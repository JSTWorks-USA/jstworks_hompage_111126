"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import type { BusinessCategory, VisionDetail } from "@/content/site";
import { T } from "@/lib/i18n";
import { useT } from "@/lib/language";
import { cn } from "@/lib/utils";

export const BUBBLE_ID = "history-bubble";

/** 말풍선 자리 (연혁 화면 상자 기준 px). 휴대폰 세로는 화면 아래, 휴대폰 가로는 오른쪽 아래에 고정합니다 */
export type BubblePlacement =
  | { mode: "bottom" }
  | { mode: "corner" }
  | {
      mode: "float";
      left: number;
      width: number;
      /** 이름표 위에 띄우면 bottom, 아래에 띄우면 top */
      top?: number;
      bottom?: number;
      /** 꼬리(이름표를 가리키는 뾰족한 부분)의 가로 위치 (말풍선 왼쪽 끝 기준 px) */
      tailX: number;
    };

/**
 * 연혁 말풍선: 왼쪽 사진(없으면 카테고리 아이콘), 오른쪽 프로젝트 이름·간단한 설명.
 * 아직 내용이 없는 카테고리는 같은 모양으로 카테고리 이름과 "준비중"만 보여 줍니다.
 * 넓은 화면에서는 가리킨 이름표 바로 위(공간이 없으면 아래)에 꼬리를 달고 뜨고, 휴대폰에서는 화면 아래에 뜹니다.
 */
export function HistoryBubble({
  category,
  detail,
  placement,
  onPointerEnter,
  onPointerLeave,
}: {
  category: BusinessCategory;
  /** 없으면 "준비중" 말풍선 */
  detail?: VisionDetail;
  placement: BubblePlacement;
  /** 마우스가 말풍선 위에 있는 동안 열린 채로 둡니다(WCAG 1.4.13: 떠 있는 내용 위로 포인터를 옮길 수 있어야 함) */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const t = useT();
  const float = placement.mode === "float" ? placement : null;
  const above = float?.bottom !== undefined;
  // 꼬리가 왼쪽 사진(아이콘) 칸 아래에 오면(오른쪽으로 펼친 K-Charm·K-Apparel) 꼬리도 그 칸과 같은 색으로 칠합니다.
  const cellRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(0);
  useLayoutEffect(() => {
    setCellWidth(cellRef.current?.offsetWidth ?? 0);
  }, [detail, float?.width]);
  const contain = detail?.image?.fit === "contain";
  const tailOnCell = float !== null && float.tailX < cellWidth;

  return (
    <motion.div
      id={BUBBLE_ID}
      role="status"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      initial={{ opacity: 0, y: reduceMotion ? 0 : above || !float ? 6 : -6, scale: reduceMotion ? 1 : 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
      className={cn(
        "absolute z-20",
        float
          ? ""
          : placement.mode === "corner"
            ? "right-(--page-inset) bottom-5 w-[min(26rem,calc(100%-2*var(--page-inset)))]"
            : "inset-x-(--page-inset) bottom-6",
      )}
      style={float ? { left: float.left, width: float.width, top: float.top, bottom: float.bottom } : undefined}
    >
      <div className="relative flex overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-xl">
        {/* 사진(아이콘) 칸: "준비중" 말풍선은 글이 짧아 칸도 좁힙니다 */}
        <div
          ref={cellRef}
          className={cn(
            "relative shrink-0 self-stretch",
            detail ? "w-28 md:w-44" : "w-24 md:w-28",
            contain ? "bg-white" : "bg-night-foreground/10",
          )}
        >
          {detail?.image ? (
            <Image
              src={detail.image.src}
              alt={t(detail.image.alt)}
              fill
              sizes="(min-width: 768px) 176px, 112px"
              className={detail.image.fit === "contain" ? "object-contain p-2" : "object-cover"}
            />
          ) : (
            <div className={cn("grid size-full place-items-center", detail ? "min-h-28" : "min-h-24")}>
              <CategoryIcon category={category} className={detail ? "size-12 md:size-14" : "size-10 md:size-12"} />
            </div>
          )}
        </div>
        {detail ? (
          <div className="flex min-w-0 flex-col justify-center gap-2 p-4 md:p-5">
            <p className="m-0 text-base leading-snug font-bold md:text-lg">
              <T>{detail.title}</T>
            </p>
            <p className="m-0 text-sm leading-relaxed text-primary-foreground/90">
              <T>{detail.body}</T>
            </p>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col justify-center gap-2 p-4 md:p-5">
            <p className="m-0 text-base leading-snug font-bold whitespace-nowrap md:text-lg">{category}</p>
            <p className="m-0 self-start rounded-full bg-primary-foreground/15 px-3 py-1 text-xs leading-snug">
              <T>준비중</T>
            </p>
          </div>
        )}
      </div>
      {/* 꼬리: 이름표 쪽으로 향하는 작은 마름모 */}
      {float && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute size-4 -translate-x-1/2 rotate-45 overflow-hidden",
            tailOnCell && contain ? "bg-white" : "bg-primary",
            above ? "-bottom-1.5" : "-top-1.5",
          )}
          style={{ left: float.tailX }}
        >
          {/* 아이콘 칸의 밝은 막(bg-night-foreground/10)을 꼬리에도 똑같이 겹칩니다 */}
          {tailOnCell && !contain && <span className="absolute inset-0 bg-night-foreground/10" />}
        </span>
      )}
    </motion.div>
  );
}
