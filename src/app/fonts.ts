import { Inter, Nanum_Gothic } from "next/font/google";

/**
 * 사이트 기본 폰트. next/font 가 빌드 때 받아 자체 호스팅하므로 외부 요청이 없습니다.
 * 글꼴 순서(globals.css 의 --font-sans): 영문·숫자는 Inter, 한글은 Nanum Gothic.
 */

/** 영문·숫자: Google Fonts "Inter", 가변 굵기 100~900 + 글자 크기별 모양(opsz). 라틴 글자만 담고 있습니다 */
export const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * 한글: Google Fonts "Nanum Gothic" (기본 400, 굵게 700·800).
 * 한글 글리프는 unicode-range 조각으로 나뉘어 화면에 쓰인 글자 조각만 내려받습니다.
 */
export const nanumGothic = Nanum_Gothic({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nanum-gothic",
});
