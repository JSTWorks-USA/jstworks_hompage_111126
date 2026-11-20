import { FAQ } from "@/content/faq";
import { BRANDS, CONTACT_EMAIL, HISTORY, IP_ITEMS, NEWS, OFFICE_LOCATIONS, PEOPLE, VISION, VISION_DETAILS } from "@/content/site";
import {
  BRAND_NAME,
  COMPANY_NAME_EN,
  COMPANY_NAME_KO,
  PAGE_SEO,
  SITE_DESCRIPTION,
  SITE_URL,
  articlePath,
} from "@/lib/seo";

/**
 * AI 검색(GEO)용 사이트 요약 (/llms.txt, llmstxt.org 형식).
 * ChatGPT·Claude·Perplexity 같은 AI 가 회사를 소개할 때 읽기 쉬운 마크다운으로, 사이트 데이터에서 빌드 때 만듭니다.
 */
export function GET() {
  const pages = (
    [
      ["홈 (About)", "/", PAGE_SEO.about.description],
      ["Business", "/business", PAGE_SEO.business.description],
      ["People", "/people", PAGE_SEO.people.description],
      ["Media", "/media", PAGE_SEO.media.description],
      ["Contact", "/contact", PAGE_SEO.contact.description],
    ] as const
  ).map(([name, path, description]) => `- [${name}](${SITE_URL}${path}): ${description}`);

  const news = NEWS.map(
    (item) => `- [${item.title}](${SITE_URL}${articlePath(item)}): ${item.date} · ${item.kind} · ${item.source}`,
  );
  const history = HISTORY.map((item) =>
    `- ${item.date} ${item.text}${item.note ? ` ${item.note}` : ""}${item.sub ? ` — ${item.sub}` : ""}`,
  );
  const status = { registered: "등록", filed: "출원", planned: "출원 예정", certified: "인증" } as const;
  const ip = IP_ITEMS.map((item) => `- ${item.date} ${item.title} (${status[item.status]})`);
  const people = PEOPLE.map((person) => `- ${person.name} — ${person.role}`);
  // 사업 요약: 연혁 장면의 카테고리별 소개(VISION_DETAILS)와 Business 페이지 브랜드 소개(BRANDS) 문구 그대로
  const business = [
    `- ${VISION.lead} ${VISION.title}`,
    ...Object.entries(VISION_DETAILS).map(([category, detail]) => `- ${category} · ${detail.title}: ${detail.body}`),
    ...BRANDS.map((brand) => `- ${brand.name} (${brand.category})${brand.tagline ? `: ${brand.tagline}.` : ""} ${brand.description}`),
  ];
  const offices = OFFICE_LOCATIONS.map((office) => `- ${office.eyebrow}: ${office.name}, ${office.address}`);

  const body = [
    `# ${BRAND_NAME}(JSTWorks, Joshua Tree Works) — ${COMPANY_NAME_KO}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `영문 회사명: ${COMPANY_NAME_EN} / 문의: ${CONTACT_EMAIL}`,
    "",
    "## 사업 요약",
    ...business,
    "",
    "## 자주 묻는 질문",
    ...FAQ.flatMap((item) => [`### ${item.question}`, item.answer, ""]),
    "## 페이지",
    ...pages,
    "",
    "## 회사 정보",
    ...offices,
    "",
    "## 연혁",
    ...history,
    "",
    "## 특허·상표·인증",
    ...ip,
    "",
    "## 구성원",
    ...people,
    "",
    "## 보도·소식",
    ...news,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
