import Image from "next/image";

/**
 * 메인 히어로: 조슈아 트리 국립공원 낮 사진을 그대로 씁니다. 별빛·움직임 효과는 없습니다.
 */
export function HeroDay() {
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
        {/* 나뭇잎 위에서도 읽히도록 글자 그림자와, 뒤에 옅고 둥근 어두운 번짐을 깝니다 */}
        <h1
          id="hero-title"
          className="relative m-0 flex flex-col items-center gap-4 drop-shadow-[0_0.125rem_0.75rem_rgb(0_0_0/0.55)] before:absolute before:-inset-x-24 before:-inset-y-12 before:-z-10 before:bg-[radial-gradient(closest-side,rgb(0_0_0/0.4),transparent)] md:gap-5"
        >
          {/* 조슈아트리웍스 흰색 로고에서 "Joshua Tree WORKS" 글자만 잘라낸 이미지, 가로 300px */}
          <Image
            src="/images/joshua-tree-works-wordmark-white.webp"
            alt="Joshua Tree WORKS"
            width={649}
            height={58}
            priority
            sizes="300px"
            className="block h-auto w-[300px] max-w-full"
          />
          <span className="text-xl leading-tight font-medium md:text-[1.75rem]">
            미국향 커머스 플랫폼
          </span>
        </h1>
      </div>
    </section>
  );
}
