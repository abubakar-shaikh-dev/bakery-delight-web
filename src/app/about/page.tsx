import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/site/PageHeader";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import { IconGift, IconHeart, IconLeaf, IconHome } from "@/components/icons";
import { getSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About Us — Bakery Delight",
  description:
    "The story of Bakery Delight — a small home kitchen with big dreams, spreading happiness through homemade cakes.",
};

export const dynamic = "force-dynamic";

const values = [
  {
    icon: <IconLeaf className="h-7 w-7" />,
    title: "Fresh Ingredients",
    text: "Only the best, always fresh — real butter, farm eggs and fruit in season.",
  },
  {
    icon: <IconHeart className="h-7 w-7" strokeWidth={1.7} />,
    title: "Made with Love",
    text: "Every cake tells a story. Yours gets our full attention, start to finish.",
  },
  {
    icon: <IconHome className="h-7 w-7" />,
    title: "Home Bakery",
    text: "A small kitchen, big dreams — no factory lines, just careful hands.",
  },
  {
    icon: <IconGift className="h-7 w-7" />,
    title: "Custom Orders",
    text: "Your ideas, our creation — flavours, colours and messages made to order.",
  },
];

const stats = [
  { value: "500+", label: "Happy Customers" },
  { value: "100%", label: "Homemade" },
  { value: "50+", label: "Unique Creations" },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <SiteNav variant="solid" />
      <main className="bg-cream-50">
        <PageHeader
          eyebrow="A little about us"
          title="A Home Kitchen,"
          accent="With Big Dreams"
          subtitle="Bakery Delight started from a simple idea — to spread happiness through homemade cakes, baked one order at a time."
          crumb="About"
        />

        {/* story */}
        <section className="px-5 pb-8 sm:px-10 lg:px-[8.5rem]">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="relative mx-auto w-full max-w-[440px]">
              <div className="-rotate-2 bg-white p-3 pb-12 shadow-[0_24px_50px_-12px_rgba(90,30,30,0.28)]">
                <div className="relative aspect-[680/760] w-full">
                  <Image
                    src="/images/about-main.jpg"
                    alt="Baking in our home kitchen"
                    fill
                    sizes="(min-width:1024px) 440px, 92vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="absolute -bottom-7 -right-2 w-36 rotate-6 bg-white p-2 pb-7 shadow-[0_16px_35px_-10px_rgba(90,30,30,0.3)] sm:-right-6 md:w-44">
                <div className="relative aspect-square w-full">
                  <Image
                    src="/images/about-small.jpg"
                    alt="Fresh cupcake"
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-5 -left-2 -rotate-6 bg-paper px-5 py-3 font-hand text-xl font-semibold leading-tight text-berry-ink shadow-md sm:-left-5 md:text-2xl">
                Happiness
                <br />
                is Homemade{" "}
                <IconHeart className="mt-[-0.25rem] inline-block h-4 w-4 text-berry-ink" strokeWidth={2} />
              </div>
            </div>

            <div>
              <h2 className="font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
                It began with one cake
                <br />
                and a <span className="text-berry">whole lot of love</span>
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-stone-500">
                Bakery Delight started from a simple idea — to spread happiness through
                homemade cakes. What began as weekend bakes for family and neighbours grew,
                one celebration at a time, into a small home bakery with a growing community
                of cake lovers.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-stone-500">
                Every cake is still made the same way the first one was: in my home
                kitchen, with fresh, high-quality ingredients and a personal touch. No
                shortcuts, no presets — just careful hands and recipes tested until
                they&rsquo;re worth sharing.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-stone-500">
                Whether it&rsquo;s a first-birthday smash cake or a Tuesday treat just
                because, my promise is the same: something beautiful, something delicious,
                something made for you.
              </p>
              <p className="mt-6 font-hand text-2xl font-semibold text-berry-ink">
                — with love, from my kitchen to yours
              </p>
            </div>
          </div>
        </section>

        {/* values */}
        <section className="px-5 py-16 sm:px-10 lg:px-[8.5rem]">
          <div className="text-center">
            <p className="eyebrow-hand">What we stand by</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-ink md:text-4xl">
              The little things that matter
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl bg-white p-6 text-center shadow-xs ring-1 ring-cream-300 transition-shadow duration-200 hover:shadow-md"
              >
                <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
                  {v.icon}
                </span>
                <h3 className="text-[15px] font-semibold text-ink">{v.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-stone-500">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* stats */}
        <section className="px-5 pb-8 sm:px-10 lg:px-[8.5rem]">
          <div className="grid gap-5 rounded-2xl bg-blush-200 px-6 py-10 text-center sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl font-bold text-cocoa-2 md:text-5xl">
                  {s.value}
                </p>
                <p className="mt-1 text-[13px] font-medium text-stone-600">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16">
          <CtaBand />
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
