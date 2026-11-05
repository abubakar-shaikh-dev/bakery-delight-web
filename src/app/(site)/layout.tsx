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
      {/* Route-progress bar in the brand berry; sits above the sticky nav,
          below drawers and toasts */}
      <NextTopLoader
        color="#cc4751"
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
      <SiteNav />
      {children}
      <Footer settings={settings} />
      <BackToTop />
    </>
  );
}
