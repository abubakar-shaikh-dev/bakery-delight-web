import { test, expect, type APIResponse } from "../support/fixtures";
import { seedDb, collection, FIX } from "../support/db";
import { fixtureJpeg, textFile } from "../support/files";

/**
 * Admin API contract tests, using the authenticated storageState from the
 * setup project. Happy paths are covered through the UI specs — this file
 * pins the auth gate and the validation edges.
 */
test.describe("admin API", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("treats POST validates the payload", async ({ request }) => {
    const noName = await request.post("/api/admin/treats", { data: {} });
    expect(noName.status()).toBe(400);
    expect(await noName.json()).toEqual({ error: "Name is required." });

    const ok = await request.post("/api/admin/treats", {
      data: {
        name: "API Treat",
        price: 42,
        featured: true,
        variants: [
          { label: "Small", price: 42 },
          { label: "", price: 5 }, // dropped — no label
          { label: "Bad", price: "x" }, // dropped — no usable price
        ],
      },
    });
    expect(ok.status()).toBe(201);
    const { treat } = await ok.json();
    expect(treat.slug).toBe("api-treat");
    expect(treat.category).toBe("Cakes"); // default when absent
    expect(treat.variants).toEqual([{ label: "Small", price: 42 }]);
  });

  test("invalid ids and missing docs answer 400/404", async ({ request }) => {
    expect(
      (await request.delete("/api/admin/treats/not-a-valid-id")).status(),
    ).toBe(400);
    expect(
      (
        await request.put("/api/admin/treats/ffffffffffffffffffffffff", {
          data: { name: "Ghost" },
        })
      ).status(),
    ).toBe(404);
    expect(
      (
        await request.patch("/api/admin/messages/ffffffffffffffffffffffff", {
          data: { read: true },
        })
      ).status(),
    ).toBe(404);
  });

  test("categories POST rejects dupes and bad names", async ({ request }) => {
    const dupe = await request.post("/api/admin/categories", {
      data: { name: FIX.categoryWithTreats },
    });
    expect(dupe.status()).toBe(409);
    expect(await dupe.json()).toEqual({
      error: `"${FIX.categoryWithTreats}" already exists.`,
    });

    const tooLong = await request.post("/api/admin/categories", {
      data: { name: "x".repeat(41) },
    });
    expect(tooLong.status()).toBe(400);
  });

  test("a category with treats cannot be deleted", async ({ request }) => {
    const cat = await (await collection("categories")).findOne({
      name: FIX.categoryWithTreats,
    });
    const res = await request.delete(`/api/admin/categories/${String(cat!._id)}`);
    expect(res.status()).toBe(409);
    expect(await res.json()).toEqual({
      error: `"${FIX.categoryWithTreats}" still has 5 treats. Move or delete them first.`,
    });
  });

  test("gallery PATCH demands a caption string", async ({ request }) => {
    const img = await (await collection("galleryimages")).findOne({});
    const bad = await request.patch(`/api/admin/gallery/${String(img!._id)}`, {
      data: { caption: 42 },
    });
    expect(bad.status()).toBe(400);

    const good = await request.patch(`/api/admin/gallery/${String(img!._id)}`, {
      data: { caption: "API caption" },
    });
    expect(good.status()).toBe(200);
  });

  test("messages PATCH demands a boolean read flag", async ({ request }) => {
    const msg = await (await collection("messages")).findOne({});
    const bad = await request.patch(`/api/admin/messages/${String(msg!._id)}`, {
      data: { read: "yes" },
    });
    expect(bad.status()).toBe(400);

    const good = await request.patch(`/api/admin/messages/${String(msg!._id)}`, {
      data: { read: true },
    });
    expect(good.status()).toBe(200);
  });

  test("upload enforces type, size and magic bytes", async ({ request }) => {
    const noFile = await request.post("/api/admin/upload", {
      multipart: { notTheRightField: "nope" },
    });
    expect(noFile.status()).toBe(400);

    const text = await request.post("/api/admin/upload", {
      multipart: {
        file: {
          name: textFile.name,
          mimeType: textFile.mimeType,
          buffer: textFile.buffer,
        },
      },
    });
    expect(text.status()).toBe(400);

    const fake = await request.post("/api/admin/upload", {
      multipart: {
        file: {
          name: "fake.jpg",
          mimeType: "image/jpeg",
          buffer: Buffer.from("jpeg-looking but not really"),
        },
      },
    });
    expect(fake.status()).toBe(400);

    const ok = await request.post("/api/admin/upload", {
      multipart: {
        file: {
          name: "api.jpg",
          mimeType: "image/jpeg",
          buffer: await fixtureJpeg(),
        },
      },
    });
    expect(ok.status()).toBe(200);
    const data = await ok.json();
    // Cloudinary env is blanked in the test server — DB storage it is.
    expect(data.storage).toBe("db");
    expect(data.url).toMatch(/^\/api\/images\/[a-f0-9]{24}$/);
  });

  test("settings PUT trims and stores the site document", async ({
    request,
  }) => {
    const res = await request.put("/api/admin/settings", {
      data: {
        bakeryName: "  API Bakery  ",
        whatsappDigits: "91 98765 43210",
        email: "api@bakery.test",
        socials: { instagram: "https://instagram.com/api", facebook: "junk" },
      },
    });
    expect(res.status()).toBe(200);
    const { settings } = await res.json();
    expect(settings.bakeryName).toBe("API Bakery");
    expect(settings.whatsappDigits).toBe("919876543210");
    expect(settings.socials.instagram).toBe("https://instagram.com/api");
    expect(settings.socials.facebook).toBe(""); // non-URLs are dropped
  });
});

test.describe("admin API (unauthenticated)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("every admin route rejects anonymous requests with 401", async ({
    request,
  }) => {
    const checks: Array<Promise<APIResponse>> = [
      request.get("/api/admin/treats"),
      request.get("/api/admin/categories"),
      request.get("/api/admin/gallery"),
      request.get("/api/admin/messages"),
      request.get("/api/admin/reviews"),
      request.get("/api/admin/settings"),
      request.post("/api/admin/treats", { data: {} }),
    ];
    for (const res of await Promise.all(checks)) {
      expect(res.status()).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorized" });
    }
  });
});
