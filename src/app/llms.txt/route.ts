import { HISTORY, IP_ITEMS, OFFICE_LOCATIONS, PEOPLE } from "@/content/site";
import {
  CONTACT_EMAIL,
  COMPANY_NAME_EN,
  COMPANY_NAME_KO,
  PAGE_SEO,
  PUBLISHED_NEWS,
  SITE_DESCRIPTION,
  SITE_NAME,
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
      ["About", "/", PAGE_SEO.about.description],
      ["Business", "/business", PAGE_SEO.business.description],
      ["People", "/people", PAGE_SEO.people.description],
      ["Media", "/media", PAGE_SEO.media.description],
      ["Contact", "/contact", PAGE_SEO.contact.description],
    ] as const
  ).map(([name, path, description]) => `- [${name}](${SITE_URL}${path}): ${description}`);

  const news = PUBLISHED_NEWS.map(
    (item) => `- [${item.title}](${SITE_URL}${articlePath(item)}): ${item.date} · ${item.kind} · ${item.source}`,
  );
  const history = HISTORY.map((item) =>
    `- ${item.date} ${item.text}${item.note ? ` ${item.note}` : ""}${item.sub ? ` — ${item.sub}` : ""}`,
  );
  const status = { registered: "등록", filed: "출원", planned: "출원 예정", certified: "인증" } as const;
  const ip = IP_ITEMS.map((item) => `- ${item.date} ${item.title} (${status[item.status]})`);
  const people = PEOPLE.map((person) => `- ${person.name} — ${person.role}`);
  const offices = OFFICE_LOCATIONS.map((office) => `- ${office.eyebrow}: ${office.name}, ${office.address}`);

  const body = [
    `# ${SITE_NAME} (${COMPANY_NAME_KO})`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `영문 회사명: ${COMPANY_NAME_EN} / 문의: ${CONTACT_EMAIL}`,
    "",
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
