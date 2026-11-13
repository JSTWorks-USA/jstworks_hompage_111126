"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { HeaderHeightSync } from "./header-height-sync";
import { LanguageToggle } from "./language-toggle";
import { TreeMark } from "./logo";
import { PrimaryNav } from "./primary-nav";
import { Container } from "./site-ui";

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** 페이지 맨 위인지. 1px만 내려가도 false가 됩니다. */
function useAtTop() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY <= 0,
    // 서버에서는 스크롤 위치를 모르므로 맨 위로 봅니다.
    () => true,
  );
}

/**
 * 상단 헤더.
 * 데스크톱: 로고 | (메뉴 + 언어) 두 묶음.
 * 모바일: 로고·언어 줄 아래에 메뉴 다섯 개를 한 줄로 고르게 나눕니다(아주 좁은 화면에서만 가로 스크롤).
 * 홈 첫 화면에서는 밤하늘 히어로 위에 투명하게 겹치고, 조금이라도 스크롤하면 흰 배경으로 바뀝니다.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const atTop = useAtTop();
  const onDark = pathname === "/" && atTop;

  return (
    <header
      id="site-header"
      data-on-dark={onDark || undefined}
      className={cn(
        "relative z-40 border-b transition-colors duration-base ease-out motion-reduce:transition-none md:sticky md:top-0",
        onDark
          ? "border-transparent bg-transparent text-night-foreground"
          : "border-border bg-background",
      )}
    >
      <HeaderHeightSync targetId="site-header" />
      <Container className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 md:min-h-18 md:flex-nowrap md:gap-x-6 md:py-0">
        <Link
          href="/"
          aria-label="Joshua Tree WORKS 홈"
          className={cn(
            "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center no-underline transition-colors duration-base",
            onDark ? "text-night-foreground" : "text-primary",
          )}
        >
          {/* 심볼만 둡니다 (세로 26px → 34px, 30% 확대) */}
          <TreeMark width={29} height={34} className="block" />
        </Link>

        {/* 모바일에서는 contents로 풀어 메뉴만 다음 줄로 보냅니다 */}
        <div className="contents md:flex md:items-center md:gap-6">
          <PrimaryNav
            onDark={onDark}
            className="order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto md:order-none md:mx-0 md:w-auto md:overflow-visible"
          />
          <LanguageToggle onDark={onDark} />
        </div>
      </Container>
    </header>
  );
}
