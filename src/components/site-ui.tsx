import { Fragment, type ReactNode } from "react";
import { CameraIcon } from "@/components/icons";
import { T } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** 최대 100rem(1600px, --content-max) 콘텐츠 폭 + 화면 크기별 좌우 여백(--page-inset: 15 / 20 / 32 / 48px) */
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
        "mx-auto w-full max-w-(--content-max) px-(--page-inset)",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** 서브 페이지 머리말: 페이지 제목 */
export function PageHeader({
  title,
  bordered = true,
}: {
  title: string;
  /** 머리 아래 구분선 */
  bordered?: boolean;
}) {
  return (
    <header className={bordered ? "border-b border-border" : undefined}>
      <Container className="flex flex-col gap-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <h1 className="m-0 text-[2.5rem] leading-[1.05] font-bold tracking-[-0.03em] md:text-[3.5rem]">
          <T>{title}</T>
        </h1>
      </Container>
    </header>
  );
}

/** 사진·문서가 들어갈 자리 표시 */
export function Placeholder({
  caption,
  className,
  icon = true,
}: {
  caption: string;
  className?: string;
  /** false 면 카메라 아이콘 없이 글만 보여 줍니다(예: 아직 서류가 없는 "예정중" 항목) */
  icon?: boolean;
}) {
  return (
    <figure
      className={cn(
        "m-0 flex flex-col items-center justify-center gap-3 bg-muted px-6 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {icon && <CameraIcon aria-hidden="true" className="size-7" />}
      <figcaption>
        <T>{caption}</T>
      </figcaption>
    </figure>
  );
}

/**
 * "K-뷰티", "K-Beauty"처럼 하이픈으로 이어진 낱말이 줄 끝에서 끊기지 않게 묶습니다.
 * 영어 사전(src/content/en.ts)에 있는 문구면 영어(EN) 화면에서 영어로 바뀝니다.
 */
export function KeepTogether({ text }: { text: string }) {
  return <T render={keepParts}>{text}</T>;
}

function keepParts(text: string) {
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
