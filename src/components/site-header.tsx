"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { HeaderHeightSync } from "./header-height-sync";
import { LanguageToggle } from "./language-toggle";
import { MobileMenu } from "./mobile-menu";
import { TreeMark } from "./logo";
import { PrimaryNav } from "./primary-nav";
import { Container } from "./site-ui";
import { useT } from "@/lib/language";

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
 * 모바일(768px 미만): 로고 | 햄버거 버튼 한 줄. 메뉴는 햄버거를 누르면 왼쪽에서 밀려 나오고, 언어 전환(KO/EN)은 그 메뉴 안 닫기(X) 버튼 아래에 있습니다.
 * 홈 첫 화면에서는 밤하늘 히어로 위에 투명하게 겹치고, 조금이라도 스크롤하면 흰 배경으로 바뀝니다.
 */
export function SiteHeader() {
  const t = useT();
  const pathname = usePathname();
  const atTop = useAtTop();
  const onDark = pathname === "/" && atTop;

  return (
    <header
      id="site-header"
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
          aria-label={t("Joshua Tree WORKS 홈")}
          className={cn(
            "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center no-underline transition-colors duration-base",
            onDark ? "text-night-foreground" : "text-primary",
          )}
        >
          {/* 심볼만 둡니다 (세로 26px → 34px, 30% 확대) */}
          <TreeMark width={29} height={34} className="block" />
        </Link>

        {/* 모바일: 햄버거 버튼(언어 전환은 메뉴 안에) */}
        <MobileMenu onDark={onDark} className="md:hidden" />

        {/* 데스크톱: 메뉴 + 언어 전환 */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <PrimaryNav onDark={onDark} />
          <LanguageToggle onDark={onDark} />
        </div>

      </Container>
    </header>
  );
}
