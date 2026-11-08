import mongoose from "mongoose";
import { mongoUri } from "./env";
import { fixtureJpeg } from "./files";

/**
 * Talks to the SAME Mongo server the app uses, but always on the throwaway
 * "bakerydelight_test" database. The dev server under test gets that name
 * via MONGODB_DB in playwright.config.ts, so server and test process see
 * identical data. The "settings" collection is never dropped: it holds the
 * app's auto-seed marker, and every spec seeds its own site baseline.
 */
export const TEST_DB_NAME = "bakerydelight_test";

const DATA_COLLECTIONS = [
  "treats",
  "categories",
  "reviews",
  "galleryimages",
  "messages",
  "uploadedimages",
] as const;

let connPromise: Promise<mongoose.Connection> | null = null;

export async function testDb(): Promise<mongoose.Connection> {
  if (!connPromise) {
    connPromise = mongoose
      .createConnection(mongoUri(), {
        dbName: TEST_DB_NAME,
        serverSelectionTimeoutMS: 8000,
      })
      .asPromise();
  }
  return connPromise;
}

export async function collection(name: string) {
  const conn = await testDb();
  // The native driver collection — the full API (findOne, countDocuments,
  // updateMany, ...), not mongoose's thinner Collection wrapper.
  return conn.db!.collection(name);
}

/** Drops every data collection; the seed marker in "settings" survives. */
export async function resetDb(): Promise<void> {
  const conn = await testDb();
  for (const name of DATA_COLLECTIONS) {
    await conn.dropCollection(name).catch(() => undefined);
  }
}

/** Fixture constants asserted by name across specs. */
export const FIX = {
  whatsappDigits: "919876543210",
  whatsappNumber: "+91 98765 43210",
  email: "hello@bakerydelight.test",
  featuredTreat: "Truffle Tower",
  searchWord: "kulfi",
  searchableTreat: "Kulfi Dream",
  noPriceTreat: "Plain Batch",
  categoryWithTreats: "Test Cakes",
  freeCategory: "Test Cookies",
  emptyCategory: "Empty Shelf",
  unreadSender: "Unread Sender",
  // "Read" is a substring of "Unread" — filter() matching is case-insensitive,
  // so this fixture must not collide with it.
  readSender: "Seen Sender",
  galleryCaption1: "Gallery photo 1",
} as const;

const SITE = {
  bakeryName: "Bakery Delight",
  tagline: "Home-baked happiness",
  phone: FIX.whatsappNumber,
  whatsappNumber: FIX.whatsappNumber,
  whatsappDigits: FIX.whatsappDigits,
  email: FIX.email,
  address: "12 Flour Lane, Mumbai",
  socials: {
    instagram: "https://instagram.com/bakerydelight",
    whatsapp: "",
    pinterest: "",
    facebook: "",
    youtube: "",
  },
};

export async function seedDb(): Promise<void> {
  const conn = await testDb();
  await resetDb();
  const now = Date.now();

  // Known settings baseline (the "seed" marker doc is left untouched).
  const settings = conn.collection("settings");
  await settings.deleteMany({ key: "site" });
  await settings.insertOne({ key: "site", ...SITE });

  // Two db-stored images so treats/gallery can use real /api/images URLs.
  const bytes = await fixtureJpeg(120, 90);
  const uploads = await conn
    .collection("uploadedimages")
    .insertMany([
      { data: bytes, mime: "image/jpeg" },
      { data: bytes, mime: "image/jpeg" },
    ]);
  const img0 = `/api/images/${String(uploads.insertedIds[0])}`;
  const img1 = `/api/images/${String(uploads.insertedIds[1])}`;

  await conn.collection("categories").insertMany([
    { name: FIX.categoryWithTreats, slug: "test-cakes", icon: "cake", order: 0 },
    { name: FIX.freeCategory, slug: "test-cookies", icon: "cookie", order: 1 },
    { name: FIX.emptyCategory, slug: "empty-shelf", icon: "sparkles", order: 2 },
  ]);

  // One featured treat (homepage strip) + 9 others (treats infinite scroll
  // needs more than the 8-per-page). Kulfi Dream is the search target.
  const treats: Array<Record<string, unknown>> = [
    ["Truffle Tower", FIX.categoryWithTreats, 499, img0, true, "A tower of dark truffles"],
    ["Kulfi Dream", FIX.categoryWithTreats, 249, "", false, "Saffron kulfi cups"],
    ["Pistachio Ring", FIX.categoryWithTreats, 199, "", false, "Nutty pistachio ring"],
    ["Cocoa Cloud", FIX.categoryWithTreats, 299, "", false, "Feather-light chocolate"],
    ["Berry Byte", FIX.categoryWithTreats, 149, img1, false, "Berry bites"],
    ["Choco Chip Classic", FIX.freeCategory, 99, "", false, "The timeless cookie"],
    ["Oat Crumble", FIX.freeCategory, 89, "", false, "Crumbly oat rounds"],
    ["Ginger Snap", FIX.freeCategory, 79, "", false, "Snappy ginger biscuits"],
    ["Lemon Drizzle", FIX.freeCategory, 129, "", false, "Zesty drizzle loaf"],
    ["Plain Batch", FIX.freeCategory, null, "", false, "Simple and honest"],
  ].map(([name, category, price, image, featured, tagline], i) => ({
    name,
    slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category,
    price,
    image,
    featured,
    tagline,
    description: `Fixture treat ${name} baked for e2e testing.`,
    cloudinaryPublicId: null,
    createdAt: new Date(now + i * 60_000),
    updatedAt: new Date(now + i * 60_000),
  }));
  await conn.collection("treats").insertMany(treats);

  // Two approved (one featured) for the public list; one pending for admin.
  await conn.collection("reviews").insertMany([
    {
      name: "Asha Verma",
      rating: 5,
      text: "These cupcakes made my daughter's birthday unforgettable, will order again.",
      socialPlatform: "Instagram",
      socialUrl: "https://instagram.com/p/test",
      avatar: "",
      approved: true,
      featured: true,
      createdAt: new Date(now),
    },
    {
      name: "Rohit Menon",
      rating: 4,
      text: "The brownies arrived fresh and beautifully packed, quite nice.",
      socialPlatform: null,
      socialUrl: null,
      avatar: "",
      approved: true,
      featured: false,
      createdAt: new Date(now - 60_000),
    },
    {
      name: "Pending Person",
      rating: 3,
      text: "Pending review text that is long enough for validation.",
      socialPlatform: null,
      socialUrl: null,
      avatar: "",
      approved: false,
      featured: false,
      createdAt: new Date(now - 120_000),
    },
  ]);

  // 15 images so the public gallery exercises infinite scroll (>12/page).
  const ratios = ["1:1", "16:9", "9:16"] as const;
  await conn.collection("galleryimages").insertMany(
    Array.from({ length: 15 }, (_, i) => ({
      url: i % 2 === 0 ? img0 : img1,
      caption: `Gallery photo ${i + 1}`,
      ratio: ratios[i % 3],
      cloudinaryPublicId: null,
      createdAt: new Date(now - i * 60_000), // photo 1 is newest/first
    })),
  );

  await conn.collection("messages").insertMany([
    {
      name: FIX.unreadSender,
      email: "unread@test.dev",
      phone: FIX.whatsappNumber,
      message: "I would like a three tier chocolate cake for a wedding this month.",
      read: false,
      createdAt: new Date(now),
    },
    {
      name: FIX.readSender,
      email: "read@test.dev",
      phone: "",
      message: "Do you ship brownies outside the city on weekends?",
      read: true,
      createdAt: new Date(now - 60_000),
    },
  ]);
}
