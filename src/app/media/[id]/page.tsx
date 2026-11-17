import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { Container } from "@/components/site-ui";
import { NEWS } from "@/content/site";
import { ArticleContent } from "../article-content";

type Props = { params: Promise<{ id: string }> };

/** 주소 값(번호)에 맞는 글. 예전 글자 주소(slug)도 찾아 줍니다 */
const findIndex = (key: string) => NEWS.findIndex((n) => String(n.id) === key || n.slug === key);

export function generateStaticParams() {
  return NEWS.map((item) => ({ id: String(item.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = NEWS[findIndex(id)];
  return { title: item ? item.title : "Media" };
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
      <Container className="flex flex-col gap-12 py-12 md:py-16">
        <Link
          href="/media"
          className="inline-flex min-h-11 items-center gap-2 self-start text-sm text-muted-foreground no-underline hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          Media 목록
        </Link>

        <ArticleContent item={item} />

        {(prev || next) && (
          <nav aria-label="다른 글" className="grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
            {prev && (
              <Link
                href={`/media/${prev.id}`}
                className="flex flex-col gap-2 rounded-xl p-4 no-underline hover:bg-muted"
              >
                <span className="text-sm text-muted-foreground">이전 글</span>
                <span className="text-base leading-snug">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link
                href={`/media/${next.id}`}
                className="flex flex-col gap-2 rounded-xl p-4 text-right no-underline hover:bg-muted sm:col-start-2"
              >
                <span className="text-sm text-muted-foreground">다음 글</span>
                <span className="text-base leading-snug">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </Container>
    </article>
  );
}
