import Image from "next/image";
import type { ReactNode } from "react";
import { HeroCopy } from "./hero-copy";

/**
 * 히어로 1안: 조슈아 트리 국립공원 낮 사진을 그대로 씁니다. 별빛·움직임 효과는 없습니다.
 * children: 히어로 안에 함께 띄울 요소(1·2안 전환 버튼)
 */
export function HeroDay({ children }: { children?: ReactNode }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate -mt-[var(--header-height)] h-svh min-h-80 overflow-hidden bg-night text-night-foreground"
    >
      <Image
        src="/images/hero/joshua-tree-day.webp"
        alt="조슈아 트리 국립공원의 조슈아 트리와 바위산"
        fill
        priority
        // 가로로 긴 사진(1584×672, 33:14)이라 화면이 사진보다 세로로 길면 높이에 맞춰 화면 폭보다 훨씬 넓게 그려집니다.
        // 그때 실제로 그려지는 폭(화면 높이 × 33/14 ≈ 236vh)으로 알려야 작은 이미지를 늘려 흐려지지 않습니다.
        sizes="(max-aspect-ratio: 33/14) 236vh, 100vw"
        // 위쪽 하늘을 더 남겨 나무가 문구 아래로 내려오게 합니다.
        className="object-cover object-top"
      />
      {/* 헤더가 겹치는 높이만큼 위쪽 여백을 더하고, 나뭇잎과 덜 겹치도록 하늘 쪽(위)에 둡니다 */}
      <div className="relative flex h-full flex-col items-center px-6 pt-[calc(var(--header-height)+2.5rem)] text-center md:pt-[calc(var(--header-height)+5vh)]">
        {/* 나뭇잎 위에서도 읽히도록 글자 뒤에 옅은 번짐을 깝니다 */}
        <HeroCopy scrim />
      </div>
      {children}
    </section>
  );
}
