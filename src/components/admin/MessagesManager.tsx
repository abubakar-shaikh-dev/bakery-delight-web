"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Clock,
  Mail,
  MailOpen,
  Phone,
  Trash2,
} from "lucide-react";
import { IconMail } from "../icons";
import { ConfirmDrawer } from "./Drawer";
import LoadError from "./LoadError";
import { MessageRowSkeleton } from "./Skeletons";
import { showToast } from "./AdminShell";

interface Message {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const [removing, setRemoving] = useState(false);
  const reqId = useRef(0);

  const load = useCallback(async (f: string) => {
    const id = ++reqId.current;
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(
        `/api/admin/messages?limit=200${f === "unread" ? "&status=unread" : ""}`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (id !== reqId.current) return;
      setMessages(data.messages ?? []);
    } catch {
      if (id === reqId.current) {
        setLoadError(true);
        showToast("Couldn't load messages.", "error");
      }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function setRead(m: Message, read: boolean) {
    const res = await fetch(`/api/admin/messages/${m._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    if (res.ok) {
      setMessages((list) => list.map((x) => (x._id === m._id ? { ...x, read } : x)));
    } else {
      showToast("Couldn't update the message.", "error");
    }
  }

  async function remove() {
    if (!deleting || removing) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/messages/${deleting._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Couldn't delete the message.");
      showToast("Message deleted.");
      setMessages((list) => list.filter((x) => x._id !== deleting._id));
      setDeleting(null);
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setRemoving(false);
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-stone-600">
          {messages.length} message{messages.length === 1 ? "" : "s"}
          {filter === "unread" ? " · unread only" : ""}
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-berry-soft px-2.5 py-0.5 text-[11px] font-semibold text-berry-deep">
              {unreadCount} new
            </span>
          )}
        </p>
        <div className="flex gap-1.5 self-start rounded-full bg-white p-1 shadow-xs ring-1 ring-cream-300">
          {(["all", "unread"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
                filter === k ? "bg-berry text-white" : "text-stone-500 hover:text-berry"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <MessageRowSkeleton key={i} />
          ))}
        </div>
      ) : loadError ? (
        <LoadError label="The inbox couldn't be loaded." onRetry={() => load(filter)} />
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <MailOpen className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">
            {filter === "unread" ? "Inbox empty" : "No messages yet"}
          </h3>
          <p className="mt-1 max-w-xs text-[13px] text-stone-600">
            {filter === "unread"
              ? "Every message has been read."
              : "Messages from the contact form will land here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const open = openId === m._id;
            return (
              <article
                key={m._id}
                className={`overflow-hidden rounded-2xl bg-white shadow-xs ring-1 transition-shadow ${
                  m.read ? "ring-cream-300" : "ring-berry/30"
                } hover:shadow-md`}
              >
                <button
                  onClick={() => {
                    setOpenId(open ? null : m._id);
                    if (!m.read) setRead(m, true);
                  }}
                  aria-expanded={open}
                  aria-controls={`message-body-${m._id}`}
                  className="flex w-full items-start gap-4 p-5 text-left"
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-[16px] font-bold ${
                      m.read ? "bg-cream-200 text-stone-500" : "bg-berry-soft text-berry-deep"
                    }`}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-ink">{m.name}</span>
                      {!m.read && (
                        <span className="rounded-full bg-berry-soft px-2 py-0.5 text-[11px] font-semibold text-berry-deep">
                          New
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-stone-500">
                      {open ? m.message : m.message.slice(0, 90) + (m.message.length > 90 ? "…" : "")}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-[12px] text-stone-500 tabular-nums">
                      {new Date(m.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </span>
                </button>

                {open && (
                  <div id={`message-body-${m._id}`} className="border-t border-cream-300 px-5 py-4">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-stone-600">
                      {m.message}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-stone-500">
                      <a
                        href={`mailto:${m.email}`}
                        className="flex items-center gap-1.5 transition-colors hover:text-berry"
                      >
                        <IconMail className="h-4 w-4" /> {m.email}
                      </a>
                      {m.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4" strokeWidth={1.8} /> {m.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" strokeWidth={1.8} />
                        {new Date(m.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.phone && (
                        <a
                          href={`https://wa.me/${m.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-4 py-2 text-[13px] font-medium text-success transition-colors hover:bg-success hover:text-white"
                        >
                          Reply on WhatsApp
                        </a>
                      )}
                      <a
                        href={`mailto:${m.email}?subject=Re: your Bakery Delight message`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-berry-soft px-4 py-2 text-[13px] font-medium text-berry-deep transition-colors hover:bg-berry hover:text-white"
                      >
                        Reply by email
                      </a>
                      <button
                        onClick={() => setRead(m, !m.read)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-stone-500 ring-1 ring-cream-300 transition-colors hover:text-berry hover:ring-berry/40"
                      >
                        {m.read ? (
                          <>
                            <Mail className="h-3.5 w-3.5" strokeWidth={1.8} /> Mark unread
                          </>
                        ) : (
                          <>
                            <MailOpen className="h-3.5 w-3.5" strokeWidth={1.8} /> Mark read
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setDeleting(m)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-stone-500 ring-1 ring-cream-300 transition-colors hover:text-berry-deep hover:ring-berry-deep/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* delete confirm */}
      <ConfirmDrawer
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this message?"
        body={
          deleting ? (
            <>
              {deleting.name}&rsquo;s message will be removed permanently. Reply first if
              you still need the details.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        busy={removing}
        onConfirm={remove}
      />
    </div>
  );
}
