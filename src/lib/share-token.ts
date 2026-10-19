import { createHash, randomBytes } from "crypto";

/** Token URL-safe (32 bytes) — exibir apenas na criação; persistir só o hash. */
export function generateShareToken(): string {
  return randomBytes(32)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 43);
}

export function hashShareToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
