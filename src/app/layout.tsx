import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BASE_OPEN_GRAPH, COMPANY_NAME_KO, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL, jsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { inter, nanumGothic } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 미국향 커머스 플랫폼 | 조슈아트리웍스`,
    template: "%s | Joshua Tree WORKS",
  },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${inter.variable} ${nanumGothic.variable}`}>
      <body>
        {/* 검색엔진·AI 검색용 회사·웹사이트 정보(JSON-LD) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([organizationJsonLd(), websiteJsonLd()]) }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:text-primary-foreground"
        >
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
