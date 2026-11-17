import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 히어로 문구: "Joshua Tree WORKS" 글자 로고(가로 300px = 18.75rem) + "미국향 커머스 플랫폼".
 * 1안(낮 사진)·2안(밤하늘) 두 히어로가 같이 씁니다.
 * scrim: 밝고 복잡한 사진 위에서도 읽히도록 글자 그림자와 뒤에 옅고 둥근 어두운 번짐을 깝니다.
 */
export function HeroCopy({ scrim = false }: { scrim?: boolean }) {
  return (
    <h1
      id="hero-title"
      className={cn(
        "relative m-0 flex flex-col items-center gap-4 md:gap-5",
        scrim &&
          "drop-shadow-[0_0.125rem_0.75rem_rgb(0_0_0/0.55)] before:absolute before:-inset-x-24 before:-inset-y-12 before:-z-10 before:bg-[radial-gradient(closest-side,rgb(0_0_0/0.4),transparent)]",
      )}
    >
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
