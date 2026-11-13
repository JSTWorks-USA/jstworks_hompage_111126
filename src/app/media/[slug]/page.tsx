import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/site-ui";
import { NEWS } from "@/content/site";
import { cn } from "@/lib/utils";
import { NewsCover } from "../news-cover";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return NEWS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = NEWS.find((n) => n.slug === slug);
  return { title: item ? item.title : "Media" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const index = NEWS.findIndex((n) => n.slug === slug);
  if (index < 0) notFound();

  const item = NEWS[index];
  const prev = NEWS[index - 1];
  const next = NEWS[index + 1];

  return (
    <article>
      <Container className="flex max-w-[50rem] flex-col gap-12 py-12 md:py-16">
        <Link
          href="/media"
          className="inline-flex min-h-11 items-center gap-2 self-start text-sm text-muted-foreground no-underline hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          Media 목록
        </Link>

        <header className="flex flex-col gap-6">
          <h1
            className={cn(
              "m-0 text-[2rem] leading-tight font-bold tracking-[-0.02em] md:text-[2.75rem]",
              item.placeholder && "text-muted-foreground",
            )}
          >
            {item.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Badge variant={item.kind === "보도" ? "primary" : "outline"} size="lg">
              {item.kind}
            </Badge>
            <span className="tabular-nums">{item.date}</span>
            <span>{item.source}</span>
          </div>
        </header>

        <NewsCover
          item={item}
          priority
          sizes="(min-width: 800px) 720px, 100vw"
          className="aspect-video rounded-xl"
        />

        <div className="flex max-w-[65ch] flex-col gap-6 text-lg leading-relaxed">
          {item.body.map((paragraph) => (
            <p key={paragraph} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>

        {item.href && (
          <Button asChild variant="outline" size="lg" className="self-start">
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.source}에서 원문 보기
              <ArrowUpRightIcon aria-hidden="true" className="size-4" />
              <span className="sr-only">(새 창에서 열림)</span>
            </a>
          </Button>
        )}

        {(prev || next) && (
          <nav aria-label="다른 글" className="grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
            {prev && (
              <Link
                href={`/media/${prev.slug}`}
                className="flex flex-col gap-2 rounded-xl p-4 no-underline hover:bg-muted"
              >
                <span className="text-sm text-muted-foreground">이전 글</span>
                <span className="text-base leading-snug">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link
                href={`/media/${next.slug}`}
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
