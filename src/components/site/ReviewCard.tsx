import Image from "next/image";
import { ExternalLink, User } from "lucide-react";
import { IconFacebook, IconInstagram, IconQuote, IconWhatsApp } from "../icons";
import StarRating from "./StarRating";

export function SocialIcon({ platform, url }: { platform: string | null; url: string | null }) {
  if (!platform || !url) return null;
  const cls = "h-3.5 w-3.5";
  const icon =
    platform === "Instagram" ? (
      <IconInstagram className={cls} />
    ) : platform === "WhatsApp" ? (
      <IconWhatsApp className={cls} />
    ) : platform === "Facebook" ? (
      <IconFacebook className={cls} />
    ) : (
      <ExternalLink className={cls} strokeWidth={1.8} />
    );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${platform} review`}
      title={`View on ${platform}`}
      className="inline-flex items-center gap-1 rounded-full bg-berry-soft px-2.5 py-1 text-[11px] font-medium text-berry-deep transition-colors hover:bg-berry/15"
    >
      {icon}
      {platform}
    </a>
  );
}

export default function ReviewCard({
  review,
  compact = false,
}: {
  review: {
    _id: string;
    name: string;
    rating: number;
    text: string;
    socialPlatform: string | null;
    socialUrl: string | null;
    avatar: string;
  };
  compact?: boolean;
}) {
  const initial = review.name.trim().charAt(0).toUpperCase();

  return (
    <article
      className={`flex flex-col rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream-300 transition-shadow duration-200 hover:shadow-md md:p-7 ${
        compact ? "" : "h-full"
      }`}
    >
      <IconQuote className="mb-4 h-8 w-8 rotate-180 text-berry/40" />
      <p className="flex-1 text-[14px] leading-relaxed text-stone-600">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="mt-6 flex items-center gap-3.5">
        {review.avatar ? (
          <Image
            src={review.avatar}
            alt={review.name}
            width={128}
            height={128}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-berry-soft"
          />
        ) : (
          <span className="grid h-11 w-11 place-items-center rounded-full bg-berry-soft font-display text-lg font-bold text-berry-deep ring-2 ring-white">
            {initial || <User className="h-5 w-5" strokeWidth={1.8} />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink">{review.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} className="h-3.5 w-3.5" />
            <SocialIcon platform={review.socialPlatform} url={review.socialUrl} />
          </div>
        </div>
      </div>
    </article>
  );
}
