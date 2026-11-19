"use client";

import { Button } from "@/components/ui/button";
import { setLang, useLang, useT } from "@/lib/language";
import { cn } from "@/lib/utils";

/**
 * KO / EN 언어 전환 버튼.
 * 테두리 안 어디를 눌러도 한국어 ↔ 영어가 번갈아 바뀌고, 흰 손잡이가 선택된 쪽으로 미끄러집니다.
 * 손잡이 위치와 글자 색은 <html data-lang> 을 CSS(en: 변형)로 읽어, 영어를 고른 사람이 새로고침해도
 * 손잡이가 KO 에서 EN 으로 미끄러지는 모습이 보이지 않습니다.
 * onDark: 홈 히어로 위 투명 헤더일 때 반투명 흰 테두리로 바꿉니다.
 */
export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const lang = useLang();
  const t = useT();
  const english = lang === "EN";

  const base =
    "relative z-10 flex h-6 w-8 items-center justify-center text-xs font-medium transition-[color,scale] duration-base motion-safe:group-active:scale-95";
  // 선택된 쪽은 흰 손잡이 위의 검은 글자, 다른 쪽은 흐린 글자(마우스를 올리면 진해짐)
  const idle = onDark
    ? "text-night-foreground/75 group-hover:text-night-foreground"
    : "text-muted-foreground group-hover:text-foreground";
  const idleEn = onDark
    ? "en:text-night-foreground/75 en:group-hover:text-night-foreground"
    : "en:text-muted-foreground en:group-hover:text-foreground";

  return (
    <Button
      // switch 변형: 눈에 보이는 알약은 72×30 이지만 누르는 영역은 88×44 로 넓게 잡고,
      // 누름 효과는 버튼 전체가 아니라 글자에만 줍니다(손잡이는 움직이기만 함).
      variant="switch"
      size="switch"
      role="switch"
      aria-checked={english}
      // 이름은 켜졌을 때의 결과로 고정하고, 현재 언어는 켜짐/꺼짐으로 읽힙니다.
      aria-label={t("영어로 보기 (EN)")}
      onClick={() => setLang(english ? "KO" : "EN")}
      className="group shrink-0 cursor-pointer"
    >
      <span
        className={cn(
          "relative flex gap-0.5 rounded-[1.125rem] border p-0.5 transition-colors duration-base",
          onDark
            ? "border-night-foreground/25 bg-night-foreground/10"
            : "border-border bg-secondary",
        )}
      >
        {/* 칸 너비(2rem) + 칸 사이 간격(0.125rem) 만큼 오른쪽으로. 움직임 줄이기 설정에서는 바로 옮깁니다 */}
        <span
          aria-hidden="true"
          className="absolute top-0.5 left-0.5 h-6 w-8 rounded-lg bg-background shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none en:translate-x-[2.125rem]"
        />
        <span aria-hidden="true" className={cn(base, "text-foreground", idleEn)}>
          KO
        </span>
        <span aria-hidden="true" className={cn(base, idle, "en:text-foreground en:group-hover:text-foreground")}>
          EN
        </span>
      </span>
    </Button>
  );
}
