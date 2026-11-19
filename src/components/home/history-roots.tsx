"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { TREE_PATH } from "@/components/logo";
import { SectionHeader } from "@/components/ui/section-header";
import { Timeline } from "@/components/ui/timeline";
import { Container, KeepTogether } from "@/components/site-ui";
import { Bi, T, en } from "@/lib/i18n";
import { useT } from "@/lib/language";
import {
  HISTORY,
  HISTORY_LANES,
  VISION,
  VISION_DETAILS,
  type BusinessCategory,
  type HistoryLane,
} from "@/content/site";
import { BUBBLE_ID, HistoryBubble, type BubblePlacement } from "./history-bubble";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

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
 * 가지 끝에서 비전(미국향 커머스 플랫폼)이 열립니다. */

const LANE = Object.fromEntries(HISTORY_LANES.map((lane) => [lane.id, lane])) as Record<
  HistoryLane,
  (typeof HISTORY_LANES)[number]
>;

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026.08.26" → { label: "2026년 8월", labelEn: "Aug 2026", iso: "2026-08" }. 일은 보여 주지 않습니다 */
function yearMonth(date: string) {
  const [year, month] = date.split(".");
  return {
    label: `${year}년 ${Number(month)}월`,
    labelEn: `${MONTHS_EN[Number(month) - 1]} ${year}`,
    iso: `${year}-${month}`,
  };
}

type Milestone = {
  kind: "milestone";
  key: string;
  when: { label: string; labelEn: string; iso: string };
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
/** 같은 글의 영어(EN) */
const fullTextEn = (m: Milestone) =>
  [m.text, m.note].filter((s): s is string => Boolean(s)).map(en).join(" ") + (m.sub ? ` / ${en(m.sub)}` : "");

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
 * 카메라 배율. 비전(미국향 커머스 플랫폼)이 나온 뒤에는 나무 전체를 담으려고 0.82 로 물러났다가,
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
/**
 * 휴대폰: 나무가 좌우로 잘리지 않게 30% 더 작게(0.68 → 0.476) 줌아웃합니다.
 * 뿌리에서 줄기를 타고 올라와 나무 전체가 보이는 때(TREE_FRAME)부터 이미 이 최종 크기·자리에 두어,
 * 큰 나무가 잘린 채 보이는 중간 장면 없이 가지 이름표가 처음부터 모두 화면 안에 보입니다.
 * 지평선은 화면 맨 아래에 둡니다. 태블릿·PC 는 위 값을 그대로 씁니다.
 */
const NARROW_FINAL_SCALE = CAMERA_SCALE[5] * 0.7;
const NARROW_CAMERA_SCALE = [...CAMERA_SCALE.slice(0, 3), NARROW_FINAL_SCALE, NARROW_FINAL_SCALE, NARROW_FINAL_SCALE];
const NARROW_CAMERA_Y = [...CAMERA_Y.slice(0, 3), ...Array(3).fill(horizonAtBottom(NARROW_FINAL_SCALE))];
/** 휴대폰: "미국향 커머스 플랫폼" 카드는 모든 효과가 거의 끝날 무렵(진행도 90%) 나타납니다 */
const NARROW_VISION_SHOW = 0.9;
/** 장면 y 가 화면 가운데에 오도록 장면 상자를 옮기는 양(상자 높이 대비 %) */
const cameraShift = (centerY: number) => `${(-(centerY - VIEW_H / 2) / SCENE_H) * 100}%`;
/** 뿌리 구간에서 진행도 p 일 때 화면 가운데에 오는 장면 y */
const rootCenterAt = (p: number) => CAMERA_Y[0] + (CAMERA_Y[1] - CAMERA_Y[0]) * (p / ROOT_END);

/* ─────────────── 땅속 네 갈래 선 ───────────────
 * 갈래(조슈아트리웍스, K-GANADA™, 젠틀복스, 타사 제품)마다 색이 다른 선이 하나씩 있습니다.
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

type LineSpotData = { i: number; lane: HistoryLane; x: number; y: number; path: string };

/** 갈래 선 위 연혁 자리: 그 연혁이 나올 때 화면 가운데에 오는 깊이에 둡니다 */
const SPOTS: LineSpotData[] = MILESTONES.map((m, i) => {
  const y = rootCenterAt((i + 0.5) * ROOT_STEP);
  return { i, lane: m.lane, x: laneX(m.lane, y), y, path: lanePath(m.lane, y) };
});

/**
 * 갈래 선: 그 갈래의 첫 연혁(가장 깊은 자리) → 뿌리 중심.
 * 첫 연혁보다 앞선(더 깊은) 구간은 그리지 않아, 선이 연혁이 시작되는 점에서 시작합니다.
 */
const LANE_LINES = LINE_LANES.flatMap((lane) => {
  const ys = SPOTS.filter((spot) => spot.lane === lane).map((spot) => spot.y);
  return ys.length ? [{ lane, d: lanePath(lane, Math.max(...ys)) }] : [];
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
 * 가지 이름표가 나타나기 시작하는 자리 (장면 대비 %, VISION.branches 순서). 좁은 화면에서도 보이도록 가운데 쪽에 둡니다.
 * 가운데 잎은 비우고 왼쪽 가지(가로 가지 끝, 아래 잎, 위 잎)와 오른쪽 가지(위 잎, 아래 잎)에 둡니다.
 */
const BRANCH_LABELS = [
  { left: 30, top: 26.8 },
  { left: 32, top: 21.5 },
  { left: 36, top: 16.5 },
  { left: 64, top: 16.5 },
  { left: 68, top: 21.5 },
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
  size = 1,
}: {
  opacity: MotionValue<number>;
  pathId: string;
  color: string;
  begins: number[];
  /** 굵기 배율 (휴대폰에서 크게) */
  size?: number;
}) {
  // 안 보일 때(투명도 0)는 알갱이를 아예 그리지 않습니다. 보이지 않아도 흐르는 알갱이가
  // 큰 장면 그림을 매 프레임 다시 그리게 만들기 때문입니다.
  const [shown, setShown] = useState(() => opacity.get() > 0.01);
  useMotionValueEvent(opacity, "change", (v) => {
    const next = v > 0.01;
    setShown((current) => (current === next ? current : next));
  });
  if (!shown) return null;
  return (
    <motion.g style={{ opacity }}>
      {begins.map((begin) => (
        <circle key={begin} r={3.5 * size} fill={color}>
          <animateMotion dur="2.4s" begin={`${begin}s`} repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}
    </motion.g>
  );
}

function SpotNode({
  x,
  y,
  color,
  opacity,
  size = 1,
}: {
  x: number;
  y: number;
  color: string;
  opacity: MotionValue<number>;
  size?: number;
}) {
  return (
    <>
      <motion.circle cx={x} cy={y} r={9 * size} fill={color} style={{ opacity }} />
      <motion.circle
        cx={x}
        cy={y}
        r={18 * size}
        fill="none"
        stroke={color}
        strokeOpacity={0.45}
        style={{ opacity }}
      />
    </>
  );
}

/** 휴대폰(좁은 화면)에서 갈래 선·점·양분 알갱이를 키우는 배율. 화면이 좁아 장면이 작게 보이기 때문입니다 */
const NARROW_MARK_SCALE = 1.7;
/** 휴대폰에서 선 굵기 배율: 점·알갱이 배율의 절반 (선만 너무 두껍지 않게) */
const NARROW_LINE_SCALE = NARROW_MARK_SCALE / 2;

/** 갈래 선 위의 연혁: 그 자리에서 뿌리 중심까지 선이 빛나고, 양분이 위로 흘러갑니다 */
function LineSpot({
  progress,
  spot,
  size = 1,
  lineSize = 1,
}: {
  progress: MotionValue<number>;
  spot: LineSpotData;
  /** 점·양분 알갱이 크기 배율 */
  size?: number;
  /** 선 굵기 배율 */
  lineSize?: number;
}) {
  const { flow, node, particles } = useSpotTiming(progress, STARTS[spot.i]);
  // 휴대폰·태블릿: 양분 알갱이는 지금 연혁과 바로 앞 연혁 자리에서만 흐르고, 지나간 자리는 선·점만 남깁니다
  const start = STARTS[spot.i];
  const recentParticles = useTransform(
    progress,
    [start + ROOT_STEP * 0.4, start + ROOT_STEP, start + ROOT_STEP * 2.2, start + ROOT_STEP * 2.8],
    [0, 1, 1, 0],
  );
  const touchy = useTouchy();
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
        strokeWidth={12 * lineSize}
        strokeLinecap="round"
        style={{ pathLength: flow }}
      />
      <motion.path
        d={spot.path}
        fill="none"
        stroke={color}
        strokeWidth={3.5 * lineSize}
        strokeLinecap="round"
        style={{ pathLength: flow }}
      />
      <Particles
        key={touchy ? "recent" : "all"}
        opacity={touchy ? recentParticles : particles}
        pathId={id}
        color={color}
        begins={[0, 0.8, 1.6]}
        size={size}
      />
      <SpotNode x={spot.x} y={spot.y} color={color} opacity={node} size={size} />
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

/** 카탈로그 이름표 자리 (장면 대비 %) */
type CatalogSpot = { left: number; top: number };
type CatalogLayout = Partial<Record<BusinessCategory, CatalogSpot>>;

/**
 * 카탈로그: 줌아웃이 끝났을 때 가지 이름표가 놓이는 자리 (장면 대비 %).
 * 맨 위 가운데 K-Play, 왼쪽 위 K-Living · 왼쪽 아래 K-Beauty, 오른쪽 위 K-Charm · 오른쪽 아래 K-Apparel.
 * 좁은 화면(휴대폰)은 같은 배치를 쓰되, 화면 밖으로 나가지 않게 좌우 간격만 가운데 쪽으로 좁힙니다.
 */
const CATALOG_WIDE: CatalogLayout = {
  "K-Play": { left: 51, top: 10.1 },
  "K-Living": { left: 6.2, top: 15.4 },
  "K-Beauty": { left: -14.2, top: 22.5 },
  "K-Charm": { left: 93.7, top: 14.5 },
  "K-Apparel": { left: 110.4, top: 21.7 },
};
/** 휴대폰에서 좌우 간격을 줄이는 비율: 가장 바깥 이름표(-14.2% · 110.4%)가 화면 안에 들어옵니다 */
const NARROW_SPREAD = 0.62;
const CATALOG_NARROW: CatalogLayout = Object.fromEntries(
  Object.entries(CATALOG_WIDE).map(([label, { left, top }]) => [label, { left: 50 + (left - 50) * NARROW_SPREAD, top }]),
);

const NARROW_QUERY = "(max-width: 767px)";
/** 휴대폰 가로처럼 아주 키가 낮은 넓은 화면 (globals.css 의 squat 과 같은 조건) */
const SQUAT_QUERY = "(min-width: 768px) and (max-height: 540px)";
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

/** 휴대폰·태블릿(1023px 이하, 또는 손가락으로 쓰는 화면). globals.css 의 touchy 와 같은 조건 */
const TOUCHY_QUERY = "(max-width: 1023.98px), (pointer: coarse)";
function subscribeTouchy(onChange: () => void) {
  const mq = window.matchMedia(TOUCHY_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
/**
 * 휴대폰·태블릿인지. 이 화면에서는 연혁 장면(화면 높이의 약 3배인 큰 그림 한 장) 안에서 쉬지 않고 도는 움직임을
 * 줄여, 그림 전체를 매 프레임 다시 그리느라 생기는 깜빡임을 막습니다. 서버에서는 넓은 화면으로 봅니다.
 */
function useTouchy() {
  return useSyncExternalStore(
    subscribeTouchy,
    () => window.matchMedia(TOUCHY_QUERY).matches,
    () => false,
  );
}

/** 이름표를 눌렀을 때·마우스를 올렸을 때 할 일 (말풍선) */
type LabelEvents = {
  /** 이름표가 말풍선을 열 수 있는 상태(카탈로그가 다 보임) */
  live: boolean;
  open: number | null;
  onOpen: (index: number, element: HTMLElement) => void;
  onClose: (index: number) => void;
  /**
   * 넓은 화면(태블릿·PC)에서 이름표 좌우 간격 비율(0~1). 태블릿 세로처럼 화면 폭에 비해 장면이 넓으면
   * 바깥 이름표가 화면 밖으로 나가므로, 화면 안에 들어오도록 가운데 쪽으로 좁힙니다. PC 는 대개 1(그대로)입니다.
   */
  spread: number;
};

/**
 * 넓은 화면 이름표 좌우 간격 비율: 마지막 장면(줌아웃 끝)에서 가장 바깥 이름표가 화면 가장자리에서
 * 여백(24px) + 이름표 반 폭(약 70px) 안쪽에 오도록 합니다.
 */
function wideSpread(stageW: number, stageH: number) {
  // 장면 상자: 높이 = 무대 높이 × 285.714%, 폭 = 높이 × 600/2000, 마지막 배율 CAMERA_SCALE[5]
  const sceneW = stageH * 2.85714 * 0.3 * CAMERA_SCALE[5];
  const reach = Math.max(...Object.values(CATALOG_WIDE).map((spot) => Math.abs(spot.left - 50) / 100));
  const room = stageW / 2 - 24 - 70;
  return Math.max(0.4, Math.min(1, room / (reach * sceneW)));
}

/**
 * 가지 이름표: 나무 전체가 보일 때 가지 위에 나타났다가, 줌아웃과 함께 카탈로그 자리로 퍼집니다.
 * 장면이 줄어들어도 글자 크기는 그대로 두려고 카메라 배율의 역수로 키웁니다.
 * 다 나타나면 이름표가 버튼이 되어 마우스를 올리거나(휴대폰은 누르면) 말풍선이 뜹니다.
 * 내용이 없는 카테고리는 말풍선에 "준비중"을 보여 줍니다.
 */
function BranchLabel({
  progress,
  zoom,
  narrow,
  index,
  label,
  events,
}: {
  progress: MotionValue<number>;
  zoom: MotionValue<number>;
  narrow: boolean;
  index: number;
  label: BusinessCategory;
  events: LabelEvents;
}) {
  const start = TREE_FRAME - 0.03 + index * 0.012;
  const opacity = useTransform(progress, [start, start + 0.03], [0, 1]);
  // 처음 나타날 때부터 나무(로고) 바깥 카탈로그 자리에 둡니다. 가지 쪽에서 살짝 밀려 나오며 나타납니다.
  const spot = (narrow ? CATALOG_NARROW : CATALOG_WIDE)[label] ?? { left: 50, top: 10 };
  const to = narrow ? spot : { left: 50 + (spot.left - 50) * events.spread, top: spot.top };
  const branch = BRANCH_LABELS[index];
  const near = (a: number, b: number) => a + (b - a) * 0.8;
  const left = useTransform(progress, [start, start + 0.04], [`${near(branch.left, to.left)}%`, `${to.left}%`]);
  const top = useTransform(progress, [start, start + 0.04], [`${near(branch.top, to.top)}%`, `${to.top}%`]);
  // 글자 크기는 카메라 배율의 역수로 지킵니다. 휴대폰은 마지막에 나무가 30% 더 작아질 때 이름표도 같이 70% 크기로 줄입니다.
  const scale = useTransform(zoom, (z) =>
    narrow ? (1 / z) * Math.min(1, Math.max(0.7, z / CAMERA_SCALE[5])) : 1 / z,
  );
  const base =
    "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-glow/40 bg-night/85 px-4 py-2 text-sm whitespace-nowrap text-night-foreground md:text-base";

  // 늘 같은 <button> 으로 두고, 이름표가 다 나타나기 전(live 아님)에는 장식처럼 키보드·클릭만 막습니다.
  // 요소를 바꾸지 않으므로 이름표에 초점이 있는 채 위로 스크롤해도 초점이 빠지지 않습니다.
  const live = events.live;
  const isOpen = live && events.open === index;
  return (
    <motion.button
      type="button"
      style={{ opacity, scale, left, top }}
      tabIndex={live ? undefined : -1}
      aria-hidden={live ? undefined : true}
      aria-expanded={live ? isOpen : undefined}
      aria-controls={isOpen ? BUBBLE_ID : undefined}
      aria-describedby={isOpen ? BUBBLE_ID : undefined}
      onPointerEnter={(e) => live && e.pointerType === "mouse" && events.onOpen(index, e.currentTarget)}
      onPointerLeave={(e) => live && e.pointerType === "mouse" && events.onClose(index)}
      onFocus={(e) => live && events.onOpen(index, e.currentTarget)}
      onBlur={() => live && events.onClose(index)}
      onClick={(e) => live && events.onOpen(index, e.currentTarget)}
      className={cn(
        base,
        live
          ? "pointer-events-auto cursor-pointer transition-colors hover:border-glow hover:bg-primary focus-visible:ring-2 focus-visible:ring-glow focus-visible:outline-none"
          : "pointer-events-none",
        isOpen && "border-glow bg-primary",
      )}
    >
      {label}
    </motion.button>
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
            "absolute hidden w-[21rem] -translate-y-1/2 rounded-xl border-2 bg-night/85 p-6 backdrop-blur-md spot:block",
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
  events,
}: {
  progress: MotionValue<number>;
  camera: MotionValue<string>;
  /** 카메라 배율 */
  zoom: MotionValue<number>;
  /** 화면 가운데에 오는 장면 y (줌의 기준점, 0~1) */
  focusY: MotionValue<number>;
  step: Step;
  events: LabelEvents;
}) {
  const narrow = useNarrow();
  const markScale = narrow ? NARROW_MARK_SCALE : 1;
  const lineScale = narrow ? NARROW_LINE_SCALE : 1;
  // 휴대폰: 뿌리 중심(x 258)과 네 갈래 선이 장면 가운데(300)보다 왼쪽에 있어, 땅속 구간에서는 장면을 오른쪽으로 옮겨
  // 선 묶음이 화면 가운데에 오게 합니다. 줄기를 타고 오르며(가운데 x 297) 원래 자리로 돌아옵니다.
  const centerShift = useTransform(
    progress,
    [ROOT_END, VISION_START],
    narrow ? ["6%", "0%"] : ["0%", "0%"],
  );
  const gathered = useTransform(progress, GATHER, [0, 1]);
  // 네 갈래 선은 늘 옅게 보이다가, 양분이 뿌리 중심에 모일 때 한꺼번에 밝아집니다.
  const lanesLit = useTransform(progress, [GATHER[0] - 0.02, GATHER[1]], [0.35, 0.85]);
  const treeLight = useTransform(progress, [VISION_START, TREE_FRAME + 0.04], [0, 1]);

  return (
    <motion.div
      style={{ x: centerShift, y: camera, scale: zoom, originY: focusY }}
      // will-change: 장면을 따로 된 층으로 올려, 스크롤로 카메라가 움직일 때 그림을 다시 그리지 않고 옮기기만 합니다
      // (휴대폰·태블릿에서 스크롤 중 깜빡임을 막습니다)
      className="absolute top-0 left-1/2 aspect-[600/2000] h-[285.714%] -translate-x-1/2 will-change-transform"
    >
      <svg
        aria-hidden="true"
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

        {/* 땅속 네 갈래 선: 각 갈래의 첫 연혁에서 시작해 위로 오르며 뿌리 중심에서 하나로 모입니다 */}
        <motion.g style={{ opacity: lanesLit }}>
          {LANE_LINES.map(({ lane, d }) => (
            <path key={lane} d={d} fill="none" stroke={laneColor(lane)} strokeWidth={3 * lineScale} strokeLinecap="round" />
          ))}
        </motion.g>

        {SPOTS.map((spot) => (
          <LineSpot key={spot.i} progress={progress} spot={spot} size={markScale} lineSize={lineScale} />
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

      <div aria-hidden="true">
        <SpotCard step={step} />
      </div>

      {/* 같은 이름이 두 번 나올 수 있어 순번을 key 에 함께 씁니다 */}
      {VISION.branches.map((label, i) => (
        <BranchLabel
          key={`${label}-${i}`}
          progress={progress}
          zoom={zoom}
          narrow={narrow}
          index={i}
          label={label}
          events={events}
        />
      ))}
    </motion.div>
  );
}

/** 지금 단계의 글: 내용(제목)을 크게, 연·월과 갈래 이름을 작게 */
function StepPanel({ step }: { step: Step }) {
  if (step.kind === "vision") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="m-0 type-meta text-balance text-night-foreground/75 squat:text-[0.6875rem]">
          <T>{VISION.lead}</T>
        </p>
        {/* 영어는 한국어보다 길어 휴대폰에서 두 줄로 나눕니다 */}
        <p className="m-0 text-4xl leading-tight font-bold whitespace-nowrap md:text-[2.5rem] squat:text-xl en:text-balance en:whitespace-normal en:text-[1.75rem] md:en:text-[2rem] squat:en:text-xl">
          <KeepTogether text={VISION.title} />
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 flex items-center gap-2 type-meta text-mint-line">
        <LaneMark lane={step.lane} />
        <span>
          <time dateTime={step.when.iso}>
            <Bi ko={step.when.label} en={step.when.labelEn} />
          </time>{" "}
          · <T>{LANE[step.lane].label}</T>
        </span>
      </p>
      <p className="m-0 type-title">
        <KeepTogether text={step.text} />
        {/* 줄이 바뀌면 앞 공백이 사라져 들여쓰기 없이 다음 줄 맨 앞에 붙습니다 */}
        {step.note && " "}
        {step.note && (
          <span className="inline-block type-meta font-normal whitespace-nowrap text-night-foreground/75">
            <T>{step.note}</T>
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

/** 쌓인 카드가 위로 밀려 올라가는 간격(px): 이전 카드의 날짜 줄이 지금 카드 위로 한 줄씩 보입니다 */
const STACK_STEP = 40;
/** 함께 보이는 카드 수(지금 카드 + 이전 카드) */
const STACK_SIZE = 4;

/**
 * 세로 태블릿: 연혁 카드를 화면 오른쪽 가운데(빛나는 점이 퍼지는 높이)에 띄웁니다.
 * 스크롤하면 새 연혁이 아래에서 올라와 맨 앞에 놓이고, 이전 연혁은 그 뒤에서 위로 조금씩 밀려 올라가며
 * 차곡차곡 쌓였다가 흐려져 사라집니다. 비전 단계에서는 사라지고 아래 비전 카드가 나옵니다.
 */
function MilestoneStack({ active, progress }: { active: number; progress: MotionValue<number> }) {
  const reduceMotion = usePrefersReducedMotion();
  // 모든 연혁 점이 뿌리 중심으로 모이는 때(GATHER)에 맞춰 쌓인 카드가 서서히 사라집니다. 위로 올리면 다시 나타납니다.
  const fade = useTransform(progress, GATHER, [1, 0]);
  const current = STEPS[active]?.kind === "milestone" ? active : -1;
  const shown = current < 0 ? [] : MILESTONES.slice(Math.max(0, current - STACK_SIZE + 1), current + 1);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity: fade }}
      className="pointer-events-none absolute top-1/2 right-(--page-inset) hidden w-80 stack:block"
    >
      {/* 카드 위쪽 끝을 가운데보다 조금 위에 맞춰, 지금 카드의 가운데가 화면 가운데에 오게 합니다 */}
      <div className="absolute inset-x-0 -top-14">
        <AnimatePresence initial={false}>
          {shown.map((m) => {
            const depth = current - MILESTONES.indexOf(m);
            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 48, scale: 1 }}
                animate={{ opacity: 1, y: -depth * STACK_STEP, scale: 1 - depth * 0.05 }}
                exit={{ opacity: 0, y: -(depth + 1) * STACK_STEP, scale: 1 - (depth + 1) * 0.05 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.19, 1, 0.22, 1] }}
                style={{ zIndex: STACK_SIZE - depth, borderColor: laneColor(m.lane), originY: 0 }}
                // 바탕은 불투명하게 두어 뒤 카드 글자가 비치지 않게 하고, 이전 카드일수록 내용만 흐리게 합니다
                className="absolute inset-x-0 top-0 rounded-xl border-2 bg-night p-5"
              >
                <motion.div
                  animate={{ opacity: depth === 0 ? 1 : Math.max(0.25, 0.75 - depth * 0.2) }}
                  transition={{ duration: reduceMotion ? 0 : 0.35 }}
                >
                  <StepPanel step={m} />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─────────────── 움직임을 줄인 경우: 정적 연혁 ─────────────── */

/** 연도별 묶음 */
const BY_YEAR = MILESTONES.reduce<{ year: string; items: Milestone[] }[]>((groups, m) => {
  const year = m.when.iso.split("-")[0];
  const last = groups.at(-1);
  if (last?.year === year) last.items.push(m);
  else groups.push({ year, items: [m] });
  return groups;
}, []);

function StaticHistory() {
  return (
    <div className="bg-secondary">
      <Container className="grid gap-[var(--layout-section-gap)] py-(--section-pad) lg:grid-cols-[16rem_minmax(0,1fr)]">
        <SectionHeader title="History" description="연혁" />
        <div className="flex flex-col gap-12">
          <ol className="m-0 flex list-none flex-col gap-12 p-0">
            {BY_YEAR.map((group) => (
              <li key={group.year} className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)]">
                <h3 className="m-0 type-title text-primary tabular-nums">
                  {group.year}
                </h3>
                <Timeline
                  className="max-w-[40rem]"
                  items={group.items.map((m) => ({
                    title: <Bi ko={fullText(m)} en={fullTextEn(m)} />,
                    timestamp: (
                      <Bi ko={`${Number(m.when.iso.split("-")[1])}월`} en={MONTHS_EN[Number(m.when.iso.split("-")[1]) - 1]} />
                    ),
                    description: <T>{LANE[m.lane].label}</T>,
                  }))}
                />
              </li>
            ))}
          </ol>
          <div className="flex max-w-[40rem] flex-col gap-3">
            <p className="m-0 type-meta text-muted-foreground">
              <T>{VISION.lead}</T>
            </p>
            <h3 className="m-0 type-title">
              <T>{VISION.title}</T>
            </h3>
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
  const reduceMotion = usePrefersReducedMotion();
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const narrow = useNarrow();
  const touchy = useTouchy();

  // 가지 이름표가 모두 카탈로그 자리에 나타난 뒤에만 말풍선을 열 수 있습니다.
  const [labelsLive, setLabelsLive] = useState(false);
  const [visionReady, setVisionReady] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [placement, setPlacement] = useState<BubblePlacement | null>(null);
  const openLabel = useRef<HTMLElement | null>(null);
  const openIndex = useRef<number | null>(null);
  // 연혁 화면(무대) 크기: 넓은 화면 이름표 간격을 화면에 맞추는 데 씁니다.
  const [stageSize, setStageSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize((current) =>
        current && current.w === width && current.h === height ? current : { w: width, h: height },
      );
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  // 이야기는 트랙 스크롤의 앞 STORY_END 안에서 끝나고, 나머지(약 한 화면, 마우스 휠 10칸 안팎)는
  // 완성된 장면(가지 이름표 + 비전)을 붙잡아 둡니다. 그 뒤에야 다음 섹션으로 넘어갑니다.
  // 한 번 끝까지 본 뒤(done)에는 장면을 마지막 모습(1)에 고정해, 위로 스크롤해도 거꾸로 재생되지 않습니다.
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  /** 트랙을 줄이기 직전, 트랙 아래 끝의 화면 위치. 줄인 뒤 같은 자리로 스크롤을 맞춥니다 */
  const bottomBefore = useRef<number | null>(null);
  /** 이번에 연혁 구간 안을 실제로 스크롤하며 지나왔는지(바로 아래로 건너뛰거나 새로 고침으로 아래에 온 경우는 아님) */
  const seenInside = useRef(false);
  const story = useTransform(scrollYProgress, (v) => (doneRef.current ? 1 : Math.min(1, Math.max(0, v / STORY_END))));
  const smooth = useSpring(story, { stiffness: 140, damping: 32, mass: 0.6 });

  // 트랙 끝까지 내려오면(모든 효과가 끝나면) 800vh 스크롤 구간을 한 화면 높이로 줄입니다.
  // 이후로는 완성된 장면이 보통 섹션처럼 지나가고, 다시 위로 올려도 애니메이션이 거꾸로 돌지 않습니다.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.001 && v < 0.999) seenInside.current = true;
    if (doneRef.current || v < 0.999 || !seenInside.current || !trackRef.current) return;
    doneRef.current = true;
    bottomBefore.current = trackRef.current.getBoundingClientRect().bottom;
    smooth.jump(1);
    setDone(true);
  });
  // 줄어든 높이만큼 스크롤을 당겨, 줄이는 순간 화면이 튀지 않게 합니다(그리기 전에 맞춥니다).
  useLayoutEffect(() => {
    const before = bottomBefore.current;
    if (!done || before === null || !trackRef.current) return;
    bottomBefore.current = null;
    const shift = trackRef.current.getBoundingClientRect().bottom - before;
    if (shift !== 0) window.scrollTo({ top: window.scrollY + shift, behavior: "instant" });
  }, [done]);
  // 연혁보다 위(히어로)로 완전히 올라가면 고정을 풀어, 다시 내려올 때 처음부터 재생합니다.
  // 연혁이 화면 아래로 다 빠진 뒤에 트랙이 다시 길어지므로 보이는 화면은 움직이지 않습니다.
  useEffect(() => {
    if (!done) return;
    const onScroll = () => {
      const track = trackRef.current;
      if (!track || track.getBoundingClientRect().top < window.innerHeight - 2) return;
      doneRef.current = false;
      seenInside.current = false;
      smooth.jump(0);
      setDone(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [done, smooth]);
  const cameraY = narrow ? NARROW_CAMERA_Y : CAMERA_Y;
  const camera = useTransform(smooth, CAMERA_P, cameraY.map(cameraShift));
  const zoom = useTransform(smooth, CAMERA_P, narrow ? NARROW_CAMERA_SCALE : CAMERA_SCALE);
  const focusY = useTransform(smooth, CAMERA_P, cameraY.map((y) => y / SCENE_H));

  // 지금 연혁의 갈래 (비전은 없음)
  const activeStep = STEPS[active];
  const activeLane = activeStep.kind === "milestone" ? activeStep.lane : null;

  useMotionValueEvent(story, "change", (p) => {
    const next = stepAt(p);
    setActive((current) => (current === next ? current : next));
  });

  /**
   * 말풍선 자리: 가리킨 이름표를 기준으로, 연혁 화면 크기에 맞춰 그때그때 계산합니다.
   * 이름표 자리는 그대로 두고, 화면 왼쪽 이름표(K-Living·K-Beauty)는 말풍선을 왼쪽으로,
   * 오른쪽 이름표(K-Charm·K-Apparel)는 오른쪽으로 펼칩니다(꼬리는 이름표 쪽 끝).
   * 화면 가운데 이름표(K-Play)는 말풍선도 이름표 바로 위 가운데에 띄웁니다(꼬리는 말풍선 가운데).
   * 위쪽 공간이 모자라면 이름표 아래에 띄웁니다. 화면 밖으로 나가지 않게 가장자리에서 멈춥니다.
   * 휴대폰 세로는 늘 화면 아래에, 휴대폰 가로는 오른쪽 아래에 띄웁니다.
   */
  const place = useCallback(() => {
    const stage = stageRef.current;
    const label = openLabel.current;
    if (!stage || !label) return;
    // 스크롤 중에는 매 프레임 불리므로, 자리가 그대로면 다시 그리지 않습니다.
    const update = (next: BubblePlacement) =>
      setPlacement((current) => (current && JSON.stringify(current) === JSON.stringify(next) ? current : next));
    if (narrow) {
      update({ mode: "bottom" });
      return;
    }
    // 휴대폰 가로(키가 아주 낮은 넓은 화면): 오른쪽 아래에 고정합니다. 왼쪽 아래에는 비전 카드가 있습니다.
    if (window.matchMedia(SQUAT_QUERY).matches) {
      update({ mode: "corner" });
      return;
    }
    const box = stage.getBoundingClientRect();
    const tag = label.getBoundingClientRect();
    const margin = 16;
    const gap = 18;
    // "준비중" 말풍선은 내용이 짧아 좁게 띄웁니다.
    const index = openIndex.current;
    const hasDetail = index !== null && Boolean(VISION_DETAILS[VISION.branches[index]]);
    const width = Math.min(hasDetail ? 448 : 288, box.width - margin * 2);
    const centerX = tag.left + tag.width / 2 - box.left;
    const centered = Math.abs(centerX - box.width / 2) < box.width * 0.08;
    const leftHalf = centerX < box.width / 2;
    const rawLeft = centered ? centerX - width / 2 : leftHalf ? centerX - width + 40 : centerX - 40;
    const left = Math.min(Math.max(rawLeft, margin), box.width - width - margin);
    const tailX = Math.min(Math.max(centerX - left, 20), width - 20);
    const tagTop = tag.top - box.top;
    const tagBottom = tag.bottom - box.top;
    // 말풍선 높이는 약 190px("준비중"은 약 120px). 이름표 위에 그만큼 자리가 없으면 아래에 띄웁니다.
    const above = tagTop - gap > (hasDetail ? 200 : 130);
    update(
      above
        ? { mode: "float", left: Math.round(left), width, bottom: Math.round(box.height - (tagTop - gap)), tailX: Math.round(tailX) }
        : { mode: "float", left: Math.round(left), width, top: Math.round(tagBottom + gap), tailX: Math.round(tailX) },
    );
  }, [narrow]);

  // 마우스가 이름표에서 말풍선으로 옮겨 가는 동안 닫히지 않도록 잠깐 기다렸다 닫습니다(말풍선 위에 있으면 열린 채).
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const openBubble = useCallback(
    (index: number, element: HTMLElement) => {
      cancelClose();
      openLabel.current = element;
      openIndex.current = index;
      setOpen(index);
      place();
    },
    [place, cancelClose],
  );
  const closeBubble = useCallback(
    (index: number) => {
      cancelClose();
      closeTimer.current = setTimeout(() => setOpen((current) => (current === index ? null : current)), 150);
    },
    [cancelClose],
  );
  useEffect(() => cancelClose, [cancelClose]);

  useMotionValueEvent(smooth, "change", (p) => {
    const live = p > TREE_FRAME + 0.08;
    setLabelsLive((current) => (current === live ? current : live));
    // 이름표가 다시 장식으로 돌아가면(위로 스크롤) 열려 있던 말풍선도 닫습니다.
    if (!live) setOpen((current) => (current === null ? current : null));
    const ready = p > NARROW_VISION_SHOW;
    setVisionReady((current) => (current === ready ? current : ready));
    // 스크롤로 장면이 움직이면 말풍선도 이름표를 따라갑니다.
    if (open !== null) place();
  });

  // 말풍선이 열려 있을 때: 창 크기가 바뀌면 자리를 다시 잡고, Esc 나 바깥을 누르면 닫습니다.
  useEffect(() => {
    if (open === null) return;
    const onResize = () => place();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(null);
    const onDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && (openLabel.current?.contains(target) || document.getElementById(BUBBLE_ID)?.contains(target)))
        return;
      setOpen(null);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, place]);

  const bubbleOpen = labelsLive && open !== null;
  const openCategory = open !== null ? VISION.branches[open] : null;
  const openDetail = openCategory ? VISION_DETAILS[openCategory] : undefined;
  const spread = stageSize ? wideSpread(stageSize.w, stageSize.h) : 1;
  const events: LabelEvents = {
    live: labelsLive,
    open: bubbleOpen ? open : null,
    onOpen: openBubble,
    onClose: closeBubble,
    spread,
  };

  return (
    <section
      id="history"
      {...(reduceMotion ? { "aria-label": t("연혁") } : { "aria-labelledby": "history-title" })}
      className="relative"
    >
      {reduceMotion ? (
        // 움직임 줄이기: 같은 연혁을 정적인 목록으로 보여 줍니다(제목 History 는 목록 안에 있습니다).
        <StaticHistory />
      ) : (
        // 800vh = 이야기 약 6화면 + 마지막 장면 붙잡기 약 1화면. 끝까지 본 뒤에는 한 화면 높이(완성된 장면)만 남깁니다.
        <div ref={trackRef} className={cn("relative bg-soil-deep", !done && "h-[800vh]")}>
          {/* 화면 낭독기용 전체 연혁과 카테고리별 프로젝트 소개 (장면은 장식이라 읽지 않습니다) */}
          <ol className="sr-only">
            {MILESTONES.map((m) => (
              <li key={m.key}>
                <Bi
                  ko={`${m.when.label} ${LANE[m.lane].label}: ${fullText(m)}`}
                  en={`${m.when.labelEn} ${en(LANE[m.lane].label)}: ${fullTextEn(m)}`}
                />
              </li>
            ))}
            <li>
              <Bi
                ko={`${VISION.lead} ${VISION.title}: ${VISION.branches
                  .map((branch) => {
                    const detail = VISION_DETAILS[branch];
                    return detail ? `${branch} (${detail.title}: ${detail.body})` : `${branch} (준비중)`;
                  })
                  .join(", ")}`}
                en={`${en(VISION.lead)} ${en(VISION.title)}: ${VISION.branches
                  .map((branch) => {
                    const detail = VISION_DETAILS[branch];
                    return detail ? `${branch} (${en(detail.title)}: ${en(detail.body)})` : `${branch} (${en("준비중")})`;
                  })
                  .join(", ")}`}
              />
            </li>
          </ol>
          <div
            ref={stageRef}
            className="sticky top-0 h-svh overflow-hidden text-night-foreground md:top-18 md:h-[calc(100svh-4.5rem)]"
          >
            <div>
              <Scene
                progress={smooth}
                camera={camera}
                zoom={zoom}
                focusY={focusY}
                step={STEPS[active]}
                events={events}
              />
            </div>

            <Container className="pointer-events-none relative flex h-full flex-col justify-between py-8 md:py-12 squat:py-5">
              <div className="flex flex-col gap-1">
                <h2 id="history-title" className="m-0 text-2xl font-semibold tracking-tight">
                  History
                </h2>
                <p className="m-0 text-sm text-mint-line">
                  <T>연혁</T>
                </p>
              </div>

              <div
                aria-hidden="true"
                className={cn(
                  // 넓은 화면에서는 이 카드에 비전만 나오므로, 퍼진 카탈로그 이름표와 겹치지 않게 조금 더 아래에 둡니다
                  "relative w-full rounded-xl bg-night/75 p-6 backdrop-blur-md md:mb-[18vh] md:w-104 lg:mb-[8vh]",
                  // 휴대폰·태블릿: 움직이는 장면 위의 배경 흐림(backdrop-blur)은 매 프레임 다시 흐려야 해 깜빡임을 일으키므로,
                  // 흐림 대신 조금 더 진한 바탕으로 글자를 읽기 쉽게 둡니다
                  "touchy:bg-night/90 touchy:backdrop-blur-none",
                  // 영어 비전 문구는 한국어보다 길어 카드를 조금 넓혀 두 줄 안에 넣습니다(K-Beauty 이름표와 겹치지 않게)
                  "md:en:w-120",
                  // 휴대폰 가로: 작게 줄여 왼쪽 아래에 붙입니다
                  "squat:mb-0 squat:w-auto squat:self-start squat:px-5 squat:py-3",
                  // 연혁 카드: 넓은 화면은 점 옆(SpotCard), 세로 태블릿은 오른쪽 쌓임 카드(MilestoneStack)로 보여 줍니다
                  activeLane ? "border-2 spot:invisible stack:invisible" : "border border-glow/20",
                  // 휴대폰: 비전 카드는 History 제목과 K-Play 이름표 사이 가운데(빈 하늘)에 둡니다. 연혁 카드는 그대로 아래에 둡니다.
                  // 장면은 화면 높이에 비례하므로(K-Play 위쪽 ≈ 화면 높이의 51.3%) 위 여백도 화면 높이로 정합니다.
                  activeStep.kind === "vision" && "max-md:mt-[max(1.5rem,calc(25.65svh-6.625rem))] max-md:mb-auto",
                  // 휴대폰: 비전 카드는 효과가 거의 끝날 때까지 숨겼다가 천천히 나타납니다
                  "transition-opacity duration-500",
                  activeStep.kind === "vision" && !visionReady && "max-md:invisible max-md:opacity-0",
                )}
                style={activeLane ? { borderColor: laneColor(activeLane) } : undefined}
              >
                {/* 비전 카드: 테두리를 따라 빛이 돌며 주변이 반짝입니다(보더 빔) */}
                {activeStep.kind === "vision" && (
                  <>
                    <span aria-hidden="true" className="border-beam border-beam-glow" />
                    <span aria-hidden="true" className="border-beam" />
                  </>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={STEPS[active].key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    // 휴대폰·태블릿: 손가락으로 빠르게 넘기면 연혁이 연달아 바뀌어, 사라졌다 나타나는 효과가
                    // 깜빡임처럼 보입니다. 이 화면에서는 글자를 바로 바꿉니다
                    transition={{ duration: touchy ? 0 : 0.2, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <StepPanel step={STEPS[active]} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </Container>

            <MilestoneStack active={active} progress={smooth} />

            <AnimatePresence>
              {bubbleOpen && openCategory && placement && (
                <HistoryBubble
                  key={openCategory}
                  category={openCategory}
                  detail={openDetail}
                  placement={placement}
                  onPointerEnter={cancelClose}
                  onPointerLeave={() => open !== null && closeBubble(open)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}
