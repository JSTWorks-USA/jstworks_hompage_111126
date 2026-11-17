"use client";

import { useEffect, useState } from "react";
import { ShareAndroidIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 공유하기: 누르면 글 주소(/media/번호)를 복사하고 "링크 복사됨"을 2초 동안 보여 줍니다.
 */
export function ShareButton({
  id,
  iconOnly = false,
  className,
}: {
  /** 글 번호 */
  id: number;
  /** 아이콘만 보이고, 복사되면 "링크 복사됨"을 잠깐 글자로 보여 줍니다 */
  iconOnly?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const url = `${window.location.origin}/media/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 클립보드를 쓸 수 없는 환경(오래된 브라우저 등): 숨긴 입력칸으로 복사합니다.
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
  };

  if (iconOnly) {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        <span aria-live="polite" className="text-sm text-muted-foreground">
          {copied ? "링크 복사됨" : ""}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="iconLg"
          aria-label="공유하기"
          onClick={share}
          className="cursor-pointer"
        >
          <ShareAndroidIcon aria-hidden="true" className="size-5" />
        </Button>
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={share}
      className={cn("cursor-pointer gap-1.5", className)}
    >
      <ShareAndroidIcon aria-hidden="true" className="size-4" />
      <span aria-live="polite">{copied ? "링크 복사됨" : "공유하기"}</span>
    </Button>
  );
}
