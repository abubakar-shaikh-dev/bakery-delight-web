import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, safeJson } from "@/lib/api";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

/** Constant-time comparison of two strings via their SHA-256 digests. */
function safeEqual(a: string, b: string) {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

export async function POST(req: NextRequest) {
  return safeJson(async () => {
    // Blunt brute force: 10 attempts per IP per 10 minutes, per instance.
    if (!rateLimit(`login:${clientIp(req)}`, 10, 10 * 60_000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const envEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD ?? "";

    if (!envEmail || !envPassword) {
      return NextResponse.json(
        { error: "Admin credentials are not configured on the server." },
        { status: 500 },
      );
    }

    if (!email || !password || !safeEqual(email, envEmail) || !safeEqual(password, envPassword)) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken({ email: envEmail, role: "admin" });
    const res = NextResponse.json({ ok: true });
    return setSessionCookie(res, token);
  });
}
