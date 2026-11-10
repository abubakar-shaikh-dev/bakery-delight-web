import { IconArrowRight, IconCupcake, IconGift, IconHeart } from "./icons";

const occasions = [
  { label: "Birthdays", icon: <IconGift className="h-[30px] w-[30px]" /> },
  { label: "Anniversaries", icon: <IconHeart className="h-[30px] w-[30px]" /> },
  { label: "Baby Showers", icon: <IconCupcake className="h-[30px] w-[30px]" /> },
  { label: "Just Because", icon: <IconHeart className="h-[30px] w-[30px]" /> },
];

export default function CustomCakes() {
  return (
    <>
      <div className="bg-blush-100">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block h-[60px] w-full -scale-x-100 text-blush-200 md:h-[80px]">
          <path fill="currentColor" d="M0,58 C200,14 420,86 700,52 C960,22 1180,74 1440,34 L1440,90 L0,90 Z" />
        </svg>
      </div>

      <section className="relative overflow-hidden bg-blush-200">
        <svg
          className="absolute -left-5 top-1/2 hidden h-auto w-14 -translate-y-1/2 -scale-x-100 text-berry/60 opacity-80 lg:block"
          aria-hidden="true"
        >
          <use href="#branch" />
        </svg>

        <div className="grid items-center gap-12 px-5 py-14 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:px-[8.5rem] lg:py-16">
          <div>
            <h2 className="font-display text-[28px] font-bold leading-[1.15] text-cocoa-2 md:text-[40px]">
              Custom Cakes
              <br />
              for Your Special Moments
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-stone-600">
              Birthdays, anniversaries, baby showers or just because — we create custom cakes that
              make your moments sweeter.
            </p>
            <a
              href="#order"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-berry px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep"
            >
              Request a Custom Cake
              <IconArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {occasions.map((o) => (
              <div key={o.label} className="flex flex-col items-center gap-3 text-center">
                <span className="text-berry-deep">{o.icon}</span>
                <p className="text-[14px] font-medium text-ink">{o.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-blush-200">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block h-[60px] w-full text-cream-100 md:h-[80px]">
          <path fill="currentColor" d="M0,58 C200,14 420,86 700,52 C960,22 1180,74 1440,34 L1440,90 L0,90 Z" />
        </svg>
      </div>
    </>
  );
}
