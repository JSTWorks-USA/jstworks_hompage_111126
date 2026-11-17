"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * 움직임 줄이기 설정. 서버와 첫 화면(하이드레이션)은 늘 false 로 그리고, 그 뒤 실제 설정으로 바뀝니다.
 * motion 의 useReducedMotion 은 서버(null)와 브라우저 첫 렌더(설정값)가 달라, 이 값으로 화면 구조를 나누면
 * 하이드레이션이 어긋납니다. 화면 구조·스타일을 이 값으로 나눌 때는 이 훅을 씁니다.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
