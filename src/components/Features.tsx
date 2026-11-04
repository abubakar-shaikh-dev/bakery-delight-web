import { IconGift, IconHeart, IconHome, IconLeaf } from "./icons";

const features = [
  {
    title: "Fresh Ingredients",
    tagline: "Only the best, always fresh.",
    icon: <IconLeaf className="h-6 w-6" />,
  },
  {
    title: "Made with Love",
    tagline: "Every cake tells a story.",
    icon: <IconHeart className="h-6 w-6" />,
  },
  {
    title: "Home Bakery",
    tagline: "A small kitchen, big dreams.",
    icon: <IconHome className="h-6 w-6" />,
  },
  {
    title: "Custom Orders",
    tagline: "Your ideas, our creation.",
    icon: <IconGift className="h-6 w-6" />,
  },
];

export default function Features() {
  return (
    <section id="features" className="px-5 py-16 md:px-10 lg:px-[8.5rem]">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center">
            <span className="mb-3 text-berry-deep">{f.icon}</span>
            <h3 className="text-[15px] font-semibold text-ink">{f.title}</h3>
            <p className="mt-1.5 text-[13px] text-stone-500">{f.tagline}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
