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
      <SiteNav />
      {children}
      <Footer settings={settings} />
      <BackToTop />
    </>
  );
}
