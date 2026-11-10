import Link from "next/link";
import { ArrowRight, Clock, Mail, Plus, Upload } from "lucide-react";
import { connectDB } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";
import Message from "@/models/Message";
import Review from "@/models/Review";
import Treat from "@/models/Treat";
import RecentReviews from "./RecentReviews";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const conn = await connectDB();

  if (!conn) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-cream-300">
        <p className="font-display text-2xl font-bold text-ink">
          The oven isn&rsquo;t reachable
        </p>
        <p className="mt-2 text-[14px] text-stone-500">
          We couldn&rsquo;t connect to MongoDB. Check the connection settings in
          .env.local and refresh.
        </p>
      </div>
    );
  }

  let data: Awaited<ReturnType<typeof loadDashboardData>>;
  try {
    data = await loadDashboardData();
  } catch (err) {
    console.error("[dashboard]", (err as Error).message);
    return (
      <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-cream-300">
        <p className="font-display text-2xl font-bold text-ink">
          The oven went cold mid-read
        </p>
        <p className="mt-2 text-[14px] text-stone-500">
          The database dropped the connection. Refresh to try again.
        </p>
      </div>
    );
  }

  return <DashboardContent {...data} />;
}

async function loadDashboardData() {
  const [treatCount, pendingReviews, unreadMessages, galleryCount, reviewCount, recentMessages, recentReviews] =
    await Promise.all([
      Treat.countDocuments(),
      Review.countDocuments({ approved: false }),
      Message.countDocuments({ read: false }),
      GalleryImage.countDocuments(),
      Review.countDocuments({ approved: true }),
      Message.find().sort({ createdAt: -1 }).limit(5).lean(),
      Review.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return {
    treatCount,
    pendingReviews,
    unreadMessages,
    galleryCount,
    reviewCount,
    recentMessages,
    recentReviews,
  };
}

function DashboardContent({
  treatCount,
  pendingReviews,
  unreadMessages,
  galleryCount,
  reviewCount,
  recentMessages,
  recentReviews,
}: {
  treatCount: number;
  pendingReviews: number;
  unreadMessages: number;
  galleryCount: number;
  reviewCount: number;
  recentMessages: Array<{
    _id: unknown;
    name: string;
    email: string;
    message: string;
    read: boolean;
    createdAt: Date | string;
  }>;
  recentReviews: Array<{
    _id: unknown;
    name: string;
    rating: number;
    text: string;
    approved: boolean;
  }>;
}) {
  const stats = [
    {
      label: "Treats on the menu",
      value: treatCount,
      href: "/admin/treats",
    },
    {
      label: "Approved reviews",
      value: reviewCount,
      href: "/admin/reviews",
    },
    {
      label: "Unread messages",
      value: unreadMessages,
      href: "/admin/messages",
    },
    {
      label: "Gallery photos",
      value: galleryCount,
      href: "/admin/gallery",
    },
  ];

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      {/* status panel — the date names the context, no greeting */}
      <div className="rounded-2xl bg-cocoa p-6 text-white sm:p-8">
        <p className="text-[13px] font-medium text-cocoa-muted">{dateStr}</p>
        <h2 className="mt-1.5 font-display text-2xl font-bold sm:text-[28px]">
          Today at the bakery
        </h2>
        <p className="mt-1.5 text-[13px] text-cocoa-muted">
          {pendingReviews > 0
            ? `${pendingReviews} review${pendingReviews === 1 ? "" : "s"} waiting for approval and ${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`
            : unreadMessages > 0
              ? `${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"} in the inbox`
              : "Everything's tidy — reviews approved and inbox empty"}
        </p>
      </div>

      {/* stats — numbers, not icon tiles; unread is the one that matters */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream-300 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-stone-500">{s.label}</p>
              <ArrowRight
                className="h-4 w-4 text-stone-400 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-berry-deep"
                strokeWidth={2}
              />
            </div>
            <p
              className={`mt-2 text-[28px] font-semibold leading-none tabular-nums ${
                s.label === "Unread messages" && s.value > 0 ? "text-berry" : "text-ink"
              }`}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {/* quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Add a treat", icon: Plus, href: "/admin/treats" },
          { label: "Upload photos", icon: Upload, href: "/admin/gallery" },
          { label: "Check messages", icon: Mail, href: "/admin/messages" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-3.5 rounded-2xl border-2 border-dashed border-cream-400 bg-white/50 px-5 py-4 text-[14px] font-medium text-stone-600 transition-colors hover:border-berry/50 hover:bg-white hover:text-berry-deep"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-berry-soft text-berry-deep">
              <a.icon className="h-4 w-4" strokeWidth={1.8} />
            </span>
            {a.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* recent messages */}
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-ink">
              Latest messages
            </h3>
            <Link
              href="/admin/messages"
              className="group flex items-center gap-1 text-[13px] font-medium text-berry-deep"
            >
              All{' '}
                <ArrowRight
                  className="h-4 w-4 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-cream-300">
            {recentMessages.length === 0 && (
              <li className="flex items-center gap-3 py-6 text-[13px] text-stone-500">
                <Clock className="h-4 w-4" strokeWidth={1.8} />
                No messages yet — the contact form sends them straight here.
              </li>
            )}
            {recentMessages.map((m) => (
              <li key={String(m._id)} className="flex items-start gap-3 py-3.5">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    m.read ? "bg-stone-200" : "bg-berry"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {m.name} <span className="font-normal text-stone-500">· {m.email}</span>
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-stone-600">{m.message}</p>
                </div>
                <span className="shrink-0 text-[12px] text-stone-500 tabular-nums">
                  {new Date(m.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* recent reviews */}
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-ink">
              Latest reviews
            </h3>
            <Link
              href="/admin/reviews"
              className="group flex items-center gap-1 text-[13px] font-medium text-berry-deep"
            >
              All{' '}
                <ArrowRight
                  className="h-4 w-4 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
            </Link>
          </div>
          <RecentReviews
            reviews={recentReviews.map((r) => ({
              _id: String(r._id),
              name: r.name,
              rating: r.rating,
              text: r.text,
              approved: r.approved,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
