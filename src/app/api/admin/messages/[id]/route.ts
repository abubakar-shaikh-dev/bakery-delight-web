import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.read !== "boolean")
    return NextResponse.json({ error: "`read` boolean is required" }, { status: 400 });

  const message = await Message.findByIdAndUpdate(id, { read: body.read }, { new: true }).lean();
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  return NextResponse.json({ message });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const message = await Message.findByIdAndDelete(id).lean();
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
