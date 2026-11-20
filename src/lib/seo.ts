import type { Metadata } from "next";
import { CONTACT_EMAIL, OFFICE_LOCATIONS, PEOPLE, dateKey, type NewsItem } from "@/content/site";

/**
 * 검색엔진(SEO)·AI 검색(GEO)용 사이트 정보.
 *
 * 사이트 대표 주소는 https://www.jstworks.com 하나로 고정합니다(끝에 / 없음).
 * 환경변수(VERCEL_URL 등)로 만들지 않아, vercel.app 주소나 미리보기 배포로 들어와도
 * 대표 주소(canonical)·링크 공유 주소(og:url)·사이트맵·robots 가 항상 이 주소를 가리킵니다.
 */
export const SITE_URL = "https://www.jstworks.com";

export const SITE_NAME = "Joshua Tree WORKS";
/**
 * 검색 결과·사이트 카드에 보일 한글 회사명. og:site_name, application-name, 구조화 데이터 이름에 씁니다.
 * 네이버·구글에서 회사명으로 검색할 때 이 이름과 아래 다른 이름들로 같은 회사임을 알아봅니다.
 */
export const BRAND_NAME = "조슈아트리웍스";
/** 홈 제목(검색 결과 제목·브라우저 탭) */
export const HOME_TITLE = "조슈아트리웍스(JSTWorks) | Joshua Tree Works - 미국향 커머스 플랫폼";
/** 하위 페이지 제목 형식: "People | 조슈아트리웍스" */
export const TITLE_TEMPLATE = `%s | ${BRAND_NAME}`;
export const COMPANY_NAME_KO = "조슈아트리웍스 주식회사";
export const COMPANY_NAME_EN = "Joshua Tree Works CO., Ltd.";

/** 사이트 전체 설명(검색 결과 아래 문구·링크 공유 미리보기·AI 요약에 쓰입니다) */
export const SITE_DESCRIPTION =
  "조슈아트리웍스(JSTWorks, Joshua Tree Works)는 검증된 한국 브랜드의 미국 독점영업권과 자사 IP(K-GANADA™, 젠틀복스)를 결합한 미국향 커머스 플랫폼입니다. 서울 본사와 미국 캘리포니아 얼바인 법인(H&H USA LLC)이 함께 K-Play·K-Living·K-Beauty 제품을 미국 시장에 선보입니다.";

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
  siteName: BRAND_NAME,
  locale: "ko_KR",
  alternateLocale: ["en_US"],
} satisfies NonNullable<Metadata["openGraph"]>;

/**
 * 페이지 메타데이터: 설명·대표 주소(canonical)·링크 공유 미리보기.
 * 제목은 "페이지명 | 조슈아트리웍스" (레이아웃의 TITLE_TEMPLATE 이 뒤를 붙입니다).
 */
export function pageMetadata(key: keyof typeof PAGE_SEO, path: string): Metadata {
  const { title, description } = PAGE_SEO[key];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...BASE_OPEN_GRAPH, url: path, title: `${title} | ${BRAND_NAME}`, description },
    twitter: { card: "summary_large_image", title: `${title} | ${BRAND_NAME}`, description },
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

/**
 * JSON-LD 를 <script> 에 넣을 문자열로 바꿉니다.
 * "<" 를 유니코드로 바꿔, 데이터 안의 문자열이 </script> 로 스크립트를 끊지 못하게 합니다(Next.js 권장 방식).
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const [korea, usa] = OFFICE_LOCATIONS;
// 대표: 직함이 "대표이사"(또는 CEO)인 사람. 직함 표기를 바꾸면 여기도 맞춰야 회사 정보에 대표가 빠지지 않습니다
const ceo = PEOPLE.find((person) => /대표이사|CEO/.test(person.role));

/** 회사(Organization) 구조화 데이터: 이름·로고·주소·연락처·대표·설립일 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: ["JSTWorks", "Joshua Tree Works", "JOSHUA TREE WORKS", COMPANY_NAME_KO],
    url: SITE_URL,
    // 정사각형 로고 512×512 (public/logo.png)
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    foundingDate: "2025-12-15",
    ...(ceo ? { founder: { "@type": "Person", name: ceo.name, jobTitle: ceo.role } } : {}),
    // 3F Joshuatree Building, Yeoksam-ro 26-gil 5, Gangnam-Gu, Seoul, Republic of Korea
    address: {
      "@type": "PostalAddress",
      streetAddress: "3F Joshuatree Building, Yeoksam-ro 26-gil 5",
      addressLocality: "Gangnam-Gu",
      addressRegion: "Seoul",
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
    name: BRAND_NAME,
    alternateName: ["JSTWorks", "Joshua Tree Works"],
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
