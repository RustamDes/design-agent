import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoutes } from "./routes/health";

const app = new Hono().basePath("/api/v1");

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
);

app.route("/health", healthRoutes);

const port = Number(process.env.PORT ?? 3001);
console.log(`API server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
