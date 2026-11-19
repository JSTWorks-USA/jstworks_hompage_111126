"use client";

import Image from "next/image";
import { type CSSProperties, useRef } from "react";
import { Container } from "@/components/site-ui";
import type { Person } from "@/content/site";
import { T } from "@/lib/i18n";
import { useT } from "@/lib/language";
import { cn } from "@/lib/utils";
import { PersonDoodles } from "./person-doodles";
import { useActiveRow } from "./use-active-row";
import { useStepToRow } from "./use-step-to-row";

/**
 * 줄 바탕은 모두 흰색이고, 지금 보고 있는 사람(화면 세로 가운데에 가장 가까운 줄)의 바탕만 Main Green 으로 켜집니다.
 * 사람마다 정한 색(site.ts 의 background)은 따옴표와 선 그림에만 씁니다.
 * 밝은 종이색(#F7F8F9)은 흰 바탕에서 보이지 않아 People Green 으로 씁니다. 여기에 없는 색은 DEFAULT_PALETTE 를 씁니다.
 */
const PEOPLE_PALETTE: Record<string, { ink: string; accent: string }> = {
  "#00441E": { ink: "var(--people-green)", accent: "var(--accent-amber)" },
  "#6300A9": { ink: "var(--people-violet)", accent: "var(--accent-amber)" },
  "#A94400": { ink: "var(--people-rust)", accent: "var(--people-navy)" },
  "#001D3D": { ink: "var(--people-navy)", accent: "var(--accent-amber)" },
  "#F7F8F9": { ink: "var(--people-green)", accent: "var(--people-rust)" },
};
const DEFAULT_PALETTE = { ink: "var(--people-green)", accent: "var(--people-rust)" };
/** 켜진 줄(녹색 바탕): 따옴표·선 그림을 녹색 위에서 보이는 민트·앰버로 */
const ACTIVE_PALETTE = { ink: "var(--green-light)", accent: "var(--accent-amber)" };

/** 녹색으로 켜진 줄에서는 흐린 글자도 흰색 단계로 바꿔 대비를 지킵니다 */
const SUBTLE = "text-muted-foreground transition-colors duration-300 group-data-active:text-primary-foreground/80";

function rowTheme(person: Person, active: boolean) {
  if (active) return ACTIVE_PALETTE;
  return (person.background && PEOPLE_PALETTE[person.background.toUpperCase()]) || DEFAULT_PALETTE;
}

/**
 * 헤드라인 한 줄의 대략적인 폭(글자 크기의 몇 배인지). 실제 글꼴로 잰 값보다 조금 넉넉하게 잡았습니다
 * (한글 0.94, 띄어쓰기 0.21, 쉼표·마침표 0.25 → 0.95, 0.22, 0.3). 헤드라인 글자 크기를 칸에 맞출 때 씁니다.
 */
function lineEm(line: string) {
  let em = 0;
  for (const ch of line) em += /[가-힣]/.test(ch) ? 0.95 : ch === " " ? 0.22 : /[.,!?·]/.test(ch) ? 0.3 : 0.62;
  return Number(em.toFixed(2));
}

/** 팔을 든 사진처럼 가로가 넓은 사진(폭 ÷ 높이 > 0.8). 이런 줄은 인물 칸을 넓히고 문구 칸을 좁힙니다 */
const isWide = (person: Person) => !!person.cutout && person.cutout.width / person.cutout.height > 0.8;

/**
 * 한국어 헤드라인 글자 크기(태블릿·PC): 모든 사람이 같은 크기를 씁니다.
 * 7명 중 가장 긴 줄이 가장 좁은 문구 칸에도 줄바꿈(\n) 자리에서만 나뉘어 들어가는 크기를 구해 globals.css(.quote-fit)에 넘깁니다.
 * 100cqi = 한 사람 줄(Container)의 안쪽 폭. 문구 칸 폭 = 넓은 화면은 (100cqi - 칸 사이 간격) × 문구 칸 비율, 세로 태블릿은 100cqi. 둘 다 최대 42rem.
 * 3rem 은 여는 따옴표와 간격, 6.5rem 은 그에 더해 마지막 줄 끝의 닫는 따옴표 자리입니다.
 */
function quoteFitVars(people: Person[]) {
  const byColumn = new Map<number, { longest: number; last: number }>();
  let longest = 0;
  let last = 0;
  for (const person of people) {
    const lines = person.quote.split("\n").map(lineEm);
    const l = Math.max(...lines);
    const e = lines[lines.length - 1];
    longest = Math.max(longest, l);
    last = Math.max(last, e);
    // 문구 칸 비율: 넓은 사진 줄은 0.75fr / 2fr, 그 밖은 0.85fr / 2fr (아래 grid-cols 와 같은 값)
    const share = isWide(person) ? 0.375 : 0.425;
    const g = byColumn.get(share) ?? { longest: 0, last: 0 };
    byColumn.set(share, { longest: Math.max(g.longest, l), last: Math.max(g.last, e) });
  }
  const fit = (width: string, l: number, e: number) => [`calc((${width} - 3rem) / ${l})`, `calc((${width} - 6.5rem) / ${e})`];
  const wideScreen = [...byColumn].flatMap(([share, g]) =>
    fit(`min((100cqi - var(--layout-column-gap)) * ${share}, 42rem)`, g.longest, g.last),
  );
  return {
    "--quote-fit-md": `min(${fit("min(100cqi, 42rem)", longest, last).join(", ")})`,
    "--quote-fit-lg": `min(${wideScreen.join(", ")})`,
  } as CSSProperties;
}

/** 사진이 아직 없는 사람 자리. 사진과 같은 크기로 줄 아래 끝에 붙는 상반신 실루엣입니다. */
function Silhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 100"
      aria-hidden="true"
      className={cn("absolute inset-0 size-full opacity-60", className)}
      fill="currentColor"
    >
      <circle cx="40" cy="42" r="15" />
      <path d="M12 100c0-19 12.5-33 28-33s28 14 28 33Z" />
    </svg>
  );
}

/**
 * 한 사람당 화면 너비 한 줄.
 * 이름·경력과 사진을 한쪽에, 한 줄 문구를 반대쪽에 두고 줄마다 좌우를 바꿉니다.
 * 사진은 줄 아래 끝에 붙어 있습니다(새로고침 때 사진이 튀지 않도록 스크롤 연동 움직임은 두지 않습니다).
 * 휴대폰·태블릿(1023px 이하)에서는 문구 → 이름·경력·사진 순서로 쌓고, 넓은 화면에서만 좌우로 나누며 줄 높이를 600px 로 맞춥니다.
 * 단, 태블릿 폭(768~1023px)이라도 가로가 세로보다 긴 화면(펼친 갤럭시 Z 폴드 등, fold: 변형)은 넓은 화면처럼 좌우로 나누고,
 * 줄 높이와 사진 높이를 보이는 화면 높이에 맞춰 한 사람이 한 화면 안에 들어오게 합니다(lg: 와 같은 값을 fold: 에도 줍니다).
 */
function PersonRow({ person, index, active }: { person: Person; index: number; active: boolean }) {
  const t = useT();
  const theme = rowTheme(person, active);
  // 홀수 줄은 문구가 왼쪽, 인물이 오른쪽
  const flip = index % 2 === 1;
  // 팔을 든 사진처럼 가로가 넓은 사진(폭 ÷ 높이 > 0.8)은 폭 상한에 먼저 걸려 키가 작아지고 머리가 다른 줄보다 내려갑니다.
  // 이런 사진은 폭 상한과 인물 칸 비율을 넓혀 다른 사람과 비슷한 높이로 맞춥니다.
  const wide = isWide(person);

  return (
    <li
      data-active={active || undefined}
      // 한영 전환 때 이 줄(한 사람) 전체를 기준으로 보던 자리를 지킵니다(src/lib/language.ts)
      data-scroll-anchor=""
      aria-current={active ? "true" : undefined}
      // 줄 사이에는 옅은 선 하나만 둡니다. 보고 있는 줄은 바탕이 녹색으로 켜집니다(색만 천천히 바뀜).
      className="group overflow-hidden border-t border-border bg-background text-foreground transition-colors duration-300 ease-out first:border-t-0 motion-reduce:transition-none data-active:bg-primary data-active:text-primary-foreground"
    >
      {/* 넓은 화면에서는 한 사람 줄의 높이를 600px 로 맞춥니다 */}
      {/* 인물 칸(이름·경력 + 사진)을 문구 칸보다 넓게 잡아 경력이 한 줄로 들어가게 합니다 */}
      <Container
        className={cn(
          "grid items-end gap-x-(--layout-column-gap) gap-y-8 pt-12 md:@container md:pt-14 lg:min-h-150 fold:min-h-[min(37.5rem,calc(100svh-var(--header-height)))] lg:pt-16 fold:pt-16",
          wide
            ? flip
              ? "lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] fold:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
              : "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] fold:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"
            : flip
              ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] fold:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
              : "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] fold:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
        )}
      >
        {/* 인물: 이름·경력 + 사진 */}
        <div
          className={cn(
            "flex items-end justify-between gap-6 lg:justify-center fold:justify-center lg:gap-8 fold:gap-8",
            wide && "lg:gap-6 fold:gap-6 xl:gap-8",
            flip && "lg:order-2 fold:order-2",
          )}
        >
          {/* 넓은 화면: 이름·경력 칸 폭을 언어와 관계없이 같게(최대 20rem, 자리가 모자라면 같은 비율로 줄어듦) 잡아
              KO/EN 을 바꿔도 사진이 좌우로 움직이지 않습니다. 영어 경력이 길면 이 칸 안에서 줄을 바꿉니다.
              휴대폰·태블릿(1023px 이하)은 지금처럼 글 길이에 맞춰 배치합니다 */}
          <div className="flex min-w-0 flex-col gap-4 self-center pb-8 md:gap-5 lg:flex-[0_1_20rem] fold:flex-[0_1_20rem] lg:gap-6 fold:gap-6 lg:pb-16 fold:pb-16">
            <div className="flex flex-col gap-1 md:gap-2">
              {/* 한국어: 이름 옆에 한글 직책(대표이사 등). 한글 직함(titleKo, 예: 부사장)이 있으면 영문 직책 대신 그것을 씁니다.
                  영어: 영문 이름 아래 줄에 영문 직책(예: Jamssi Park / Co-founder & Creative Director) */}
              <h2 className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[1.375rem] leading-snug font-bold tracking-[-0.01em] break-keep md:text-[1.75rem] xl:text-[2rem] en:flex-col en:items-start max-sm:en:text-xl">
                <T>{person.name}</T>
                {person.titleKo && (
                  <span className={cn("text-sm font-medium tracking-normal md:text-base en:hidden", SUBTLE)}>{person.titleKo}</span>
                )}
                <span className={cn("text-sm font-medium tracking-normal md:text-base", SUBTLE, person.titleKo && "hidden en:inline")}>
                  <T>{person.role}</T>
                </span>
              </h2>
            </div>
            <div className="flex flex-col gap-1 md:gap-2">
              {/* "경력" 제목은 아래 경력 줄보다 한 단계 크게, 굵게.
                  영어 이름·경력(Communications 등)은 단어가 길어 휴대폰에서는 한 단계 작게 씁니다(위 이름 줄도 같음) */}
              <h3 className="m-0 text-base font-bold sm:text-lg md:text-2xl">
                <T>경력</T>
              </h3>
              <ul className={cn("m-0 flex list-none flex-col gap-1 p-0 text-[0.9375rem] leading-snug break-keep sm:text-base md:text-xl max-sm:en:text-sm", SUBTLE)}>
                {person.career.map((item, i) => (
                  // 괄호로 시작하는 줄은 바로 위 경력의 덧붙임이라 두 단계 작게 씁니다
                  <li
                    key={`${item}-${i}`}
                    className={cn(item.startsWith("(") && "text-[0.8125rem] sm:text-sm md:text-base")}
                  >
                    <T>{item}</T>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {person.photo && person.cutout ? (
            // 오려 낸 고해상도 사진: 네모 칸 없이 줄 높이에 가깝게 크게, 줄 바닥에 붙입니다.
            // 뒤에는 역할에 맞춘 선 그림을 깔아 줍니다. 넓은 화면에서는 인물 양옆에 여백을 두고 그 안에만 그려
            // 이름·경력이나 문구와 겹치지 않게 합니다. 팔을 든 사진처럼 폭이 넓은 사진은 폭을 묶어 이름·경력 자리를 남깁니다.
            <div
              className={cn(
                "relative shrink-0 xl:px-6",
                // 넓은 사진은 바깥쪽 여백으로 조금 내보내 이름·경력 칸 폭을 지킵니다(1024~1279px)
                wide && (flip ? "lg:-mr-6 fold:-mr-6 xl:mr-0" : "lg:-ml-6 fold:-ml-6 xl:ml-0"),
              )}
            >
              {person.doodle && (
                <PersonDoodles
                  theme={person.doodle}
                  accent={theme.accent}
                  className="absolute inset-0 size-full opacity-70"
                  style={{ color: theme.ink }}
                />
              )}
              <Image
                src={person.photo}
                alt={t(person.alt)}
                width={person.cutout.width}
                height={person.cutout.height}
                // 첫 사람 사진은 첫 화면에 바로 보이므로 미루지 않고 바로 받습니다(나머지는 스크롤해 가까워질 때)
                loading={index === 0 ? "eager" : undefined}
                sizes={wide ? "(min-width: 1280px) 460px, (min-width: 1024px) 400px, (min-width: 768px) 400px, (min-width: 640px) 56vw, 52vw" : "(min-width: 1280px) 360px, (min-width: 1024px) 320px, (min-width: 768px) 340px, (min-width: 640px) 300px, 52vw"}
                className={cn(
                  "relative block h-auto drop-shadow-[0_0.75rem_1.5rem_rgb(0_0_0/0.35)] max-h-72 w-auto max-w-[48vw] sm:max-h-96 md:max-h-[28rem] lg:max-h-[28rem] fold:max-h-[min(28rem,calc(100svh-var(--header-height)-4rem))] xl:max-h-[32rem]",
                  wide
                    ? "sm:max-w-[54vw] md:max-w-[25rem] xl:max-w-[28.5rem]"
                    : "lg:max-w-[20rem] fold:max-w-[20rem] xl:max-w-[22rem]",
                )}
              />
            </div>
          ) : (
            <div className="relative aspect-4/5 w-36 shrink-0 sm:w-48 md:w-56 lg:w-64 fold:w-64">
              {person.photo ? (
                <Image
                  src={person.photo}
                  alt={t(person.alt)}
                  fill
                  sizes="(min-width: 1024px) 256px, (min-width: 768px) 224px, (min-width: 640px) 192px, 144px"
                  className="object-cover object-top"
                />
              ) : (
                <Silhouette className={SUBTLE} />
              )}
            </div>
          )}
        </div>

        {/* 인물별 헤드라인: 여는 따옴표는 첫 줄 왼쪽, 닫는 따옴표는 마지막 줄 끝에 붙습니다. */}
        <blockquote
          className={cn(
            "order-first m-0 flex max-w-md items-start gap-3 self-center md:max-w-2xl lg:order-0 fold:order-0 lg:justify-self-center fold:justify-self-center lg:pb-16 fold:pb-16",
            flip && "lg:order-1 fold:order-1",
            // 한국어 글자 크기를 모든 사람이 같게 맞춥니다(quoteFitVars, globals.css .quote-fit)
            "quote-fit",
          )}
        >
          <span
            aria-hidden="true"
            className="shrink-0 text-5xl leading-none font-bold transition-colors duration-300 md:text-6xl lg:text-7xl fold:text-7xl"
            style={{ color: theme.ink }}
          >
            “
          </span>
          {/* 슬로건 굵기: 한국어·영어 모두 font-bold(700).
              글자 크기는 --quote-fs 변수로 줍니다: 휴대폰 32px, 태블릿 48px, 작은 PC(1024~1279px)는 화면 폭에 맞춰 약 30~39px, PC 44px, 큰 PC 48px.
              한국어(태블릿·PC)는 이 값을 넘지 않는 범위에서 줄바꿈 자리에서만 줄이 나뉘도록 globals.css(.quote-fit)가 더 줄입니다.
              영문은 한 단계(4px) 작게 씁니다. 태블릿·PC 영문은 정해 둔 줄바꿈(\n)을 쓰지 않고 문장을 이어 줄 길이를 고르게 나눕니다
              (긴 첫 줄이 칸에 다 안 들어가 "products" 처럼 한 단어만 떨어진 뒤 다시 줄이 바뀌는 일을 막음). 휴대폰은 그대로 */}
          <p className="m-0 pt-2 text-(length:--quote-fs) leading-[1.15] en:text-[calc(var(--quote-fs)-0.25rem)] md:en:whitespace-normal md:en:text-balance font-bold break-keep whitespace-pre-line [--quote-fs:2rem] md:[--quote-fs:3rem] lg:[--quote-fs:calc(3.6vw-0.45rem)] fold:[--quote-fs:calc(3.6vw-0.45rem)] xl:[--quote-fs:2.75rem] 2xl:[--quote-fs:3rem]">
            <T>{person.quote}</T>
            <span
              aria-hidden="true"
              className="ml-3 inline-block align-top text-5xl leading-none font-bold transition-colors duration-300 md:ml-4 md:text-6xl lg:text-7xl fold:text-7xl"
              style={{ color: theme.ink }}
            >
              ”
            </span>
          </p>
        </blockquote>
      </Container>
    </li>
  );
}

/**
 * 구성원 줄을 정해진 순서(PEOPLE)대로 쌓습니다. 좌우 배치는 순번에 따라 번갈아 바뀝니다.
 * 일정 거리 이상 스크롤하면 그 방향 다음 사람 줄의 세로 가운데로 한 번에 옮기고(덜 움직이면 그대로),
 * 화면 가운데에 온 사람의 줄이 녹색으로 켜집니다.
 */
export function PeopleRows({ people }: { people: Person[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  useStepToRow(listRef);
  const active = useActiveRow(listRef);
  return (
    <ul ref={listRef} className="m-0 list-none p-0" style={quoteFitVars(people)}>
      {people.map((person, i) => (
        <PersonRow key={person.name} person={person} index={i} active={i === active} />
      ))}
    </ul>
  );
}
