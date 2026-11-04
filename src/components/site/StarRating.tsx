import { Star } from "lucide-react";

export default function StarRating({
  rating,
  className = "h-4 w-4",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={rating > 0 ? `${rating} out of 5 stars` : undefined}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`${className} ${
            i <= rating
              ? "fill-gold text-gold"
              : "fill-cream-400 text-cream-400"
          }`}
        />
      ))}
    </div>
  );
}
