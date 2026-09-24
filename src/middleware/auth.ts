import type { MiddlewareHandler } from "hono";
import { config } from "../config.js";

export const dashboardAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader) {
    // Check for password query param (from login form submission)
    const password = c.req.query("password");
    if (password === config.DASHBOARD_PASSWORD) {
      return next();
    }

    // Browser? Redirect to login page. API client? Return JSON 401.
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html")) {
      return c.redirect("/dashboard/login");
    }
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Support Bearer token
  const token = authHeader.replace("Bearer ", "");
  if (token === config.DASHBOARD_PASSWORD) {
    return next();
  }

  const accept = c.req.header("accept") ?? "";
  if (accept.includes("text/html")) {
    return c.redirect("/dashboard/login?error=1");
  }
  return c.json({ error: "Unauthorized" }, 401);
};
