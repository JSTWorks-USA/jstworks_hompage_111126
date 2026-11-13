"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Lang = "KO" | "EN";

/** 선택을 확인하는 움직임이라 튕기지 않고 바로 멈추는 스프링(임계 감쇠)을 씁니다. */
const KNOB_SPRING: Transition = { type: "spring", stiffness: 520, damping: 46, mass: 1 };

/**
 * KO / EN 언어 전환 버튼.
 * 테두리 안 어디를 눌러도 한국어 ↔ 영어가 번갈아 바뀌고, 흰 손잡이가 선택된 쪽으로 미끄러집니다.
 * 영문 콘텐츠가 준비되기 전까지는 선택 상태만 바뀝니다(본문은 한국어 그대로).
 * onDark: 홈 히어로 위 투명 헤더일 때 반투명 흰 테두리로 바꿉니다.
 */
export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const [lang, setLang] = useState<Lang>("KO");
  const reduceMotion = useReducedMotion();
  const english = lang === "EN";

  const labelClass = (active: boolean) =>
    cn(
      "relative z-10 flex h-6 w-8 items-center justify-center text-xs font-medium transition-[color,scale] duration-base motion-safe:group-active:scale-95",
      // 선택된 쪽은 흰 손잡이 위의 검은 글자, 다른 쪽은 흐린 글자(마우스를 올리면 진해짐)
      active
        ? "text-foreground"
        : onDark
          ? "text-night-foreground/75 group-hover:text-night-foreground"
          : "text-muted-foreground group-hover:text-foreground",
    );

  return (
    <Button
      // switch 변형: 눈에 보이는 알약은 72×30 이지만 누르는 영역은 88×44 로 넓게 잡고,
      // 누름 효과는 버튼 전체가 아니라 글자에만 줍니다(손잡이는 움직이기만 함).
      variant="switch"
      size="switch"
      role="switch"
      aria-checked={english}
      // 이름은 켜졌을 때의 결과로 고정하고, 현재 언어는 켜짐/꺼짐으로 읽힙니다.
      aria-label="영어로 보기 (EN)"
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
        <motion.span
          aria-hidden="true"
          className="absolute top-0.5 left-0.5 h-6 w-8 rounded-lg bg-background shadow-sm"
          initial={false}
          // 칸 너비(2rem) + 칸 사이 간격(0.125rem) 만큼 오른쪽으로
          animate={{ x: english ? "2.125rem" : "0rem" }}
          transition={reduceMotion ? { duration: 0 } : KNOB_SPRING}
        />
        <span aria-hidden="true" className={labelClass(!english)}>
          KO
        </span>
        <span aria-hidden="true" className={labelClass(english)}>
          EN
        </span>
      </span>
    </Button>
  );
}
