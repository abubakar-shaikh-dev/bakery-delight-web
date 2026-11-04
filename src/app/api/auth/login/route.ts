import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
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
}
