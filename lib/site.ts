/**
 * The site's canonical URL, for metadata, the sitemap and robots.
 * NEXT_PUBLIC_SITE_URL wins once there's a custom domain; otherwise Vercel's
 * production URL, then localhost in development.
 */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);
