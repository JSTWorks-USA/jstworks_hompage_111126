"use client";

import Image from "next/image";
import { useRef } from "react";
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
 * 밝은 종이색(#F7F8F9 · #FAF9F7)은 흰 바탕에서 보이지 않아 People Green 으로 씁니다.
 */
const PEOPLE_PALETTE: Record<string, { ink: string; accent: string }> = {
  "#00441E": { ink: "var(--people-green)", accent: "var(--accent-amber)" },
  "#00441D": { ink: "var(--people-green)", accent: "var(--accent-amber)" },
  "#6300A9": { ink: "var(--people-violet)", accent: "var(--accent-amber)" },
  "#A94400": { ink: "var(--people-rust)", accent: "var(--people-navy)" },
  "#001D3D": { ink: "var(--people-navy)", accent: "var(--accent-amber)" },
  "#F7F8F9": { ink: "var(--people-green)", accent: "var(--people-rust)" },
  "#FAF9F7": { ink: "var(--people-green)", accent: "var(--people-rust)" },
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
  const wide = !!person.cutout && person.cutout.width / person.cutout.height > 0.8;

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
          "grid items-end gap-x-(--layout-column-gap) gap-y-8 pt-12 md:pt-14 lg:min-h-150 fold:min-h-[min(37.5rem,calc(100svh-var(--header-height)))] lg:pt-16 fold:pt-16",
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
                  영어: 영문 이름 아래 줄에 영문 직책(예: Jaemo Park / Co-founder & Creative) */}
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
              작은 PC(1024~1279px)에서는 문구 칸이 좁아 40px 고정이면 "고객은 좋은 / 제품만을 구매하진 / 않는다," 처럼
              뜻 중간에서 잘게 끊기므로, 화면 폭에 맞춰 약 30px(1024px)~39px(1279px)로 줄여 넓은 화면과 같은 위치에서 줄이 바뀌게 합니다 */}
          <p className="m-0 pt-2 text-[2rem] leading-[1.15] font-bold break-keep whitespace-pre-line md:text-[3rem] lg:text-[calc(3.6vw-0.45rem)] fold:text-[calc(3.6vw-0.45rem)] xl:text-[2.75rem] 2xl:text-[3rem]">
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
    <ul ref={listRef} className="m-0 list-none p-0">
      {people.map((person, i) => (
        <PersonRow key={person.name} person={person} index={i} active={i === active} />
      ))}
    </ul>
  );
}
