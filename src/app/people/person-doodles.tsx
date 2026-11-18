import type { CSSProperties, ReactNode } from "react";
import type { DoodleTheme } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * 인물 뒤에 깔리는 손그림 느낌의 선 그림.
 * 그 사람 역할에 맞춘 아이콘 네 개와, 별·동그라미·X·더하기·물결 같은 작은 장식을 흩뿌립니다.
 * 그림마다 둥실(위아래) · 살랑(기울기) · 산책(옆으로 왔다 갔다) · 반짝(크기) 움직임을
 * 서로 다른 박자로 줘서 귀엽게 살아 움직이게 합니다. 움직임을 줄인 사용자에게는 멈춘 그림만 보입니다(globals.css).
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

type Motion = "float" | "sway" | "wander" | "twinkle";

/**
 * 움직이는 묶음. 바깥 g 는 CSS 로 움직이고(transform-box: fill-box 로 그림 자기 중심 기준),
 * 안쪽 내용은 자기 자리(transform 속성)를 그대로 지킵니다.
 */
function Move({
  motion,
  dur,
  delay = 0,
  children,
  stroke,
  strokeWidth,
}: {
  motion: Motion;
  dur: number;
  delay?: number;
  children: ReactNode;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <g
      className={`doodle-${motion}`}
      style={{ "--doodle-dur": `${dur}s`, "--doodle-delay": `${delay}s` } as CSSProperties}
      stroke={stroke}
      strokeWidth={strokeWidth}
    >
      {children}
    </g>
  );
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
      {/* 머리 위 반짝이는 별들 */}
      <Move motion="twinkle" dur={1.8} delay={0.2}>
        <Twinkle x={200} y={34} r={13} />
      </Move>
      <Move motion="twinkle" dur={2.4} delay={1.1} stroke={accent}>
        <Twinkle x={404} y={22} r={10} />
      </Move>
      <Move motion="twinkle" dur={2.1} delay={0.6}>
        <Twinkle x={572} y={170} r={11} />
      </Move>

      {/* 동그라미 · 더하기 · X 가 둥실 떠다니고 살랑 흔들립니다 */}
      <Move motion="float" dur={3.2} delay={0.4}>
        <circle cx="504" cy="210" r="11" />
      </Move>
      <Move motion="float" dur={2.8} delay={1.4}>
        <Plus x={150} y={186} r={10} />
      </Move>
      <Move motion="float" dur={3.6} delay={0.9} stroke={accent}>
        <circle cx="34" cy="250" r="9" />
      </Move>
      <Move motion="sway" dur={2.6} delay={0.3}>
        <Cross x={541} y={259} r={9} />
      </Move>
      <Move motion="sway" dur={3} delay={1.6} stroke={accent}>
        <Cross x={568} y={428} r={8} />
      </Move>
      <Move motion="float" dur={3.4} delay={0.7}>
        <circle cx="556" cy="356" r="8" />
      </Move>
      <Move motion="float" dur={2.9} delay={2} stroke={accent}>
        <circle cx="520" cy="474" r="12" />
      </Move>
      <Move motion="sway" dur={3.3} delay={0.5} stroke={accent}>
        <Cross x={556} y={548} r={8} />
      </Move>
      <Move motion="float" dur={3.1} delay={1.2}>
        <Plus x={44} y={372} r={8} />
      </Move>

      {/* 물결 한 줄이 옆으로 산책합니다 */}
      <Move motion="wander" dur={4.2} delay={0.8}>
        <path d="M14 166Q30 150 46 166T78 166T110 166" />
      </Move>

      {/* 왼쪽 아래 빛줄기 */}
      <Move motion="twinkle" dur={2.2} delay={0.4}>
        <path d="M58 492 30 524M84 508 70 562M108 502 118 548" />
      </Move>

      {/* 점 */}
      <Move motion="twinkle" dur={1.6} delay={0.9}>
        <circle cx="170" cy="40" r="3.5" fill="currentColor" stroke="none" />
      </Move>
      <Move motion="twinkle" dur={1.9} delay={0.2}>
        <circle cx="430" cy="190" r="3.5" fill={accent} stroke="none" />
      </Move>
      <Move motion="twinkle" dur={2.3} delay={1.5}>
        <circle cx="140" cy="150" r="3" fill="currentColor" stroke="none" />
      </Move>
      <Move motion="twinkle" dur={1.7} delay={1}>
        <circle cx="586" cy="300" r="3" fill={accent} stroke="none" />
      </Move>
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
  return (
    <svg
      viewBox="0 0 600 600"
      // 상자가 세로로 길면 위쪽(머리 양옆)에 붙여 그립니다
      preserveAspectRatio="xMidYMin meet"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none", className)}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Scatter accent={accent} />
      {/* 아이콘은 줄여 그리므로 선을 그만큼 굵게 줘서 장식과 같은 굵기로 보이게 합니다 */}
      <Move motion="sway" dur={3.4} delay={0.2} strokeWidth={3.6}>
        <Icon name={topLeft} x={40} y={60} size={84} />
      </Move>
      <Move motion="wander" dur={4.6} stroke={accent} strokeWidth={2.3}>
        <Icon name={topRight} x={432} y={44} size={130} />
      </Move>
      <Move motion="float" dur={3.8} delay={1.1} stroke={accent} strokeWidth={4.2}>
        <Icon name={sideLeft} x={16} y={274} size={72} />
      </Move>
      <Move motion="sway" dur={3} delay={0.7} strokeWidth={4.2}>
        <Icon name={sideRight} x={516} y={300} size={72} />
      </Move>
    </svg>
  );
}
