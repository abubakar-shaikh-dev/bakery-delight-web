import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen bg-cream-100 lg:grid-cols-[1.1fr_1fr]">
      {/* brand panel */}
      <div className="relative hidden overflow-hidden bg-cocoa lg:block">
        <Image
          src="/hero-bg.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 55vw, 0px"
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-cocoa via-cocoa/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-berry">
              <ShieldCheck className="h-5.5 w-5.5 text-white" strokeWidth={1.8} />
            </span>
            <span className="font-display text-[22px] font-bold text-cream-50">
              Bakery Delight
            </span>
          </div>
          <div>
            <p className="font-hand text-[40px] font-semibold text-cocoa-cream">
              Good food, happier people
            </p>
            <h2 className="mt-3 font-display text-[40px] font-bold leading-tight text-cream-50">
              The oven is warm —<br />
              welcome back
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-cocoa-muted">
              Sign in to manage treats, reviews, messages and everything sweet.
            </p>
          </div>
          <p className="text-[12px] text-cocoa-muted">
            © {new Date().getFullYear()} Bakery Delight · Admin Panel
          </p>
        </div>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <Suspense fallback={<div className="h-80 w-full max-w-md skeleton rounded-2xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
