import { Hono } from "hono";
import { z } from "zod";
import { db, schema } from "../db/client.js";
import { eq } from "drizzle-orm";
import { generateToken } from "../services/tokens.js";
import { sendConfirmationEmail } from "../services/email.js";
import { config } from "../config.js";
import { ConfirmedPage } from "../views/ConfirmedPage.js";
import { UnsubscribedPage } from "../views/UnsubscribedPage.js";
import { SubscribePage } from "../views/SubscribePage.js";
import { rateLimit } from "../middleware/rate-limit.js";

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
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-color: #f5f5f7;
          --surface-color: #ffffff;
          --text-main: #1d1d1f;
          --text-secondary: #6e6e73;
          --accent-color: #E8792F;
          --accent-hover: #d26a24;
          --border-color: rgba(0, 0, 0, 0.08);
          --border-radius: 16px;
          --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: var(--font-family);
          background: var(--bg-color);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: var(--text-main);
          -webkit-font-smoothing: antialiased;
        }
        .container {
          text-align: center;
          max-width: 440px;
          padding: 48px 40px;
          background: var(--surface-color);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          margin: 0 24px;
        }
        .subtitle {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--accent-color);
          font-weight: 600;
          display: block;
          margin-bottom: 12px;
        }
        h1 {
          font-size: 2rem;
          font-weight: 600;
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        p {
          color: var(--text-secondary);
          margin-bottom: 32px;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          background: var(--accent-color);
          color: white;
          padding: 14px 30px;
          border-radius: 980px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.01em;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .btn:hover {
          background: var(--accent-hover);
          transform: scale(1.02);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="subtitle">Self-hosted</span>
        <h1>📬 Sendlet</h1>
        <p>Your mailing list service. Embed the subscribe form on your site and manage subscribers here.</p>
        <a href="/dashboard/login" class="btn">Go to Dashboard</a>
      </div>
    </body>
    </html>
  `);
});

// GET /subscribe — confirmation page shown after subscribing
publicRoutes.get("/subscribe", (c) => {
  return c.html(SubscribePage());
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

  return c.redirect("/subscribe", 303);
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
