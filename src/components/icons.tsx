/**
 * Icon system for the public site.
 * Generic icons are thin wrappers around lucide-react; brand icons
 * (Instagram, Facebook, YouTube, WhatsApp, Pinterest) and the bespoke
 * cupcake keep hand-drawn paths so the design stays pixel-true.
 * One stroke convention: 1.8 everywhere, 2 only for tiny directional arrows.
 */
import {
  ArrowRight as LucideArrowRight,
  ArrowUp as LucideArrowUp,
  ChevronRight as LucideChevronRight,
  Clock as LucideClock,
  Gift as LucideGift,
  Heart as LucideHeart,
  House as LucideHouse,
  Leaf as LucideLeaf,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  Phone as LucidePhone,
  Quote as LucideQuote,
  Search as LucideSearch,
} from "lucide-react";

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSearch({ className = "h-[18px] w-[18px]" }: IconProps) {
  return <LucideSearch className={className} strokeWidth={1.8} />;
}

export function IconArrowRight({ className = "h-4 w-4" }: IconProps) {
  return <LucideArrowRight className={className} strokeWidth={2} />;
}

export function IconArrowUp({ className = "h-[18px] w-[18px]" }: IconProps) {
  return <LucideArrowUp className={className} strokeWidth={2} />;
}

export function IconHeart({ className = "h-8 w-8", strokeWidth = 1.8 }: IconProps) {
  return (
    <LucideHeart
      aria-hidden="true"
      className={className}
      strokeWidth={strokeWidth}
      {...base}
    />
  );
}

export function IconLeaf({ className = "h-7 w-7" }: IconProps) {
  return <LucideLeaf className={className} strokeWidth={1.8} {...base} />;
}

export function IconHome({ className = "h-7 w-7" }: IconProps) {
  return <LucideHouse className={className} strokeWidth={1.8} {...base} />;
}

export function IconGift({ className = "h-7 w-7" }: IconProps) {
  return <LucideGift className={className} strokeWidth={1.8} {...base} />;
}

export function IconMail({ className = "h-[18px] w-[18px]" }: IconProps) {
  return <LucideMail className={className} strokeWidth={1.8} {...base} />;
}

export function IconPhone({ className = "h-[18px] w-[18px]" }: IconProps) {
  return <LucidePhone className={className} strokeWidth={1.8} {...base} />;
}

export function IconMapPin({ className = "h-[18px] w-[18px]" }: IconProps) {
  return <LucideMapPin className={className} strokeWidth={1.8} {...base} />;
}

export function IconQuote({ className = "h-9 w-9" }: IconProps) {
  return (
    <LucideQuote aria-hidden="true" className={className} fill="currentColor" strokeWidth={0} />
  );
}

export function IconChevronRight({ className = "h-4 w-4" }: IconProps) {
  return <LucideChevronRight className={className} strokeWidth={2} />;
}

export function IconClock({ className = "h-4 w-4" }: IconProps) {
  return <LucideClock className={className} strokeWidth={1.8} {...base} />;
}

/* ---------- Bespoke icons (no lucide equivalent) ---------- */

export function IconCupcake({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...base} strokeWidth={1.8}>
      <path d="M6.2 12.5 7.6 20a1.4 1.4 0 0 0 1.4 1.1h6a1.4 1.4 0 0 0 1.4-1.1l1.4-7.5" />
      <path d="M5.5 12.5h13" />
      <path d="M6 12.5c-1.4 0-2.5-1.1-2.5-2.4 0-1.2 1-2.3 2.3-2.4C6.1 6 7.6 4.6 9.4 4.6c.5 0 1 .1 1.4.3.6-1.1 1.8-1.9 3.2-1.9 2 0 3.7 1.6 3.7 3.5v.2c1.1.3 1.8 1.2 1.8 2.3 0 1.4-1.1 2.4-2.5 2.4" />
    </svg>
  );
}

export function IconInstagram({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...base} strokeWidth={1.8}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconWhatsApp({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.25.7-1.45 1.33-2.02 1.38-.52.05-1.18.07-1.9-.12-.44-.14-1-.32-1.73-.63-3.04-1.31-5.03-4.37-5.18-4.57-.15-.2-1.24-1.65-1.24-3.15 0-1.5.79-2.24 1.07-2.54.28-.3.6-.38.81-.38.2 0 .4 0 .58.01.19.01.44-.07.68.52.25.6.85 2.08.92 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.53-.15.15-.31.31-.13.61.17.3.77 1.27 1.65 2.06 1.14 1.01 2.09 1.33 2.39 1.48.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.58.35.07.13.07.75-.18 1.45Z" />
    </svg>
  );
}

export function IconPinterest({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.31-.09-.79-.17-2 .04-2.87.18-.78 1.18-4.97 1.18-4.97s-.3-.6-.3-1.49c0-1.4.81-2.44 1.82-2.44.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.35-.24 1 .5 1.81 1.49 1.81 1.78 0 3.15-1.88 3.15-4.59 0-2.4-1.72-4.08-4.19-4.08-2.85 0-4.53 2.14-4.53 4.35 0 .86.33 1.79.75 2.29.08.1.09.19.07.29-.08.31-.25 1-.28 1.14-.04.19-.15.23-.34.14-1.25-.58-2.03-2.41-2.03-3.88 0-3.16 2.3-6.06 6.62-6.06 3.48 0 6.18 2.48 6.18 5.79 0 3.45-2.18 6.23-5.2 6.23-1.02 0-1.97-.53-2.3-1.15l-.62 2.38c-.23.87-.84 1.96-1.25 2.63.94.29 1.94.45 2.98.45 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
    </svg>
  );
}

export function IconFacebook({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7h2.6l.4-3h-3V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4V11H8v3h2.6v7h2.9Z" />
    </svg>
  );
}

export function IconYoutube({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...base} strokeWidth={1.8}>
      <rect x="2.5" y="6" width="19" height="12.5" rx="3.5" />
      <polygon points="10.5 9.75 15 12.25 10.5 14.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
