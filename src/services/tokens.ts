import { randomBytes } from "node:crypto";

/**
 * Generate a cryptographically random token (hex string).
 * Default 32 bytes = 64 hex chars.
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}
