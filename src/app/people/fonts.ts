import { Dokdo } from "next/font/google";

/**
 * People 인물별 헤드라인 전용 손글씨 폰트(Google Fonts "Dokdo", 한 굵기 400).
 * next/font 가 빌드 때 받아 자체 호스팅하므로 외부 요청이 없습니다.
 * 한글 글리프는 unicode-range 조각으로 나뉘어 필요한 글자만 내려받습니다.
 */
export const dokdo = Dokdo({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
