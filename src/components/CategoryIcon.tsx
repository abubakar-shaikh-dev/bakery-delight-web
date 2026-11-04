"use client";

import {
  CakeSlice,
  Candy,
  Cookie,
  Croissant,
  Cupcake,
  Donut,
  IceCreamCone,
  Sparkles,
  Square,
  Wheat,
} from "lucide-react";

/** Lucide keys available for categories. */
export const CATEGORY_ICONS = [
  { key: "cake", label: "Cake slice", Icon: CakeSlice },
  { key: "cupcake", label: "Cupcake", Icon: Cupcake },
  { key: "cookie", label: "Cookie", Icon: Cookie },
  { key: "brownie", label: "Brownie (square)", Icon: Square },
  { key: "donut", label: "Donut", Icon: Donut },
  { key: "icecream", label: "Ice cream", Icon: IceCreamCone },
  { key: "wheat", label: "Bread / wheat", Icon: Wheat },
  { key: "croissant", label: "Croissant", Icon: Croissant },
  { key: "candy", label: "Candy", Icon: Candy },
  { key: "sparkles", label: "Sparkles (seasonal)", Icon: Sparkles },
] as const;

export function CategoryGlyph({
  icon,
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  icon: string;
  className?: string;
  strokeWidth?: number;
}) {
  const found = CATEGORY_ICONS.find((i) => i.key === icon);
  const Icon = found ? found.Icon : Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
