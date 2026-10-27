import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/** One page: everything else is a question asked on it. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl.href, changeFrequency: "monthly", priority: 1 }];
}
