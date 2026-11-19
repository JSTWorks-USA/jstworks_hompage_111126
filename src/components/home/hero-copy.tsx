import Image from "next/image";
import { T } from "@/lib/i18n";

/**
 * 히어로 문구: "Joshua Tree WORKS" 글자 로고 + "미국향 커머스 플랫폼".
 * 영어(EN) 화면에서는 아래 문구가 "Commerce Platform for US Market" 으로 바뀝니다.
 *
 * 로고 가로는 PC 500px(31.25rem). 화면이 좁으면 화면 폭의 78%까지 줄어듭니다(휴대폰 390px → 약 304px).
 * 아래 글씨와 사이 간격은 로고 폭에 비례하므로(컨테이너 단위 cqw) 로고와 같은 비율로 함께 작아집니다.
 *   글씨 = 로고 폭의 6.4% (500px 일 때 32px), 간격 = 로고 폭의 4% (500px 일 때 20px)
 *   영문 부제는 한글보다 길어 한 줄에 들어가도록 6% (500px 일 때 30px)
 */
export function HeroCopy() {
  return (
    <h1
      id="hero-title"
      className="relative m-0 flex w-[min(31.25rem,78vw)] flex-col items-center [container-type:inline-size]"
    >
      <Image
        src="/images/joshua-tree-works-wordmark-white.webp"
        alt="Joshua Tree WORKS"
        width={649}
        height={58}
        loading="eager"
        sizes="(min-width: 641px) 500px, 78vw"
        className="block h-auto w-full"
      />
      <span className="mt-[4cqw] text-[6.4cqw] leading-tight font-medium en:text-[6cqw] en:whitespace-nowrap">
        <T>미국향 커머스 플랫폼</T>
      </span>
    </h1>
  );
}
