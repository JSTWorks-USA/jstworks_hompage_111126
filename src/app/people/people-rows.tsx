"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Container } from "@/components/site-ui";
import type { Person } from "@/content/site";
import { cn } from "@/lib/utils";

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
            <h2
              className={cn(
                "m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl font-bold",
                person.placeholder && tone.subtle,
              )}
            >
              {person.name}
              <span className={cn("text-sm font-medium", tone.subtle)}>
                {person.role}
              </span>
            </h2>
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-sm font-bold">경력</h3>
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
            <Image
              src={person.photo}
              alt={person.alt}
              fill
              sizes="(min-width: 1024px) 256px, (min-width: 768px) 224px, (min-width: 640px) 192px, 144px"
              className="object-cover object-top"
            />
          </motion.div>
        </div>

        {/* 한 줄 문구 */}
        <blockquote
          className={cn(
            "order-first m-0 flex max-w-md flex-col self-center md:order-0 md:justify-self-center md:pb-16",
            flip && "md:order-1",
          )}
        >
          <span aria-hidden="true" className={cn("text-5xl leading-none font-bold", tone.mark)}>
            “
          </span>
          <p className="m-0 -mt-2 text-2xl leading-snug font-bold tracking-[-0.01em] md:text-[1.75rem]">
            {person.quote}
          </p>
          <span
            aria-hidden="true"
            className={cn("self-end text-5xl leading-none font-bold", tone.mark)}
          >
            ”
          </span>
        </blockquote>
      </Container>
    </li>
  );
}

export function PeopleRows({ people }: { people: Person[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {people.map((person, i) => (
        <PersonRow key={`${person.name}-${i}`} person={person} index={i} />
      ))}
    </ul>
  );
}
