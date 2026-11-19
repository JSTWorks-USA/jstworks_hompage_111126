"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MenuIcon, XmarkIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { TreeMark } from "./logo";
import { NAV_ITEMS } from "./site-nav";
import { useT } from "@/lib/language";

const EASE_OUT = [0.19, 1, 0.22, 1] as const;

/**
 * 모바일(768px 미만) 메뉴.
 * 햄버거 버튼을 누르면 화면 전체를 덮는 메뉴가 왼쪽에서 밀려 들어오고, 메뉴 항목은 가운데 정렬됩니다.
 * 닫기(X) 버튼 아래에 언어 전환(KO/EN) 버튼이 있습니다.
 * 닫기: X 버튼, Esc 키, 메뉴 항목 선택. 열려 있는 동안 뒤 페이지는 스크롤되지 않고, 키보드 초점은 메뉴 안에서만 돕니다.
 * onDark: 홈 히어로 위 투명 헤더일 때 햄버거 아이콘을 흰색으로 둡니다.
 */
export function MobileMenu({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 페이지가 바뀌면(안드로이드 뒤로 가기 등) 메뉴를 닫습니다.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  // 화면이 넓어지면(태블릿을 가로로 돌리는 등) 메뉴가 사라지므로 닫아서 스크롤 잠금을 풉니다.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const onChange = () => wide.matches && setOpen(false);
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [open]);

  // 열려 있는 동안 뒤 페이지 스크롤을 막고, 처음 메뉴 항목에 초점을 둡니다.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("nav a")?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Esc 로 닫고, Tab 은 메뉴 안의 버튼·링크 사이에서만 돌게 합니다.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>("a, button")];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={className}>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="iconLg"
        aria-label={t("메뉴 열기")}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className={cn(
          "cursor-pointer hover:bg-transparent",
          onDark ? "text-night-foreground hover:text-night-foreground" : "text-foreground",
        )}
      >
        <MenuIcon className="size-7" aria-hidden="true" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("메뉴")}
            onKeyDown={onKeyDown}
            initial={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
            transition={{ duration: reduceMotion ? 0.12 : 0.36, ease: EASE_OUT }}
            className="fixed inset-0 z-50 flex flex-col bg-background text-foreground"
          >
            {/* 위 줄: 헤더와 같은 자리에 로고(왼쪽)와 닫기 버튼(오른쪽) */}
            <div className="flex items-center justify-between px-(--page-inset) py-3">
              <Link
                href="/"
                aria-label={t("Joshua Tree WORKS 홈")}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-primary"
              >
                <TreeMark width={29} height={34} className="block" />
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="iconLg"
                aria-label={t("메뉴 닫기")}
                onClick={close}
                className="cursor-pointer"
              >
                <XmarkIcon className="size-7" aria-hidden="true" />
              </Button>
            </div>

            {/* 언어 전환(KO/EN): 닫기(X) 버튼 바로 아래, 같은 오른쪽 끝에 맞춥니다 */}
            {/* 한영 버튼의 누르는 영역이 보이는 알약보다 넓어(88px) 8px 안쪽으로 당겨, 알약 오른쪽 끝을 X 아이콘 오른쪽 끝에 맞춥니다 */}
            <div className="flex justify-end px-(--page-inset)">
              <div className="mr-2">
                <LanguageToggle />
              </div>
            </div>

            {/* 메뉴 항목: 화면 가운데에 세로로 */}
            <nav aria-label={t("주 메뉴")} className="flex flex-1 items-center justify-center pb-16">
              <ul className="m-0 flex list-none flex-col items-center gap-2 p-0">
                {NAV_ITEMS.map((item, i) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <motion.li
                      key={item.href}
                      initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.12 + i * 0.05, ease: EASE_OUT }}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "inline-flex min-h-14 items-center px-6 text-[2rem] leading-none font-bold tracking-tight no-underline transition-colors",
                          active ? "text-primary" : "text-foreground hover:text-primary",
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
