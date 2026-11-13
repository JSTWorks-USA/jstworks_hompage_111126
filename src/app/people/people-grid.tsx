"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Person } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * 한 사람당 400px 높이의 사진 카드.
 * 스크롤 위치에 따라 사진이 살짝 당겨지듯(1.1 → 1) 자리 잡습니다.
 * 내용은 처음부터 보이고, 움직임을 줄인 사용자에게는 효과가 없습니다.
 */
function PersonCard({ person }: { person: Person }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <li ref={ref} className="flex flex-col gap-4">
      <div className="relative h-100 overflow-hidden rounded-xl bg-muted">
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? undefined : { scale }}
        >
          <Image
            src={person.photo}
            alt={person.alt}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-[50%_20%]"
          />
        </motion.div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className={cn(
              "m-0 text-xl font-medium",
              person.placeholder && "text-muted-foreground",
            )}
          >
            {person.name}
          </h2>
          <span className="shrink-0 text-xs text-muted-foreground">{person.team}</span>
        </div>
        <p className="m-0 text-sm text-muted-foreground">{person.role}</p>
      </div>
    </li>
  );
}

export function PeopleGrid({ people }: { people: Person[] }) {
  return (
    <ul className="m-0 grid list-none gap-x-[var(--layout-column-gap)] gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-4">
      {people.map((person, i) => (
        <PersonCard key={`${person.name}-${i}`} person={person} />
      ))}
    </ul>
  );
}
