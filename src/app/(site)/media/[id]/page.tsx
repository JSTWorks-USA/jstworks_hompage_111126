import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { Container } from "@/components/site-ui";
import { NEWS } from "@/content/site";
import { BASE_OPEN_GRAPH, SITE_NAME, articleJsonLd, articlePath, isoDate, jsonLd } from "@/lib/seo";
import { articlePreview } from "../article-body";
import { ArticleContent } from "../article-content";
import { T } from "@/lib/i18n";

type Props = { params: Promise<{ id: string }> };

/** 주소 값(번호)에 맞는 글. 예전 글자 주소(slug)도 찾아 줍니다 */
const findIndex = (key: string) => NEWS.findIndex((n) => String(n.id) === key || n.slug === key);

export function generateStaticParams() {
  return NEWS.map((item) => ({ id: String(item.id) }));
}

/** 검색 결과·링크 공유 미리보기에 쓰는 글 요약 (본문 앞부분) */
const summaryOf = (item: (typeof NEWS)[number]) => articlePreview(item.slug, item.body, 150);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = NEWS[findIndex(id)];
  if (!item) return {};
  const description = summaryOf(item);
  const path = articlePath(item);
  // 탭 제목은 레이아웃의 "Joshua Tree Works" 그대로. 기사 제목은 링크 공유 미리보기에만 씁니다
  return {
    description,
    alternates: { canonical: path },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      type: "article",
      url: path,
      title: item.title,
      description,
      publishedTime: isoDate(item.date),
      ...(item.cover ? { images: [{ url: item.cover.src, width: item.cover.width, height: item.cover.height, alt: item.cover.alt }] } : {}),
    },
    twitter: { card: "summary_large_image", title: `${item.title} | ${SITE_NAME}`, description },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const index = findIndex(id);
  if (index < 0) notFound();
  // 예전 주소(/media/글자주소)로 들어오면 번호 주소로 옮겨 줍니다.
  if (String(NEWS[index].id) !== id) permanentRedirect(`/media/${NEWS[index].id}`);

  const item = NEWS[index];
  const prev = NEWS[index - 1];
  const next = NEWS[index + 1];

  return (
    <article>
      {/* 검색엔진·AI 검색용 기사 정보(JSON-LD) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd(item, summaryOf(item))) }} />
      {/* 페이지 폭(최대 1600px)이 넓어도 본문은 읽기 좋은 폭(52rem)으로 가운데에 둡니다 */}
      <Container className="py-12 md:py-16">
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-12">
          <Link
            href="/media"
            className="inline-flex min-h-11 items-center gap-2 self-start text-sm text-muted-foreground no-underline hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            <T>Media 목록</T>
          </Link>

          <ArticleContent item={item} />

          {(prev || next) && (
            <nav aria-label="다른 글" className="grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
              {prev && (
                <Link
                  href={`/media/${prev.id}`}
                  className="flex flex-col gap-2 rounded-xl p-4 no-underline hover:bg-muted"
                >
                  <span className="text-sm text-muted-foreground">
                    <T>이전 글</T>
                  </span>
                  <span className="text-base leading-snug">
                    <T>{prev.title}</T>
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={`/media/${next.id}`}
                  className="flex flex-col gap-2 rounded-xl p-4 text-right no-underline hover:bg-muted sm:col-start-2"
                >
                  <span className="text-sm text-muted-foreground">
                    <T>다음 글</T>
                  </span>
                  <span className="text-base leading-snug">
                    <T>{next.title}</T>
                  </span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </Container>
    </article>
  );
}
