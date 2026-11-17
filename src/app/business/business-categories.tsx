"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Container } from "@/components/site-ui";
import { Button } from "@/components/ui/button";
import { BUSINESS_CATEGORIES, type BusinessCategory } from "@/content/site";
import { CategoryIcon } from "@/components/category-icon";

const PARAM = "category";
const DEFAULT: BusinessCategory = BUSINESS_CATEGORIES[0];
/** 주소를 바꾼 뒤 화면에 알리는 이벤트 (replaceState 는 popstate 를 내지 않습니다) */
const CHANGE = "business-category-change";

const isCategory = (value: string | null): value is BusinessCategory =>
  value !== null && (BUSINESS_CATEGORIES as readonly string[]).includes(value);

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

/** 고른 카테고리는 주소(?category=K-Living)에 남아, 새로 고침하거나 링크를 공유해도 같은 카테고리가 열립니다 */
function readCategory(): BusinessCategory {
  const value = new URLSearchParams(window.location.search).get(PARAM);
  return isCategory(value) ? value : DEFAULT;
}

const panelId = (category: BusinessCategory) => `business-${category.toLowerCase()}`;

/**
 * Business 카테고리: 위쪽 카드(아이콘 + 이름)를 누르면 아래에 그 카테고리의 자사 IP·타사 제품이 보입니다.
 * 모든 카테고리 내용은 서버에서 미리 그려 두고(검색·공유 미리보기에 남도록), 고른 것만 보여 줍니다.
 */
export function BusinessCategories({ panels }: { panels: Record<BusinessCategory, ReactNode> }) {
  // 서버와 첫 화면은 기본 카테고리(K-Play), 주소에 다른 카테고리가 있으면 바로 그 카테고리로 바뀝니다.
  const selected = useSyncExternalStore(subscribe, readCategory, () => DEFAULT);

  const select = (next: BusinessCategory) => {
    const url = new URL(window.location.href);
    if (next === DEFAULT) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, next);
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(CHANGE));
  };

  return (
    <>
      <section aria-label="비즈니스 카테고리">
        <Container className="pt-(--section-pad) pb-8 md:pt-12 md:pb-12">
          <div role="group" aria-label="카테고리" className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
            {BUSINESS_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant="tile"
                size="tile"
                aria-pressed={category === selected}
                aria-controls={panelId(category)}
                onClick={() => select(category)}
                className="cursor-pointer"
              >
                <CategoryIcon category={category} className="size-10 md:size-12" />
                <span>{category}</span>
              </Button>
            ))}
          </div>
        </Container>
      </section>

      {BUSINESS_CATEGORIES.map((category) => (
        <div key={category} id={panelId(category)} hidden={category !== selected}>
          {panels[category]}
        </div>
      ))}
    </>
  );
}
