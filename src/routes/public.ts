import { Hono } from "hono";
import { z } from "zod";
import { db, schema } from "../db/client";
import { eq } from "drizzle-orm";
import { generateToken } from "../services/tokens";
import { sendConfirmationEmail } from "../services/email";
import { config } from "../config";
import { ConfirmedPage } from "../views/ConfirmedPage";
import { UnsubscribedPage } from "../views/UnsubscribedPage";
import { rateLimit } from "../middleware/rate-limit";

const { subscribers } = schema;

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().max(255, "Source too long").optional(),
});

export const publicRoutes = new Hono();

// GET / — Welcome page
publicRoutes.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sendlet</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #334155;
        }
        .container {
          text-align: center;
          max-width: 400px;
          padding: 2rem;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        a {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
        }
        a:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📬 Sendlet</h1>
        <p>Self-hosted mailing list service</p>
        <a href="/dashboard/login">Go to Dashboard</a>
      </div>
    </body>
    </html>
  `);
});

// POST /subscribe
publicRoutes.post("/subscribe", rateLimit(10), async (c) => {
  // Accept both JSON and form-encoded data
  let body: Record<string, string> = {};
  const contentType = c.req.header("content-type") ?? "";

  if (contentType.includes("application/json")) {
    body = (await c.req.json().catch(() => ({}))) as Record<string, string>;
  } else {
    body = (await c.req.parseBody().catch(() => ({}))) as Record<string, string>;
  }

  const parsed = emailSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  const { email, source } = parsed.data;
  const confirmToken = generateToken();
  const unsubscribeToken = generateToken();

  try {
    // Upsert: if already exists, reset tokens and re-confirm
    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .get();

    if (existing) {
      if (existing.unsubscribedAt) {
        return c.json({ error: "This email has unsubscribed." }, 409);
      }
      await db
        .update(subscribers)
        .set({
          confirmed: false,
          confirmToken,
          confirmedAt: null,
          unsubscribedAt: null,
        })
        .where(eq(subscribers.id, existing.id))
        .run();
    } else {
      await db
        .insert(subscribers)
        .values({
          email,
          confirmed: false,
          confirmToken,
          unsubscribeToken,
          subscribedAt: new Date(),
          source,
        })
        .run();
    }
  } catch (err) {
    console.error("Database error on subscribe:", err);
    return c.json({ error: "Internal server error" }, 500);
  }

  // Send confirmation email in background (non-blocking)
  const confirmUrl = `${config.BASE_URL}/confirm/${confirmToken}`;
  sendConfirmationEmail(email, confirmUrl).catch((err) => {
    console.error("Failed to send confirmation email:", err);
  });

  return c.json({ message: "Check your email to confirm." }, 201);
});

// GET /confirm/:token
publicRoutes.get("/confirm/:token", async (c) => {
  const token = c.req.param("token");

  let subscriber;
  try {
    subscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.confirmToken, token))
      .get();
  } catch (err) {
    console.error("Database error on confirm:", err);
    return c.text("Internal server error", 500);
  }

  if (!subscriber) {
    return c.text("Invalid or expired confirmation link.", 404);
  }

  if (subscriber.confirmed) {
    return c.html(ConfirmedPage());
  }

  try {
    await db
      .update(subscribers)
      .set({
        confirmed: true,
        confirmedAt: new Date(),
        confirmToken: null,
      })
      .where(eq(subscribers.id, subscriber.id))
      .run();
  } catch (err) {
    console.error("Database error confirming subscriber:", err);
    return c.text("Internal server error", 500);
  }

  return c.html(ConfirmedPage());
});

// GET /unsubscribe/:token
publicRoutes.get("/unsubscribe/:token", async (c) => {
  const token = c.req.param("token");

  let subscriber;
  try {
    subscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.unsubscribeToken, token))
      .get();
  } catch (err) {
    console.error("Database error on unsubscribe:", err);
    return c.text("Internal server error", 500);
  }

  if (!subscriber) {
    return c.text("Invalid unsubscribe link.", 404);
  }

  if (!subscriber.unsubscribedAt) {
    try {
      await db
        .update(subscribers)
        .set({ unsubscribedAt: new Date() })
        .where(eq(subscribers.id, subscriber.id))
        .run();
    } catch (err) {
      console.error("Database error unsubscribing:", err);
      return c.text("Internal server error", 500);
    }
  }

  return c.html(UnsubscribedPage());
});
