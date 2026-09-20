import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  // Email provider: resend, smtp, or file
  EMAIL_PROVIDER: z.enum(["resend", "smtp", "file"]).default("resend"),
  // Resend settings
  RESEND_API_KEY: z.string().optional(),
  // SMTP settings
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
  // File output settings
  EMAIL_OUTPUT_DIR: z.string().default("./emails"),
  // Common settings
  EMAIL_FROM: z
    .string()
    .regex(/^([^\s@]+@[^\s@]+\.[^\s@]+|"[^"]+"\s*<[^\s@]+@[^\s@]+\.[^\s@]+>)/, "EMAIL_FROM must be an email address or 'Name <email>' format")
    .optional(),
  BASE_URL: z.string().url().default("http://localhost:3000"),
  DASHBOARD_PASSWORD: z.string().min(1, "DASHBOARD_PASSWORD is required"),
  DATABASE_PATH: z.string().default("./data/subscribers.db"),
  PORT: z.coerce.number().int().positive().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Environment validation failed:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parsed.data;
