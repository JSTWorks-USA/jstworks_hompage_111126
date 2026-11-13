"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./site-nav";

/** 주 메뉴. 현재 페이지는 민트 면으로 채워 표시합니다. */
export function PrimaryNav({ className }: { className?: string }) {
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
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "h-11 w-full rounded-[1.125rem] px-2 text-[0.8125rem] md:w-auto md:px-4 md:text-sm",
                  !active && "border border-transparent",
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
