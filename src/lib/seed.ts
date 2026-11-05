/**
 * Seed data — the original static content of the site.
 * Used to bootstrap an empty database once, and as graceful
 * fallbacks if the database is unreachable.
 */

export interface SeedTreat {
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number | null;
  image: string;
  featured: boolean;
}

export const seedTreats: SeedTreat[] = [
  {
    name: "Cakes",
    slug: "cakes",
    category: "Cakes",
    tagline: "For every celebration",
    description:
      "Our signature celebration cakes — chocolate drip, strawberry cream, vanilla berry and more. Baked fresh to order for birthdays, anniversaries and every sweet moment worth remembering.",
    price: 699,
    image: "/images/treat-cakes.jpg",
    featured: true,
  },
  {
    name: "Cupcakes",
    slug: "cupcakes",
    category: "Cupcakes",
    tagline: "Little bites of happiness",
    description:
      "Soft, pillowy cupcakes crowned with silky swirls of buttercream. Perfect for gift boxes, party tables and little everyday indulgences.",
    price: 49,
    image: "/images/treat-cupcakes.jpg",
    featured: true,
  },
  {
    name: "Cookies",
    slug: "cookies",
    category: "Cookies",
    tagline: "Classic & comforting",
    description:
      "Golden, chewy-centred chocolate chip cookies with crisp edges — the classic that never goes out of style, baked in small batches.",
    price: 199,
    image: "/images/treat-cookies.jpg",
    featured: true,
  },
  {
    name: "Brownies",
    slug: "brownies",
    category: "Brownies",
    tagline: "Rich, fudgy, irresistible",
    description:
      "Deep, dark and dangerously fudgy. Our brownies are dense, glossy-topped and loaded with chocolate in every bite.",
    price: 249,
    image: "/images/treat-brownies.jpg",
    featured: true,
  },
  {
    name: "Seasonal Specials",
    slug: "seasonal-specials",
    category: "Seasonal",
    tagline: "Limited time delights",
    description:
      "A rotating menu of festive bakes — berry cream cakes in summer, plum loaves in winter, and everything the season inspires.",
    price: 899,
    image: "/images/treat-seasonal.jpg",
    featured: true,
  },
];

export interface SeedReview {
  name: string;
  rating: number;
  text: string;
  socialPlatform: string | null;
  socialUrl: string | null;
  avatar: string;
  approved: boolean;
  featured: boolean;
}

export const seedReviews: SeedReview[] = [
  {
    name: "Ayesha K.",
    rating: 5,
    text: "The cake was not only beautiful but tasted even better! You can truly taste the love in every bite.",
    socialPlatform: "Instagram",
    socialUrl: "https://instagram.com/",
    avatar: "/images/avatar-1.jpg",
    approved: true,
    featured: true,
  },
  {
    name: "Rohan S.",
    rating: 5,
    text: "Super fresh, perfectly balanced flavors, and exactly what I imagined. Highly recommend!",
    socialPlatform: "WhatsApp",
    socialUrl: null,
    avatar: "/images/avatar-2.jpg",
    approved: true,
    featured: true,
  },
  {
    name: "Fatima R.",
    rating: 5,
    text: "Ordered for my mom’s birthday and she absolutely loved it. Will definitely order again!",
    socialPlatform: "Instagram",
    socialUrl: "https://instagram.com/",
    avatar: "/images/avatar-3.jpg",
    approved: true,
    featured: true,
  },
];

export const seedGallery = [
  { url: "/images/gallery-1.jpg", caption: "Chocolate celebration cake" },
  { url: "/images/gallery-2.jpg", caption: "Hazelnut cupcake" },
  { url: "/images/gallery-3.jpg", caption: "Fresh from the oven" },
  { url: "/images/gallery-4.jpg", caption: "Good food, happier people" },
  { url: "/images/gallery-5.jpg", caption: "Red velvet crumble" },
];

export interface SeedCategory {
  name: string;
  slug: string;
  icon: string;
  order: number;
}

export const seedCategories: SeedCategory[] = [
  { name: "Cakes", slug: "cakes", icon: "cake", order: 1 },
  { name: "Cupcakes", slug: "cupcakes", icon: "cupcake", order: 2 },
  { name: "Cookies", slug: "cookies", icon: "cookie", order: 3 },
  { name: "Brownies", slug: "brownies", icon: "brownie", order: 4 },
  { name: "Seasonal", slug: "seasonal", icon: "sparkles", order: 5 },
];

export const fallbackCategories = seedCategories.map((c) => ({
  ...c,
  _id: c.slug,
}));

export const seedSettings = {
  key: "site" as const,
  bakeryName: "Bakery Delight",
  tagline: "HOMEMADE CAKES, HAPPIER MOMENTS",
  phone: "+91 98765 43210",
  whatsappNumber: "+91 98765 43210",
  whatsappDigits: "919876543210",
  email: "hello@bakerydelight.in",
  address: "Your City, India",
  socials: {
    instagram: "https://instagram.com/bakerydelight",
    whatsapp: "https://wa.me/919876543210",
    pinterest: "https://pinterest.com/bakerydelight",
    facebook: "https://facebook.com/bakerydelight",
    youtube: "https://youtube.com/@bakerydelight",
  },
};

export const fallbackTreats = seedTreats;
export const fallbackReviews = seedReviews.map((r) => ({
  ...r,
  _id: r.name,
  createdAt: new Date().toISOString(),
}));
export const fallbackGallery = seedGallery.map((g, i) => ({
  ...g,
  _id: String(i),
  ratio: "1:1",
}));
export const fallbackSettings = seedSettings;
