import type { SVGProps } from "react";
import type { BusinessCategory } from "@/content/site";

/*
 * Business·연혁 카테고리 아이콘. 24×24 칸에 같은 굵기의 선으로 그리고, 색은 글자색(currentColor)을 따릅니다.
 * 고른 카드에서는 카드 글자색(초록)이 그대로 아이콘 색이 됩니다.
 */

const PATHS: Record<BusinessCategory, React.ReactNode> = {
  // 게임 패드
  "K-Play": (
    <>
      <path d="M7.5 7.5h9a5 5 0 0 1 4.8 6.4l-.9 3.2a2.4 2.4 0 0 1-4.1 1L14.4 16H9.6l-1.9 2.1a2.4 2.4 0 0 1-4.1-1l-.9-3.2a5 5 0 0 1 4.8-6.4z" />
      <path d="M7.5 10.5v3.5M5.75 12.25h3.5" />
      <circle cx="15.5" cy="11" r="0.6" fill="currentColor" />
      <circle cx="17.5" cy="13" r="0.6" fill="currentColor" />
    </>
  ),
  // 립스틱 + 반짝임
  "K-Beauty": (
    <>
      <rect x="7.5" y="13" width="7" height="8.5" rx="1.2" />
      <path d="M8.75 13V8.4l4.5-3v7.6" />
      <path d="M18.5 3.5v4M16.5 5.5h4" />
    </>
  ),
  // 집
  "K-Living": (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.75 9.25V20h12.5V9.25" />
      <path d="M10 20v-5.25h4V20" />
    </>
  ),
  // 티셔츠
  "K-Apparel": (
    <path d="M9 3.5 4.5 5.75 2.5 10l3.25 1.5L7 10v10.5h10V10l1.25 1.5L21.5 10l-2-4.25L15 3.5a3 3 0 0 1-6 0z" />
  ),
  // 고리에 달린 하트 참
  "K-Charm": (
    <>
      <circle cx="12" cy="4.5" r="2.25" />
      <path d="M12 6.75v3.5" />
      <path d="M12 21c-4.6-3-6.8-5.4-6.8-8a3.3 3.3 0 0 1 6.8-1.3 3.3 3.3 0 0 1 6.8 1.3c0 2.6-2.2 5-6.8 8z" />
    </>
  ),
  // 김이 나는 밥그릇
  "K-Food": (
    <>
      <path d="M3.75 12h16.5a8.25 8.25 0 0 1-16.5 0z" />
      <path d="M9 9c-.8-.9.8-2.1 0-3M12 9c-.8-.9.8-2.1 0-3M15 9c-.8-.9.8-2.1 0-3" />
    </>
  ),
};

export function CategoryIcon({ category, ...props }: { category: BusinessCategory } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[category]}
    </svg>
  );
}
