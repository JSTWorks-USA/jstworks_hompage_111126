"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HeroDay } from "./hero-day";
import { HeroNightSky } from "./hero-night-sky";

type Variant = "day" | "night";

/**
 * 메인 히어로 시안 비교: 1안(지금 쓰는 낮 사진) / 2안(은하수 밤하늘 + 검은 나무 실루엣, 별빛 효과)
 * 히어로 오른쪽 아래 버튼으로 바꿔 볼 수 있습니다. 시안을 고르면 이 전환 버튼은 지웁니다.
 */
export function HeroSection() {
  const [variant, setVariant] = useState<Variant>("day");

  const picker = (
    <div className="absolute right-6 bottom-6 z-10 md:right-10 md:bottom-10">
      <ToggleGroup
        type="single"
        value={variant}
        // 이미 고른 쪽을 다시 눌러도 선택이 풀리지 않게 합니다.
        onValueChange={(value) => value && setVariant(value as Variant)}
        aria-label="히어로 시안 선택"
        className="bg-background/90 backdrop-blur-sm"
      >
        <ToggleGroupItem value="day" className="min-h-9">
          1 · 낮 사진
        </ToggleGroupItem>
        <ToggleGroupItem value="night" className="min-h-9">
          2 · 밤하늘
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );

  return variant === "day" ? <HeroDay>{picker}</HeroDay> : <HeroNightSky>{picker}</HeroNightSky>;
}
