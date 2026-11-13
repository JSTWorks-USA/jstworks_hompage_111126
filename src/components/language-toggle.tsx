"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Lang = "KO" | "EN";

/**
 * KO / EN 전환.
 * 영문 콘텐츠가 준비되기 전까지는 선택 상태만 바뀝니다.
 */
export function LanguageToggle() {
  const [lang, setLang] = useState<Lang>("KO");

  return (
    <ToggleGroup
      type="single"
      value={lang}
      onValueChange={(value) => {
        if (value === "KO" || value === "EN") setLang(value);
      }}
      aria-label="언어"
      className="gap-0.5 rounded-[1.125rem] p-0.5"
    >
      <ToggleGroupItem value="KO" aria-label="한국어" className="h-6 w-8 px-0 text-xs">
        KO
      </ToggleGroupItem>
      <ToggleGroupItem value="EN" aria-label="English" className="h-6 w-8 px-0 text-xs">
        EN
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
