import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

async function GET_(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const filter: Record<string, unknown> = {};
  if (searchParams.get("status") === "unread") filter.read = false;

  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 12));
  const offset = Math.min(10000, Math.max(0, Number(searchParams.get("offset")) || 0));
  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
    Message.countDocuments(filter),
  ]);
  return NextResponse.json({ messages, total });
}

export function GET(req: NextRequest) {
  return safeJson(() => GET_(req));
}
