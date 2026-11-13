import Link from "next/link";
import { HeaderHeightSync } from "./header-height-sync";
import { LanguageToggle } from "./language-toggle";
import { TreeMark } from "./logo";
import { PrimaryNav } from "./primary-nav";
import { Container } from "./site-ui";

/**
 * 상단 헤더.
 * 데스크톱: 로고 | (메뉴 + 언어) 두 묶음.
 * 모바일: 로고·언어 줄 아래에 메뉴 다섯 개를 한 줄로 고르게 나눕니다(아주 좁은 화면에서만 가로 스크롤).
 */
export function SiteHeader() {
  return (
    <header
      id="site-header"
      className="border-b border-border bg-background md:sticky md:top-0 md:z-40"
    >
      <HeaderHeightSync targetId="site-header" />
      <Container className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 md:min-h-18 md:flex-nowrap md:gap-x-6 md:py-0">
        <Link
          href="/"
          aria-label="Joshua Tree WORKS 홈"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-primary no-underline"
        >
          {/* 심볼만 둡니다 (세로 26px → 34px, 30% 확대) */}
          <TreeMark width={29} height={34} className="block" />
        </Link>

        {/* 모바일에서는 contents로 풀어 메뉴만 다음 줄로 보냅니다 */}
        <div className="contents md:flex md:items-center md:gap-6">
          <PrimaryNav className="order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto md:order-none md:mx-0 md:w-auto md:overflow-visible" />
          <LanguageToggle />
        </div>
      </Container>
    </header>
  );
}
