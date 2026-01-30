import { MetadataRoute } from "next";

const SITE_URL = "https://www.qknou.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
