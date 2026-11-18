import type { CSSProperties, ReactNode } from "react";
import type { DoodleTheme } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * 인물 뒤에 깔리는 손그림 느낌의 선 그림.
 * 동그라미·X·빛줄기 같은 작은 장식과, 그 사람 역할에 맞춘 아이콘 두 개(머리 양옆 빈자리)를 그립니다.
 *
 * 좌표: 600×600. 인물은 가운데(가로 120~480)에 서 있으므로 아이콘은 머리 양옆 위쪽과 가장자리에만 둡니다.
 * 각 아이콘은 100×100 칸에 그린 뒤 원하는 자리·크기로 옮깁니다.
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
  sparkle: (
    <path d="M50 8C54 40 60 46 92 50 60 54 54 60 50 92 46 60 40 54 8 50 40 46 46 40 50 8Z" />
  ),
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
  // 상자 (상품)
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
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof ICON;

/** 주제별 아이콘: [머리 왼쪽 위 작은 것, 오른쪽 위 큰 것] */
const THEME: Record<DoodleTheme, [IconName, IconName]> = {
  export: ["sparkle", "plane"],
  creative: ["eye", "pencil"],
  global: ["chart", "globe"],
  product: ["ruler", "box"],
  research: ["flask", "sound"],
  patent: ["shield", "bulb"],
  tech: ["gear", "code"],
};

function Icon({
  name,
  x,
  y,
  size,
}: {
  name: IconName;
  x: number;
  y: number;
  size: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 100})`}>{ICON[name]}</g>
  );
}

/** 모든 줄에 공통으로 흩뿌리는 작은 장식 (동그라미 · X · 빛줄기 · 점) */
function Scatter({ accent }: { accent: string }) {
  return (
    <>
      {/* 왼쪽 아래 빛줄기 (이름·경력 글씨 아래쪽) */}
      <path d="M58 492 30 524M84 508 70 562M108 502 118 548" />
      {/* 동그라미 */}
      <circle cx="504" cy="210" r="11" />
      <circle cx="556" cy="356" r="8" />
      <circle cx="520" cy="474" r="12" stroke={accent} />
      {/* X 표시 */}
      <path d="M560 420 576 436M576 420 560 436" stroke={accent} />
      <path d="M532 250 550 268M550 250 532 268" />
      <path d="M548 540 564 556M564 540 548 556" stroke={accent} />
      {/* 점 */}
      <circle cx="170" cy="40" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="430" cy="190" r="3.5" fill={accent} stroke="none" />
      <circle cx="140" cy="150" r="3" fill="currentColor" stroke="none" />
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
  /** 강조색 (아이콘 하나와 몇몇 장식에 씁니다) */
  accent: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [small, big] = THEME[theme];
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
      <g strokeWidth="3.6">
        <Icon name={small} x={40} y={60} size={84} />
      </g>
      <g stroke={accent} strokeWidth="2.3">
        <Icon name={big} x={432} y={44} size={130} />
      </g>
    </svg>
  );
}
