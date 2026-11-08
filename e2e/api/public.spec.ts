import { test, expect } from "../support/fixtures";
import { seedDb, collection } from "../support/db";
import { fixtureJpeg } from "../support/files";

/**
 * Public API contract tests. POSTs spoof a unique x-forwarded-for per test —
 * clientIp() reads that header first, giving every test its own rate-limit
 * bucket (5/hour per IP) instead of sharing the browser's.
 */
test.describe("public API", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  const withIp = (ip: string) => ({ "x-forwarded-for": ip });

  test("GET /api/treats honours q, category and clamps", async ({
    request,
  }) => {
    const all = await request.get("/api/treats");
    expect(all.status()).toBe(200);
    const allData = await all.json();
    expect(allData.total).toBe(10);
    expect(allData.treats).toHaveLength(8); // default limit
    expect(allData.categories.length).toBeGreaterThanOrEqual(3);
    // featured-first, then oldest
    expect(allData.treats[0].featured).toBe(true);

    const searched = await request.get("/api/treats?q=kulfi");
    const searchData = await searched.json();
    expect(searchData.total).toBe(1);
    expect(searchData.treats[0].name).toBe("Kulfi Dream");

    const filtered = await request.get("/api/treats?category=Test%20Cookies");
    expect((await filtered.json()).total).toBe(5);

    // limit is clamped to 1..24; offset paginates
    const clamped = await request.get("/api/treats?limit=999");
    expect((await clamped.json()).treats.length).toBe(10);
    const paged = await request.get("/api/treats?limit=4&offset=8");
    const pageData = await paged.json();
    expect(pageData.treats).toHaveLength(2);
    expect(pageData.total).toBe(10);
  });

  test("GET /api/reviews returns approved only with the average", async ({
    request,
  }) => {
    const res = await request.get("/api/reviews");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(2);
    expect(data.avg).toBe(4.5);
    expect(data.reviews.map((r: { name: string }) => r.name)).toEqual([
      "Asha Verma",
      "Rohit Menon",
    ]);
  });

  test("GET /api/gallery paginates", async ({ request }) => {
    const first = await (await request.get("/api/gallery?limit=12")).json();
    expect(first.total).toBe(15);
    expect(first.images).toHaveLength(12);

    const second = await (
      await request.get("/api/gallery?limit=12&offset=12")
    ).json();
    expect(second.images).toHaveLength(3);
  });

  test("POST /api/contact validates every field", async ({ request }) => {
    const post = (data: unknown, ip: string) =>
      request.post("/api/contact", { data, headers: withIp(ip) });

    expect(
      (await post({}, "10.1.0.1")).status(),
    ).toBe(400);
    expect(
      await (
        await post({ name: "", email: "a@b.co", message: "hello there" }, "10.1.0.2")
      ).json(),
    ).toEqual({ error: "Please tell us your name." });
    expect(
      await (
        await post({ name: "A", email: "not-an-email", message: "hello there" }, "10.1.0.3")
      ).json(),
    ).toEqual({ error: "Please enter a valid email address." });
    expect(
      await (
        await post(
          { name: "A", email: "a@b.co", phone: "abc", message: "hello there" },
          "10.1.0.4",
        )
      ).json(),
    ).toEqual({ error: "Phone number looks off — digits, spaces and + - ( ) only." });
    expect(
      await (
        await post({ name: "A", email: "a@b.co", message: "hi" }, "10.1.0.5")
      ).json(),
    ).toEqual({ error: "Your message should be between 5 and 2000 characters." });

    // Valid submission stores the message.
    const ok = await post(
      { name: "API Sender", email: "api@test.dev", message: "Sent via the API test." },
      "10.1.0.6",
    );
    expect(ok.status()).toBe(200);
    expect(await ok.json()).toEqual({ ok: true });
    expect(
      await (await collection("messages")).countDocuments({ name: "API Sender" }),
    ).toBe(1);
  });

  test("POST /api/contact rate limits the sixth attempt", async ({
    request,
  }) => {
    const ip = "10.2.0.1";
    let last;
    for (let i = 0; i < 6; i++) {
      last = await request.post("/api/contact", {
        data: { name: "Spam", email: "spam@test.dev", message: "Rate limit probe." },
        headers: withIp(ip),
      });
    }
    expect(last!.status()).toBe(429);
    expect(await last!.json()).toEqual({
      error: "Too many messages sent. Please try again later.",
    });
  });

  test("POST /api/reviews validates and stores unapproved", async ({
    request,
  }) => {
    const post = (data: unknown, ip: string) =>
      request.post("/api/reviews", { data, headers: withIp(ip) });

    expect((await post({}, "10.3.0.1")).status()).toBe(400);
    expect(
      await (
        await post({ name: "A" }, "10.3.0.2")
      ).json(),
    ).toEqual({ error: "Please pick a star rating." });
    expect(
      await (
        await post({ name: "A", rating: 5, text: "short" }, "10.3.0.3")
      ).json(),
    ).toEqual({ error: "Your review should be between 10 and 600 characters." });
    // Out-of-range rating is rejected.
    expect(
      (await post({ name: "A", rating: 9, text: "long enough text here" }, "10.3.0.4")).status(),
    ).toBe(400);

    const ok = await post(
      { name: "API Reviewer", rating: 4, text: "Submitted straight through the API." },
      "10.3.0.5",
    );
    expect(ok.status()).toBe(200);
    const doc = await (await collection("reviews")).findOne({ name: "API Reviewer" });
    expect(doc?.approved).toBe(false);
  });

  test("GET /api/images/[id] serves stored bytes and rejects bad ids", async ({
    request,
  }) => {
    expect((await request.get("/api/images/not-an-id")).status()).toBe(400);
    expect(
      (await request.get("/api/images/ffffffffffffffffffffffff")).status(),
    ).toBe(404);

    // Seed one real upload and fetch it back.
    const bytes = await fixtureJpeg(60, 40);
    const inserted = await (await collection("uploadedimages")).insertOne({
      data: bytes,
      mime: "image/jpeg",
    });
    const res = await request.get(`/api/images/${String(inserted.insertedId)}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/jpeg");
    expect((await res.body()).length).toBe(bytes.length);
  });
});
