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
import { useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { TREE_PATH } from "@/components/logo";
import { SectionHeader } from "@/components/ui/section-header";
import { Timeline } from "@/components/ui/timeline";
import { Container, KeepTogether } from "@/components/site-ui";
import { HISTORY, HISTORY_LANES, VISION, type HistoryLane } from "@/content/site";
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

/** 결정적인 난수 (서버·클라이언트 렌더 결과를 같게 유지) */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─────────────── 단계와 스크롤 진행도 ───────────────
 * 연혁 하나하나가 뿌리 끝에서 모은 양분입니다. 양분이 뿌리 중심에 모이면 줄기를 타고 땅 위로 올라가고,
 * 가지 끝에서 비전(K-IP 커머스 플랫폼)이 열립니다. */

const LANE = Object.fromEntries(HISTORY_LANES.map((lane) => [lane.id, lane])) as Record<
  HistoryLane,
  (typeof HISTORY_LANES)[number]
>;

/** "2026.08.26" → { label: "2026년 8월", iso: "2026-08" }. 일은 보여 주지 않습니다 */
function yearMonth(date: string) {
  const [year, month] = date.split(".");
  return { label: `${year}년 ${Number(month)}월`, iso: `${year}-${month}` };
}

type Milestone = {
  kind: "milestone";
  key: string;
  when: { label: string; iso: string };
  text: string;
  note?: string;
  sub?: string;
  lane: HistoryLane;
};
type Step = Milestone | { kind: "vision"; key: "vision" };

const MILESTONES: Milestone[] = HISTORY.map((item, i) => ({
  kind: "milestone",
  // 같은 날짜의 연혁이 여럿일 수 있어 순번을 붙입니다 (앞 10자는 날짜 그대로)
  key: `${item.date}-${i}`,
  when: yearMonth(item.date),
  text: item.text,
  note: item.note,
  sub: item.sub,
  lane: item.lane,
}));

/** 한 줄로 이어 쓴 연혁 (화면 낭독기·정적 연혁용) */
const fullText = (m: Milestone) =>
  [m.text, m.note].filter(Boolean).join(" ") + (m.sub ? ` / ${m.sub}` : "");

const STEPS: Step[] = [...MILESTONES, { kind: "vision", key: "vision" }];

/** 연혁(뿌리)이 모두 지나가는 진행도. 연혁마다 같은 몫(ROOT_STEP)을 나눠 가집니다 */
const ROOT_END = 0.5;
const ROOT_STEP = ROOT_END / MILESTONES.length;
/** 양분이 뿌리 중심에 모이는 때 */
const GATHER: [number, number] = [ROOT_END - 0.02, ROOT_END + 0.02];
/** 모인 양분이 줄기를 타고 오르는 구간 */
const TRUNK: [number, number] = [ROOT_END + 0.02, 0.7];
/** 가지 끝 비전이 열리는 때 */
const VISION_START = 0.7;
/** 나무 전체(가지 끝 ~ 지평선)가 한 화면에 들어오는 때 */
const TREE_FRAME = 0.76;
/** 이 때부터 끝까지: 화면이 줌아웃되며 가지 이름표가 카탈로그처럼 양옆으로 퍼집니다 */
const SPREAD_START = 0.82;

/** 단계별 시작 진행도 */
const STARTS: number[] = STEPS.map((step, i) =>
  step.kind === "vision" ? VISION_START : i * ROOT_STEP,
);

const stepAt = (p: number) => {
  let index = 0;
  STARTS.forEach((start, i) => {
    if (p >= start) index = i;
  });
  return index;
};

/** 카메라: 진행도별로 화면 가운데에 오는 장면 y. 땅속 깊은 곳 → 뿌리 위쪽 → 줄기 → 가지 끝 */
const CAMERA_P = [0, ROOT_END, VISION_START, TREE_FRAME, SPREAD_START, 1];
/**
 * 카메라 배율. 비전(K-IP 커머스 플랫폼)이 나온 뒤에는 나무 전체를 담으려고 0.82 로 물러났다가,
 * 카탈로그가 퍼질 때 0.68 까지 줌아웃합니다.
 */
const CAMERA_SCALE = [1, 1, 1, 0.82, 0.82, 0.68];
/** 지평선(땅 선)이 화면 맨 아래에 오도록 하는 화면 가운데 y: 땅속은 보이지 않습니다 */
const horizonAtBottom = (scale: number) => GROUND_Y - 4 - VIEW_H / 2 / scale;
const CAMERA_Y = [
  1650,
  1060,
  520,
  horizonAtBottom(CAMERA_SCALE[3]),
  horizonAtBottom(CAMERA_SCALE[4]),
  horizonAtBottom(CAMERA_SCALE[5]),
];
/** 장면 y 가 화면 가운데에 오도록 장면 상자를 옮기는 양(상자 높이 대비 %) */
const cameraShift = (centerY: number) => `${(-(centerY - VIEW_H / 2) / SCENE_H) * 100}%`;
/** 뿌리 구간에서 진행도 p 일 때 화면 가운데에 오는 장면 y */
const rootCenterAt = (p: number) => CAMERA_Y[0] + (CAMERA_Y[1] - CAMERA_Y[0]) * (p / ROOT_END);

/* ─────────────── 땅속 네 갈래 선 ───────────────
 * 갈래(K-GANADA™, Gentle Vox, 요리엔, A-Global)마다 색이 다른 선이 하나씩 있습니다.
 * 깊은 곳에서는 넓게 벌어져 있다가, 위로 올라오며 뿌리 중심(ROOT)에서 하나로 모입니다.
 * 연혁은 자기 갈래 선 위에 놓입니다. */

/** 갈래 선. 왼쪽부터 조슈아트리웍스, K-GANADA™, 젠틀복스, 타사 제품 */
const LINE_LANES = HISTORY_LANES.map((lane) => lane.id);

/** 장면 맨 아래(가장 깊은 곳)에서 갈래 선의 가로 위치. 좁은 화면에서도 보이도록 약 140~460 안에 둡니다 */
const LANE_BOTTOM_X: Record<HistoryLane, number> = {
  company: 150,
  kganada: 222,
  gentlevox: 335,
  partner: 425,
};

/** 갈래 선 색 */
const laneColor = (lane: HistoryLane) => `var(--lane-${lane})`;
/** 왼쪽 두 갈래는 선 왼쪽에, 오른쪽 두 갈래는 선 오른쪽에 연혁 카드를 띄웁니다 */
const isLeftLane = (lane: HistoryLane) => LANE[lane].side === "left";

/** 깊이 y 에서 갈래 선의 가로 위치: 뿌리 중심에서 하나였다가 깊을수록 벌어집니다 */
function laneX(lane: HistoryLane, y: number) {
  const t = Math.min(Math.max((y - ROOT.y) / (SCENE_H - ROOT.y), 0), 1);
  const spread = 1 - Math.pow(1 - t, 2.2);
  return ROOT.x + (LANE_BOTTOM_X[lane] - ROOT.x) * spread;
}

/** 깊이 fromY 에서 뿌리 중심까지 갈래 선을 따라 올라가는 경로 (아래 → 위) */
function lanePath(lane: HistoryLane, fromY: number = SCENE_H) {
  const steps = 48;
  return Array.from({ length: steps + 1 }, (_, k) => {
    const y = fromY + (ROOT.y - fromY) * (k / steps);
    return `${k ? "L" : "M"} ${laneX(lane, y).toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

/** 갈래 선 전체 (장면 맨 아래 → 뿌리 중심) */
const LANE_LINES = LINE_LANES.map((lane) => ({ lane, d: lanePath(lane) }));

type LineSpotData = { i: number; lane: HistoryLane; x: number; y: number; path: string };

/** 갈래 선 위 연혁 자리: 그 연혁이 나올 때 화면 가운데에 오는 깊이에 둡니다 */
const SPOTS: LineSpotData[] = MILESTONES.map((m, i) => {
  const y = rootCenterAt((i + 0.5) * ROOT_STEP);
  return { i, lane: m.lane, x: laneX(m.lane, y), y, path: lanePath(m.lane, y) };
});

/** 줄기와 가지 (빛이 타고 오르는 길) */
const TRUNK_PATH = `M ${ROOT.x} ${ROOT.y - 5} C 268 860, 297 830, 297 780 L 297 560`;
/**
 * 가지 빛줄기. 줄기 꼭대기(297,560)에서 올라와 꼭짓점(297,530)에서 만난 뒤,
 * 잎마다 잎자루를 따라 잎이 붙은 곳(잎 밑동)까지 가고, 이어서 잎 가운데 잎맥을 따라 잎 끝 가까이까지 퍼집니다.
 * 잎 밑동·끝은 조슈아 트리 심볼(TREE_PATH, +22 +250 이동)에서 잰 값입니다.
 * 왼쪽부터: 가로 가지 왼쪽 끝, 왼쪽 아래 잎, 왼쪽 위 잎, 가운데 잎, 오른쪽 위 잎, 오른쪽 아래 잎, 가로 가지 오른쪽 끝.
 */
const BRANCH_PATHS = [
  "M 297 562 C 240 558, 190 566, 168 595 C 160 606, 154 616, 151 626",
  "M 297 560 L 297 530 Q 262 528, 241 508 Q 140 468, 34 453",
  "M 297 560 L 297 530 Q 285 510, 278 486 L 128 334",
  "M 297 560 L 297 476 L 300 266",
  "M 297 560 L 297 530 Q 309 510, 320 486 L 471 335",
  "M 297 560 L 297 530 Q 332 528, 358 508 Q 460 468, 562 453",
  "M 297 562 C 354 558, 404 566, 426 595 C 434 606, 446 618, 451 628",
];

/**
 * 가지 이름표 위치 (장면 대비 %, VISION.branches 순서). 좁은 화면에서도 보이도록 가운데 쪽에 둡니다.
 * 이름표가 여섯 개라 가운데 잎은 비우고 왼쪽 셋(가로 가지 끝, 아래 잎, 위 잎), 오른쪽 셋을 대칭으로 둡니다.
 */
const BRANCH_LABELS = [
  { left: 30, top: 26.8 },
  { left: 32, top: 21.5 },
  { left: 36, top: 16.5 },
  { left: 64, top: 16.5 },
  { left: 68, top: 21.5 },
  { left: 70, top: 26.8 },
];

/* ─────────────── 별 ───────────────
 * 장면 폭은 600이지만 넓은 화면에서는 좌우로 더 보이므로(배경은 -600 ~ 1200),
 * 별은 -350 ~ 950 에 흩뿌립니다. 위로 갈수록 촘촘하게 둡니다.
 * 별마다 애니메이션을 걸면 무거워서, 같은 박자로 반짝이는 묶음(그룹) 단위로 반짝입니다. */

const rand = seeded(7);
const SKY_X = { min: -1400, max: 2000 };
const skyX = () => SKY_X.min + rand() * (SKY_X.max - SKY_X.min);
/** 하늘 위쪽이 더 촘촘하도록 0~1 값을 위로 몰아 줍니다 */
const skyY = () => 8 + Math.pow(rand(), 1.6) * (GROUND_Y - 60);

type Dot = { x: number; y: number; r: number; o: number };
/** 반짝임 박자(초)와 시작 어긋남(초). 서로 다른 박자의 묶음이 겹쳐 무작위로 반짝이는 것처럼 보입니다 */
const TWINKLE = [
  { dur: 3.1, delay: -0.4 },
  { dur: 4.3, delay: -2.1 },
  { dur: 5.7, delay: -1.2 },
  { dur: 3.7, delay: -3.3 },
  { dur: 6.4, delay: -0.9 },
  { dur: 4.9, delay: -4.0 },
];

function groupsOf(count: number, groups: number, make: () => Dot): Dot[][] {
  const out: Dot[][] = Array.from({ length: groups }, () => []);
  for (let i = 0; i < count; i++) out[i % groups].push(make());
  return out;
}

/** 아주 작은 별가루 */
const STAR_DUST = groupsOf(420, 6, () => ({
  x: skyX(), y: skyY(), r: 0.35 + rand() * 0.55, o: 0.35 + rand() * 0.45,
}));
/** 또렷한 별 */
const STARS = groupsOf(160, 6, () => ({
  x: skyX(), y: skyY(), r: 0.9 + rand() * 1.1, o: 0.7 + rand() * 0.3,
}));
/** 십자 빛과 번짐이 있는 밝은 별(하나씩 따로 반짝임) */
const BRIGHT_STARS = Array.from({ length: 34 }, () => ({
  x: skyX(),
  y: 12 + Math.pow(rand(), 1.3) * (GROUND_Y - 220),
  r: 1.5 + rand() * 1.1,
  dur: 2.6 + rand() * 2.4,
  delay: -rand() * 4,
}));
/** 별똥별: 시작 위치(하늘 위쪽, 왼쪽 아래로 떨어짐)와 주기·시작 지연(초) */
const SHOOTING_STARS = [
  { x: 560, y: 60, dur: 9, delay: 2.5 },
  { x: 260, y: 150, dur: 11, delay: 6 },
  { x: 900, y: 30, dur: 13, delay: 9.5 },
  { x: 60, y: 90, dur: 15, delay: 4 },
];
/** 땅속에서 반짝이는 양분 알갱이(별의 기운이 흙까지 이어지는 느낌) */
const SOIL_MOTES = groupsOf(150, 6, () => ({
  x: skyX(),
  y: GROUND_Y + 30 + rand() * (SCENE_H - GROUND_Y - 40),
  r: 0.6 + rand() * 1.4,
  o: 0.4 + rand() * 0.45,
}));
const PEBBLES = Array.from({ length: 60 }, () => ({
  x: rand() * SCENE_W,
  y: GROUND_Y + 40 + rand() * (SCENE_H - GROUND_Y - 60),
  r: 1 + rand() * 2.5,
}));

/** 묶음별 반짝임 박자를 CSS 변수로 넘깁니다 */
const twinkleStyle = (i: number, slow = 1) =>
  ({
    "--twinkle-dur": `${TWINKLE[i % TWINKLE.length].dur * slow}s`,
    "--twinkle-delay": `${TWINKLE[i % TWINKLE.length].delay}s`,
  }) as CSSProperties;

/* ─────────────── 장면 조각 ─────────────── */

/** 진행도에 따라 연혁 자리가 켜지는 정도: 선(양분 흐름), 점, 양분 알갱이 */
function useSpotTiming(progress: MotionValue<number>, start: number) {
  // 아직 오지 않은 연혁 자리도 옅게(0.2) 보여, 앞으로 모일 양분이 있다는 것을 알 수 있게 합니다.
  return {
    flow: useTransform(progress, [start, start + ROOT_STEP * 1.3], [0, 1]),
    node: useTransform(progress, [start - ROOT_STEP * 0.6, start + ROOT_STEP * 0.2], [0.2, 1]),
    particles: useTransform(progress, [start + ROOT_STEP * 0.4, start + ROOT_STEP], [0, 1]),
  };
}

/** 양분 알갱이: 경로(id)를 따라 되풀이해 흘러갑니다 */
function Particles({
  opacity,
  pathId,
  color,
  begins,
}: {
  opacity: MotionValue<number>;
  pathId: string;
  color: string;
  begins: number[];
}) {
  return (
    <motion.g style={{ opacity }}>
      {begins.map((begin) => (
        <circle key={begin} r={3.5} fill={color}>
          <animateMotion dur="2.4s" begin={`${begin}s`} repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}
    </motion.g>
  );
}

function SpotNode({ x, y, color, opacity }: { x: number; y: number; color: string; opacity: MotionValue<number> }) {
  return (
    <>
      <motion.circle cx={x} cy={y} r={9} fill={color} style={{ opacity }} />
      <motion.circle
        cx={x}
        cy={y}
        r={18}
        fill="none"
        stroke={color}
        strokeOpacity={0.45}
        style={{ opacity }}
      />
    </>
  );
}

/** 갈래 선 위의 연혁: 그 자리에서 뿌리 중심까지 선이 빛나고, 양분이 위로 흘러갑니다 */
function LineSpot({ progress, spot }: { progress: MotionValue<number>; spot: LineSpotData }) {
  const { flow, node, particles } = useSpotTiming(progress, STARTS[spot.i]);
  const color = laneColor(spot.lane);
  const id = `history-spot-${spot.i}`;
  return (
    <g>
      <path id={id} d={spot.path} fill="none" stroke="none" />
      <motion.path
        d={spot.path}
        fill="none"
        stroke={color}
        strokeOpacity={0.22}
        strokeWidth={12}
        strokeLinecap="round"
        style={{ pathLength: flow }}
      />
      <motion.path
        d={spot.path}
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        style={{ pathLength: flow }}
      />
      <Particles opacity={particles} pathId={id} color={color} begins={[0, 0.8, 1.6]} />
      <SpotNode x={spot.x} y={spot.y} color={color} opacity={node} />
    </g>
  );
}

/** 갈래 표시: 그 갈래 선과 같은 색 점 */
function LaneMark({ lane }: { lane: HistoryLane }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ background: laneColor(lane) }}
    />
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

/**
 * 카탈로그: 줌아웃이 끝났을 때 가지 이름표가 놓이는 자리 (장면 대비 %, VISION.branches 순서).
 * 나무 왼쪽에 셋, 오른쪽에 셋. 좁은 화면은 화면 안에 들어오도록 나무 쪽으로 붙입니다.
 */
const CATALOG_WIDE = [
  { left: -15, top: 22.5 },
  { left: -11.7, top: 15 },
  { left: 1.7, top: 7.5 },
  { left: 98.3, top: 7.5 },
  { left: 111.7, top: 15 },
  { left: 115, top: 22.5 },
];
const CATALOG_NARROW = [
  { left: 27.5, top: 25 },
  { left: 27.5, top: 17 },
  { left: 27.5, top: 9 },
  { left: 72.5, top: 9 },
  { left: 72.5, top: 17 },
  { left: 72.5, top: 25 },
];

const NARROW_QUERY = "(max-width: 767px)";
function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
/** 좁은 화면(휴대폰)인지. 서버에서는 넓은 화면으로 봅니다 */
function useNarrow() {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}

/**
 * 가지 이름표: 나무 전체가 보일 때 가지 위에 나타났다가, 줌아웃과 함께 카탈로그 자리로 퍼집니다.
 * 장면이 줄어들어도 글자 크기는 그대로 두려고 카메라 배율의 역수로 키웁니다.
 */
function BranchLabel({
  progress,
  zoom,
  narrow,
  index,
  label,
}: {
  progress: MotionValue<number>;
  zoom: MotionValue<number>;
  narrow: boolean;
  index: number;
  label: string;
}) {
  const start = TREE_FRAME - 0.03 + index * 0.012;
  const opacity = useTransform(progress, [start, start + 0.03], [0, 1]);
  // 처음 나타날 때부터 나무(로고) 바깥 카탈로그 자리에 둡니다. 가지 쪽에서 살짝 밀려 나오며 나타납니다.
  const to = (narrow ? CATALOG_NARROW : CATALOG_WIDE)[index];
  const branch = BRANCH_LABELS[index];
  const near = (a: number, b: number) => a + (b - a) * 0.8;
  const left = useTransform(progress, [start, start + 0.04], [`${near(branch.left, to.left)}%`, `${to.left}%`]);
  const top = useTransform(progress, [start, start + 0.04], [`${near(branch.top, to.top)}%`, `${to.top}%`]);
  const scale = useTransform(zoom, (z) => 1 / z);
  return (
    <motion.span
      style={{ opacity, scale, left, top }}
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-glow/40 bg-night/85 px-4 py-2 text-sm whitespace-nowrap text-night-foreground md:text-base"
    >
      {label}
    </motion.span>
  );
}

/**
 * 넓은 화면: 지금 연혁 카드를 그 갈래 선 위 자리 바로 옆에 띄웁니다(테두리는 갈래 색).
 * 장면 안에 두어 카메라와 함께 움직이므로 점에 붙어 있습니다. 좁은 화면은 아래 카드로 보여 줍니다.
 */
function SpotCard({ step }: { step: Step }) {
  const spot = step.kind === "milestone" ? SPOTS.find((s) => MILESTONES[s.i] === step) : undefined;
  return (
    <AnimatePresence initial={false}>
      {spot && step.kind === "milestone" && (
        <motion.div
          key={step.key}
          initial={{ opacity: 0, x: isLeftLane(spot.lane) ? 8 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
          className={cn(
            "absolute hidden w-[21rem] -translate-y-1/2 rounded-xl border-2 bg-night/85 p-6 backdrop-blur-md lg:block",
            isLeftLane(spot.lane) ? "mr-10" : "ml-10",
          )}
          style={{
            borderColor: laneColor(spot.lane),
            top: `${(spot.y / SCENE_H) * 100}%`,
            ...(isLeftLane(spot.lane)
              ? { right: `${100 - (spot.x / SCENE_W) * 100}%` }
              : { left: `${(spot.x / SCENE_W) * 100}%` }),
          }}
        >
          <StepPanel step={step} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Scene({
  progress,
  camera,
  zoom,
  focusY,
  step,
}: {
  progress: MotionValue<number>;
  camera: MotionValue<string>;
  /** 카메라 배율 */
  zoom: MotionValue<number>;
  /** 화면 가운데에 오는 장면 y (줌의 기준점, 0~1) */
  focusY: MotionValue<number>;
  step: Step;
}) {
  const narrow = useNarrow();
  const gathered = useTransform(progress, GATHER, [0, 1]);
  // 네 갈래 선은 늘 옅게 보이다가, 양분이 뿌리 중심에 모일 때 한꺼번에 밝아집니다.
  const lanesLit = useTransform(progress, [GATHER[0] - 0.02, GATHER[1]], [0.35, 0.85]);
  const treeLight = useTransform(progress, [VISION_START, TREE_FRAME + 0.04], [0, 1]);

  return (
    <motion.div
      style={{ y: camera, scale: zoom, originY: focusY }}
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
          {/* 밝은 별 둘레의 번짐 */}
          <radialGradient id="history-star-glow">
            <stop offset="0" stopColor="var(--night-foreground)" stopOpacity={0.55} />
            <stop offset="0.35" stopColor="var(--glow)" stopOpacity={0.18} />
            <stop offset="1" stopColor="var(--glow)" stopOpacity={0} />
          </radialGradient>
          {/* 은하수처럼 옅게 번지는 빛 */}
          <radialGradient id="history-nebula">
            <stop offset="0" stopColor="var(--glow)" stopOpacity={0.16} />
            <stop offset="0.5" stopColor="var(--mint-line)" stopOpacity={0.06} />
            <stop offset="1" stopColor="var(--mint-line)" stopOpacity={0} />
          </radialGradient>
          {/* 별똥별 꼬리: 머리(오른쪽 위)는 밝고 꼬리로 갈수록 사라짐 */}
          <linearGradient id="history-meteor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--night-foreground)" stopOpacity={0} />
            <stop offset="1" stopColor="var(--night-foreground)" stopOpacity={0.95} />
          </linearGradient>
        </defs>

        <rect x={-3000} y={-1500} width={6600} height={GROUND_Y + 1500} fill="url(#history-sky)" />
        <rect x={-3000} y={GROUND_Y} width={6600} height={SCENE_H - GROUND_Y + 1500} fill="url(#history-soil)" />

        {/* 은하수 띠: 하늘을 비스듬히 가로지르는 옅은 빛 */}
        <g transform="rotate(-24 300 330)">
          <ellipse cx={300} cy={330} rx={720} ry={120} fill="url(#history-nebula)" />
          <ellipse cx={120} cy={300} rx={300} ry={70} fill="url(#history-nebula)" />
          <ellipse cx={520} cy={360} rx={260} ry={60} fill="url(#history-nebula)" />
        </g>

        {/* 별가루 → 또렷한 별 → 밝은 별 순으로 겹칩니다. 반짝임은 묶음(g) 단위 */}
        {STAR_DUST.map((group, gi) => (
          <g key={`dust-${gi}`} className="star-twinkle" style={twinkleStyle(gi, 1.3)}>
            {group.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--night-foreground)" fillOpacity={s.o} />
            ))}
          </g>
        ))}
        {STARS.map((group, gi) => (
          <g key={`star-${gi}`} className="star-twinkle" style={twinkleStyle(gi + 2)}>
            {group.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--night-foreground)" fillOpacity={s.o} />
            ))}
          </g>
        ))}
        {BRIGHT_STARS.map((s, i) => (
          // 바깥 g 는 자리, 안쪽 g 는 반짝임만 맡습니다(둘의 transform 이 섞이지 않게)
          <g key={`bright-${i}`} transform={`translate(${s.x} ${s.y})`}>
            <g
              className="star-flare"
              style={{ "--twinkle-dur": `${s.dur}s`, "--twinkle-delay": `${s.delay}s` } as CSSProperties}
            >
              <circle r={s.r * 7} fill="url(#history-star-glow)" />
              <rect x={-s.r * 5} y={-0.35} width={s.r * 10} height={0.7} fill="var(--night-foreground)" fillOpacity={0.55} />
              <rect x={-0.35} y={-s.r * 5} width={0.7} height={s.r * 10} fill="var(--night-foreground)" fillOpacity={0.55} />
              <circle r={s.r} fill="var(--night-foreground)" />
            </g>
          </g>
        ))}
        {SHOOTING_STARS.map((m, i) => (
          <g key={`meteor-${i}`} transform={`translate(${m.x} ${m.y}) rotate(152)`}>
            <rect
              x={-90}
              y={-0.6}
              width={90}
              height={1.2}
              rx={0.6}
              fill="url(#history-meteor)"
              className="shooting-star"
              style={{ "--meteor-dur": `${m.dur}s`, "--meteor-delay": `${m.delay}s` } as CSSProperties}
            />
          </g>
        ))}

        {PEBBLES.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="var(--mint-line)" fillOpacity={0.06} />
        ))}
        {/* 땅속 양분 알갱이: 별보다 느리게, 민트빛으로 반짝입니다 */}
        {SOIL_MOTES.map((group, gi) => (
          <g key={`mote-${gi}`} className="star-twinkle" style={twinkleStyle(gi + 1, 1.6)}>
            {group.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--glow)" fillOpacity={s.o} />
            ))}
          </g>
        ))}

        {/* 땅 */}
        <path
          d={`M -3000 ${GROUND_Y} L -600 ${GROUND_Y} C 0 ${GROUND_Y - 14}, 300 ${GROUND_Y + 10}, 1200 ${GROUND_Y - 6} L 3600 ${GROUND_Y - 6}`}
          fill="none"
          stroke="var(--mint-line)"
          strokeOpacity={0.3}
          strokeWidth={2}
        />

        {/* 땅속 네 갈래 선: 깊은 곳에서 벌어져 있다가 뿌리 중심에서 하나로 모입니다 */}
        <motion.g style={{ opacity: lanesLit }}>
          {LANE_LINES.map(({ lane, d }) => (
            <path key={lane} d={d} fill="none" stroke={laneColor(lane)} strokeWidth={3} strokeLinecap="round" />
          ))}
        </motion.g>

        {SPOTS.map((spot) => (
          <LineSpot key={spot.i} progress={progress} spot={spot} />
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

        <GlowPath progress={progress} range={TRUNK} d={TRUNK_PATH} width={5} />
        {BRANCH_PATHS.map((d, i) => (
          <GlowPath
            key={d}
            progress={progress}
            range={[VISION_START + i * 0.012, VISION_START + 0.08 + i * 0.01]}
            d={d}
            width={3}
          />
        ))}

        {/* 연혁의 양분이 모두 모이는 뿌리 중심 */}
        <motion.g style={{ opacity: gathered }}>
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

      <SpotCard step={step} />

      {/* 같은 이름이 두 번 나올 수 있어 순번을 key 에 함께 씁니다 */}
      {VISION.branches.map((label, i) => (
        <BranchLabel
          key={`${label}-${i}`}
          progress={progress}
          zoom={zoom}
          narrow={narrow}
          index={i}
          label={label}
        />
      ))}
    </motion.div>
  );
}

/** 지금 단계의 글: 내용(제목)을 크게, 연·월과 갈래 이름을 작게 */
function StepPanel({ step }: { step: Step }) {
  if (step.kind === "vision") {
    return (
      <p className="m-0 text-2xl leading-snug font-medium md:text-[1.75rem]">
        <KeepTogether text={VISION.title} />
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 flex items-center gap-2 text-sm text-mint-line">
        <LaneMark lane={step.lane} />
        <span>
          <time dateTime={step.when.iso}>{step.when.label}</time> · {LANE[step.lane].label}
        </span>
      </p>
      <p className="m-0 text-xl leading-snug font-semibold md:text-2xl">
        <KeepTogether text={step.text} />
        {/* 줄이 바뀌면 앞 공백이 사라져 들여쓰기 없이 다음 줄 맨 앞에 붙습니다 */}
        {step.note && " "}
        {step.note && (
          <span className="inline-block text-sm font-normal whitespace-nowrap text-night-foreground/75">
            {step.note}
          </span>
        )}
        {step.sub && (
          <span className="block">
            <KeepTogether text={step.sub} />
          </span>
        )}
      </p>
    </div>
  );
}

/* ─────────────── 움직임을 줄인 경우: 정적 연혁 ─────────────── */

/** 연도별 묶음 */
const BY_YEAR = MILESTONES.reduce<{ year: string; items: Milestone[] }[]>((groups, m) => {
  const year = m.key.slice(0, 4);
  const last = groups.at(-1);
  if (last?.year === year) last.items.push(m);
  else groups.push({ year, items: [m] });
  return groups;
}, []);

function StaticHistory() {
  return (
    <div className="bg-secondary">
      <Container className="grid gap-[var(--layout-section-gap)] py-16 md:py-24 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <SectionHeader title="History" description="연혁" />
        <div className="flex flex-col gap-12">
          <ol className="m-0 flex list-none flex-col gap-12 p-0">
            {BY_YEAR.map((group) => (
              <li key={group.year} className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)]">
                <h3 className="m-0 text-xl leading-7 font-bold text-primary tabular-nums">
                  {group.year}
                </h3>
                <Timeline
                  className="max-w-[40rem]"
                  items={group.items.map((m) => ({
                    title: fullText(m),
                    timestamp: `${Number(m.key.slice(5, 7))}월`,
                    description: LANE[m.lane].label,
                  }))}
                />
              </li>
            ))}
          </ol>
          <div className="flex max-w-[40rem] flex-col gap-3">
            <h3 className="m-0 text-xl font-medium">{VISION.title}</h3>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {VISION.branches.map((label, i) => (
                <li key={`${label}-${i}`} className="rounded-full border border-border px-3 py-1 text-sm">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ─────────────── 연혁 섹션 ─────────────── */

/**
 * 트랙 스크롤 진행도 중 이야기가 끝나는 지점.
 * 800vh 트랙(스크롤 약 7화면)에서 6/7 이면 앞 6화면이 이야기(연혁 하나에 약 0.27화면, 마지막 줌아웃·카탈로그 약 1화면),
 * 마지막 약 1화면(마우스 휠 10칸 안팎)이 완성된 장면을 붙잡아 두는 구간입니다.
 */
const STORY_END = 6 / 7;

/**
 * 스크롤하면 카메라가 땅속 뿌리에서 줄기, 가지 끝으로 서서히 올라갑니다.
 * 연혁이 하나씩 나올 때마다 그 뿌리 끝에서 모은 양분이 뿌리 중심으로 흘러들고,
 * 모두 모이면 줄기를 타고 땅 위로 올라가 가지 끝에서 비전이 열립니다.
 */
export function HistoryRoots() {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  // 이야기는 트랙 스크롤의 앞 STORY_END 안에서 끝나고, 나머지(약 한 화면, 마우스 휠 10칸 안팎)는
  // 완성된 장면(가지 이름표 + 비전)을 붙잡아 둡니다. 그 뒤에야 다음 섹션으로 넘어갑니다.
  const story = useTransform(scrollYProgress, [0, STORY_END], [0, 1]);
  const smooth = useSpring(story, { stiffness: 140, damping: 32, mass: 0.6 });
  const camera = useTransform(smooth, CAMERA_P, CAMERA_Y.map(cameraShift));
  const zoom = useTransform(smooth, CAMERA_P, CAMERA_SCALE);
  const focusY = useTransform(smooth, CAMERA_P, CAMERA_Y.map((y) => y / SCENE_H));

  // 지금 연혁의 갈래 (비전은 없음)
  const activeStep = STEPS[active];
  const activeLane = activeStep.kind === "milestone" ? activeStep.lane : null;

  useMotionValueEvent(story, "change", (p) => {
    const next = stepAt(p);
    setActive((current) => (current === next ? current : next));
  });

  return (
    <section id="history" aria-labelledby="history-title" className="relative">
      {/* 화면 낭독기용 전체 연혁 */}
      <ol className="sr-only">
        {MILESTONES.map((m) => (
          <li key={m.key}>
            {m.when.label} {LANE[m.lane].label}: {fullText(m)}
          </li>
        ))}
        <li>
          {VISION.title}: {VISION.branches.join(", ")}
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
        // 800vh = 이야기 약 6화면 + 마지막 장면 붙잡기 약 1화면
        <div ref={trackRef} className="relative h-[800vh] bg-soil-deep">
          <div className="sticky top-0 h-svh overflow-hidden text-night-foreground md:top-18 md:h-[calc(100svh-4.5rem)]">
            <div aria-hidden="true">
              <Scene progress={smooth} camera={camera} zoom={zoom} focusY={focusY} step={STEPS[active]} />
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
                className={cn(
                  // 넓은 화면에서는 이 카드에 비전만 나오므로, 퍼진 카탈로그 이름표와 겹치지 않게 조금 더 아래에 둡니다
                  "w-full rounded-xl bg-night/75 p-6 backdrop-blur-md md:mb-[18vh] md:w-88 lg:mb-[8vh]",
                  activeLane ? "border-2 lg:invisible" : "border border-glow/20",
                )}
                style={activeLane ? { borderColor: laneColor(activeLane) } : undefined}
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
