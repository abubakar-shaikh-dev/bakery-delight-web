import NextTopLoader from "nextjs-toploader";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { getSettings } from "@/lib/site-data";

/**
 * Shared shell for every public page. The nav, footer and back-to-top
 * button live here — above the swapping page segment — so they stay
 * mounted across navigations instead of flickering with each loading
 * skeleton. Settings are fetched once per request (React cache() dedupes
 * the page-level reads).
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <>
      {/* React 19 hoists these into <head>: warm the Cloudinary connection
          before the first treat/gallery image renders. Only when Cloudinary
          is actually configured — DB-stored images need no cross-origin
          connection. */}
      {process.env.CLOUDINARY_CLOUD_NAME && (
        <>
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        </>
      )}
      {/* Route-progress bar in the brand berry; sits above the sticky nav,
          below drawers and toasts. The lib interpolates the color into a
          stylesheet rule, so the token var resolves here. */}
      <NextTopLoader
        color="var(--color-berry)"
        height={3}
        showSpinner={false}
        shadow={false}
        easing="ease"
        speed={400}
        crawl
        crawlSpeed={200}
        initialPosition={0.25}
        zIndex={70}
      />
      {/* Keyboard users' first tab stop: jumps past the nav. Sits above the
          viewport until focused, then drops in as a berry pill. No transition
          — focus reveals it instantly, per the motion rules. */}
      <a
        href="#main"
        className="fixed left-4 top-4 z-[80] -translate-y-24 rounded-full bg-berry px-5 py-3 text-[15px] font-medium text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteNav />
      {/* Skip-link target. tabIndex lets focus land here before the content. */}
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <Footer settings={settings} />
      <BackToTop />
    </>
  );
}
