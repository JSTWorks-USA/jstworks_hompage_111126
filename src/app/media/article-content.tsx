import Image from "next/image";
import { ArrowUpRightIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NewsItem } from "@/content/site";
import { cn } from "@/lib/utils";
import { ArticleBody, readArticleMarkdown } from "./article-body";
import { NewsCover } from "./news-cover";
import { ShareButton } from "./share-button";

/**
 * 글 한 편의 내용: 제목, 출처·종류·날짜, 대표 이미지, 본문, 원문 링크, 공유하기.
 * 전체 페이지(/media/글주소)와 목록 위에 뜨는 창(모달)이 같이 씁니다.
 * heading: 전체 페이지에서는 h1, 창 안에서는 h2
 */
export function ArticleContent({
  item,
  heading = "h1",
  share = true,
}: {
  item: NewsItem;
  heading?: "h1" | "h2";
  /** 창(모달)에서는 위 막대에 공유하기가 있으므로 끕니다 */
  share?: boolean;
}) {
  const Title = heading;
  // 본문 마크다운(src/content/news/<slug>.md)이 있으면 블로그 본문으로, 없으면 body 단락으로 보여 줍니다.
  const markdown = readArticleMarkdown(item.slug);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <p className="m-0 text-sm font-medium text-foreground">{item.source}</p>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] text-muted-foreground">
            <Badge variant={item.kind === "보도" ? "primary" : "outline"} size="default">
              {item.kind}
            </Badge>
            <span className="tabular-nums">{item.date}</span>
          </div>
          {share && <ShareButton id={item.id} className="-mr-3" />}
        </div>
        <Title
          className={cn(
            "m-0 text-[1.375rem] leading-snug font-bold tracking-[-0.01em] break-keep",
            item.placeholder && "text-muted-foreground",
          )}
        >
          {item.title}
        </Title>
      </header>

      {/* 사진은 원래 크기 기준으로 보여 줍니다: 글 폭보다 크면 폭에 맞춰 줄이고, 작으면 늘리지 않습니다.
          로고를 얹는 사진(cover.logo)은 로고 위치를 지키려고 칸 비율을 사진 비율에 맞춰 둡니다. */}
      {item.cover &&
        (item.cover.logo ? (
          <NewsCover
            item={item}
            eager
            sizes="(min-width: 800px) 720px, 100vw"
            className="w-full rounded-lg"
            style={{ aspectRatio: `${item.cover.width} / ${item.cover.height}` }}
          />
        ) : (
          <Image
            src={item.cover.src}
            alt={item.cover.alt}
            width={item.cover.width}
            height={item.cover.height}
            loading="eager"
            sizes={`(min-width: 800px) ${Math.min(item.cover.width, 720)}px, 100vw`}
            className="block h-auto max-w-full rounded-lg"
          />
        ))}

      {markdown ? (
        <ArticleBody markdown={markdown} />
      ) : (
        <div className="flex flex-col gap-5 text-[0.9375rem] leading-[1.75] break-keep">
          {item.body.map((paragraph) => (
            <p key={paragraph} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* 보도 글: 본문 끝에 출처를 글자로 남깁니다(원문 링크가 있으면 링크 버튼도 함께) */}
      {item.kind === "보도" && (
        <p className="m-0 border-t border-border pt-5 type-meta text-muted-foreground">출처: {item.source}</p>
      )}

      {item.href && (
        <Button asChild variant="outline" className="self-start">
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {item.source}에서 원문 보기
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
            <span className="sr-only">(새 창에서 열림)</span>
          </a>
        </Button>
      )}
    </div>
  );
}
