import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Public pages welcome every crawler, human or AI. /admin is private and
 * /api is machine plumbing — except /api/images/, which serves real content
 * photos when Cloudinary is unconfigured; blocking it would hide those
 * images from Google Images and from scrapers that respect robots.txt
 * (WhatsApp's link preview among them).
 *
 * The AI agents are listed explicitly (same policy as the wildcard) so the
 * site's AI-search stance is a documented, deliberate choice — remove a
 * name here to keep that assistant out.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "FacebookBot",
  "Amazonbot",
  "YouBot",
  "DuckAssistBot",
  "cohere-ai",
  "Diffbot",
  "Imagesift",
  "MistralAI-User",
  "MistralAI-Training",
];

export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/images/"],
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: ["/", "/api/images/"],
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap,
  };
}
