"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CakeSlice,
  CircleCheck,
  Globe,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Star,
  Tags,
  TriangleAlert,
  X,
} from "lucide-react";

/* ------------------------------ toast bus ------------------------------ */

export type ToastKind = "success" | "error";
export function showToast(message: string, kind: ToastKind = "success") {
  window.dispatchEvent(new CustomEvent("admin-toast", { detail: { message, kind } }));
}

function ToastHost() {
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string; kind: ToastKind }>).detail;
      setToast(detail);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 3200);
    };
    window.addEventListener("admin-toast", onToast);
    return () => {
      window.removeEventListener("admin-toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0"
    >
      <div
        className={`flex items-center gap-2.5 rounded-full px-5 py-3 text-[13px] font-medium text-white shadow-xl ${
          toast.kind === "success" ? "bg-success" : "bg-berry-deep"
        }`}
      >
        {toast.kind === "success" ? (
          <CircleCheck className="h-4.5 w-4.5" strokeWidth={2} />
        ) : (
          <TriangleAlert className="h-4.5 w-4.5" strokeWidth={2} />
        )}
        {toast.message}
      </div>
    </div>
  );
}

/* ------------------------------ navigation ------------------------------ */

const navSections = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Treats", href: "/admin/treats", icon: CakeSlice },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Gallery", href: "/admin/gallery", icon: Images },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Messages", href: "/admin/messages", icon: Mail, badge: true },
    ],
  },
  {
    label: "Site",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/treats": "Treats",
  "/admin/categories": "Categories",
  "/admin/reviews": "Reviews",
  "/admin/messages": "Messages",
  "/admin/gallery": "Gallery",
  "/admin/settings": "Settings",
};

/* ------------------------------ shell ------------------------------ */

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unread, setUnread] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  const loadUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages?limit=1&status=unread");
      if (!res.ok) return;
      const data = await res.json();
      setUnread(typeof data.total === "number" ? data.total : (data.messages?.length ?? 0));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadUnread();
  }, [loadUnread, pathname]);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  async function logout() {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      router.replace("/admin/login");
    } catch {
      showToast("Couldn't sign out. Please try again.", "error");
      setLoggingOut(false);
    }
  }

  const title = titles[pathname] ?? "Admin";

  const sidebarNav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6">
      {navSections.map((section) => (
        <div key={section.label}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-medium text-white/40">
              {section.label}
            </p>
          )}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                      active
                        ? "bg-berry text-white"
                        : "text-white/65 hover:bg-white/8 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span>{item.label}</span>}
                    {item.badge && unread > 0 && !collapsed && (
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-berry px-1.5 text-[11px] font-semibold text-white">
                        {unread}
                      </span>
                    )}
                    {item.badge && unread > 0 && collapsed && (
                      <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-berry" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3 px-5 pt-6 pb-2">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-berry">
        <CakeSlice className="h-5 w-5 text-white" strokeWidth={1.8} />
      </span>
      {!collapsed && (
        <span className="leading-tight">
          <span className="block font-display text-[19px] font-bold text-cream-50">
            Bakery Delight
          </span>
          <span className="block text-[11px] font-medium text-white/50">
            Admin panel
          </span>
        </span>
      )}
    </Link>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col bg-cocoa">
      {brand}
      {sidebarNav}
      <div className="border-t border-white/8 p-3">
        <a
          href="/"
          target="_blank"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-white/65 transition-colors hover:bg-white/8 hover:text-white ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Globe className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {!collapsed && <span>View site</span>}
        </a>
        <button
          onClick={logout}
          disabled={loggingOut}
          className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-berry-200 transition-colors hover:bg-berry/20 hover:text-white disabled:opacity-50 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {!collapsed && <span>{loggingOut ? "Signing out…" : "Sign out"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-200">
      {/* desktop sidebar — collapse is instant; animating width stutters */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block ${
          collapsed ? "w-[84px]" : "w-[264px]"
        }`}
      >
        {sidebarInner}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3.5 top-20 grid h-7 w-7 place-items-center rounded-full bg-berry text-white transition-colors hover:bg-berry-deep"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </button>
      </aside>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[280px] shadow-2xl transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarInner}
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-6 grid h-11 w-11 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </aside>
      </div>

      {/* content — margin follows the sidebar instantly */}
      <div
        className={`flex min-h-screen flex-col ${
          collapsed ? "lg:ml-[84px]" : "lg:ml-[264px]"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-cream-300/60 bg-cream-200/85 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-xl text-stone-600 transition-colors hover:bg-white hover:shadow-xs lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <h1 className="font-display text-[22px] font-bold text-ink sm:text-2xl">
            {title}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-stone-600 shadow-xs ring-1 ring-cream-300/70 transition-colors hover:text-berry sm:flex"
            >
              <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
              View site
            </a>
            <span className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-xs ring-1 ring-cream-300/70">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-berry font-display text-[15px] font-bold text-white">
                {email.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-[12px] font-medium text-stone-600 md:block">
                {email}
              </span>
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="px-6 pb-6 text-center text-[12px] text-stone-400">
          Bakery Delight Admin · baked with love
        </footer>
      </div>

      <ToastHost />
    </div>
  );
}
