import Image from "next/image";
import { Placeholder } from "@/components/site-ui";
import type { NewsItem } from "@/content/site";
import { cn } from "@/lib/utils";

/** 보도·소식 대표 이미지. 이미지가 없으면 자리 표시를 보여 줍니다. */
export function NewsCover({
  item,
  sizes,
  priority,
  className,
}: {
  item: NewsItem;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!item.cover) {
    return <Placeholder icon="camera" caption="대표 이미지 자리" className={className} />;
  }
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={item.cover.src}
        alt={item.cover.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
