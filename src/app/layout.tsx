import type { Metadata, Viewport } from "next";
import { BASE_OPEN_GRAPH, BRAND_NAME, COMPANY_NAME_KO, HOME_TITLE, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_URL, TITLE_TEMPLATE, jsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { T } from "@/lib/i18n";
import { LANG_INIT_SCRIPT } from "@/lib/language-init";
import { inter, nanumGothic } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  // 대표 주소 고정: https://www.jstworks.com (src/lib/seo.ts 의 SITE_URL)
  metadataBase: new URL(SITE_URL),
  // 제목(검색 결과·브라우저 탭): 홈은 HOME_TITLE, 하위 페이지는 "페이지명 | 조슈아트리웍스"
  title: { default: HOME_TITLE, template: TITLE_TEMPLATE },
  description: SITE_DESCRIPTION,
  applicationName: BRAND_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: COMPANY_NAME_KO, url: SITE_URL }],
  creator: COMPANY_NAME_KO,
  publisher: COMPANY_NAME_KO,
  category: "business",
  alternates: { canonical: "/", types: { "application/rss+xml": "/rss.xml" } },
  // 링크 공유 대표 사진은 app/opengraph-image.jpg · twitter-image.jpg (히어로 밤하늘 사진, 1200×630)
  openGraph: {
    ...BASE_OPEN_GRAPH,
    url: "/",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false, address: false, email: false },
};

/**
 * 휴대폰 다크 모드에서도 사이트 색을 바꾸지 않습니다(밝은 화면 전용).
 * <meta name="color-scheme" content="only light"> 가 들어가, 크롬 등 브라우저가 글자·배경색을 자동으로 어둡게 바꾸지 않습니다.
 * 같은 설정을 globals.css 의 :root { color-scheme } 에도 둡니다.
 */
export const viewport: Viewport = {
  colorScheme: "only light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // 영어(EN)를 고른 사람은 그리기 전에 스크립트가 lang·data-lang 을 바꾸므로 그 차이는 경고하지 않습니다
    <html lang="ko" className={`${inter.variable} ${nanumGothic.variable}`} suppressHydrationWarning>
      <head>
        {/* 고른 언어(KO/EN)를 첫 화면 전에 표시합니다. 새로고침해도 한국어가 잠깐 보이지 않습니다 */}
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
        {/* 검색엔진·AI 검색용 회사(Organization)·웹사이트(WebSite) 정보(JSON-LD). 사이트 카드(로고·이름)에 쓰입니다 */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([organizationJsonLd(), websiteJsonLd()]) }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:text-primary-foreground"
        >
          <T>본문으로 건너뛰기</T>
        </a>
        {/* 머리글·본문·바닥글은 (site)/layout.tsx 에 있습니다 */}
        {children}
      </body>
    </html>
  );
}
