"use client";

import { Drawer } from "vaul";
import { LoaderCircle, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";

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
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[81] mx-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:mb-6 sm:max-w-xl sm:rounded-2xl">
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
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Small confirmation sheet for destructive actions (delete/remove). */
export function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Remove",
  busy = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[81] mx-auto w-full max-w-sm rounded-t-2xl bg-white p-7 text-center shadow-2xl outline-none sm:mb-10 sm:rounded-2xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-berry-deep">
            <Trash2 className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <Drawer.Title className="mt-4 block font-display text-xl font-bold text-ink">
            {title}
          </Drawer.Title>
          <Drawer.Description className="mt-1.5 block text-[13px] leading-relaxed text-stone-500">
            {body}
          </Drawer.Description>
          <div className="mt-6 flex justify-center gap-3">
            <button
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
