import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * 검색엔진·AI 검색 로봇 안내 (/robots.txt).
 * 회사 소개 사이트라 모든 페이지를 열어 두고, AI 검색(ChatGPT·Claude·Perplexity·Google AI)이
 * 회사를 정확히 소개할 수 있도록 AI 로봇도 명시적으로 허용합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
  ];
  // 검색 로봇: 네이버(Yeti)·다음(Daum)·빙(Bingbot, ChatGPT 검색도 참고)도 명시적으로 허용합니다
  const searchBots = ["Yeti", "Daum", "Bingbot"];
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...[...searchBots, ...aiBots].map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
