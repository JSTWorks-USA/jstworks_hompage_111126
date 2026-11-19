"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { DoodleTheme } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * 인물 뒤에 깔리는 손그림 느낌의 선 그림.
 * 그 사람 역할에 맞춘 아이콘 네 개와, 별·동그라미·X·더하기·물결 같은 작은 장식을 흩뿌립니다.
 * 줄이 화면에 들어올 때마다 그림들이 사진 뒤에서 한두 개씩 슝슝 튀어나와 제자리에 섭니다.
 * 한 번에 몇 개가 나올지는 매번 무작위이고, 모든 그림이 2초 안에 다 나옵니다(화면 밖으로 나가면 다시 숨었다가 다음에 또 나옴).
 * 움직임을 줄인 사용자에게는 처음부터 제자리에 멈춘 그림이 보입니다(globals.css).
 *
 * 좌표: 600×600, 상자 위쪽에 붙여 그립니다. 인물 머리는 가운데(가로 220~380) 위쪽에 있으므로
 * 그림은 머리 양옆 위쪽과 좌우 가장자리에 둡니다. 각 아이콘은 100×100 칸에 그린 뒤 원하는 자리·크기로 옮깁니다.
 */

/* 100×100 칸 안의 선 아이콘 ─────────────────────────────── */

const ICON = {
  // 비행기 + 점선 항로 (미국 진출)
  plane: (
    <>
      <path d="M8 58 92 26 80 44 60 50 46 82 38 79 44 53 22 59 16 70 10 68Z" />
      <path d="M6 96Q30 70 52 72" strokeDasharray="4 7" />
    </>
  ),
  // 반짝임
  sparkle: <path d="M50 8C54 40 60 46 92 50 60 54 54 60 50 92 46 60 40 54 8 50 40 46 46 40 50 8Z" />,
  // 연필 (크리에이티브)
  pencil: (
    <>
      <path d="M18 82 24 60 68 16 84 32 40 76Z" />
      <path d="M60 24 76 40M24 60 40 76M18 82 30 79" />
    </>
  ),
  // 눈 (시선)
  eye: (
    <>
      <path d="M8 50Q50 12 92 50 50 88 8 50Z" />
      <circle cx="50" cy="50" r="13" />
    </>
  ),
  // 지구본 (해외영업)
  globe: (
    <>
      <circle cx="50" cy="50" r="40" />
      <ellipse cx="50" cy="50" rx="17" ry="40" />
      <path d="M10 50H90M16 30Q50 40 84 30M16 70Q50 60 84 70" />
    </>
  ),
  // 올라가는 그래프
  chart: (
    <>
      <path d="M10 84 38 56 56 70 88 32" />
      <path d="M70 32H88V50" />
    </>
  ),
  // 상자 (상품·배송)
  box: (
    <>
      <path d="M50 10 88 30V70L50 90 12 70V30Z" />
      <path d="M12 30 50 50 88 30M50 50V90" />
    </>
  ),
  // 자 (디테일)
  ruler: (
    <>
      <path d="M12 72 72 12 88 28 28 88Z" />
      <path d="M30 54 38 62M42 42 50 50M54 30 62 38" />
    </>
  ),
  // 소리 (젠틀복스 오디오)
  sound: (
    <>
      <path d="M10 40H26L44 24V76L26 60H10Z" />
      <path d="M58 36Q70 50 58 64M70 24Q90 50 70 76" />
    </>
  ),
  // 실험 플라스크 (연구)
  flask: (
    <>
      <path d="M38 10H62M44 10V40L18 84Q16 90 24 90H76Q84 90 82 84L56 40V10" />
      <path d="M28 68H72" />
    </>
  ),
  // 전구 (아이디어)
  bulb: (
    <>
      <path d="M50 14C32 14 22 28 24 42 26 54 36 60 38 70H62C64 60 74 54 76 42 78 28 68 14 50 14Z" />
      <path d="M38 78H62M42 87H58M50 2V-6M14 18 8 12M86 18 92 12" />
    </>
  ),
  // 방패 + 체크 (권리 보호)
  shield: (
    <>
      <path d="M50 8 86 20V46C86 70 70 84 50 92 30 84 14 70 14 46V20Z" />
      <path d="M33 50 46 63 68 38" />
    </>
  ),
  // 코드 괄호 (기술)
  code: <path d="M34 26 10 50 34 74M66 26 90 50 66 74M57 18 43 82" />,
  // 톱니 (엔지니어링)
  gear: (
    <>
      <circle cx="50" cy="50" r="24" />
      <circle cx="50" cy="50" r="9" />
      <path d="M50 10V22M50 78V90M10 50H22M78 50H90M22 22 30 30M70 70 78 78M78 22 70 30M30 70 22 78" />
    </>
  ),
  // 깃발 (도착·목표)
  flag: (
    <>
      <path d="M22 92V10" />
      <path d="M22 14C40 4 56 24 80 14V54C56 64 40 44 22 54" />
    </>
  ),
  // 별
  star: <path d="M50 8 61 36 92 38 68 58 76 90 50 72 24 90 32 58 8 38 39 36Z" />,
  // 말풍선
  chat: (
    <>
      <path d="M12 20H88V68H44L24 86V68H12Z" />
      <path d="M30 40H70M30 52H58" />
    </>
  ),
  // 위치 핀 (해외 지사)
  pin: (
    <>
      <path d="M50 92C50 92 18 58 18 38A32 32 0 0 1 82 38C82 58 50 92 50 92Z" />
      <circle cx="50" cy="38" r="11" />
    </>
  ),
  // 하트
  heart: (
    <path d="M50 86C22 64 8 48 8 32 8 18 20 10 32 10 40 10 46 14 50 22 54 14 60 10 68 10 80 10 92 18 92 32 92 48 78 64 50 86Z" />
  ),
  // 번개 (에너지)
  bolt: <path d="M58 6 18 56H46L38 94 82 40H54Z" />,
  // 음표 (소리)
  note: (
    <>
      <path d="M38 76V18L82 8V64" />
      <circle cx="28" cy="78" r="12" />
      <circle cx="72" cy="66" r="12" />
    </>
  ),
  // 자물쇠 (권리 보호)
  lock: (
    <>
      <rect x="18" y="44" width="64" height="46" rx="8" />
      <path d="M32 44V30A18 18 0 0 1 68 30V44M50 62V72" />
    </>
  ),
  // 칩 (하드웨어)
  chip: (
    <>
      <rect x="24" y="24" width="52" height="52" rx="6" />
      <rect x="38" y="38" width="24" height="24" rx="2" />
      <path d="M36 24V10M50 24V10M64 24V10M36 90V76M50 90V76M64 90V76M24 36H10M24 50H10M24 64H10M90 36H76M90 50H76M90 64H76" />
    </>
  ),
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof ICON;

/** 주제별 아이콘 네 개: [머리 왼쪽 위, 오른쪽 위(크게), 왼쪽 가장자리, 오른쪽 가장자리] */
const THEME: Record<DoodleTheme, [IconName, IconName, IconName, IconName]> = {
  export: ["sparkle", "plane", "box", "flag"],
  creative: ["eye", "pencil", "star", "chat"],
  global: ["chart", "globe", "pin", "plane"],
  product: ["ruler", "box", "heart", "star"],
  research: ["flask", "sound", "bolt", "note"],
  patent: ["shield", "bulb", "lock", "star"],
  tech: ["gear", "code", "chip", "bolt"],
};

/** 아이콘이 튀어나오기 시작하는 곳: 사진(인물 몸통) 뒤 가운데 */
const ORIGIN = { x: 300, y: 300 };
/** 한 아이콘이 튀어나오는 데 걸리는 시간(초, globals.css 의 doodle-pop 과 같게) */
const POP_SECONDS = 0.55;
/** 모든 아이콘이 다 나오는 데 걸리는 시간(초) */
const ALL_WITHIN_SECONDS = 2;
/** 한 번에 같이 튀어나오는 아이콘 수: 1 ~ 이 값 사이에서 무작위 */
const MAX_PER_BURST = 3;

/**
 * 튀어나오는 묶음. at 은 이 그림의 가운데 좌표(600×600 기준)이고,
 * 사진 뒤 가운데(ORIGIN)에서 at 까지의 거리를 --pop-x/--pop-y 로 넘겨 거기서부터 제자리로 날아오게 합니다.
 * 안쪽 내용은 자기 자리(transform 속성)를 그대로 지킵니다.
 */
function Pop({
  at,
  children,
  stroke,
  strokeWidth,
}: {
  at: [number, number];
  children: ReactNode;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <g
      className="doodle-pop"
      // 색은 CSS 변수(토큰)로 오므로 SVG 속성 대신 style 로 넣습니다(속성에는 var() 를 쓸 수 없음).
      // 거리는 그림 좌표 그대로입니다(SVG 안에서는 1px = 그림 좌표 1칸).
      style={
        { "--pop-x": `${ORIGIN.x - at[0]}px`, "--pop-y": `${ORIGIN.y - at[1]}px`, ...(stroke ? { stroke } : {}) } as CSSProperties
      }
      strokeWidth={strokeWidth}
    >
      {children}
    </g>
  );
}

/**
 * 아이콘들이 튀어나올 시각을 매번 무작위로 정합니다.
 * 순서를 섞은 뒤 1~MAX_PER_BURST 개씩 묶고, 묶음마다 같은 시각에 함께 나오게 합니다.
 * 마지막 묶음도 ALL_WITHIN_SECONDS 안에 다 나오도록 시작 시각을 고르게 나눕니다.
 */
function scheduleBursts(items: SVGGElement[]) {
  const order = [...items];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const bursts: SVGGElement[][] = [];
  for (let i = 0; i < order.length; ) {
    const size = 1 + Math.floor(Math.random() * MAX_PER_BURST);
    bursts.push(order.slice(i, i + size));
    i += size;
  }
  const lastStart = ALL_WITHIN_SECONDS - POP_SECONDS;
  bursts.forEach((burst, i) => {
    const start = bursts.length > 1 ? (lastStart * i) / (bursts.length - 1) : 0;
    burst.forEach((item) => item.style.setProperty("--pop-delay", `${start.toFixed(2)}s`));
  });
}

function Icon({ name, x, y, size }: { name: IconName; x: number; y: number; size: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size / 100})`}>{ICON[name]}</g>;
}

/** 작은 별(네 갈래 반짝임) */
const Twinkle = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <path
    d={`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`}
  />
);

/** 더하기 표시 */
const Plus = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <path d={`M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}`} />
);

/** X 표시 */
const Cross = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <path d={`M${x - r} ${y - r} ${x + r} ${y + r}M${x + r} ${y - r} ${x - r} ${y + r}`} />
);

/** 모든 줄에 공통으로 흩뿌리는 작은 장식 */
function Scatter({ accent }: { accent: string }) {
  return (
    <>
      {/* 머리 위 별들 */}
      <Pop at={[200, 34]}>
        <Twinkle x={200} y={34} r={13} />
      </Pop>
      <Pop at={[404, 22]} stroke={accent}>
        <Twinkle x={404} y={22} r={10} />
      </Pop>
      <Pop at={[572, 170]}>
        <Twinkle x={572} y={170} r={11} />
      </Pop>

      {/* 동그라미 · 더하기 · X */}
      <Pop at={[504, 210]}>
        <circle cx="504" cy="210" r="11" />
      </Pop>
      <Pop at={[150, 186]}>
        <Plus x={150} y={186} r={10} />
      </Pop>
      <Pop at={[34, 250]} stroke={accent}>
        <circle cx="34" cy="250" r="9" />
      </Pop>
      <Pop at={[541, 259]}>
        <Cross x={541} y={259} r={9} />
      </Pop>
      <Pop at={[568, 428]} stroke={accent}>
        <Cross x={568} y={428} r={8} />
      </Pop>
      <Pop at={[556, 356]}>
        <circle cx="556" cy="356" r="8" />
      </Pop>
      <Pop at={[520, 474]} stroke={accent}>
        <circle cx="520" cy="474" r="12" />
      </Pop>
      <Pop at={[556, 548]} stroke={accent}>
        <Cross x={556} y={548} r={8} />
      </Pop>
      <Pop at={[44, 372]}>
        <Plus x={44} y={372} r={8} />
      </Pop>

      {/* 물결 한 줄 */}
      <Pop at={[62, 160]}>
        <path d="M14 166Q30 150 46 166T78 166T110 166" />
      </Pop>

      {/* 왼쪽 아래 빛줄기 */}
      <Pop at={[74, 527]}>
        <path d="M58 492 30 524M84 508 70 562M108 502 118 548" />
      </Pop>

      {/* 점 */}
      <Pop at={[170, 40]}>
        <circle cx="170" cy="40" r="3.5" fill="currentColor" stroke="none" />
      </Pop>
      <Pop at={[430, 190]}>
        <circle cx="430" cy="190" r="3.5" stroke="none" style={{ fill: accent }} />
      </Pop>
      <Pop at={[140, 150]}>
        <circle cx="140" cy="150" r="3" fill="currentColor" stroke="none" />
      </Pop>
      <Pop at={[586, 300]}>
        <circle cx="586" cy="300" r="3" stroke="none" style={{ fill: accent }} />
      </Pop>
    </>
  );
}

export function PersonDoodles({
  theme,
  accent,
  className,
  style,
}: {
  theme: DoodleTheme;
  /** 강조색 (큰 아이콘과 몇몇 장식에 씁니다) */
  accent: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [topLeft, topRight, sideLeft, sideRight] = THEME[theme];
  const svgRef = useRef<SVGSVGElement>(null);

  // 줄이 화면에 충분히 들어오면 튀어나오기를 (무작위 순서로) 처음부터 다시 틀고,
  // 화면 밖으로 완전히 나가면 숨겨 두어 다음에 들어올 때 또 튀어나오게 합니다.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.35) {
          if (svg.hasAttribute("data-doodles-play")) return;
          scheduleBursts(Array.from(svg.querySelectorAll<SVGGElement>(".doodle-pop")));
          svg.setAttribute("data-doodles-play", "");
        } else if (!entry.isIntersecting) {
          svg.removeAttribute("data-doodles-play");
        }
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      // 상자가 세로로 길면 위쪽(머리 양옆)에 붙여 그립니다
      preserveAspectRatio="xMidYMin meet"
      aria-hidden="true"
      focusable="false"
      // 튀어나올 때 살짝 크게 튕기는 순간이 그림 가장자리에서 잘리지 않게 바깥으로 넘쳐도 보이게 둡니다
      className={cn("pointer-events-none overflow-visible", className)}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Scatter accent={accent} />
      {/* 아이콘은 줄여 그리므로 선을 그만큼 굵게 줘서 장식과 같은 굵기로 보이게 합니다 */}
      <Pop at={[82, 102]} strokeWidth={3.6}>
        <Icon name={topLeft} x={40} y={60} size={84} />
      </Pop>
      <Pop at={[497, 109]} stroke={accent} strokeWidth={2.3}>
        <Icon name={topRight} x={432} y={44} size={130} />
      </Pop>
      <Pop at={[52, 310]} stroke={accent} strokeWidth={4.2}>
        <Icon name={sideLeft} x={16} y={274} size={72} />
      </Pop>
      <Pop at={[552, 336]} strokeWidth={4.2}>
        <Icon name={sideRight} x={516} y={300} size={72} />
      </Pop>
    </svg>
  );
}
