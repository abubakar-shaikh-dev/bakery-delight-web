import PageHeader from "@/components/site/PageHeader";
import { TreatGridSkeleton } from "@/components/site/Skeletons";

export default function LoadingTreats() {
  return (
    <>
      <PageHeader
        eyebrow="Fresh from the oven"
        title="Our"
        accent="Treats"
        subtitle="From classic flavours to custom creations, there's something for every occasion. Search the menu or pick a category."
        crumb="Our Treats"
      />
      <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <TreatGridSkeleton count={8} />
      </section>
    </>
  );
}
