"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NewsItem, NewsKind } from "@/content/site";
import { cn } from "@/lib/utils";
import { ArticleModal } from "./article-modal";
import { NewsCover } from "./news-cover";
import { ShareButton } from "./share-button";

type Filter = "전체" | NewsKind;
const FILTERS: Filter[] = ["전체", "보도", "소식"];
/** 처음에 보여 주는 글 수, 더보기를 누를 때마다 늘어나는 수 */
const PAGE_SIZE = 10;

export type FeedItem = NewsItem & { preview: string };

const isFilter = (value: string | null): value is Filter =>
  value !== null && (FILTERS as string[]).includes(value);

/**
 * 글 한 편: 출처 → 종류·날짜 → 제목 → 본문 앞부분(흐려지며 잘림) → 대표 이미지 → 공유하기.
 * 카드 전체가 링크라 어디를 눌러도 글 창이 열립니다. 공유하기는 링크 밖에 따로 두어(링크 안에 버튼을 넣지 않음) 카드 아래쪽에 겹칩니다.
 */
function FeedCard({ item, onOpen }: { item: FeedItem; onOpen: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <li className="relative">
      <Link
        href={`/media/${item.id}`}
        scroll={false}
        onClick={onOpen}
        className="flex flex-col gap-3 rounded-xl border border-border bg-background p-6 pb-18 text-foreground no-underline transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:flex-row md:gap-8 md:p-8 md:pb-20"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="m-0 text-sm font-medium">{item.source}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] text-muted-foreground">
            <Badge variant={item.kind === "보도" ? "primary" : "outline"} size="default">
              {item.kind}
            </Badge>
            <span className="tabular-nums">{item.date}</span>
          </div>
          <h2
            className={cn(
              "m-0 text-[1.375rem] leading-snug font-bold tracking-[-0.01em] break-keep",
              item.placeholder && "text-muted-foreground",
            )}
          >
            {item.title}
          </h2>
          {/* 본문 앞부분: 세 줄까지, 아래로 갈수록 흐려집니다 */}
          <p className="m-0 line-clamp-3 text-[0.9375rem] leading-[1.75] break-keep text-foreground [mask-image:linear-gradient(to_bottom,black_45%,transparent)]">
            {item.preview}
          </p>
        </div>
        {item.cover && (
          <NewsCover
            item={item}
            sizes="(min-width: 768px) 240px, 100vw"
            className="aspect-video w-full shrink-0 rounded-lg md:aspect-[4/3] md:w-60"
          />
        )}
      </Link>
      <ShareButton id={item.id} className="absolute bottom-4 left-3 md:bottom-6 md:left-5" />
    </li>
  );
}

/**
 * Media 피드: 종류 탭(전체·보도·소식) + 세로로 쌓이는 글 카드 + 더보기.
 * 고른 탭은 주소(?type=보도)에 남아, 새로 고침하거나 링크를 공유해도 같은 탭이 열립니다.
 */
export function NewsList({ items, articles }: { items: FeedItem[]; articles: Record<string, ReactNode> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const filter: Filter = isFilter(typeParam) ? typeParam : "전체";
  // 탭을 바꾸면 보여 주는 글 수를 처음(10개)으로 되돌립니다(탭별로 따로 기억).
  const [shown, setShown] = useState<Record<Filter, number>>({ 전체: PAGE_SIZE, 보도: PAGE_SIZE, 소식: PAGE_SIZE });

  // 지금 창으로 연 글. 주소를 /media/글주소 로 바꿔 두어 공유·새로 고침·뒤로 가기가 그대로 동작합니다.
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openItem = openSlug ? items.find((item) => item.slug === openSlug) : undefined;

  useEffect(() => {
    // 브라우저 뒤로·앞으로 가기: 주소에 맞춰 창을 열고 닫습니다.
    const onPop = () => {
      const match = window.location.pathname.match(/^\/media\/(\d+)$/);
      setOpenSlug(match ? (items.find((item) => String(item.id) === match[1])?.slug ?? null) : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [items]);

  const openArticle = (slug: string, id: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    // 새 탭 열기(Ctrl·⌘·가운데 버튼)는 그대로 둡니다.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!articles[slug]) return;
    event.preventDefault();
    window.history.pushState({ mediaModal: slug }, "", `/media/${id}`);
    setOpenSlug(slug);
  };

  const closeArticle = () => {
    // 창을 열 때 쌓은 주소를 되돌립니다(뒤로 가기와 같은 결과).
    if (window.history.state?.mediaModal) window.history.back();
    else {
      window.history.replaceState(null, "", "/media");
      setOpenSlug(null);
    }
  };

  const visible = filter === "전체" ? items : items.filter((item) => item.kind === filter);
  const count = shown[filter];

  const selectFilter = (next: Filter) => {
    setShown((current) => ({ ...current, [next]: PAGE_SIZE }));
    router.replace(next === "전체" ? pathname : `${pathname}?type=${encodeURIComponent(next)}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="글 종류" className="flex flex-wrap gap-2">
        {FILTERS.map((key) => {
          const selected = key === filter;
          return (
            <Button
              key={key}
              type="button"
              variant={selected ? "default" : "outline"}
              size="pill"
              aria-pressed={selected}
              onClick={() => selectFilter(key)}
              className="cursor-pointer"
            >
              {key}
            </Button>
          );
        })}
      </div>

      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {visible.slice(0, count).map((item) => (
          <FeedCard key={item.slug} item={item} onOpen={openArticle(item.slug, item.id)} />
        ))}
      </ul>

      {visible.length > count && (
        <Button
          type="button"
          variant="outline"
          size="xl"
          onClick={() => setShown((current) => ({ ...current, [filter]: current[filter] + PAGE_SIZE }))}
          className="cursor-pointer self-center"
        >
          더보기
        </Button>
      )}

      {openItem && (
        <ArticleModal title={openItem.title} onClose={closeArticle}>
          {articles[openItem.slug]}
        </ArticleModal>
      )}
    </div>
  );
}
