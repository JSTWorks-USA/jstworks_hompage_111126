import Image from "next/image";
import type { CSSProperties } from "react";
import type { NewsItem } from "@/content/site";
import { cn } from "@/lib/utils";

/** 보도·소식 대표 이미지. 이미지가 없으면 자리 표시를 보여 줍니다. */
export function NewsCover({
  item,
  sizes,
  eager,
  className,
  style,
}: {
  item: NewsItem;
  sizes: string;
  /** 첫 화면에 바로 보이는 사진이면 true (지연 로딩하지 않음) */
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  // 부르는 쪽이 대표 사진이 있을 때만 그립니다.
  if (!item.cover) return null;
  // 문서처럼 잘리면 안 되는 이미지는 옅은 바탕 가운데에 여백을 두고 통째로 보여 줍니다.
  const contain = item.cover.fit === "contain";
  return (
    // 이미지 뒤 바탕: 아주 연한 흰색(#f9f9f9)
    <div className={cn("relative overflow-hidden bg-neutral-cool", className)} style={style}>
      <Image
        src={item.cover.src}
        alt={item.cover.alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : undefined}
        className={cn(
          contain ? "object-contain p-[6%]" : "object-cover",
          item.cover.focus === "right" && "object-right",
        )}
      />
      {item.cover.logo && (
        // 사진 왼쪽(하늘 부분) 가운데에 로고를 얹습니다. 칸 너비에 비례해 커지고 줄어듭니다.
        <div className="pointer-events-none absolute inset-y-0 left-[7%] flex w-[38%] items-center">
          <Image
            src={item.cover.logo.src}
            alt={item.cover.logo.alt}
            width={item.cover.logo.width}
            height={item.cover.logo.height}
            className="block h-auto w-full drop-shadow-[0_0.125rem_0.75rem_rgb(0_0_0/0.35)]"
          />
        </div>
      )}
    </div>
  );
}
