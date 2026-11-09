import type { MetadataRoute } from "next";

/**
 * Web app manifest — gives browsers and search engines the site's name,
 * brand colors and app icons (the /icons/*.png set generated from the
 * same source as src/app/icon.png). Served at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bakery Delight — Homemade Cakes, Happier Moments",
    short_name: "Bakery Delight",
    description:
      "Homemade cakes, cupcakes and treats, freshly baked to order in a small home kitchen and ordered over WhatsApp.",
    id: "/",
    start_url: "/",
    display: "browser",
    background_color: "#fdf2ec", // cream-100 token value
    theme_color: "#fdf2ec",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
