"use client";

import { useEffect } from "react";

/**
 * 헤더의 실제 높이를 :root의 --header-height에 적습니다.
 * 메뉴 줄바꿈, 가로 스크롤바, 글자 크기 설정으로 헤더 높이가 달라져도
 * 첫 화면의 히어로가 남는 공간을 정확히 채우게 합니다.
 * 스크립트가 돌기 전에는 globals.css의 기본값을 씁니다.
 */
export function HeaderHeightSync({ targetId }: { targetId: string }) {
  useEffect(() => {
    const header = document.getElementById(targetId);
    if (!header) return;

    const root = document.documentElement;
    const update = () => {
      root.style.setProperty(
        "--header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);

    return () => {
      observer.disconnect();
      root.style.removeProperty("--header-height");
    };
  }, [targetId]);

  return null;
}
