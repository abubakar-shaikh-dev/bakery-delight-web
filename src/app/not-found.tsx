import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const settings = await getSettings();

  return (
    <>
      <SiteNav variant="solid" />
      <main className="bg-cream-50">
        <section className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-24 text-center sm:px-10">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.2 12.5 7.6 20a1.4 1.4 0 0 0 1.4 1.1h6a1.4 1.4 0 0 0 1.4-1.1l1.4-7.5" />
              <path d="M5.5 12.5h13" />
              <path d="M6 12.5c-1.4 0-2.5-1.1-2.5-2.4 0-1.2 1-2.3 2.3-2.4C6.1 6 7.6 4.6 9.4 4.6c.5 0 1 .1 1.4.3.6-1.1 1.8-1.9 3.2-1.9 2 0 3.7 1.6 3.7 3.5v.2c1.1.3 1.8 1.2 1.8 2.3 0 1.4-1.1 2.4-2.5 2.4" />
            </svg>
          </span>
          <p className="eyebrow-hand mt-6">This page seems to be eaten</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
            Fresh out of the <span className="text-berry">oven</span>, not the menu
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-stone-600">
            The page you&rsquo;re looking for doesn&rsquo;t exist — but the treats
            very much do.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/treats"
              className="rounded-full bg-berry px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep"
            >
              Browse the treats
            </Link>
            <Link
              href="/"
              className="rounded-full border-2 border-berry px-7 py-3.5 text-[15px] font-medium text-berry transition-colors hover:bg-berry/5"
            >
              Back home
            </Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
