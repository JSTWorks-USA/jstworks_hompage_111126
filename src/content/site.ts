// 홈페이지 콘텐츠. [대괄호] 값은 확정 전 자리 표시입니다.

/* ──────────────────────────── 연혁 ──────────────────────────── */

/**
 * 연혁이 놓이는 뿌리(갈래). 연혁 장면 땅속에서 색이 다른 선 하나씩이 되어, 위로 올라오며 하나로 모입니다.
 * 왼쪽부터 조슈아트리웍스(회사 전체의 일), K-GANADA™, 젠틀복스, 타사 제품(독점 영업권 등) 순서입니다.
 */
export type HistoryLane = "company" | "kganada" | "gentlevox" | "partner";
export type HistoryLaneInfo = {
  id: HistoryLane;
  /** 연혁 글에서 연·월 뒤에 붙는 갈래 이름 */
  label: string;
  /** 넓은 화면에서 연혁 카드를 선의 어느 쪽에 띄울지 */
  side: "left" | "right";
};
export const HISTORY_LANES: HistoryLaneInfo[] = [
  { id: "company", label: "조슈아트리웍스", side: "left" },
  { id: "kganada", label: "K-GANADA™", side: "left" },
  { id: "gentlevox", label: "젠틀복스", side: "right" },
  { id: "partner", label: "타사 제품 독점영업권", side: "right" },
];

/**
 * 연혁. date 는 순서를 정하는 데만 쓰고, 화면에는 연·월만 보여 줍니다.
 * note: 내용 바로 뒤에 작게 붙는 글, sub: 내용 아랫줄에 이어지는 글
 */
export type HistoryItem = { date: string; text: string; note?: string; sub?: string; lane: HistoryLane };
export const HISTORY: HistoryItem[] = [
  { date: "2025.12.15", text: "조슈아트리웍스 창업, 연구소 설립", lane: "company" },
  { date: "2026.01.07", text: "캐릭터굿즈 특허 아이디어 발의", lane: "gentlevox" },
  { date: "2026.01.07", text: "아티스트굿즈 특허출원", lane: "kganada" },
  {
    date: "2026.03.17",
    text: "미국법인설립",
    note: "(캘리포니아, 얼바인)",
    lane: "company",
  },
  { date: "2026.03.17", text: "젠틀복스 개발 발의", lane: "gentlevox" },
  { date: "2026.06.08", text: "미국 상표권 출원", lane: "kganada" },
  {
    date: "2026.07.20",
    text: "삼익제약 요리엔정수기",
    sub: "미국 독점영업권계약 체결",
    lane: "partner",
  },
  { date: "2026.08.06", text: "캐릭터굿즈 특허 출원", lane: "gentlevox" },
  { date: "2026.08.26", text: "아티스트굿즈 특허 등록", lane: "kganada" },
  {
    date: "2026.09.23",
    text: "뷰티 디바이스",
    note: "(제우스 III, 제오니스)",
    sub: "미국 및 중동 독점계약 체결",
    lane: "partner",
  },
  { date: "2026.10.06", text: "벤처확인기업 등록", lane: "company" },
  { date: "2026.10.21", text: "삼익제약 요리엔정수기", sub: "초도 물량 미국 선적", lane: "partner" },
];

/** 연혁 장면 맨 위(가지 끝)에 보여 줄 비전. branches 는 가지 이름표입니다(순서는 장면의 BRANCH_LABELS 와 같음, K-Food 는 아직 없음) */
export const VISION = {
  /** 비전 위에 작게 붙는 설명 */
  lead: "검증된 한국브랜드의 독점영업권 및 자사 IP를 결합한",
  title: "미국향 커머스 플랫폼",
  branches: ["K-Beauty", "K-Charm", "K-Play", "K-Apparel", "K-Living"] as BusinessCategory[],
};

/** 연혁: 가지 이름표에 마우스를 올리면(휴대폰은 누르면) 뜨는 말풍선 (진행 중인 프로젝트 소개) */
export type VisionDetail = {
  title: string;
  body: string;
  /**
   * 사진이 없으면 카테고리 아이콘을 대신 보여 줍니다.
   * fit: "contain" 은 흰 바탕 제품 사진처럼 잘리면 안 되는 사진(흰 칸에 통째로 넣습니다)
   */
  image?: { src: string; alt: string; width: number; height: number; fit?: "cover" | "contain" };
};

/** 내용이 없는 카테고리는 이름표에 "(준비중)"으로 표시합니다 */
export const VISION_DETAILS: Partial<Record<BusinessCategory, VisionDetail>> = {
  "K-Play": {
    title: "젠틀복스 Gentle Vox",
    body: "가족이 앱에 남긴 목소리를 큐브 스피커로 들려주는 스마트 오디오 토이입니다.",
  },
  "K-Living": {
    title: "삼익제약 요리엔 정수기",
    body: "조슈아트리웍스와 삼익제약은 미국 독점영업권계약을 체결하여 미국시장에 진출합니다.",
    image: {
      src: "/images/news/yorien-pitcher-kitchen.webp",
      alt: "주방 조리대 위에 놓인 나무 손잡이 YORIEN 정수 피처",
      width: 1440,
      height: 960,
    },
  },
  "K-Beauty": {
    title: "제오니스 · 제우스 III",
    body: "뷰티 디바이스 제오니스와 제우스 III의 미국 및 중동 독점계약을 체결했습니다.",
    // 흰 바탕에 두 제품이 나란히 있는 정사각 사진이라 잘리지 않게 통째로 보여 줍니다.
    image: {
      src: "/images/business/beauty-devices.webp",
      alt: "뷰티 디바이스 제오니스(왼쪽)와 제우스 III(오른쪽)",
      width: 800,
      height: 800,
      fit: "contain",
    },
  },
};

/* ──────────────────────────── 날짜 정렬 ──────────────────────────── */

/**
 * 날짜 문구를 정렬용 숫자(YYYYMMDD)로 바꿉니다.
 * "2026.10.14" 형식과 "2026 3Q" 같은 분기 표기를 읽고(분기는 그 분기의 첫날), 읽을 수 없는 값은 null 입니다.
 */
export function dateKey(date: string): number | null {
  const day = date.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
  if (day) return Number(day[1]) * 10000 + Number(day[2]) * 100 + Number(day[3]);
  const quarter = date.match(/^(\d{4})\s*([1-4])Q$/i);
  if (quarter) return Number(quarter[1]) * 10000 + ((Number(quarter[2]) - 1) * 3 + 1) * 100 + 1;
  return null;
}

/**
 * 최신 날짜가 먼저 오도록 정렬합니다. 날짜를 읽을 수 없거나 last(예: 내용 없는 자리 표시)에 해당하면 맨 뒤로 보냅니다.
 * 맨 뒤로 간 항목끼리, 같은 날짜끼리는 원래 적힌 순서를 지킵니다.
 */
function sortByDateDesc<T extends { date: string }>(items: T[], last?: (item: T) => boolean): T[] {
  return items
    .map((item, order) => ({ item, order, key: last?.(item) ? null : dateKey(item.date) }))
    .sort((a, b) => {
      if (a.key === null && b.key === null) return a.order - b.order;
      if (a.key === null) return 1;
      if (b.key === null) return -1;
      return b.key - a.key || a.order - b.order;
    })
    .map(({ item }) => item);
}

/* ──────────────────────────── 특허·상표권 ──────────────────────────── */

export type IpStatus = "registered" | "filed" | "planned" | "certified";
export type IpItem = {
  status: IpStatus;
  badge: string;
  title: string;
  date: string;
  /** A4 문서 이미지 자리 표시 문구 (이미지가 오면 image에 경로를 넣습니다) */
  document: string;
  /**
   * 화면용 저해상도 이미지(글씨가 겨우 보일 정도). 원본은 공개 폴더 밖
   * assets/originals/certificates/ 에 따로 보관합니다.
   */
  image?: string;
  note?: string[];
};

/** 작성 순서는 상관없습니다. 화면에는 아래 IP_ITEMS(날짜순)를 씁니다. */
const IP_ITEMS_RAW: IpItem[] = [
  {
    status: "registered",
    badge: "특허 등록",
    title: "아티스트 굿즈",
    date: "2026.08.26",
    document: "한국 특허증 이미지 자리",
    image: "/images/certificates/patent-10-3012294.webp",
    note: [""],
  },
  {
    status: "filed",
    badge: "특허 출원",
    title: "캐릭터 굿즈",
    date: "2026.08.06",
    document: "한국 특허 출원서 이미지 자리",
  },
  {
    status: "filed",
    badge: "USPTO 상표 출원",
    title: "K-GANADA™ 4건",
    date: "2026.06.08",
    document: "상표 출원서 이미지 자리",
    note: [""],
  },
  {
    status: "planned",
    badge: "예정",
    title: "PCT 국제특허",
    date: "2027.01.08",
    document: "국제특허 출원서 이미지 자리",
  },
  {
    status: "certified",
    badge: "정회원",
    title: "벤처기업협회",
    date: "2026.10.06",
    document: "벤처기업협회 회원증 이미지 자리",
    image: "/images/certificates/venture-association-membership.webp",
  },
];

/** 최신 날짜 → 과거 날짜 순서로 정렬합니다(예정 항목도 날짜대로). 날짜가 없는 항목만 맨 뒤로 보냅니다. */
export const IP_ITEMS: IpItem[] = sortByDateDesc(IP_ITEMS_RAW);

/* ──────────────────────────── 구성원 ──────────────────────────── */

/** People 줄 배경의 선 그림 주제 (src/app/people/person-doodles.tsx) */
export type DoodleTheme = "export" | "creative" | "global" | "product" | "research" | "patent" | "tech";

export type Person = {
  name: string;
  role: string;
  /** 부문 아래 소속 팀. 있을 때만 이름 위에 작게 표시합니다 (예: 젠틀복스) */
  unit?: string;
  /**
   * 인물 사진. 사진이 아직 없으면 비워 두세요. 그 자리에 실루엣이 보입니다.
   * 배경을 오려 낸 투명 사진(누끼)이면 cutout 에 크기를 함께 적습니다.
   */
  photo?: string;
  /**
   * photo 가 배경을 오려 낸 고해상도 투명 이미지일 때 그 원본 크기(px).
   * 네모 칸 없이 줄 높이에 가깝게 크게, 줄 바닥에 붙여 보여 줍니다.
   * 머리 위에서 바로 자르고 아래쪽(허리선)은 사진 끝까지 두면 자연스럽습니다.
   */
  cutout?: { width: number; height: number };
  /** 줄 배경색. 비워 두면 기본 색(검정·회색·민트)을 번갈아 씁니다 */
  background?: string;
  /** 인물 뒤에 그리는 선 그림 주제 (역할에 맞춘 작은 아이콘들) */
  doodle?: DoodleTheme;
  alt: string;
  /** 주요 경력. 위에서부터 최근 순. 괄호로 시작하는 줄(예: "(호주 등 …)")은 위 줄의 덧붙임으로 한 단계 작게 보입니다 */
  career: string[];
  /** 사진 반대편에 크게 보이는 인물별 헤드라인. 줄바꿈(\n) 위치 그대로 보여 줍니다. */
  quote: string;
};

export type Division = {
  /** 페이지 안 위치 주소(#id). 하단 메뉴에서 이 부문으로 바로 이동합니다 */
  id: string;
  name: string;
  /** 조직도 순서: 부문장 → 부문 구성원 */
  people: Person[];
};

/** 조직도 순서대로 묶은 구성원. 부문 이름이 People 페이지의 구분 제목이 됩니다. */
export const PEOPLE_DIVISIONS: Division[] = [
  {
    id: "management",
    name: "경영",
    people: [
      {
        name: "이우용",
        role: "대표이사 (CEO)",
        photo: "/images/people/lee-wooyong-cutout.webp",
        cutout: { width: 775, height: 1200 },
        background: "#00441E",
        doodle: "export",
        alt: "이우용 대표이사",
        career: ["덕우전자 미국법인장", "LG전자 해외영업", "미국공인회계사"],
        quote: "좋은 한국 제품이\n미국에서 다시 찾는 제품이 되도록.",
      },
      {
        name: "길용준",
        role: "CIPO (지식재산)",
        photo: "/images/people/gil-yongjun-cutout.webp",
        cutout: { width: 726, height: 1200 },
        background: "#00441E",
        doodle: "patent",
        alt: "길용준 CIPO",
        career: ["AMD, LG전자, 삼성에버랜드 특허"],
        quote: "아이디어가 자산이 되는 순간까지\n권리로 완성합니다.",
      },
    ],
  },
  {
    id: "brand",
    name: "브랜드부문",
    people: [
      {
        name: "박재모",
        role: "Co-founder & Creative",
        photo: "/images/people/park-jaemo-cutout.webp",
        cutout: { width: 1063, height: 1200 },
        background: "#6300A9",
        doodle: "creative",
        alt: "박재모 Co-founder & Creative",
        career: ["상암커뮤니케이션즈", "머큐리프로젝트 E.CD"],
        quote: "말을 잘하는 것은 쉽다",
      },
      {
        name: "이주황",
        role: "CTO",
        photo: "/images/people/lee-juhwang-cutout.webp",
        cutout: { width: 724, height: 1200 },
        background: "#F7F8F9",
        doodle: "tech",
        alt: "이주황 CTO",
        career: ["현대자동차 R&D", "서울대 기계항공 졸업"],
        quote: "기술은 앞에 서지 않아도\n경험을 바꿀 수 있습니다.",
      },
      {
        name: "윤정원",
        role: "책임연구원",
        unit: "젠틀복스",
        photo: "/images/people/yoon-jeongwon-cutout.webp",
        cutout: { width: 801, height: 1200 },
        background: "#001D3D",
        doodle: "research",
        alt: "윤정원 책임연구원",
        career: ["브라이트랩", "유즈브레인넷"],
        quote: "기술의 가능성을 설계하고,\n현실로 구현합니다.",
      },
    ],
  },
  {
    id: "global-sales",
    name: "해외영업부문",
    people: [
      {
        name: "김종효",
        role: "COO/전무",
        photo: "/images/people/kim-jonghyo-cutout.webp",
        cutout: { width: 650, height: 1200 },
        background: "#A94400",
        doodle: "global",
        alt: "김종효 COO",
        career: ["LG전자 해외영업 30년", "(호주 등 5개국 17년 해외주재)"],
        quote: "시장과 실행 사이,\n빈틈을 남기지 않습니다.",
      },
      {
        name: "김진욱",
        role: "상품개발 부장",
        photo: "/images/people/kim-jinwook-cutout.webp",
        cutout: { width: 745, height: 1200 },
        background: "#F7F8F9",
        doodle: "product",
        alt: "김진욱 상품개발 부장",
        career: ["플랫코퍼레이션", "키세스"],
        quote: "좋은 제품은 결국\n디테일에서 차이가 납니다.",
      },
    ],
  },
];
/** People 페이지에 보여 주는 순서 (부문과 상관없이 이 순서대로 한 줄씩) */
const PEOPLE_ORDER = ["이우용", "박재모", "김종효", "김진욱", "윤정원", "길용준", "이주황"];

const ALL_PEOPLE = PEOPLE_DIVISIONS.flatMap((division) => division.people);
export const PEOPLE: Person[] = [
  ...PEOPLE_ORDER.flatMap((name) => ALL_PEOPLE.filter((person) => person.name === name)),
  // 순서 목록에 없는 사람은 맨 뒤에 원래 순서대로 붙입니다
  ...ALL_PEOPLE.filter((person) => !PEOPLE_ORDER.includes(person.name)),
];


/* ──────────────────────────── 비즈니스 카테고리 ──────────────────────────── */

/** Business 페이지 위쪽 카테고리 카드 순서. 카드를 누르면 그 카테고리의 자사 IP·타사 제품이 아래에 보입니다 */
export const BUSINESS_CATEGORIES = ["K-Play", "K-Living", "K-Beauty", "K-Apparel", "K-Charm", "K-Food"] as const;
export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

/* ──────────────────────────── 독점 판권 브랜드 ──────────────────────────── */

export type Brand = {
  name: string;
  /** Business 카테고리(K-Living 등) */
  kCategory: BusinessCategory;
  category: string;
  /** 강점을 한 줄로 말하는 카피 (시안) */
  tagline: string;
  description: string;
  /** 일정 등 상태 표시 */
  status?: string;
  /** 제품 구성 이미지는 추후 교체합니다 */
  images: { src: string; alt: string }[];
  /**
   * 브랜드 줄 배경 사진. 카피 상자가 놓이는 쪽(첫 줄은 왼쪽)이 비어 있는 사진을 씁니다.
   * width·height: 사진 크기(px)
   * focus: 화면 가운데에 둘 제품 위치(사진 가로·세로 대비 0~1). 화면 비율이 어떻든 이 점이 가운데에 오고,
   *        사진 끝이 드러나야 할 만큼 치우치면 끝에 맞춰 멈춥니다(빈 곳이 생기지 않게).
   */
  background?: { src: string; alt: string; width: number; height: number; focus: { x: number; y: number } };
};

export const BRANDS: Brand[] = [
  {
    name: "YORIEN",
    kCategory: "K-Living",
    category: "삼익제약 정수기",
    tagline: "매일 마시는 물, 제약사가 만듭니다",
    description: "삼익제약의 정수기 YORIEN을 미국 가정의 주방에 소개합니다.",
    status: "2026년 12월 미국 출시 예정",
    images: [{ src: "/images/business/yorien.webp", alt: "YORIEN 정수기" }],
    // 제품이 가운데 오른쪽에 있고 왼쪽 빈 벽에 카피 상자를 둡니다(로고 글자는 제 방향으로 고쳤습니다).
    background: {
      src: "/images/business/yorien-pitcher.jpg",
      alt: "나무 손잡이가 달린 YORIEN 정수 피처와 물이 담긴 유리잔",
      width: 2400,
      height: 1534,
      // 정수 피처 몸통 가운데
      focus: { x: 0.6, y: 0.58 },
    },
  },
];

/* ──────────────────────────── 보도·소식 ──────────────────────────── */

export type NewsKind = "보도" | "소식";
export type NewsItem = {
  /** 글 번호: 주소가 /media/번호 가 됩니다. 새 글은 가장 큰 번호 + 1 을 씁니다(바꾸지 않습니다) */
  id: number;
  /** 본문 마크다운 파일 이름(src/content/news/<slug>.md). 예전 주소(/media/slug)는 번호 주소로 넘겨 줍니다 */
  slug: string;
  date: string;
  kind: NewsKind;
  title: string;
  source: string;
  /** 본문 단락 */
  body: string[];
  /**
   * 대표 이미지 (없으면 자리 표시).
   * fit: "contain" 은 로고처럼 잘리면 안 되는 이미지, focus: "right" 는 칸이 좁을 때 오른쪽을 남기고 왼쪽부터 자릅니다.
   */
  cover?: {
    src: string;
    alt: string;
    /** 사진 원래 크기(px). 글 보기에서 사진을 이 크기 기준으로(늘리지 않고) 보여 줍니다 */
    width: number;
    height: number;
    fit?: "cover" | "contain";
    focus?: "center" | "right";
    /** 사진 왼쪽 가운데에 얹는 흰색 로고(가로형 SVG) */
    logo?: { src: string; alt: string; width: number; height: number };
  };
  /** 원문 링크 (보도) */
  href?: string;
  /** 확정 전 자리 표시 항목 */
  placeholder?: boolean;
};

/** 작성 순서는 상관없습니다. 화면에는 아래 NEWS(날짜순)를 씁니다. */
const NEWS_ITEMS: NewsItem[] = [
  {
    // 연혁 2026.03.17 "미국법인설립 (캘리포니아, 얼바인)"과 같은 날짜입니다.
    id: 7,
    slug: "us-corporation-founded",
    date: "2026.03.17",
    kind: "소식",
    title: "미국 법인 설립",
    source: "JSTWorks",
    // 본문은 src/content/news/us-corporation-founded.md 에 있습니다(이 단락은 파일이 없을 때만 보입니다).
    body: ["조슈아트리웍스가 미국 캘리포니아주 얼바인(Irvine)에 미국 현지 법인 H&H USA LLC를 설립했습니다."],
  },
  {
    id: 4,
    slug: "fandom-goods-patent-sentv",
    date: "2026.10.12",
    kind: "보도",
    title: "“피규어가 이름 불러줘요”…조슈아트리웍스, 팬덤 굿즈 특허",
    source: "서울경제TV",
    // 기사 사진(서울경제TV, 사진=조슈아트리웍스): K-GANADA™ 로고. 잘리지 않게 통째로 보여 줍니다
    cover: {
      src: "/images/news/fandom-goods-patent-sentv.webp",
      width: 800,
      height: 266,
      alt: "K-GANADA™ 로고",
      fit: "contain",
    },
    // 상세 본문은 src/content/news/fandom-goods-patent-sentv.md 에 있습니다. 아래 body 는 마크다운이 없을 때의 대체 문구입니다.
    body: [
      "서울경제TV가 조슈아트리웍스의 팬덤 굿즈 특허와 2027년 미국 스마트 토이 시장 진출 계획을 보도했습니다.",
      "기사 전문은 서울경제TV에서 볼 수 있습니다.",
    ],
  },
  {
    id: 3,
    slug: "artist-goods-patent",
    date: "2026.08.26",
    kind: "소식",
    title: "아티스트 굿즈 특허 등록",
    source: "JSTWorks",
    // 특허증 제10-3012294호 (가수의 음원과 연동되는 물품을 이용한 가수 이벤트 영상 제공 방법)
    cover: {
      src: "/images/certificates/patent-10-3012294.webp",
      width: 283,
      height: 400,
      alt: "특허증 제10-3012294호",
      fit: "contain",
    },
    body: [
      "조슈아트리웍스가 아티스트 굿즈 특허를 등록했습니다.",
      "2026년 1월에 출원한 특허로, 같은 해 8월 등록을 마쳤습니다.",
    ],
  },
  {
    id: 2,
    slug: "yorien-us-exclusive",
    date: "2026.10.19",
    kind: "보도",
    title: "삼익제약, 프리미엄 정수기 '요리엔 샤블리' 미국 첫 수출",
    source: "메디칼타임즈",
    // 사진 파일은 1440×960, 글 보기에서는 720px 폭으로 작게 보여 줍니다(선명도를 위해 2배 크기 파일)
    cover: {
      src: "/images/news/yorien-pitcher-kitchen.webp",
      alt: "주방 조리대 위에 놓인 나무 손잡이 YORIEN 정수 피처",
      width: 720,
      height: 480,
    },
    // 상세 본문은 src/content/news/yorien-us-exclusive.md 에 있습니다(메디칼타임즈 기사를 정리한 글).
    body: [
      "메디칼타임즈가 삼익제약 요리엔 샤블리의 미국 첫 수출 소식을 보도했습니다.",
      "미국 판매 파트너는 조슈아트리웍스입니다.",
    ],
  },
  {
    id: 1,
    slug: "k-ganada-us-trademark",
    date: "2026.06.08",
    kind: "소식",
    title: "K-GANADA™ 미국 상표 출원",
    source: "USPTO",
    cover: {
      src: "/images/news/k-ganada-us-trademark.webp",
      width: 1920,
      height: 826,
      alt: "밤하늘을 배경으로 횃불을 든 자유의 여신상과 옛 미국 문서",
      focus: "right",
      // 이 글 처음에 쓰던 K-GANADA™ 로고를 사진 왼쪽 하늘 위에 얹습니다.
      logo: { src: "/images/k-ganada-logo.svg", alt: "K-GANADA™", width: 1823, height: 227 },
    },
    // 상세 본문은 src/content/news/k-ganada-us-trademark.md 에 있습니다. 아래 body 는 마크다운이 없을 때의 대체 문구입니다.
    body: [
      "K-GANADA™ 상표 4건을 미국 특허상표청(USPTO)에 출원했습니다.",
      "출원번호는 99870826, 99870856, 99870920, 99870958입니다.",
    ],
  },
];

/** 최신 날짜 → 과거 날짜 순서로 정렬합니다. 내용이 없는 글(자리 표시)과 날짜가 없는 글만 맨 뒤로 보냅니다. */
export const NEWS: NewsItem[] = sortByDateDesc(NEWS_ITEMS, (item) => item.placeholder === true);

/* ──────────────────────────── 오시는 길 ──────────────────────────── */

export const OFFICE_LOCATIONS = [
  {
    eyebrow: "한국 본사",
    name: "조슈아트리웍스 주식회사",
    address: "Joshuatree Building, Yeoksam-ro 26-gil 5, Gangnam-Gu, Seoul, Republic of Korea",
    localAddress: "서울 강남구 역삼로26길 5, 조슈아트리빌딩",
    /** Google 지도에서 찾을 주소 */
    mapQuery: "서울 강남구 역삼로26길 5",
  },
  {
    eyebrow: "미국 법인",
    name: "H&H USA LLC",
    address: "17595 Harvard Ave, Suite C, Irvine, CA 92614",
    localAddress: "캘리포니아 얼바인",
    mapQuery: "17595 Harvard Ave, Suite C, Irvine, CA 92614",
  },
];
