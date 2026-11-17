import Image from "next/image";

/**
 * 히어로 문구: "Joshua Tree WORKS" 글자 로고(가로 300px = 18.75rem) + "미국향 커머스 플랫폼".
 */
export function HeroCopy() {
  return (
    <h1 id="hero-title" className="relative m-0 flex flex-col items-center gap-4 md:gap-5">
      <Image
        src="/images/joshua-tree-works-wordmark-white.webp"
        alt="Joshua Tree WORKS"
        width={649}
        height={58}
        priority
        sizes="300px"
        className="block h-auto w-75 max-w-full"
      />
      {/* 20px → 14px, 넓은 화면 28px → 19.6px (30% 줄임) */}
      <span className="text-sm leading-tight font-medium md:text-[1.225rem]">
        미국향 커머스 플랫폼
      </span>
    </h1>
  );
}
