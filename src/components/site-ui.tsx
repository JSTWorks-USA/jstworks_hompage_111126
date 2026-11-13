import { Fragment, type ReactNode } from "react";
import { CameraIcon, MapPinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** 75rem 콘텐츠 폭 + 디자인 시스템의 페이지 여백(--layout-inset) */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[75rem] px-6 md:px-[var(--layout-inset)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** 서브 페이지 머리말: 제목 + 한 줄 설명 */
export function PageHeader({
  title,
  description,
}: {
  title: string;
  /** 아래 섹션·필터를 되풀이하지 않을 때만 씁니다 */
  description?: string;
}) {
  return (
    <header className="border-b border-border">
      <Container className="flex flex-col gap-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <h1 className="m-0 text-[2.5rem] leading-[1.05] font-bold tracking-[-0.03em] md:text-[3.5rem]">
          {title}
        </h1>
        {description && (
          <p className="m-0 text-lg text-muted-foreground">{description}</p>
        )}
      </Container>
    </header>
  );
}

const placeholderIcons = {
  camera: CameraIcon,
  pin: MapPinIcon,
};

/** 사진·지도가 들어갈 자리 표시 */
export function Placeholder({
  icon,
  caption,
  className,
}: {
  icon: keyof typeof placeholderIcons;
  caption: string;
  className?: string;
}) {
  const Icon = placeholderIcons[icon];
  return (
    <figure
      className={cn(
        "m-0 flex flex-col items-center justify-center gap-3 bg-muted px-6 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-7" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/**
 * "K-뷰티", "K-Beauty"처럼 하이픈으로 이어진 낱말이 줄 끝에서 끊기지 않게 묶습니다.
 */
export function KeepTogether({ text }: { text: string }) {
  const parts = text.split(/(K-[^\s,.()]+)/);
  return (
    <>
      {parts.map((part, i) =>
        /^K-/.test(part) ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
