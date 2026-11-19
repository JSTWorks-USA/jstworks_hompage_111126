import type { Metadata, Viewport } from "next";
import { BASE_OPEN_GRAPH, COMPANY_NAME_KO, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL, TAB_TITLE, jsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { T } from "@/lib/i18n";
import { LANG_INIT_SCRIPT } from "@/lib/language-init";
import { inter, nanumGothic } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // 브라우저 탭 제목: 모든 페이지가 "Joshua Tree Works" 하나만 씁니다(하위 페이지는 title 을 넣지 않아 이 값을 물려받음)
  title: TAB_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: COMPANY_NAME_KO, url: SITE_URL }],
  creator: COMPANY_NAME_KO,
  publisher: COMPANY_NAME_KO,
  category: "business",
  alternates: { canonical: "/" },
  // 링크 공유 대표 사진은 app/opengraph-image.jpg · twitter-image.jpg (히어로 밤하늘 사진, 1200×630)
  openGraph: {
    ...BASE_OPEN_GRAPH,
    url: "/",
    title: `${SITE_NAME} — 미국향 커머스 플랫폼`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} — 미국향 커머스 플랫폼`, description: SITE_DESCRIPTION },
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
      </head>
      <body>
        {/* 검색엔진·AI 검색용 회사·웹사이트 정보(JSON-LD) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([organizationJsonLd(), websiteJsonLd()]) }} />
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
