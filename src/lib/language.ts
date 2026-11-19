"use client";

import { useSyncExternalStore } from "react";
import { EN } from "@/content/en";
import { LANG_STORAGE_KEY } from "./language-init";

export type Lang = "KO" | "EN";

/**
 * 사이트 표시 언어(KO/EN). 헤더의 KO/EN 버튼이 바꾸고, 언어별 문구가 이 값을 읽습니다.
 * 고른 언어는 이 브라우저에 기억해 두어, 다른 페이지로 가거나 다시 와도 유지됩니다.
 *
 * 화면에 보이는 문구는 <T>(src/lib/i18n.tsx)가 두 언어를 함께 그려 두고 CSS 로 고르므로 새로고침해도 깜빡이지 않습니다.
 * 이 훅(useLang)은 글자로 바꿀 수 없는 곳(입력 칸 안내 문구, aria-label 등)에만 씁니다.
 * 서버에서 그릴 때와 첫 화면은 한국어이고, 화면이 준비되면 고른 언어로 바뀝니다.
 */
const STORAGE_KEY = LANG_STORAGE_KEY;
const listeners = new Set<() => void>();
let current: Lang | null = null;

function read(): Lang {
  if (current) return current;
  try {
    current = window.localStorage.getItem(STORAGE_KEY) === "EN" ? "EN" : "KO";
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 한국어로 시작합니다.
    current = "KO";
  }
  return current;
}

/** <html data-lang lang> 을 고른 언어로 맞춥니다(CSS 가 이 값으로 한국어·영어 문구 중 하나를 보여 줍니다). */
function applyToDocument(lang: Lang) {
  const html = document.documentElement;
  if (lang === "EN") html.setAttribute("data-lang", "EN");
  else html.removeAttribute("data-lang");
  html.lang = lang === "EN" ? "en" : "ko";
}

/**
 * 언어를 바꿀 때 기준으로 삼을 요소: 화면(상단 고정 머리글 아래 보이는 영역) 세로 가운데에 있는 본문 요소.
 * 바뀌는 글자(<T> 의 [data-l] 칸)나 글자 조각이 아니라, 언어와 관계없이 남아 있는 블록을 고릅니다.
 * People 줄처럼 data-scroll-anchor 가 붙은 요소 안이면 그 요소(한 사람 줄 전체)를 씁니다.
 * 모바일 메뉴처럼 화면을 덮는 층은 건너뛰고 본문(main·footer)에서 찾습니다.
 */
function scrollAnchor(): Element | null {
  const top = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
  const mid = top + (window.innerHeight - top) / 2;
  const hit = document.elementsFromPoint(window.innerWidth / 2, mid).find((el) => el.closest("main, footer"));
  if (!hit) return null;
  const marked = hit.closest("[data-scroll-anchor]");
  if (marked) return marked;
  let el: Element | null = hit;
  while (el && (el.closest("[data-l]") || getComputedStyle(el).display.startsWith("inline"))) el = el.parentElement;
  return el;
}

const centerOf = (el: Element) => {
  const box = el.getBoundingClientRect();
  return box.top + box.height / 2;
};

export function setLang(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 기억하지 못해도 이번 방문 동안은 바뀐 언어로 보입니다.
  }
  // 언어가 바뀌면 위쪽 글의 길이(높이)가 달라져 보던 자리가 위아래로 밀립니다.
  // 바꾸기 전 화면 가운데에 있던 요소를 기억해 두었다가, 바꾼 뒤 그 요소가 같은 자리에 오도록 스크롤을 맞춥니다.
  // 브라우저의 자동 보정(scroll anchoring)은 다른 요소를 기준으로 잡아 어긋나므로 이 순간만 끕니다.
  const html = document.documentElement;
  const anchor = scrollAnchor();
  const before = anchor ? centerOf(anchor) : 0;
  html.style.overflowAnchor = "none";
  applyToDocument(next);
  if (anchor?.isConnected) {
    const shift = centerOf(anchor) - before;
    if (Math.abs(shift) >= 1) window.scrollTo({ top: window.scrollY + shift, behavior: "instant" });
  }
  requestAnimationFrame(() => {
    html.style.overflowAnchor = "";
  });
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "KO");
}

/**
 * 글자로만 넘길 수 있는 문구(placeholder, aria-label, alt 등)를 지금 언어로 바꿔 주는 함수.
 * 영어 사전(src/content/en.ts)에 없는 문구는 한국어 그대로 돌려줍니다.
 */
export function useT(): (ko: string) => string {
  const english = useLang() === "EN";
  return (ko) => (english ? (EN[ko] ?? ko) : ko);
}
