"use client";

import { useLang } from "@/lib/language";

/**
 * 한국어·영문 문구를 같은 자리에 겹쳐 두고 지금 언어만 보여 줍니다.
 * 자리는 늘 두 문구 중 더 긴 쪽 크기로 잡히므로, KO/EN 을 바꿔도 둘레 영역(푸터 등)의 크기가 변하지 않습니다.
 */
export function StableLocalizedText({ ko, en }: { ko: string; en: string }) {
  const english = useLang() === "EN";
  return (
    <span className="grid">
      <span className={english ? "invisible col-start-1 row-start-1" : "col-start-1 row-start-1"} aria-hidden={english}>
        {ko}
      </span>
      <span
        lang="en"
        className={english ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}
        aria-hidden={!english}
      >
        {en}
      </span>
    </span>
  );
}
