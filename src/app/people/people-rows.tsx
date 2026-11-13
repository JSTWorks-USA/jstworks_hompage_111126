"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Container } from "@/components/site-ui";
import type { Division, Person } from "@/content/site";
import { cn } from "@/lib/utils";
import { dokdo } from "./fonts";

type Tone = "dark" | "muted" | "mint";

/** 줄 배경: 밤하늘색 → 회색 → 민트 → 회색 순서로 반복합니다. */
function toneFor(index: number): Tone {
  if (index % 4 === 0) return "dark";
  return index % 2 === 1 ? "muted" : "mint";
}

const TONE = {
  dark: {
    row: "bg-night text-night-foreground",
    subtle: "text-night-foreground/70",
    mark: "text-glow",
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
 * 휴대폰에서는 문구 → 이름·경력·사진 순서로 쌓습니다.
 */
function PersonRow({ person, index }: { person: Person; index: number }) {
  const tone = TONE[toneFor(index)];
  // 홀수 줄은 문구가 왼쪽, 인물이 오른쪽
  const flip = index % 2 === 1;
  const ref = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["2rem", "0rem"]);

  return (
    <li ref={ref} className={cn("overflow-hidden", tone.row)}>
      <Container className="grid items-end gap-x-(--layout-column-gap) gap-y-8 pt-12 md:grid-cols-2 md:pt-16">
        {/* 인물: 이름·경력 + 사진 */}
        <div
          className={cn(
            "flex items-end justify-between gap-6 md:justify-center lg:gap-8",
            flip && "md:order-2",
          )}
        >
          <div className="flex min-w-0 flex-col gap-4 self-center pb-8 md:pb-16">
            <div className="flex flex-col gap-1">
              {person.unit && (
                <p className={cn("m-0 text-sm font-medium", tone.subtle)}>{person.unit}</p>
              )}
              <h3 className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl font-bold">
                {person.name}
                <span className={cn("text-sm font-medium", tone.subtle)}>
                  {person.role}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="m-0 text-sm font-bold">경력</h4>
              <ul className={cn("m-0 list-none p-0 text-sm leading-relaxed", tone.subtle)}>
                {person.career.map((item, i) => (
                  <li key={`${item}-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

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
        </div>

        {/* 인물별 헤드라인: 여는 따옴표는 첫 줄 왼쪽, 닫는 따옴표는 마지막 줄 끝에 붙습니다. */}
        <blockquote
          className={cn(
            "order-first m-0 flex max-w-md items-start md:max-w-xl gap-3 self-center md:order-0 md:justify-self-center md:gap-4 md:pb-16",
            flip && "md:order-1",
          )}
        >
          <span
            aria-hidden="true"
            className={cn("shrink-0 text-5xl leading-none font-bold", tone.mark)}
          >
            “
          </span>
          <p className="m-0 pt-2 text-[2rem] leading-[1.15] break-keep whitespace-pre-line md:text-[2.25rem] lg:text-[2.5rem]">
            <span className={dokdo.className}>{person.quote}</span>
            <span
              aria-hidden="true"
              className={cn(
                "ml-3 inline-block align-top text-5xl leading-none font-bold md:ml-4",
                tone.mark,
              )}
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
 * 조직도 순서대로 부문마다 제목을 달고 그 아래에 구성원 줄을 쌓습니다.
 * 줄 배경색과 좌우 배치는 부문을 넘어 전체 순번으로 이어서 번갈아 바뀝니다.
 */
export function PeopleRows({ divisions }: { divisions: Division[] }) {
  // 부문별 첫 사람의 전체 순번
  const starts = divisions.reduce<number[]>(
    (acc, _d, i) => [...acc, i === 0 ? 0 : acc[i - 1] + divisions[i - 1].people.length],
    [],
  );

  return (
    <div className="flex flex-col">
      {divisions.map((division, d) => {
        const headingId = `division-${d}`;
        return (
          <section key={division.name} aria-labelledby={headingId}>
            <Container className="flex items-baseline gap-3 py-10 md:py-14">
              <h2
                id={headingId}
                className="m-0 text-2xl leading-tight font-bold tracking-[-0.01em] md:text-[2rem]"
              >
                {division.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                {division.people.length}명
              </span>
            </Container>
            <ul className="m-0 list-none p-0">
              {division.people.map((person, i) => (
                <PersonRow key={person.name} person={person} index={starts[d] + i} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
