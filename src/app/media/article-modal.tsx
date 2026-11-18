"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeftIcon, XmarkIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

/**
 * Media 목록에서 글을 누르면 목록 위에 뜨는 창. 주소는 /media/번호 로 바뀌어 그대로 공유할 수 있고,
 * 그 주소로 바로 들어오거나 새로 고침하면 전체 페이지로 보입니다.
 * 글 칸 바깥에 이전(←)·닫기(✕) 버튼이 있고, 공유하기는 글 안 날짜 옆에 있습니다.
 * 닫기: ← 또는 ✕ 버튼, Esc 키, 바깥(어두운 바탕) 클릭, 브라우저 뒤로 가기.
 * 열려 있는 동안 뒤 목록은 스크롤되지 않고, 키보드 초점은 창 안에서만 돕니다.
 */
export function ArticleModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // 창 맨 위가 보이도록 초점을 옮겨도 스크롤은 움직이지 않게 합니다.
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previous;
      // 닫히면 글을 열었던 카드로 초점을 돌려줍니다.
      if (opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true });
    };
  }, []);

  const close = onClose;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    // 창 전체(어두운 바탕 + 바깥 버튼 + 글 칸)를 하나의 대화상자로 묶어, 키보드 초점이 이 안에서만 돌게 합니다.
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      // 어두운 바탕을 직접 눌렀을 때만 닫습니다. 안쪽 버튼의 클릭이 여기까지 올라와 한 번 더 닫히지 않게 합니다.
      onClick={(event) => event.target === event.currentTarget && close()}
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto overscroll-contain bg-foreground/40 px-0 pt-16 backdrop-blur-[0.125rem] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:p-10 md:pt-20"
    >
      {/* 글 칸 바깥(왼쪽 위·오른쪽 위)에 두는 이전·닫기 버튼 */}
      <Button
        type="button"
        variant="secondary"
        size="iconLg"
        aria-label="이전 페이지"
        onClick={close}
        className="fixed top-3 left-3 z-10 cursor-pointer md:top-5 md:left-5"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-5" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="iconLg"
        aria-label="닫기"
        onClick={close}
        className="fixed top-3 right-3 z-10 cursor-pointer md:top-5 md:right-5"
      >
        <XmarkIcon aria-hidden="true" className="size-5" />
      </Button>

      <motion.div
        onClick={(event) => event.stopPropagation()}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.3, ease: [0.19, 1, 0.22, 1] }}
        className="relative h-fit min-h-full w-full max-w-[min(60rem,calc(var(--content-max)-2*var(--page-inset)))] rounded-t-2xl bg-background md:min-h-0 md:rounded-2xl"
      >
        <div className="px-6 pt-8 pb-10 md:px-10 md:pt-10 md:pb-12">{children}</div>
      </motion.div>
    </div>
  );
}
