"use client";

import Image from "next/image";
import { createElement, type ComponentProps, type HTMLAttributes, type IframeHTMLAttributes } from "react";
import { useLang, useT } from "@/lib/language";

/**
 * 속성으로만 넘길 수 있는 문구(사진 설명 alt, 구역 이름 aria-label, 지도 제목 title)를 지금 언어로 바꿔 주는 부품.
 *
 * 화면에 보이는 글은 <T>/<Bi> 가 두 언어를 함께 그려 두고 CSS 로 고르지만, 속성 값은 CSS 로 바꿀 수 없습니다.
 * 서버에서 그리는 페이지에서는 이 부품을 써야 영어(EN) 화면에서 화면 낭독기가 영어로 읽습니다.
 * 영어 문구는 다른 글과 같이 src/content/en.ts 사전에서 찾고, 사전에 없으면 한국어 그대로 둡니다.
 * (클라이언트 컴포넌트 안에서는 이 부품 대신 useT() 를 바로 쓰면 됩니다.)
 */

/** next/image 와 같고, alt 만 지금 언어로 바뀝니다. alt 는 한국어 원문(사전 열쇠)으로 넘깁니다 */
export function LocalizedImage({ alt, ...props }: ComponentProps<typeof Image>) {
  const t = useT();
  return <Image alt={t(alt)} {...props} />;
}

/** 이름(aria-label)이 붙는 구역. label 은 한국어 원문(사전 열쇠)으로 넘깁니다 */
export function Region({
  as = "section",
  label,
  ...props
}: { as?: "section" | "nav" | "ul"; label: string } & HTMLAttributes<HTMLElement>) {
  const t = useT();
  return createElement(as, { "aria-label": t(label), ...props });
}

/**
 * 제목(title)이 붙는 iframe(지도 등). 이름과 낱말을 이어 만든 제목은 사전 열쇠로 찾기 어려워 두 언어를 직접 넘깁니다.
 * 제목만 바뀌고 src 는 그대로라 언어를 바꿔도 안의 내용을 다시 불러오지 않습니다.
 */
export function LocalizedFrame({
  title,
  titleEn,
  ...props
}: { title: string; titleEn: string } & IframeHTMLAttributes<HTMLIFrameElement>) {
  const english = useLang() === "EN";
  return <iframe title={english ? titleEn : title} {...props} />;
}
