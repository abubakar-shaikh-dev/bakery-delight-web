/** Escapes user input before embedding it into a RegExp. */
export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Joins conditional class names — tiny clsx. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Validates an optional URL — empty passes, otherwise must be http(s). */
export function isOptionalUrl(value: string) {
  return value === "" || /^https?:\/\/.+/i.test(value);
}

/** Validates an optional phone — empty passes, otherwise digits/spaces/+-(). */
export function isOptionalPhone(value: string) {
  return value === "" || /^[+()\-\s\d]{7,24}$/.test(value);
}

export function waLink(digits: string, text?: string) {
  const t = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${t}`;
}

/** The standard pre-filled order message, used by every treat CTA.
    A chosen size lands in the message so the baker knows the ask. */
export function waOrderLink(
  digits: string,
  treatName: string,
  variantLabel?: string,
) {
  const suffix = variantLabel ? ` (${variantLabel})` : "";
  return waLink(
    digits,
    `Hi Bakery Delight, I'd like to order ${treatName}${suffix}.`,
  );
}

/**
 * The honest "from" price of a treat: the smaller of the standalone price
 * and the cheapest listed size. Cards, the detail page and JSON-LD all
 * read this so they never disagree.
 */
export function treatFromPrice(
  price: number | null,
  variants?: Array<{ price: number }>,
): number | null {
  const prices = [
    ...(typeof price === "number" && Number.isFinite(price) && price >= 0
      ? [price]
      : []),
    ...(variants ?? [])
      .map((v) => v.price)
      .filter((p) => Number.isFinite(p) && p >= 0),
  ];
  return prices.length ? Math.min(...prices) : null;
}
