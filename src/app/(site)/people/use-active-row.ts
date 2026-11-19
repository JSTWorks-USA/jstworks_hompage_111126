"use client";

import { useEffect, useState, type RefObject } from "react";

/** 가운데에서 이만큼(보이는 높이 대비) 안에 들어온 줄만 "보고 있는 줄"로 봅니다 */
const RANGE_RATIO = 0.4;

/**
 * 지금 보고 있는 줄 번호: 화면(상단 고정 머리글 아래 보이는 영역) 세로 가운데에 가장 가까운 줄.
 * 가장 가까운 줄도 가운데에서 멀면(맨 위 We are, 바닥글) 없음(-1)입니다.
 * 스크롤할 때마다 한 프레임에 한 번만 계산합니다.
 */
export function useActiveRow(listRef: RefObject<HTMLElement | null>): number {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const top = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
      const visible = window.innerHeight - top;
      const mid = top + visible / 2;
      let best = -1;
      let bestDistance = Infinity;
      Array.from(list.children).forEach((row, i) => {
        const box = row.getBoundingClientRect();
        const distance = Math.abs(box.top + box.height / 2 - mid);
        if (distance < bestDistance) {
          best = i;
          bestDistance = distance;
        }
      });
      setActive(bestDistance <= visible * RANGE_RATIO ? best : -1);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [listRef]);

  return active;
}
