import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let cache: Record<string, string> | null = null;

/**
 * Minimal .env.local reader (Playwright's process doesn't load it, but the
 * test process needs MONGODB_URI and the admin credentials directly).
 */
export function envLocal(): Record<string, string> {
  if (cache) return cache;
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[match[1]] = value;
  }
  cache = out;
  return out;
}

export function adminEmail(): string {
  const value = envLocal().ADMIN_EMAIL;
  if (!value) throw new Error("ADMIN_EMAIL is missing from .env.local");
  return value;
}

export function adminPassword(): string {
  const value = envLocal().ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD is missing from .env.local");
  return value;
}

export function mongoUri(): string {
  const value = envLocal().MONGODB_URI;
  if (!value) {
    throw new Error(
      "MONGODB_URI is missing from .env.local — e2e tests need a reachable MongoDB.",
    );
  }
  return value;
}
