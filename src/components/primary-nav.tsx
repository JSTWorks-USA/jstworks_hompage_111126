"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./site-nav";

/**
 * 주 메뉴. 현재 페이지는 글자만 브랜드 녹색으로 바꿔 표시하고, 나머지 메뉴는 기본 색을 유지합니다.
 * onDark: 홈 히어로 위에 투명 헤더로 겹쳐 있을 때. 모든 메뉴를 같은 흰 글자로 둡니다.
 */
export function PrimaryNav({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="주 메뉴" className={className}>
      <ul className="m-0 flex list-none items-center p-0 md:gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-auto shrink-0 md:flex-none">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  // 마우스를 올려도 배경 칸은 생기지 않고 글자 색만 진해집니다.
                  "h-11 w-full rounded-[1.125rem] px-2 text-[0.8125rem] transition-colors hover:bg-transparent md:w-auto md:px-4 md:text-sm",
                  onDark
                    ? "text-night-foreground/80 hover:text-night-foreground"
                    : "hover:text-foreground",
                  // 투명 헤더 위에서는 현재 메뉴도 다른 메뉴와 같은 흰색입니다. 녹색 표시는 흰 헤더에서만 씁니다.
                  active && !onDark && "text-primary hover:text-primary",
                )}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
