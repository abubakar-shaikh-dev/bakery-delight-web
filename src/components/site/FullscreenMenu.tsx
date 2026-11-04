"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowRight, IconCupcake } from "../icons";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Treats", href: "/treats" },
  { label: "About", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
];

const FOCUSABLE = "a[href], button:not([disabled])";

const subscribeNoop = () => () => {};

/**
 * Full-screen navigation for phones and tablets (< lg) — see DESIGN.md → Motion
 * for the sanctioned long-form animation. Opens with a circular wipe from the
 * menu button corner, then the content staggers in (.nav-overlay in
 * globals.css); everything reverses on close. Portalled to body so the overlay
 * never inherits stacking or positioning from the header.
 */
export default function FullscreenMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Portals are client-only: false during SSR/hydration, true afterwards.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  // Close after every navigation (link clicks inside the menu) — adjusted
  // during render per the React docs, so no setState-in-effect.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // The menu only exists below lg — never leave it open when resizing up.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock page scroll while open (compensate for the scrollbar so nothing shifts).
  useEffect(() => {
    if (!open) return;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  // Escape closes; focus moves to the close button once the wipe has settled.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 520);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, close]);

  // Keep Tab cycling inside the dialog while it is open.
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Stagger-in delay per step on open; reset to 0 on close for a single exit motion.
  const delay = (step: number) => ({ transitionDelay: open ? `${120 + step * 55}ms` : "0ms" });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-stone-800 transition-[background-color,color,transform] hover:text-berry-deep active:scale-95 sm:bg-white/70 sm:shadow-xs sm:backdrop-blur-md sm:hover:bg-white lg:hidden"
      >
        <span className="flex flex-col gap-[5px]">
          <span className="h-[2px] w-5 rounded-full bg-current" />
          <span className="h-[2px] w-5 rounded-full bg-current" />
          <span className="h-[2px] w-5 rounded-full bg-current" />
        </span>
      </button>

      {mounted &&
        createPortal(
          <div
            id="site-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-open={open}
            inert={!open}
            onKeyDown={trapTab}
            className="nav-overlay overflow-hidden lg:hidden"
          >
            {/* hand-drawn branch — the site signature, peeking from the page edge */}
            <svg
              aria-hidden="true"
              className="absolute -left-5 bottom-10 h-auto w-20 -scale-x-100 text-berry/40 opacity-60 sm:w-24"
            >
              <use href="#branch" />
            </svg>

            <div className="nav-inner relative flex h-full flex-col px-5 pt-5 pb-8 sm:px-10 sm:pt-6 sm:pb-12">
              {/* top bar — mirrors the page header */}
              <div className="nav-stagger flex items-center justify-between" style={delay(0)}>
                <Link
                  href="/"
                  onClick={close}
                  aria-label="Bakery Delight — home"
                  className="shrink-0"
                >
                  <Image
                    src="/navbar-logo.png"
                    alt="Bakery Delight"
                    width={2138}
                    height={736}
                    className="h-10 w-auto sm:h-12"
                  />
                </Link>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close menu"
                  onClick={close}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-stone-800 shadow-xs ring-1 ring-cream-300 transition-[background-color,box-shadow,transform] hover:bg-cream-50 hover:shadow-md active:scale-95"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* display links — the heart of the page */}
              <nav aria-label="Menu" className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
                <ul className="my-auto flex flex-col gap-1.5 sm:gap-2.5">
                  {NAV_LINKS.map((l, i) => {
                    const active =
                      l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                    return (
                      <li key={l.label} className="nav-stagger" style={delay(i + 1)}>
                        <Link
                          href={l.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className="group flex w-fit items-baseline gap-4 py-1.5 sm:gap-5"
                        >
                          <span className="font-hand text-lg font-semibold text-berry-ink sm:text-2xl">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`font-display text-[40px] font-bold leading-[1.05] transition-colors duration-200 sm:text-[56px] ${
                              active ? "text-berry" : "text-ink group-hover:text-berry"
                            }`}
                          >
                            {l.label}
                          </span>
                          {active && (
                            <svg
                              className="h-5 w-5 self-center text-berry sm:h-6 sm:w-6"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* bottom row — CTA + handwritten sign-off */}
              <div className="nav-stagger" style={delay(NAV_LINKS.length + 1)}>
                <div className="border-t border-cream-300 pt-6">
                  <Link
                    href="/contact"
                    onClick={close}
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-berry py-3.5 text-[15px] font-medium text-white shadow-xs transition-colors hover:bg-berry-deep"
                  >
                    Order Now
                    <IconArrowRight className="h-4 w-4 transition-[opacity,transform] duration-200 group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-5 flex items-center justify-center gap-2 font-hand text-lg font-semibold text-berry-ink">
                    <IconCupcake className="h-5 w-5" strokeWidth={1.8} />
                    Baked with love, just for you
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
