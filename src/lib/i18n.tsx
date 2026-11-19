import type { ReactNode } from "react";
import { EN } from "@/content/en";

/**
 * 한국어·영어 문구 (KO/EN 버튼).
 *
 * 두 언어를 모두 HTML 에 그려 두고, <html data-lang="EN"> 일 때는 영어만, 아니면 한국어만 보여 줍니다
 * (globals.css 의 [data-l] 규칙). 서버 컴포넌트에서도 쓸 수 있고, 새로고침해도 깜빡이지 않습니다.
 * 숨긴 쪽은 display:none 이라 화면 낭독기도 읽지 않습니다.
 *
 * 영어 문구는 src/content/en.ts 사전에 한국어 원문을 열쇠로 적습니다. 사전에 없으면 한국어만 그립니다.
 */

/**
 * 영어 단어가 줄 끝에서 끊기지 않게, 단어 안의 하이픈(K-Beauty, Co-founder)을 줄바꿈 없는 하이픈(U+2011)으로 바꿉니다.
 * 띄어쓰기에서만 줄이 바뀝니다.
 */
export function keepWords(text: string): string {
  return text.replace(/(\w)-(?=\w)/g, "$1\u2011");
}

/** 한국어 원문의 영어 문구(없으면 원문 그대로) */
export function en(ko: string): string {
  return EN[ko] ?? ko;
}

/**
 * 사전에서 영어 문구를 찾아 두 언어를 함께 그립니다.
 * render: 문구를 감쌀 모양(예: s => <KeepTogether text={s} />)
 */
export function T({ children, render }: { children: string; render?: (text: string) => ReactNode }) {
  const draw = render ?? ((text: string) => text);
  const english = EN[children];
  if (english === undefined || english === children) return <>{draw(children)}</>;
  return <Bi ko={draw(children)} en={draw(keepWords(english))} />;
}

/** 두 언어 문구를 직접 넘깁니다(숫자·이름이 섞인 문장 등 사전 열쇠로 찾기 어려운 곳) */
export function Bi({ ko, en: english }: { ko: ReactNode; en: ReactNode }) {
  return (
    <>
      <span data-l="ko">{ko}</span>
      <span data-l="en" lang="en">
        {typeof english === "string" ? keepWords(english) : english}
      </span>
    </>
  );
}
