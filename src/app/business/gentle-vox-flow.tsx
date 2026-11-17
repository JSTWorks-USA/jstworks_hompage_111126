import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * 젠틀복스 작동 흐름: 4단계(녹음 → 전달 → 재생 → 안심) + 핵심 특허기술 3가지 + 사용 예.
 * 사이트 기본(흰 바탕, 검은 글자, 사이트 기본 폰트)에 맞춰 그립니다.
 * 넓은 화면에서는 4단계가 한 줄로 이어지고, 좁은 화면에서는 세로로 쌓입니다.
 */

/** 아이콘 선·채움: 흰 면에 검은 선, 강조 선도 검은색 */
const S = "fill-none stroke-foreground stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round]";
const F = "fill-background stroke-foreground stroke-[2.4] [stroke-linejoin:round]";
const A = "fill-none stroke-foreground stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round]";
const AF = "fill-foreground";
const D = "fill-foreground";
/** 아이콘 안쪽 칸(마이크·말풍선): 흰 면에 검은 선 */
const S_SURFACE = "fill-background stroke-foreground stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round]";

type Step = { title: string; body: string; icon: ReactNode };

const STEPS: Step[] = [
  {
    title: "녹음",
    body: "Gentle Vox 앱에 안부 메시지를 말하거나 입력합니다.",
    // 휴대폰 + 마이크
    icon: (
      <svg viewBox="0 0 60 60">
        <rect className={F} x="17" y="5" width="26" height="50" rx="6" />
        <rect className={S_SURFACE} x="26.5" y="17" width="7" height="13" rx="3.5" />
        <path className={S} d="M22.5 27a7.5 7.5 0 0 0 15 0M30 34.5V40M26 40h8" />
        <path className={A} d="M49 24v8M54 20v16M11 24v8M6 20v16" />
      </svg>
    ),
  },
  {
    title: "전달",
    body: "메시지가 안전하게 저장되어 가족의 큐브로 전해집니다.",
    // 클라우드 + 전송
    icon: (
      <svg viewBox="0 0 60 60">
        <path className={F} d="M17 44a11 11 0 0 1-1.5-21.9A15 15 0 0 1 44.6 20 12 12 0 0 1 44 44z" />
        <path className={A} d="M30 38V26M24.5 31l5.5-5.5 5.5 5.5" />
      </svg>
    ),
  },
  {
    title: "재생",
    body: "큐브에서 가족의 목소리로 안부가 흘러나옵니다.",
    // 큐브 스피커
    icon: (
      <svg viewBox="0 0 60 60">
        <rect className={F} x="6" y="12" width="36" height="36" rx="8" />
        <g className={D}>
          {[21, 30, 39].flatMap((cy) =>
            [15, 24, 33].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />),
          )}
        </g>
        <path className={A} d="M47 24a8 8 0 0 1 0 12M52 19a15 15 0 0 1 0 22" />
      </svg>
    ),
  },
  {
    title: "안심",
    body: "듣고 스위치를 누르면, 보낸 사람 휴대폰에 확인 알림이 뜹니다.",
    // 휴대폰 + 안심 알림
    icon: (
      <svg viewBox="0 0 60 60">
        <rect className={F} x="8" y="9" width="26" height="46" rx="6" />
        <path className={S} d="M17 47h8" />
        <rect className={S_SURFACE} x="24" y="5" width="31" height="24" rx="7" />
        <path
          className={AF}
          d="M39.5 23.5c-5-3.4-7.5-6-7.5-8.8a3.9 3.9 0 0 1 7.5-1.5 3.9 3.9 0 0 1 7.5 1.5c0 2.8-2.5 5.4-7.5 8.8z"
        />
      </svg>
    ),
  },
];

const PATENTS = [
  { label: "특허기술1", title: "구매자 1:1 매칭", body: "식별 ID와 사용자 단말 1:1 대조 인증" },
  { label: "특허기술2", title: "초개인화 맞춤형 경험", body: "구매자가 지정한 사람의 이름을 직접 부름" },
  { label: "특허기술3", title: "위조품 원천차단", body: "고유번호와 구매자 스마트폰 정보가 일치해야만 작동" },
];

function Arrow() {
  return (
    <li aria-hidden="true" className="-my-1 flex shrink-0 items-center justify-center lg:my-0 lg:w-6">
      <svg
        viewBox="0 0 24 24"
        className="size-4 rotate-90 fill-none stroke-muted-foreground stroke-2 lg:size-5 [stroke-linecap:round] [stroke-linejoin:round] lg:rotate-0"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </li>
  );
}

/**
 * product: 왼쪽 위에 둘 제품 이름·소개(Gentle Vox, 스마트 오디오 토이, 출시 예정)
 * 넓은 화면에서는 제품 이름(왼쪽)과 작동 흐름 제목(오른쪽)이 한 줄에 나란히 놓입니다.
 */
export function GentleVoxFlow({ product, className }: { product: ReactNode; className?: string }) {
  return (
    <section aria-labelledby="gv-flow-title" className={cn("flex flex-col gap-8 md:gap-6 short:gap-4", className)}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
        {product}
        <div className="flex flex-col gap-3">
          <h4 id="gv-flow-title" className="m-0 type-title text-balance">
            앱으로 남긴 진심, 큐브로 듣는 안부
          </h4>
          <p className="m-0 max-w-[34em] type-body text-muted-foreground">
            젠틀복스 앱에 안부를 녹음하면, 가족의 큐브에서 내 목소리가 흘러나옵니다.
          </p>
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-2 p-0 lg:flex-row lg:items-stretch">
        {STEPS.map((step, i) => (
          <Fragment key={step.title}>
            {i > 0 && <Arrow />}
            {/* 휴대폰·태블릿: 아이콘 | STEP·제목·설명을 한 줄로 작게 / 넓은 화면: 아이콘·STEP 줄 아래 제목·설명 */}
            <li className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 lg:flex-col lg:items-stretch lg:gap-3 lg:p-5 short:lg:gap-2 short:lg:p-4">
              <div className="flex shrink-0 items-center gap-3">
                <div
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted lg:size-12 lg:rounded-xl [&_svg]:block [&_svg]:size-7 lg:[&_svg]:size-9"
                >
                  {step.icon}
                </div>
                <span className="hidden type-meta text-muted-foreground tabular-nums lg:inline">STEP {i + 1}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 lg:gap-1">
                <h5 className="m-0 flex items-baseline gap-2 type-title">
                  <span className="type-meta font-normal text-muted-foreground tabular-nums lg:hidden">{i + 1}</span>
                  {step.title}
                </h5>
                <p className="m-0 type-body text-muted-foreground">{step.body}</p>
              </div>
            </li>
          </Fragment>
        ))}
      </ol>

      {/* 핵심 특허기술: 상자 대신 위쪽 선으로만 나눕니다(위 단계 목록과 겹치지 않게) */}
      <ul aria-label="주요 핵심기술" className="m-0 grid list-none gap-x-8 gap-y-5 p-0 md:grid-cols-3 short:gap-y-3">
        {PATENTS.map((patent) => (
          <li key={patent.label} className="flex flex-col gap-1 border-t border-border pt-4 short:pt-3">
            <span className="type-meta text-muted-foreground">{patent.label}</span>
            <span className="type-title">{patent.title}</span>
            <span className="type-body text-muted-foreground">{patent.body}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 rounded-xl bg-muted px-6 py-4 short:py-3">
        <p className="m-0 type-meta text-muted-foreground">예: 요양원에 계신 엄마</p>
        <p className="m-0 type-body">
          딸이 앱에 안부를 남기면 엄마의 큐브에서 딸 목소리가 나오고, 엄마가 스위치를 누르면 딸에게
          “엄마 잘 지내니 걱정 마” 알림이 도착합니다.
        </p>
      </div>
    </section>
  );
}
