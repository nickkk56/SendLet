import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "./config.js";
import { publicRoutes } from "./routes/public.js";
import { dashboardRoutes } from "./routes/dashboard.js";

const app = new Hono();

// Public routes
app.route("/", publicRoutes);

// Protected dashboard routes
app.route("/dashboard", dashboardRoutes);

serve({
  fetch: app.fetch,
  port: config.PORT,
  hostname: "0.0.0.0",
});

console.log(`Sendlet listening on port ${config.PORT} (all interfaces)`);
