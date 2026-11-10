"use client";

import { Drawer } from "vaul";
import { LoaderCircle, RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Bottom sheet for admin dialogs, built on vaul — Escape, focus trap and
 * scroll lock come for free. Forms use `dismissible={false}` so a stray
 * swipe can't throw away typed data. When `onCloseRequest` is set, the X
 * asks the owner first — it can hold the close for a discard check.
 */
export function AdminDrawer({
  open,
  onOpenChange,
  title,
  children,
  dismissible = true,
  onCloseRequest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  dismissible?: boolean;
  onCloseRequest?: () => void;
}) {
  const requestClose = onCloseRequest ?? (() => onOpenChange(false));
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} dismissible={dismissible}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-cocoa-3/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[81] mx-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-lg outline-none sm:mb-6 sm:max-w-xl sm:rounded-2xl">
          {dismissible && (
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-cream-300 sm:hidden"
            />
          )}
          <div className="flex items-center justify-between px-6 pt-4 pb-2 sm:px-8 sm:pt-6">
            <Drawer.Title className="font-display text-2xl font-bold text-ink">
              {title}
            </Drawer.Title>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Close"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/**
 * Confirmation sheet for risky actions. Two tones: "danger" (deleting an
 * entity — trash chip, danger confirm) and "discard" (throwing away unsaved
 * work — revert chip, same guarded confirm). The safe action receives focus
 * on open, so a hasty Enter never confirms the loss, and the sheet can't be
 * swiped away mid-action.
 */
export function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  tone = "danger",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  tone?: "danger" | "discard";
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const discard = tone === "discard";

  // Focus the safe action on open — Enter confirms "Keep it", not the loss.
  // Deferred past vaul's own focus-on-content, which would otherwise win.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => cancelRef.current?.focus({ preventScroll: true }), 0);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} dismissible={!busy}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-cocoa-3/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[81] mx-auto w-full max-w-sm rounded-t-2xl bg-white shadow-lg outline-none sm:mb-10 sm:rounded-2xl">
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-cream-300 sm:hidden"
          />
          <div className="px-6 pb-6 pt-5 text-center sm:px-8 sm:pb-7">
            <span
              className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${
                discard ? "bg-cream-200 text-stone-500" : "bg-danger-soft text-danger"
              }`}
            >
              {discard ? (
                <RotateCcw className="h-5 w-5" strokeWidth={1.8} />
              ) : (
                <Trash2 className="h-5 w-5" strokeWidth={1.8} />
              )}
            </span>
            <Drawer.Title className="mt-3.5 block font-display text-2xl font-bold text-ink">
              {title}
            </Drawer.Title>
            <Drawer.Description className="mx-auto mt-1.5 block max-w-xs text-[13px] leading-relaxed text-stone-500">
              {body}
            </Drawer.Description>
            <div className="mt-6 flex justify-center gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => onOpenChange(false)}
                className="btn-ghost"
                disabled={busy}
              >
                Keep it
              </button>
              <button type="button" onClick={onConfirm} disabled={busy} className="btn-danger">
                {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
