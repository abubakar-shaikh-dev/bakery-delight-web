import {
  fallbackCategories,
  fallbackGallery,
  fallbackReviews,
  fallbackSettings,
  fallbackTreats,
} from "@/lib/seed";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import { escapeRegex } from "@/lib/utils";
import Category from "@/models/Category";
import GalleryImage from "@/models/GalleryImage";
import Review from "@/models/Review";
import Setting, { ISettings } from "@/models/Setting";
import Treat from "@/models/Treat";

export type SettingsData = Pick<
  ISettings,
  | "bakeryName"
  | "tagline"
  | "phone"
  | "whatsappNumber"
  | "whatsappDigits"
  | "email"
  | "address"
  | "socials"
>;

async function withDB<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const conn = await connectDB();
    if (!conn) return fallback;
    return await fn();
  } catch (err) {
    console.error("[site-data]", (err as Error).message);
    return fallback;
  }
}

/**
 * Cached per request: the (site) layout and the page below it both need
 * settings, and cache() collapses those into a single DB read.
 */
export const getSettings = cache(async function getSettings(): Promise<SettingsData> {
  return withDB<SettingsData>(
    async () => {
      const doc = await Setting.findOne({ key: "site" }).lean<ISettings | null>();
      return doc
        ? {
            bakeryName: doc.bakeryName,
            tagline: doc.tagline,
            phone: doc.phone,
            whatsappNumber: doc.whatsappNumber,
            whatsappDigits: doc.whatsappDigits,
            email: doc.email,
            address: doc.address,
            socials: doc.socials,
          }
        : fallbackSettings;
    },
    fallbackSettings,
  );
});

export interface TreatData {
  _id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number | null;
  image: string;
  featured: boolean;
}

const mapTreat = (d: Record<string, unknown>): TreatData => ({
  _id: String(d._id),
  name: d.name as string,
  slug: d.slug as string,
  category: d.category as string,
  tagline: d.tagline as string,
  description: d.description as string,
  price: (d.price as number | null) ?? null,
  image: d.image as string,
  featured: d.featured as boolean,
});

const fallbackTreatList: TreatData[] = fallbackTreats.map((t) => ({ ...t, _id: t.slug }));

export function getFeaturedTreats(limit = 5): Promise<TreatData[]> {
  return withDB<TreatData[]>(
    async () => {
      const docs = await Treat.find({ featured: true })
        .sort({ featured: -1, createdAt: 1 })
        .limit(limit)
        .lean();
      // DB is up but empty — that's the owner's real menu, not an outage.
      return docs.map(mapTreat);
    },
    fallbackTreatList,
  );
}

export interface ReviewData {
  _id: string;
  name: string;
  rating: number;
  text: string;
  socialPlatform: string | null;
  socialUrl: string | null;
  avatar: string;
}

const mapReview = (d: Record<string, unknown>): ReviewData => ({
  _id: String(d._id),
  name: d.name as string,
  rating: d.rating as number,
  text: d.text as string,
  socialPlatform: (d.socialPlatform as string | null) ?? null,
  socialUrl: (d.socialUrl as string | null) ?? null,
  avatar: d.avatar as string,
});

const fallbackReviewList: ReviewData[] = fallbackReviews;

export function getFeaturedReviews(limit = 3): Promise<ReviewData[]> {
  return withDB<ReviewData[]>(
    async () => {
      const docs = await Review.find({ approved: true, featured: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      // DB is up but empty — that's the real state, not an outage.
      return docs.map(mapReview);
    },
    fallbackReviewList,
  );
}

/**
 * Hero summary — the homepage shows one honest figure about reviews or,
 * when there are none yet, no rating at all.
 */
export function getReviewsSummary(): Promise<{ total: number; avg: number }> {
  return withDB<{ total: number; avg: number }>(
    async () => {
      const [total, agg] = await Promise.all([
        Review.countDocuments({ approved: true }),
        Review.aggregate<{ _id: null; avg: number }>([
          { $match: { approved: true } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]),
      ]);
      return {
        total,
        avg: total === 0 ? 0 : Math.round((agg[0]?.avg ?? 0) * 10) / 10,
      };
    },
    { total: fallbackReviewList.length, avg: 5 },
  );
}

export interface GalleryData {
  _id: string;
  url: string;
  caption: string;
  ratio: string;
}

export function getGallery(limit = 5): Promise<GalleryData[]> {
  return withDB<GalleryData[]>(
    async () => {
      const docs = await GalleryImage.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      // DB is up but empty — that's the real state, not an outage.
      return docs.map((d) => ({
        _id: String(d._id),
        url: d.url,
        caption: d.caption,
        ratio: d.ratio ?? "1:1",
      }));
    },
    fallbackGallery,
  );
}

export interface GalleryPage {
  images: GalleryData[];
  total: number;
}

/** Paginated gallery for the gallery page browser. */
export function getGalleryPage(
  limit = 12,
  offset = 0,
): Promise<GalleryPage> {
  return withDB<GalleryPage>(
    async () => {
      const [docs, total] = await Promise.all([
        GalleryImage.find().sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
        GalleryImage.countDocuments(),
      ]);
      return {
        images: docs.map((d) => ({
          _id: String(d._id),
          url: d.url,
          caption: d.caption,
          ratio: d.ratio ?? "1:1",
        })),
        total,
      };
    },
    {
      images: fallbackGallery.slice(offset, offset + limit),
      total: fallbackGallery.length,
    },
  );
}

/* ------------------------- paginated public queries ------------------------ */

export interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

export function getCategories(): Promise<CategoryData[]> {
  return withDB<CategoryData[]>(
    async () => {
      const docs = await Category.find().sort({ order: 1, name: 1 }).lean();
      if (!docs.length)
        return fallbackCategories;
      return docs.map((d) => ({
        _id: String(d._id),
        name: d.name,
        slug: d.slug,
        icon: d.icon,
        order: d.order,
      }));
    },
    fallbackCategories,
  );
}

export interface TreatsPage {
  treats: TreatData[];
  total: number;
  categories: CategoryData[];
}

export function getTreatsPage(
  q: string,
  category: string,
  limit = 8,
  offset = 0,
): Promise<TreatsPage> {
  const term = q.trim().slice(0, 60);
  const cat = category.trim().slice(0, 40);
  const rx = new RegExp(escapeRegex(term), "i");
  return withDB<TreatsPage>(
    async () => {
      const filter: Record<string, unknown> = {};
      if (term)
        filter.$or = [
          { name: rx },
          { tagline: rx },
          { description: rx },
          { category: rx },
        ];
      if (cat) filter.category = cat;

      const [docs, total, all] = await Promise.all([
        Treat.find(filter).sort({ featured: -1, createdAt: 1 }).skip(offset).limit(limit).lean(),
        Treat.countDocuments(filter),
        Category.find().sort({ order: 1, name: 1 }).lean(),
      ]);

      return {
        treats: docs.map(mapTreat),
        total,
        categories: all.map((d) => ({
          _id: String(d._id),
          name: d.name,
          slug: d.slug,
          icon: d.icon,
          order: d.order,
        })),
      };
    },
    {
      treats: fallbackTreatList
        .filter(
          (t) =>
            (!category || t.category === category) &&
            (!q ||
              `${t.name} ${t.tagline} ${t.description} ${t.category}`
                .toLowerCase()
                .includes(q.toLowerCase())),
        )
        .slice(offset, offset + limit),
      total: fallbackTreatList.filter(
        (t) =>
          (!category || t.category === category) &&
          (!q ||
            `${t.name} ${t.tagline} ${t.description} ${t.category}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ).length,
      categories: fallbackCategories,
    },
  );
}

export interface ReviewsPage {
  reviews: ReviewData[];
  total: number;
  avg: number;
}

export function getReviewsPage(
  limit = 9,
  offset = 0,
): Promise<ReviewsPage> {
  return withDB<ReviewsPage>(
    async () => {
      const filter = { approved: true };
      const [docs, total, agg] = await Promise.all([
        Review.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
        Review.countDocuments(filter),
        Review.aggregate<{ _id: null; avg: number }>([
          { $match: filter },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]),
      ]);
      if (!docs.length && offset === 0) {
        // DB is up with no approved reviews — show the real (empty) state.
        return { reviews: [], total, avg: 0 };
      }
      return {
        reviews: docs.map(mapReview),
        total,
        avg: Math.round((agg[0]?.avg ?? 0) * 10) / 10,
      };
    },
    {
      reviews: fallbackReviewList.slice(offset, offset + limit),
      total: fallbackReviewList.length,
      avg: 5,
    },
  );
}
