import type { Metadata } from "next";
import { NEWS, OFFICE_LOCATIONS, PEOPLE, dateKey, type NewsItem } from "@/content/site";

/**
 * 검색엔진(SEO)·AI 검색(GEO)용 사이트 정보.
 *
 * 사이트 주소: NEXT_PUBLIC_SITE_URL 이 있으면 그 값, 없으면 Vercel 이 배포 때 넣어 주는 운영 도메인
 * (VERCEL_PROJECT_PRODUCTION_URL — 자체 도메인을 연결하면 자동으로 그 도메인), 둘 다 없으면 로컬 주소입니다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Joshua Tree WORKS";
/** 브라우저 탭 제목. 어느 페이지에서나 이 이름 하나만 보입니다(페이지 이름을 앞에 붙이지 않음) */
export const TAB_TITLE = "Joshua Tree Works";
export const COMPANY_NAME_KO = "조슈아트리웍스 주식회사";
export const COMPANY_NAME_EN = "Joshua Tree Works CO., Ltd.";
export const CONTACT_EMAIL = "info@jstworks.com";

/** 사이트 전체 설명(검색 결과 아래 문구·링크 공유 미리보기·AI 요약에 쓰입니다) */
export const SITE_DESCRIPTION =
  "조슈아트리웍스(Joshua Tree WORKS)는 검증된 한국 브랜드의 미국 독점영업권과 자사 IP(K-GANADA™, 젠틀복스)를 결합한 미국향 커머스 플랫폼입니다. 서울 본사와 미국 캘리포니아 얼바인 법인(H&H USA LLC)이 함께 K-Play·K-Living·K-Beauty 제품을 미국 시장에 선보입니다.";

export const SITE_KEYWORDS = [
  "조슈아트리웍스",
  "Joshua Tree WORKS",
  "JSTWorks",
  "H&H USA LLC",
  "미국 진출",
  "미국 독점영업권",
  "K-브랜드 미국 수출",
  "K-GANADA",
  "젠틀복스",
  "Gentle Vox",
  "요리엔 정수기",
  "K-Beauty",
  "K-Living",
  "K-Play",
  "Korean brands US market",
  "US exclusive distribution",
];

/** 페이지별 설명 (각 page.tsx 의 metadata 에 씁니다) */
export const PAGE_SEO = {
  about: {
    title: "About",
    description: SITE_DESCRIPTION,
  },
  people: {
    title: "People",
    description:
      "조슈아트리웍스를 이끄는 사람들. 대표이사 이우용을 비롯해 경영·브랜드·해외영업 부문 구성원과 경력을 소개합니다.",
  },
  business: {
    title: "Business",
    description:
      "조슈아트리웍스의 비즈니스: 자사 IP 젠틀복스(Gentle Vox)와 타사 제품 독점영업권(삼익제약 요리엔 정수기 등)을 K-Play·K-Living·K-Beauty·K-Apparel·K-Charm·K-Food 카테고리로 소개합니다.",
  },
  media: {
    title: "Media",
    description: "조슈아트리웍스의 보도 기사와 회사 소식: 특허 등록, 미국 상표 출원, 미국 법인 설립, 미국 수출 소식을 모았습니다.",
  },
  contact: {
    title: "Contact",
    description: `조슈아트리웍스 연락처와 오시는 길. 한국 본사(서울시 강남구 역삼로26길 5)와 미국 법인 H&H USA LLC(17595 Harvard Ave, Suite C, Irvine, CA 92614). 문의: ${CONTACT_EMAIL}`,
  },
} as const;

/** 링크 공유 미리보기 공통 값 (페이지의 openGraph 는 레이아웃 값과 합쳐지지 않고 통째로 바뀌므로 매번 함께 넣습니다) */
export const BASE_OPEN_GRAPH = {
  type: "website",
  siteName: SITE_NAME,
  locale: "ko_KR",
  alternateLocale: ["en_US"],
} satisfies NonNullable<Metadata["openGraph"]>;

/**
 * 페이지 메타데이터: 설명·대표 주소(canonical)·링크 공유 미리보기.
 * 탭 제목(title)은 넣지 않아 레이아웃의 TAB_TITLE 이 그대로 보입니다. 페이지 이름은 링크 공유 제목에만 씁니다.
 */
export function pageMetadata(key: keyof typeof PAGE_SEO, path: string): Metadata {
  const { title, description } = PAGE_SEO[key];
  return {
    description,
    alternates: { canonical: path },
    openGraph: { ...BASE_OPEN_GRAPH, url: path, title: `${title} | ${SITE_NAME}`, description },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description },
  };
}

/** "2026.03.17" → "2026-03-17" (구조화 데이터·사이트맵 날짜) */
export function isoDate(date: string): string | undefined {
  const key = dateKey(date);
  if (key === null) return undefined;
  const s = String(key);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/** 글 주소 (/media/번호) */
export const articlePath = (item: Pick<NewsItem, "id">) => `/media/${item.id}`;

/** 공개된 글만 (자리 표시 항목 제외) */
export const PUBLISHED_NEWS = NEWS.filter((item) => !item.placeholder);

/**
 * JSON-LD 를 <script> 에 넣을 문자열로 바꿉니다.
 * "<" 를 유니코드로 바꿔, 데이터 안의 문자열이 </script> 로 스크립트를 끊지 못하게 합니다(Next.js 권장 방식).
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const [korea, usa] = OFFICE_LOCATIONS;
const ceo = PEOPLE.find((person) => person.role.includes("CEO"));

/** 회사(Organization) 구조화 데이터: 이름·로고·주소·연락처·대표·설립일 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY_NAME_KO,
    alternateName: [SITE_NAME, COMPANY_NAME_EN, "JSTWorks", "조슈아트리웍스"],
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon.png`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    foundingDate: "2025-12-15",
    ...(ceo ? { founder: { "@type": "Person", name: ceo.name, jobTitle: ceo.role } } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: "역삼로26길 5, 조슈아트리빌딩",
      addressLocality: "강남구",
      addressRegion: "서울",
      addressCountry: "KR",
    },
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: CONTACT_EMAIL, availableLanguage: ["Korean", "English"] },
    subOrganization: {
      "@type": "Organization",
      name: usa.name,
      description: "조슈아트리웍스 미국 법인",
      address: {
        "@type": "PostalAddress",
        streetAddress: "17595 Harvard Ave, Suite C",
        addressLocality: "Irvine",
        addressRegion: "CA",
        postalCode: "92614",
        addressCountry: "US",
      },
    },
    areaServed: ["KR", "US"],
    knowsAbout: ["미국 독점영업권", "K-브랜드 미국 진출", "캐릭터·아티스트 굿즈", "스마트 오디오 토이", "K-Beauty", "K-Living"],
    // 한국 본사 표기는 화면의 주소와 같게 둡니다.
    location: korea.address,
  };
}

/** 웹사이트(WebSite) 구조화 데이터 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: COMPANY_NAME_KO,
    url: SITE_URL,
    inLanguage: ["ko-KR", "en-US"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** 글(NewsArticle) 구조화 데이터 */
export function articleJsonLd(item: NewsItem, description: string) {
  const url = `${SITE_URL}${articlePath(item)}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description,
    datePublished: isoDate(item.date),
    inLanguage: "ko-KR",
    mainEntityOfPage: url,
    url,
    ...(item.cover ? { image: [`${SITE_URL}${item.cover.src}`] } : {}),
    author: item.kind === "보도" ? { "@type": "Organization", name: item.source } : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(item.href ? { isBasedOn: item.href } : {}),
  };
}
