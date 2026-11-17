import type { MetadataRoute } from "next";
import { PUBLISHED_NEWS, SITE_URL, articlePath, isoDate } from "@/lib/seo";

/** 검색엔진에 알려 주는 사이트 주소 목록 (/sitemap.xml) */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/business`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/people`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/media`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ];
  const articles: MetadataRoute.Sitemap = PUBLISHED_NEWS.map((item) => ({
    url: `${SITE_URL}${articlePath(item)}`,
    lastModified: isoDate(item.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));
  return [...pages, ...articles];
}
