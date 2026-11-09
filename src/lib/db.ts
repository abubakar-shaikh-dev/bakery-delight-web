import mongoose, { Mongoose } from "mongoose";
import {
  seedCategories,
  seedGallery,
  seedReviews,
  seedSettings,
  seedTreats,
} from "@/lib/seed";
import Category from "@/models/Category";
import GalleryImage from "@/models/GalleryImage";
import Review from "@/models/Review";
import Setting from "@/models/Setting";
import Treat from "@/models/Treat";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
  seeded: boolean;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache =
  global.__mongooseCache ??
  (global.__mongooseCache = { conn: null, promise: null, seeded: false });

/**
 * Bootstraps an empty database with the original static content, so the
 * site is never empty on first run. A persistent marker document makes
 * this once per database — content the owner deletes stays deleted even
 * when a collection is emptied and the server restarts.
 */
async function ensureSeed() {
  if (cache.seeded) return;
  cache.seeded = true;

  try {
    if (await Setting.findOne({ key: "seed" }).lean()) return;

    // Spaced createdAt values keep the mockup's display order.
    // Inserted through the raw collection API because mongoose's
    // `timestamps: true` overwrites provided createdAt fields.
    if ((await Treat.estimatedDocumentCount()) === 0) {
      await Treat.collection.insertMany(
        seedTreats.map((t, i) => ({
          ...t,
          createdAt: new Date(Date.now() - (seedTreats.length - i) * 60_000),
          updatedAt: new Date(Date.now() - (seedTreats.length - i) * 60_000),
        })),
      );
    }
    if ((await Review.estimatedDocumentCount()) === 0) {
      await Review.collection.insertMany(
        seedReviews.map((r, i) => ({
          ...r,
          createdAt: new Date(Date.now() - i * 60_000),
        })),
      );
    }
    if ((await Category.estimatedDocumentCount()) === 0) {
      await Category.insertMany(seedCategories);
    }
    if ((await GalleryImage.estimatedDocumentCount()) === 0) {
      await GalleryImage.collection.insertMany(
        [...seedGallery].map((g, i) => ({
          ...g,
          createdAt: new Date(Date.now() - i * 60_000),
        })),
      );
    }
    if ((await Setting.countDocuments({ key: "site" }).maxTimeMS(3000)) === 0) {
      await Setting.create(seedSettings);
    }

    // Written last so a failed bootstrap can be retried on next boot.
    // Raw collection API: the marker key isn't part of the ISettings shape.
    await Setting.collection.updateOne(
      { key: "seed" },
      { $setOnInsert: { key: "seed" } },
      { upsert: true },
    );
  } catch (err) {
    // Seeding is best-effort — never block a request because of it.
    console.error("[db] seed skipped:", (err as Error).message);
  }
}

export async function connectDB(): Promise<Mongoose | null> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .set({ strictQuery: true })
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB || undefined,
        serverSelectionTimeoutMS: 8000,
      })
      .then(async (conn) => {
        await ensureSeed();
        return conn;
      })
      .catch((err) => {
        console.error("[db] MongoDB connection failed:", err.message);
        cache.promise = null;
        throw err;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch {
    return null;
  }
  return cache.conn;
}
