// 홈 연혁(History) 장면을 After Effects 모션그래픽으로 만드는 ExtendScript를 생성합니다.
// 사이트와 같은 기준을 쓰도록 콘텐츠(site.ts), 색(globals.css), 나무 모양(logo.tsx)을 소스에서 직접 읽습니다.
// 장면 좌표·타이밍은 src/components/home/history-roots.tsx 와 같은 값입니다. 그쪽을 고치면 여기도 맞춰 주세요.
//
// 사용법: node scripts/after-effects/build-history-roots.mjs
//   → assets/motion/history-roots.jsx 생성 (After Effects에서 실행)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT_DIR, "assets/motion");
const { HISTORY, VISION } = await import(join(ROOT_DIR, "src/content/site.ts"));

/* ─────────────── 영상 설정 ─────────────── */

const W = 1920;
const H = 1080;
const FPS = 30;
/** 스크롤 진행도 0~1 을 0~DURATION초에 그대로 대응시킵니다(스크롤 재생용으로 선형). */
const DURATION = 20;

/* ─────────────── 색: globals.css 의 oklch 토큰 → sRGB ─────────────── */

const css = readFileSync(join(ROOT_DIR, "src/app/globals.css"), "utf8");
function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`));
  if (!m) throw new Error(`색 토큰을 찾지 못했습니다: --${name}`);
  return oklchToRgb(Number(m[1]), Number(m[2]), Number(m[3]));
}
function oklchToRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((x) => {
    const c = Math.min(1, Math.max(0, x));
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(v * 10000) / 10000;
  });
}
const COLORS = {
  night: token("night"),
  nightForeground: token("night-foreground"),
  horizon: token("horizon"),
  soil: token("soil"),
  soilDeep: token("soil-deep"),
  glow: token("glow"),
  tree: token("tree"),
  mintLine: token("mint-line"),
  primary: token("primary"),
  border: token("border"),
  // 배지 기본(default) 배경: badge.tsx 의 oklch(0.897 0 180)
  badgeBg: oklchToRgb(0.897, 0, 180),
};

/* ─────────────── 장면 좌표 (history-roots.tsx 와 동일, viewBox 0 0 600 2000) ─────────────── */

const SCENE_W = 600;
const SCENE_H = 2000;
const VIEW_H = 700;
const GROUND_Y = 900;
const ROOT = { x: 258, y: 905 };
const TREE_OFFSET = [22, 250];
const centerAt = (p) => (SCENE_H - VIEW_H) * (1 - p) + VIEW_H / 2;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const MILESTONES = HISTORY.flatMap((y) =>
  y.items.map((item) => ({
    kind: "milestone",
    date: /^\d+$/.test(item.month) ? `${y.year}.${item.month}` : `${y.year} ${item.month}`,
    text: item.text,
    stage: item.stage,
    planned: Boolean(item.planned),
  })),
);
const STEPS = [...MILESTONES, { kind: "vision" }];

const STARTS = (() => {
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
const windowMid = (i) => (STARTS[i] + (STARTS[i + 1] ?? 1)) / 2;

const ROOT_TIPS = STEPS.map((step, i) => {
  if (step.kind !== "milestone" || step.stage !== "root") return null;
  const left = i % 2 === 0;
  const spread = 120 - i * 6;
  return {
    i,
    x: left ? ROOT.x - spread : ROOT.x + spread + 40,
    y: Math.min(centerAt(windowMid(i)), SCENE_H - 120),
  };
}).filter(Boolean);

const rootPath = (tip) =>
  `M ${tip.x} ${tip.y} C ${tip.x} ${tip.y - (tip.y - ROOT.y) * 0.45}, ${
    ROOT.x + (tip.x - ROOT.x) * 0.35
  } ${ROOT.y + 70}, ${ROOT.x} ${ROOT.y}`;

const FINE_ROOTS = [
  `M ${ROOT.x} ${ROOT.y} C 250 1200, 272 1600, 262 2000`,
  `M ${ROOT.x} ${ROOT.y} C 180 960, 60 1000, -20 1060`,
  `M ${ROOT.x} ${ROOT.y} C 360 950, 520 990, 620 1040`,
  "M 262 1450 C 200 1620, 120 1800, 50 2000",
  "M 262 1450 C 330 1640, 450 1820, 560 2000",
  "M 255 1200 C 180 1260, 90 1330, -10 1360",
  "M 266 1250 C 360 1300, 470 1370, 610 1400",
];
const TRUNK_PATH = `M ${ROOT.x} ${ROOT.y - 5} C 268 860, 297 830, 297 780 L 297 560`;
const BRANCH_PATHS = [
  "M 297 560 C 250 540, 150 520, 60 470",
  "M 297 560 C 270 480, 200 420, 150 360",
  "M 297 560 C 297 470, 300 380, 300 270",
  "M 297 560 C 330 480, 400 420, 450 360",
  "M 297 560 C 350 540, 450 520, 545 470",
];
const BRANCH_LABELS = [
  { left: 32, top: 21.5 },
  { left: 36, top: 16.5 },
  { left: 50, top: 11.25 },
  { left: 64, top: 16.5 },
  { left: 68, top: 21.5 },
];
const GROUND_PATH = `M -600 ${GROUND_Y} C 0 ${GROUND_Y - 14}, 300 ${GROUND_Y + 10}, 1200 ${GROUND_Y - 6}`;

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

/* ─────────────── 나무 모양: logo.tsx 의 TREE_PATH ─────────────── */

const logo = readFileSync(join(ROOT_DIR, "src/components/logo.tsx"), "utf8");
const TREE_PATH = logo.match(/TREE_PATH\s*=\s*"([^"]+)"/)[1];

/* ─────────────── SVG 경로 → After Effects Shape(정점·접선) ─────────────── */

function svgToShapes(d, [dx, dy] = [0, 0]) {
  const toks = d.match(/[MLCZ]|-?\d*\.?\d+/gi);
  const subs = [];
  let i = 0;
  let cmd = null;
  let cur = null;
  const num = () => parseFloat(toks[i++]);
  const r = (v) => Math.round(v * 1000) / 1000;
  while (i < toks.length) {
    const t = toks[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t.toUpperCase();
      i++;
      if (cmd === "Z") {
        cur.closed = true;
        const n = cur.v.length;
        const [f, l] = [cur.v[0], cur.v[n - 1]];
        if (n > 1 && Math.abs(f[0] - l[0]) < 1e-6 && Math.abs(f[1] - l[1]) < 1e-6) {
          cur.i[0] = cur.i[n - 1];
          cur.v.pop();
          cur.i.pop();
          cur.o.pop();
        }
        cur = null;
      }
      continue;
    }
    if (cmd === "M") {
      cur = { v: [[r(num() + dx), r(num() + dy)]], i: [[0, 0]], o: [[0, 0]], closed: false };
      subs.push(cur);
      cmd = "L";
    } else if (cmd === "L") {
      cur.v.push([r(num() + dx), r(num() + dy)]);
      cur.i.push([0, 0]);
      cur.o.push([0, 0]);
    } else if (cmd === "C") {
      const c1 = [num() + dx, num() + dy];
      const c2 = [num() + dx, num() + dy];
      const p = [r(num() + dx), r(num() + dy)];
      const n = cur.v.length - 1;
      const p0 = cur.v[n];
      cur.o[n] = [r(c1[0] - p0[0]), r(c1[1] - p0[1])];
      cur.v.push(p);
      cur.i.push([r(c2[0] - p[0]), r(c2[1] - p[1])]);
      cur.o.push([0, 0]);
    } else {
      throw new Error(`지원하지 않는 경로 명령: ${cmd}`);
    }
  }
  return subs;
}

/* ─────────────── After Effects 로 넘길 데이터 ─────────────── */

const DATA = {
  W,
  H,
  FPS,
  DURATION,
  /** 한 화면(700 단위)이 영상 높이 1080px 에 맞도록 키우는 비율 */
  SCALE: H / VIEW_H,
  SCENE_W,
  SCENE_H,
  VIEW_H,
  ROOT,
  COLORS,
  STARTS,
  STEPS: STEPS.map((s) =>
    s.kind === "vision"
      ? { kind: "vision", title: VISION.title, description: VISION.description }
      : s,
  ),
  ROOT_TIPS: ROOT_TIPS.map((tip) => ({ ...tip, start: STARTS[tip.i], path: svgToShapes(rootPath(tip)) })),
  FINE_ROOTS: FINE_ROOTS.flatMap((d) => svgToShapes(d)),
  GROUND: svgToShapes(GROUND_PATH),
  TREE: svgToShapes(TREE_PATH, TREE_OFFSET),
  TRUNK: svgToShapes(TRUNK_PATH),
  BRANCHES: BRANCH_PATHS.map((d) => svgToShapes(d)),
  BRANCH_LABELS: VISION.branches.map((label, i) => ({
    label,
    x: (BRANCH_LABELS[i].left / 100) * SCENE_W,
    y: (BRANCH_LABELS[i].top / 100) * SCENE_H,
    start: 0.88 + i * 0.02,
  })),
  STARS,
  PEBBLES,
  GROUND_Y,
  /** 프로젝트(.aep)·렌더·로그를 저장할 폴더 */
  OUT_DIR,
};

// ExtendScript 가 파일 인코딩을 헷갈리지 않도록 한글 등 ASCII 밖 문자는 \uXXXX 로 적습니다.
const ascii = (s) => s.replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);

const builder = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "history-roots.builder.jsx"), "utf8");
mkdirSync(OUT_DIR, { recursive: true });
const outFile = join(OUT_DIR, "history-roots.jsx");
writeFileSync(outFile, ascii(`var DATA = ${JSON.stringify(DATA)};\n\n${builder}`));
console.log(`생성: ${outFile}`);
console.log(`단계 ${STEPS.length}개, 뿌리 ${ROOT_TIPS.length}개, 시작 진행도 ${STARTS.map((s) => s.toFixed(3)).join(", ")}`);
