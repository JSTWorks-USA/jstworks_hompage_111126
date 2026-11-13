"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { NewsItem, NewsKind } from "@/content/site";
import { cn } from "@/lib/utils";
import { NewsCover } from "./news-cover";

type Filter = "전체" | NewsKind;

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <li>
      <Link
        href={`/media/${item.slug}`}
        className="group block h-full rounded-xl no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-primary/50">
          <NewsCover
            item={item}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="aspect-[16/10]"
          />
          <div className="flex flex-1 flex-col gap-4 p-[var(--layout-card-padding)]">
            <h2
              className={cn(
                "m-0 text-lg leading-snug font-medium",
                item.placeholder ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {item.title}
            </h2>
            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <Badge variant={item.kind === "보도" ? "primary" : "outline"} size="lg">
                {item.kind}
              </Badge>
              <span className="tabular-nums">{item.date}</span>
              <span>{item.source}</span>
            </div>
          </div>
        </Card>
      </Link>
    </li>
  );
}

export function NewsList({ items }: { items: NewsItem[] }) {
  const [filter, setFilter] = useState<Filter>("전체");

  const filters: { key: Filter; count: number }[] = [
    { key: "전체", count: items.length },
    { key: "보도", count: items.filter((i) => i.kind === "보도").length },
    { key: "소식", count: items.filter((i) => i.kind === "소식").length },
  ];

  const visible =
    filter === "전체" ? items : items.filter((i) => i.kind === filter);

  return (
    <div className="flex flex-col gap-8">
      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(value) => {
          if (value) setFilter(value as Filter);
        }}
        aria-label="뉴스 종류"
        className="self-start p-0.5"
      >
        {filters.map(({ key, count }) => (
          <ToggleGroupItem key={key} value={key} className="h-11 px-4">
            {key} <span className="tabular-nums">{count}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ul className="m-0 grid list-none gap-[var(--layout-column-gap)] p-0 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <NewsCard key={item.slug} item={item} />
        ))}
      </ul>
    </div>
  );
}
