"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Container } from "@/components/site-ui";
import type { Person } from "@/content/site";
import { cn } from "@/lib/utils";
import { dokdo } from "./fonts";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type Tone = "dark" | "muted" | "mint";

/** 줄 배경: 밤하늘색 → 회색 → 민트 → 회색 순서로 반복합니다. */
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
  const tone = TONE[toneFor(index)];
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
    <li ref={ref} className={cn("overflow-hidden", tone.row)}>
      {/* 넓은 화면에서는 한 사람 줄의 높이를 600px 로 맞춥니다 */}
      <Container className="grid items-end gap-x-(--layout-column-gap) gap-y-8 pt-12 md:pt-14 lg:min-h-150 lg:grid-cols-2 lg:pt-16">
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
                <p className={cn("m-0 type-label", tone.subtle)}>{person.unit}</p>
              )}
              <h2 className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 type-title">
                {person.name}
                <span className={cn("type-label", tone.subtle)}>
                  {person.role}
                </span>
              </h2>
            </div>
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="m-0 type-label font-bold">경력</h3>
              <ul className={cn("m-0 list-none p-0 type-body", tone.subtle)}>
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
            "order-first m-0 flex max-w-md items-start gap-3 self-center md:max-w-2xl lg:order-0 lg:justify-self-center lg:pb-16",
            flip && "lg:order-1",
          )}
        >
          <span
            aria-hidden="true"
            className={cn("shrink-0 text-5xl leading-none font-bold md:text-6xl lg:text-7xl", tone.mark)}
          >
            “
          </span>
          <p className="m-0 pt-2 text-[2rem] leading-[1.15] break-keep whitespace-pre-line md:text-4xl lg:text-[2rem] xl:text-[2.625rem]">
            <span className={dokdo.className}>{person.quote}</span>
            <span
              aria-hidden="true"
              className={cn(
                "ml-3 inline-block align-top text-5xl leading-none font-bold md:ml-4 md:text-6xl lg:text-7xl",
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
