import { NEWS } from "@/content/site";
import { articlePreview } from "@/app/(site)/media/article-body";
import { COMPANY_NAME_KO, SITE_DESCRIPTION, SITE_NAME, SITE_URL, articlePath, isoDate } from "@/lib/seo";

/**
 * 보도·소식 RSS 피드 (/rss.xml, RSS 2.0).
 * 네이버 서치어드바이저의 "RSS 제출"에 이 주소(https://www.jstworks.com/rss.xml)를 넣으면
 * 새 글이 네이버 검색에 더 빨리 알려집니다. Media 글 목록(site.ts 의 NEWS)에서 빌드 때 만듭니다.
 */

/** XML 안에 그대로 넣으면 안 되는 문자(& < > " ')를 바꿉니다 */
const xml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** "2026-03-17" → RSS 날짜 형식(RFC 822). 한국 시간 오전 9시로 둡니다 */
const rssDate = (iso: string) => new Date(`${iso}T09:00:00+09:00`).toUTCString();

export function GET() {
  const items = NEWS.map((item) => {
    const url = `${SITE_URL}${articlePath(item)}`;
    const date = isoDate(item.date);
    return [
      "    <item>",
      `      <title>${xml(item.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <description>${xml(articlePreview(item.slug, item.body, 300))}</description>`,
      `      <category>${xml(item.kind)}</category>`,
      date ? `      <pubDate>${rssDate(date)}</pubDate>` : "",
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const newest = NEWS.map((item) => isoDate(item.date)).find(Boolean);
  const body = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    "  <channel>",
    `    <title>${xml(`${SITE_NAME} 보도·소식`)}</title>`,
    `    <link>${SITE_URL}/media</link>`,
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
    `    <description>${xml(SITE_DESCRIPTION)}</description>`,
    "    <language>ko</language>",
    `    <copyright>${xml(COMPANY_NAME_KO)}</copyright>`,
    newest ? `    <lastBuildDate>${rssDate(newest)}</lastBuildDate>` : "",
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
