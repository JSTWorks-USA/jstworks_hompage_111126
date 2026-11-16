"use client";

import { useLang } from "@/lib/language";

/** 헤더에서 고른 언어(KO/EN)에 맞는 문구를 보여 줍니다. 영문 문구가 없으면 한국어 그대로입니다. */
export function LocalizedText({ ko, en }: { ko: string; en?: string }) {
  const lang = useLang();
  return <>{lang === "EN" && en ? en : ko}</>;
}
