"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { TREE_PATH } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Timeline } from "@/components/ui/timeline";
import { Container, KeepTogether } from "@/components/site-ui";
import { HISTORY, VISION, type HistoryStage } from "@/content/site";
import { cn } from "@/lib/utils";

/* ─────────────── 장면 좌표 (viewBox 0 0 600 2000) ─────────────── */

const SCENE_W = 600;
const SCENE_H = 2000;
/** 한 화면에 보이는 장면 높이 */
const VIEW_H = 700;
/** 땅 높이와 뿌리 중심 (조슈아 트리 심볼의 밑동) */
const GROUND_Y = 900;
const ROOT = { x: 258, y: 905 };
const TREE_TRANSFORM = "translate(22 250)";

/** 스크롤 진행도(0~1)에서 화면 가운데에 오는 장면 y */
const centerAt = (p: number) => (SCENE_H - VIEW_H) * (1 - p) + VIEW_H / 2;

/** 결정적인 난수 (서버·클라이언트 렌더 결과를 같게 유지) */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Step =
  | {
      kind: "milestone";
      key: string;
      date: string;
      text: string;
      stage: HistoryStage;
      planned?: boolean;
    }
  | { kind: "vision"; key: "vision" };

const MILESTONES = HISTORY.flatMap((y) =>
  y.items.map((item) => ({
    kind: "milestone" as const,
    key: `${y.year}-${item.month}`,
    date: /^\d+$/.test(item.month) ? `${y.year}.${item.month}` : `${y.year} ${item.month}`,
    text: item.text,
    stage: item.stage,
    planned: item.planned,
  })),
);

const STEPS: Step[] = [...MILESTONES, { kind: "vision", key: "vision" }];

/** 단계별 시작 진행도: 뿌리 0~0.44, 매출 0.46, 줄기 0.58~0.84, 비전 0.84~ */
const STARTS: number[] = (() => {
  const roots = MILESTONES.filter((m) => m.stage === "root").length;
  const trunks = MILESTONES.filter((m) => m.stage === "trunk").length;
  let r = 0;
  let t = 0;
  return STEPS.map((step) => {
    if (step.kind === "vision") return 0.84;
    if (step.stage === "root") return (0.44 / roots) * r++;
    if (step.stage === "revenue") return 0.46;
    return 0.58 + (0.26 / Math.max(trunks, 1)) * t++;
  });
})();

const windowMid = (i: number) => (STARTS[i] + (STARTS[i + 1] ?? 1)) / 2;
const stepAt = (p: number) => {
  let index = 0;
  STARTS.forEach((start, i) => {
    if (p >= start) index = i;
  });
  return index;
};

/** 뿌리 끝(자산이 모이는 곳): 단계가 화면 가운데에 올 때 보이도록 배치 */
const ROOT_TIPS = STEPS.map((step, i) => {
  if (step.kind !== "milestone" || step.stage !== "root") return null;
  const left = i % 2 === 0;
  const spread = 120 - i * 6;
  return {
    i,
    x: left ? ROOT.x - spread : ROOT.x + spread + 40,
    y: Math.min(centerAt(windowMid(i)), SCENE_H - 120),
  };
}).filter((tip): tip is { i: number; x: number; y: number } => tip !== null);

const rootPath = (tip: { x: number; y: number }) =>
  `M ${tip.x} ${tip.y} C ${tip.x} ${tip.y - (tip.y - ROOT.y) * 0.45}, ${
    ROOT.x + (tip.x - ROOT.x) * 0.35
  } ${ROOT.y + 70}, ${ROOT.x} ${ROOT.y}`;

/** 장식용 잔뿌리 */
const FINE_ROOTS = [
  `M ${ROOT.x} ${ROOT.y} C 250 1200, 272 1600, 262 2000`,
  `M ${ROOT.x} ${ROOT.y} C 180 960, 60 1000, -20 1060`,
  `M ${ROOT.x} ${ROOT.y} C 360 950, 520 990, 620 1040`,
  "M 262 1450 C 200 1620, 120 1800, 50 2000",
  "M 262 1450 C 330 1640, 450 1820, 560 2000",
  "M 255 1200 C 180 1260, 90 1330, -10 1360",
  "M 266 1250 C 360 1300, 470 1370, 610 1400",
];

/** 줄기와 가지 (빛이 타고 오르는 길) */
const TRUNK_PATH = `M ${ROOT.x} ${ROOT.y - 5} C 268 860, 297 830, 297 780 L 297 560`;
const BRANCH_PATHS = [
  "M 297 560 C 250 540, 150 520, 60 470",
  "M 297 560 C 270 480, 200 420, 150 360",
  "M 297 560 C 297 470, 300 380, 300 270",
  "M 297 560 C 330 480, 400 420, 450 360",
  "M 297 560 C 350 540, 450 520, 545 470",
];

/** 가지 끝 라벨 위치 (장면 대비 %) — 좁은 화면에서도 보이도록 가운데 쪽에 둡니다 */
const BRANCH_LABELS = [
  { left: 32, top: 21.5 },
  { left: 36, top: 16.5 },
  { left: 50, top: 11.25 },
  { left: 64, top: 16.5 },
  { left: 68, top: 21.5 },
];

const rand = seeded(7);
const STARS = Array.from({ length: 70 }, () => ({
  x: rand() * SCENE_W,
  y: 20 + rand() * (GROUND_Y - 260),
  r: 0.8 + rand() * 1.6,
  delay: rand() * 3,
}));
const PEBBLES = Array.from({ length: 60 }, () => ({
  x: rand() * SCENE_W,
  y: GROUND_Y + 40 + rand() * (SCENE_H - GROUND_Y - 60),
  r: 1 + rand() * 2.5,
}));

/* ─────────────── 장면 조각 ─────────────── */

function RootStrand({
  progress,
  start,
  tip,
  path,
  id,
}: {
  progress: MotionValue<number>;
  start: number;
  tip: { x: number; y: number };
  path: string;
  id: string;
}) {
  const flow = useTransform(progress, [start, start + 0.07], [0, 1]);
  const node = useTransform(progress, [start - 0.03, start + 0.01], [0.2, 1]);
  const particles = useTransform(progress, [start + 0.02, start + 0.05], [0, 1]);

  return (
    <g>
      <path id={id} d={path} fill="none" stroke="var(--mint-line)" strokeOpacity={0.22} strokeWidth={3} />
      <motion.path
        d={path}
        fill="none"
        stroke="var(--glow)"
        strokeOpacity={0.18}
        strokeWidth={12}
        strokeLinecap="round"
        style={{ pathLength: flow }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="var(--glow)"
        strokeWidth={3}
        strokeLinecap="round"
        style={{ pathLength: flow }}
      />
      {/* 뿌리를 따라 중심으로 흘러가는 양분 */}
      <motion.g style={{ opacity: particles }}>
        {[0, 0.8, 1.6].map((begin) => (
          <circle key={begin} r={3.5} fill="var(--glow)">
            <animateMotion dur="2.4s" begin={`${begin}s`} repeatCount="indefinite">
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>
        ))}
      </motion.g>
      <motion.circle cx={tip.x} cy={tip.y} r={9} fill="var(--glow)" style={{ opacity: node }} />
      <motion.circle
        cx={tip.x}
        cy={tip.y}
        r={18}
        fill="none"
        stroke="var(--glow)"
        strokeOpacity={0.4}
        style={{ opacity: node }}
      />
    </g>
  );
}

function GlowPath({
  progress,
  range,
  d,
  width = 4,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  d: string;
  width?: number;
}) {
  const length = useTransform(progress, range, [0, 1]);
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke="var(--glow)"
        strokeOpacity={0.2}
        strokeWidth={width * 3.5}
        strokeLinecap="round"
        style={{ pathLength: length }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="var(--glow)"
        strokeWidth={width}
        strokeLinecap="round"
        style={{ pathLength: length }}
      />
    </>
  );
}

function BranchLabel({
  progress,
  index,
  label,
}: {
  progress: MotionValue<number>;
  index: number;
  label: string;
}) {
  const start = 0.88 + index * 0.02;
  const opacity = useTransform(progress, [start, start + 0.04], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.04], [0.93, 1]);
  const pos = BRANCH_LABELS[index];
  return (
    <motion.span
      style={{ opacity, scale, left: `${pos.left}%`, top: `${pos.top}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-glow/40 bg-night/80 px-3 py-1.5 text-sm whitespace-nowrap text-night-foreground"
    >
      {label}
    </motion.span>
  );
}

function Scene({
  progress,
  camera,
}: {
  progress: MotionValue<number>;
  camera: MotionValue<string>;
}) {
  const revenue = useTransform(progress, [0.44, 0.48], [0, 1]);
  const treeLight = useTransform(progress, [0.84, 1], [0, 1]);

  return (
    <motion.div
      style={{ y: camera }}
      className="absolute top-0 left-1/2 aspect-[600/2000] h-[285.714%] -translate-x-1/2"
    >
      <svg
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <linearGradient id="history-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--night)" />
            <stop offset="1" stopColor="var(--horizon)" />
          </linearGradient>
          <linearGradient id="history-soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--soil)" />
            <stop offset="1" stopColor="var(--soil-deep)" />
          </linearGradient>
        </defs>

        <rect x={-600} y={0} width={1800} height={GROUND_Y} fill="url(#history-sky)" />
        <rect x={-600} y={GROUND_Y} width={1800} height={SCENE_H - GROUND_Y} fill="url(#history-soil)" />

        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="var(--night-foreground)"
            className="star-twinkle"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
        {PEBBLES.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="var(--mint-line)" fillOpacity={0.06} />
        ))}

        {/* 땅 */}
        <path
          d={`M -600 ${GROUND_Y} C 0 ${GROUND_Y - 14}, 300 ${GROUND_Y + 10}, 1200 ${GROUND_Y - 6}`}
          fill="none"
          stroke="var(--mint-line)"
          strokeOpacity={0.3}
          strokeWidth={2}
        />

        {FINE_ROOTS.map((d) => (
          <path key={d} d={d} fill="none" stroke="var(--mint-line)" strokeOpacity={0.12} strokeWidth={2} />
        ))}

        {ROOT_TIPS.map((tip) => (
          <RootStrand
            key={tip.i}
            id={`history-root-${tip.i}`}
            progress={progress}
            start={STARTS[tip.i]}
            tip={tip}
            path={rootPath(tip)}
          />
        ))}

        {/* 조슈아 트리 */}
        <path
          d={TREE_PATH}
          transform={TREE_TRANSFORM}
          fill="var(--tree)"
          fillRule="evenodd"
          stroke="var(--mint-line)"
          strokeOpacity={0.25}
          strokeWidth={1.5}
        />
        <motion.path
          d={TREE_PATH}
          transform={TREE_TRANSFORM}
          fill="none"
          stroke="var(--glow)"
          strokeWidth={2}
          style={{ pathLength: treeLight, opacity: treeLight }}
        />

        <GlowPath progress={progress} range={[0.5, 0.84]} d={TRUNK_PATH} width={5} />
        {BRANCH_PATHS.map((d, i) => (
          <GlowPath key={d} progress={progress} range={[0.84 + i * 0.015, 0.94 + i * 0.01]} d={d} width={3} />
        ))}

        {/* 매출이 시작되는 뿌리 중심 */}
        <motion.g style={{ opacity: revenue }}>
          <circle cx={ROOT.x} cy={ROOT.y} r={14} fill="var(--glow)" />
          <circle
            cx={ROOT.x}
            cy={ROOT.y}
            r={14}
            fill="none"
            stroke="var(--glow)"
            strokeWidth={2}
            className="root-pulse"
          />
        </motion.g>
      </svg>

      {VISION.branches.map((label, i) => (
        <BranchLabel key={label} progress={progress} index={i} label={label} />
      ))}
    </motion.div>
  );
}

function StepPanel({ step }: { step: Step }) {
  if (step.kind === "vision") {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-2xl leading-snug font-medium md:text-[1.75rem]">
          <KeepTogether text={VISION.title} />
        </p>
        <p className="m-0 text-base leading-relaxed text-mint-line">
          <KeepTogether text={VISION.description} />
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-3xl leading-none font-bold tabular-nums md:text-4xl">{step.date}</p>
      <p className="m-0 text-lg leading-snug">
        <KeepTogether text={step.text} />
      </p>
      {(step.stage === "revenue" || step.planned) && (
        <div className="flex flex-wrap gap-2">
          {step.stage === "revenue" && <Badge size="lg">매출의 시작</Badge>}
          {step.planned && (
            <Badge size="lg" variant="inverse">
              예정
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────── 움직임을 줄인 경우: 정적 연혁 ─────────────── */

function StaticHistory() {
  return (
    <div className="bg-secondary">
      <Container className="grid gap-[var(--layout-section-gap)] py-16 md:py-24 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <SectionHeader title="History" description="연혁" />
        <div className="flex flex-col gap-12">
          <ol className="m-0 flex list-none flex-col gap-12 p-0">
            {HISTORY.map((year) => (
              <li key={year.year} className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)]">
                <h3
                  className={cn(
                    "m-0 text-xl leading-7 font-bold tabular-nums",
                    year.future ? "text-muted-foreground" : "text-primary",
                  )}
                >
                  {year.year}
                </h3>
                <Timeline
                  className="max-w-[40rem]"
                  items={year.items.map((item) => ({
                    title: item.text,
                    timestamp: /^\d+$/.test(item.month) ? `${Number(item.month)}월` : item.month,
                    description: item.planned ? "예정" : undefined,
                  }))}
                />
              </li>
            ))}
          </ol>
          <div className="flex max-w-[40rem] flex-col gap-2">
            <h3 className="m-0 text-xl font-medium">{VISION.title}</h3>
            <p className="m-0 text-muted-foreground">
              <KeepTogether text={VISION.description} />
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ─────────────── 연혁 섹션 ─────────────── */

/**
 * 스크롤하면 카메라가 땅속 뿌리에서 줄기, 가지 끝으로 서서히 올라갑니다.
 * 뿌리 끝에서 모은 자산(특허·상표·법인·영업권)이 뿌리 중심으로 흘러들고,
 * 매출이 시작되는 시점이 뿌리 중심, 비전은 가지 끝에 놓입니다.
 */
export function HistoryRoots() {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.6 });
  const camera = useTransform(smooth, [0, 1], ["-65%", "0%"]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = stepAt(p);
    setActive((current) => (current === next ? current : next));
  });

  return (
    <section aria-labelledby="history-title" className="relative">
      {/* 화면 낭독기용 전체 연혁 */}
      <ol className="sr-only">
        {MILESTONES.map((m) => (
          <li key={m.key}>
            {m.date} {m.text}
            {m.stage === "revenue" ? " (매출의 시작)" : ""}
            {m.planned ? " (예정)" : ""}
          </li>
        ))}
        <li>
          {VISION.title}. {VISION.description}
        </li>
      </ol>

      {reduceMotion ? (
        <>
          <h2 id="history-title" className="sr-only">
            연혁
          </h2>
          <StaticHistory />
        </>
      ) : (
        <div ref={trackRef} className="relative h-[500vh] bg-soil-deep">
          <div className="sticky top-0 h-svh overflow-hidden text-night-foreground md:top-18 md:h-[calc(100svh-4.5rem)]">
            <div aria-hidden="true">
              <Scene progress={smooth} camera={camera} />
            </div>

            <Container className="pointer-events-none relative flex h-full flex-col justify-between py-8 md:py-12">
              <div className="flex flex-col gap-1">
                <h2 id="history-title" className="m-0 text-2xl font-semibold tracking-tight">
                  History
                </h2>
                <p className="m-0 text-sm text-mint-line">연혁</p>
              </div>

              <div
                aria-hidden="true"
                className="w-full rounded-xl border border-glow/20 bg-night/75 p-6 backdrop-blur-md md:mb-[18vh] md:w-88"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={STEPS[active].key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <StepPanel step={STEPS[active]} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </Container>
          </div>
        </div>
      )}
    </section>
  );
}
