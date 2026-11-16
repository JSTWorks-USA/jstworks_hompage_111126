"use client";

import { useSyncExternalStore } from "react";

export type Lang = "KO" | "EN";

/**
 * 사이트 표시 언어(KO/EN). 헤더의 KO/EN 버튼이 바꾸고, 언어별 문구가 이 값을 읽습니다.
 * 고른 언어는 이 브라우저에 기억해 두어, 다른 페이지로 가거나 다시 와도 유지됩니다.
 * 서버에서 그릴 때와 첫 화면은 항상 한국어입니다.
 */
const STORAGE_KEY = "jstworks-lang";
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

export function setLang(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 기억하지 못해도 이번 방문 동안은 바뀐 언어로 보입니다.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "KO");
}
