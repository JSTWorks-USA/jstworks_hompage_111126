"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { Container } from "@/components/site-ui";
import type { Person } from "@/content/site";
import { cn } from "@/lib/utils";
import { dokdo } from "./fonts";
import { PersonDoodles } from "./person-doodles";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type Tone = "dark" | "muted" | "mint";

/** 배경색을 정하지 않은 줄: 밤하늘색 → 회색 → 민트 → 회색 순서로 반복합니다. */
function toneFor(index: number): Tone {
  if (index % 4 === 0) return "dark";
  return index % 2 === 1 ? "muted" : "mint";
}

const TONE = {
  dark: {
    row: "bg-black text-night-foreground",
    subtle: "text-night-foreground/70",
    mark: "text-green-light",
  },
  muted: {
    row: "bg-muted text-foreground",
    subtle: "text-muted-foreground",
    mark: "text-primary/40",
  },
  mint: {
    row: "bg-secondary text-foreground",
    subtle: "text-muted-foreground",
    mark: "text-primary/40",
  },
} satisfies Record<Tone, { row: string; subtle: string; mark: string }>;

/** JSTWorks 색: 녹색·주황 */
const BRAND_GREEN = "#00441E";
const BRAND_ORANGE = "#A94400";

/**
 * 어두운 배경 줄의 강조색(따옴표·선 그림 일부). 배경과 잘 대비되는 밝은 색을 고릅니다.
 * 목록에 없는 어두운 배경은 밝은 주황을 씁니다.
 */
const ACCENT_ON: Record<string, string> = {
  "#00441E": "#F2A65A",
  "#6300A9": "#FFC46B",
  "#A94400": "#FFE0B8",
  "#001D3D": "#F2A65A",
};

/** 배경색이 어두운지 (상대 휘도 기준) */
function isDark(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.4;
}

type RowTheme = {
  row: string;
  style?: CSSProperties;
  subtle: string;
  mark: string;
  markStyle?: CSSProperties;
  /** 선 그림의 강조색 */
  accent: string;
  /** 선 그림 기본 색 */
  doodle: string;
};

/** 줄 색: 사람마다 정한 배경색이 있으면 그 색, 없으면 기본 색을 번갈아 씁니다. */
function rowTheme(person: Person, index: number): RowTheme {
  const bg = person.background?.toUpperCase();
  if (!bg) {
    const tone = TONE[toneFor(index)];
    return { ...tone, accent: BRAND_ORANGE, doodle: "currentColor" };
  }
  if (isDark(bg)) {
    const accent = ACCENT_ON[bg] ?? "#F2A65A";
    return {
      row: "text-white",
      style: { backgroundColor: bg },
      subtle: "text-white/90",
      mark: "",
      markStyle: { color: accent },
      accent,
      doodle: "rgb(255 255 255 / 0.7)",
    };
  }
  return {
    row: "text-foreground",
    style: { backgroundColor: bg },
    subtle: "text-muted-foreground",
    mark: "text-primary/40",
    accent: BRAND_ORANGE,
    doodle: BRAND_GREEN,
  };
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
 * 사진은 줄 아래 끝에 붙어 있고, 스크롤하면 아래에서 살짝 올라와 자리 잡습니다.
 * 휴대폰·태블릿(1023px 이하)에서는 문구 → 이름·경력·사진 순서로 쌓고, 넓은 화면에서만 좌우로 나누며 줄 높이를 600px 로 맞춥니다.
 */
function PersonRow({ person, index }: { person: Person; index: number }) {
  const theme = rowTheme(person, index);
  const tone = theme;
  // 홀수 줄은 문구가 왼쪽, 인물이 오른쪽
  const flip = index % 2 === 1;
  const ref = useRef<HTMLLIElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["2rem", "0rem"]);

  return (
    <li
      ref={ref}
      className={cn("overflow-hidden", tone.row)}
      style={tone.style}
    >
      {/* 넓은 화면에서는 한 사람 줄의 높이를 600px 로 맞춥니다 */}
      {/* 인물 칸(이름·경력 + 사진)을 문구 칸보다 넓게 잡아 h2 크기 경력이 한 줄로 들어가게 합니다 */}
      <Container
        className={cn(
          "grid items-end gap-x-(--layout-column-gap) gap-y-8 pt-12 md:pt-14 lg:min-h-150 lg:pt-16",
          flip
            ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
            : "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
        )}
      >
        {/* 인물: 이름·경력 + 사진 */}
        <div
          className={cn(
            "flex items-end justify-between gap-6 lg:justify-center lg:gap-8",
            flip && "lg:order-2",
          )}
        >
          <div className="flex min-w-0 flex-col gap-4 self-center pb-8 md:gap-5 lg:gap-6 lg:pb-16">
            <div className="flex flex-col gap-1 md:gap-2">
              {person.unit && (
                <p className={cn("m-0 type-label", tone.subtle)}>
                  {person.unit}
                </p>
              )}
              <h2 className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[1.375rem] leading-snug font-bold tracking-[-0.01em] break-keep md:text-[1.75rem] xl:text-[2rem]">
                {person.name}
                <span className={cn("text-sm font-medium md:text-base", tone.subtle)}>
                  {person.role}
                </span>
              </h2>
            </div>
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="m-0 text-sm font-bold md:text-base">경력</h3>
              <ul className={cn("m-0 flex list-none flex-col gap-1 p-0 text-[0.9375rem] leading-snug break-keep sm:text-base md:text-xl", tone.subtle)}>
                {person.career.map((item, i) => (
                  <li key={`${item}-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {person.photo && person.cutout ? (
            // 오려 낸 고해상도 사진: 네모 칸 없이 줄 높이에 가깝게 크게, 줄 바닥에 붙입니다.
            // 뒤에는 역할에 맞춘 선 그림을 깔아 줍니다. 넓은 화면에서는 인물 양옆에 여백을 두고 그 안에만 그려
            // 이름·경력이나 문구와 겹치지 않게 합니다. 팔을 든 사진처럼 폭이 넓은 사진은 폭을 묶어 이름·경력 자리를 남깁니다.
            <motion.div
              className="relative shrink-0 xl:px-6"
              style={reduceMotion ? undefined : { y }}
            >
              {person.doodle && (
                <PersonDoodles
                  theme={person.doodle}
                  accent={theme.accent}
                  className="absolute inset-0 size-full"
                  style={{ color: theme.doodle }}
                />
              )}
              <Image
                src={person.photo}
                alt={person.alt}
                width={person.cutout.width}
                height={person.cutout.height}
                sizes="(min-width: 1280px) 360px, (min-width: 1024px) 320px, (min-width: 768px) 340px, (min-width: 640px) 300px, 52vw"
                className="relative block h-auto drop-shadow-[0_0.75rem_1.5rem_rgb(0_0_0/0.35)] max-h-72 w-auto max-w-[48vw] sm:max-h-96 md:max-h-[28rem] lg:max-h-[28rem] lg:max-w-[20rem] xl:max-h-[32rem] xl:max-w-[22rem]"
              />
            </motion.div>
          ) : (
            <motion.div
              className="relative aspect-4/5 w-36 shrink-0 sm:w-48 md:w-56 lg:w-64"
              style={reduceMotion ? undefined : { y }}
            >
              {person.photo ? (
                <Image
                  src={person.photo}
                  alt={person.alt}
                  fill
                  sizes="(min-width: 1024px) 256px, (min-width: 768px) 224px, (min-width: 640px) 192px, 144px"
                  className="object-cover object-top"
                />
              ) : (
                <Silhouette className={tone.mark} />
              )}
            </motion.div>
          )}
        </div>

        {/* 인물별 헤드라인: 여는 따옴표는 첫 줄 왼쪽, 닫는 따옴표는 마지막 줄 끝에 붙습니다. */}
        <blockquote
          className={cn(
            "order-first m-0 flex max-w-md items-start gap-3 self-center md:max-w-2xl lg:order-0 lg:justify-self-center lg:pb-16",
            flip && "lg:order-1",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 text-5xl leading-none font-bold md:text-6xl lg:text-7xl",
              tone.mark,
            )}
            style={tone.markStyle}
          >
            “
          </span>
          <p className="m-0 pt-2 text-[2.5rem] leading-[1.15] break-keep whitespace-pre-line md:text-[3.5rem] lg:text-[2.75rem] xl:text-[3rem] 2xl:text-[3.5rem]">
            <span className={dokdo.className}>{person.quote}</span>
            <span
              aria-hidden="true"
              className={cn(
                "ml-3 inline-block align-top text-5xl leading-none font-bold md:ml-4 md:text-6xl lg:text-7xl",
                tone.mark,
              )}
              style={tone.markStyle}
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
 * 구성원 줄을 정해진 순서(PEOPLE)대로 쌓습니다.
 * 줄 배경색과 좌우 배치는 순번에 따라 번갈아 바뀝니다.
 */
export function PeopleRows({ people }: { people: Person[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {people.map((person, i) => (
        <PersonRow key={person.name} person={person} index={i} />
      ))}
    </ul>
  );
}
