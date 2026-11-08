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

/** The standard pre-filled order message, used by every treat CTA. */
export function waOrderLink(digits: string, treatName: string) {
  return waLink(digits, `Hi Bakery Delight, I'd like to order ${treatName}.`);
}
