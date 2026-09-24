import { Hono } from "hono";
import { z } from "zod";
import { db, schema } from "../db/client.js";
import { eq, and, isNull } from "drizzle-orm";
import { dashboardAuth } from "../middleware/auth.js";
import { Dashboard } from "../views/Dashboard.js";
import { LoginPage } from "../views/Login.js";
import { sendBroadcastEmail } from "../services/email.js";
import { config } from "../config.js";

const { subscribers } = schema;

export const dashboardRoutes = new Hono();

// Login page (not behind auth middleware)
dashboardRoutes.get("/login", (c) => {
  const error = c.req.query("error");
  return c.html(LoginPage(error === "1" ? "Incorrect password. Try again." : undefined));
});

// Login form submission (not behind auth middleware)
dashboardRoutes.post("/login", async (c) => {
  const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, string>;
  const password = body.password;

  if (password === config.DASHBOARD_PASSWORD) {
    // Redirect to dashboard with password in query (simple session-less auth)
    return c.redirect(`/dashboard?password=${encodeURIComponent(password)}`);
  }

  return c.redirect("/dashboard/login?error=1");
});

dashboardRoutes.use(dashboardAuth);

// GET /dashboard — main dashboard with stats and subscriber table
dashboardRoutes.get("/", async (c) => {
  let all;
  try {
    all = await db.select().from(subscribers).orderBy(subscribers.subscribedAt).all();
  } catch (err) {
    console.error("Database error loading dashboard:", err);
    return c.text("Internal server error", 500);
  }

  const total = all.length;
  const confirmed = all.filter((s) => s.confirmed && !s.unsubscribedAt).length;
  const unsubscribed = all.filter((s) => !!s.unsubscribedAt).length;

  // Pass auth token to client for API calls
  const authHeader = c.req.header("authorization");
  const passwordQuery = c.req.query("password");
  const authToken = authHeader?.replace("Bearer ", "") ?? passwordQuery ?? "";

  return c.html(Dashboard({ total, confirmed, unsubscribed, subscribers: all, authToken }));
});

// POST /dashboard/send — broadcast email form
const broadcastSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

dashboardRoutes.post("/send", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = broadcastSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  const { subject, body: bodyHtml } = parsed.data;

  let targets;
  try {
    targets = await db
      .select()
      .from(subscribers)
      .where(and(eq(subscribers.confirmed, true), isNull(subscribers.unsubscribedAt)))
      .all();
  } catch (err) {
    console.error("Database error loading subscribers for broadcast:", err);
    return c.json({ error: "Internal server error" }, 500);
  }

  let sent = 0;
  let failed = 0;

  const errors: string[] = [];

  for (const s of targets) {
    const unsubscribeUrl = `${config.BASE_URL}/unsubscribe/${s.unsubscribeToken}`;
    try {
      await sendBroadcastEmail(s.email, subject, bodyHtml, unsubscribeUrl);
      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to send to ${s.email}:`, err);
      errors.push(`${s.email}: ${message}`);
      failed++;
    }
  }

  return c.json({ sent, failed, total: targets.length, errors });
});

// DELETE /dashboard/subscribers/:id — remove a subscriber
dashboardRoutes.delete("/subscribers/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid subscriber ID" }, 400);
  }

  try {
    const result = await db
      .delete(subscribers)
      .where(eq(subscribers.id, id))
      .run();

    if (result.changes === 0) {
      return c.json({ error: "Subscriber not found" }, 404);
    }

    return c.json({ message: "Subscriber deleted" });
  } catch (err) {
    console.error("Database error deleting subscriber:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /dashboard/subscribers/export/csv — export all subscribers as CSV
dashboardRoutes.get("/subscribers/export/csv", async (c) => {
  let all;
  try {
    all = await db
      .select()
      .from(subscribers)
      .orderBy(subscribers.subscribedAt)
      .all();
  } catch (err) {
    console.error("Database error exporting subscribers:", err);
    return c.text("Internal server error", 500);
  }

  const headers = ["email", "subscribed_at", "confirmed_at", "source"];
  const rows = all.map((s) => [
    s.email,
    s.subscribedAt.toISOString(),
    s.confirmedAt ? s.confirmedAt.toISOString() : "",
    s.source ?? "",
  ]);

  const csvLines = [headers.join(","), ...rows.map((r) => r.join(","))];
  const csv = csvLines.join("\n");

  return c.body(csv, 200, {
    "Content-Type": "text/csv",
    "Content-Disposition": 'attachment; filename="subscribers.csv"',
  });
});

// GET /dashboard/subscribers/export/json — export all subscribers as JSON
dashboardRoutes.get("/subscribers/export/json", async (c) => {
  let all;
  try {
    all = await db
      .select()
      .from(subscribers)
      .orderBy(subscribers.subscribedAt)
      .all();
  } catch (err) {
    console.error("Database error exporting subscribers:", err);
    return c.json({ error: "Internal server error" }, 500);
  }

  const data = all.map((s) => ({
    email: s.email,
    subscribedAt: s.subscribedAt.toISOString(),
    confirmedAt: s.confirmedAt ? s.confirmedAt.toISOString() : null,
    source: s.source ?? null,
  }));

  return c.body(JSON.stringify(data, null, 2), 200, {
    "Content-Type": "application/json",
    "Content-Disposition": 'attachment; filename="subscribers.json"',
  });
});

// GET /dashboard/subscribers — JSON list of subscribers (for API consumers)
dashboardRoutes.get("/subscribers", async (c) => {
  let all;
  try {
    all = await db
      .select()
      .from(subscribers)
      .orderBy(subscribers.subscribedAt)
      .all();
  } catch (err) {
    console.error("Database error loading subscriber list:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
  return c.json(all);
});
