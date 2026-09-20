import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "./config";
import { publicRoutes } from "./routes/public";
import { dashboardRoutes } from "./routes/dashboard";

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
