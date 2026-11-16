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
  { date: "2026.01.07", text: "캐릭터 굿즈특허 개발 착수", lane: "kganada" },
  { date: "2026.01.07", text: "아티스트굿즈 특허출원", lane: "gentlevox" },
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
    text: "삼익제약, 요리엔정수기",
    sub: "미국 독점영업권계약 체결",
    lane: "partner",
  },
  { date: "2026.08.06", text: "캐릭터 굿즈 특허 출원", lane: "gentlevox" },
  { date: "2026.08.26", text: "아티스트굿즈 특허 등록", lane: "kganada" },
  { date: "2026.09.23", text: "제우스 3, 제오니스 미국 및 중동 독점 계약 체결", lane: "partner" },
  { date: "2026.10.06", text: "벤처확인기업 등록", lane: "company" },
  { date: "2026.10.21", text: "삼익제약 요리엔", sub: "미국 초도 물량 선적", lane: "partner" },
];

/** 연혁 장면 맨 위(가지 끝)에 보여 줄 비전. branches 는 나무 왼쪽부터 붙는 이름표입니다(왼쪽 셋, 오른쪽 셋) */
export const VISION = {
  title: "K-IP 커머스 플랫폼",
  branches: ["K-Beauty", "K-Charm", "K-Play", "K-Apparel", "K-Living", "K-Food"],
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
    badge: "혁신성장유형",
    title: "벤처확인기업",
    date: "2026.09.23",
    document: "벤처확인기업 명판 이미지 자리",
    image: "/images/certificates/venture-confirmation-plaque.webp",
    note: [""],
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

export type Person = {
  name: string;
  role: string;
  /** 부문 아래 소속 팀. 있을 때만 이름 위에 작게 표시합니다 (예: 젠틀복스) */
  unit?: string;
  /**
   * 인물 사진. 배경을 오려 낸 세로 4:5 투명 이미지(예: 800×1000 WebP/PNG)로 교체할 예정입니다.
   * 줄 아래 끝에 붙여 보여 주므로, 사진 아래쪽(가슴·허리선)이 잘린 상태로 오리면 자연스럽습니다.
   * 사진이 아직 없으면 비워 두세요. 그 자리에 실루엣이 보입니다.
   */
  photo?: string;
  alt: string;
  /** 주요 경력. 위에서부터 최근 순 */
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
        photo: "/images/people/lee-wooyong.webp",
        alt: "이우용 대표이사",
        career: ["덕우전자 미국법인장", "LG전자 해외영업", "미국공인회계사"],
        quote: "좋은 한국 제품이\n미국에서 다시 찾는 제품이 되도록.",
      },
      {
        name: "길용준",
        role: "CIPO (지식재산)",
        photo: "/images/people/gil-yongjun.webp",
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
        photo: "/images/people/park-jaemo.webp",
        alt: "박재모 Co-founder & Creative",
        career: ["상암커뮤니케이션즈", "머큐리프로젝트 E.CD"],
        quote: "한 번의 시선이\n한 번의 선택이 되도록.",
      },
      {
        name: "이주황",
        role: "CTO",
        photo: "/images/people/lee-juhwang.webp",
        alt: "이주황 CTO",
        career: ["현대자동차 R&D", "서울대 기계항공 졸업"],
        quote: "기술은 앞에 서지 않아도\n경험을 바꿀 수 있습니다.",
      },
      {
        // 사진 준비 전
        name: "윤정원",
        role: "책임연구원",
        unit: "젠틀복스",
        alt: "윤정원 책임연구원",
        career: ["브라이트랩", "유즈브레인넷"],
        quote: "될 때까지 실험하는 일이\n기술을 현실로 만듭니다.",
      },
    ],
  },
  {
    id: "global-sales",
    name: "해외영업부문",
    people: [
      {
        name: "김종효",
        role: "COO",
        photo: "/images/people/kim-jonghyo.webp",
        alt: "김종효 COO",
        career: ["LG전자 두바이 법인장", "LG전자 호주 주재원"],
        quote: "시장과 실행 사이에\n빈칸을 남기지 않습니다.",
      },
      {
        name: "김진욱",
        role: "상품개발 부장",
        photo: "/images/people/kim-jinwook.webp",
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


/* ──────────────────────────── 독점 판권 브랜드 ──────────────────────────── */

export type Brand = {
  name: string;
  category: string;
  /** 강점을 한 줄로 말하는 카피 (시안) */
  tagline: string;
  description: string;
  /** 일정 등 상태 표시 */
  status?: string;
  /** 제품 구성 이미지는 추후 교체합니다 */
  images: { src: string; alt: string }[];
};

export const BRANDS: Brand[] = [
  {
    name: "YORIEN",
    category: "삼익제약 정수기",
    tagline: "매일 마시는 물, 제약사가 만듭니다",
    description: "삼익제약의 정수기 YORIEN을 미국 가정의 주방에 소개합니다.",
    status: "2026년 12월 미국 출시 예정",
    images: [{ src: "/images/business/yorien.webp", alt: "YORIEN 정수기" }],
  },
];

/* ──────────────────────────── 보도·소식 ──────────────────────────── */

export type NewsKind = "보도" | "소식";
export type NewsItem = {
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
    slug: "ai-fandom-goods-patent",
    date: "2026.10.14",
    kind: "보도",
    title: "조슈아트리웍스, AI 팬덤 굿즈 특허 등록…美 스마트 토이 시장 진출",
    source: "와우테일",
    href: "https://wowtale.net/2026/10/14/266252/",
    cover: {
      src: "/images/certificates/patent-10-3012294.webp",
      alt: "특허증 제10-3012294호",
      fit: "contain",
    },
    // 상세 본문은 src/content/news/ai-fandom-goods-patent.md 에 있습니다. 아래 body 는 마크다운이 없을 때의 대체 문구입니다.
    body: [
      "와우테일이 조슈아트리웍스의 AI 팬덤 굿즈 특허 등록과 미국 스마트 토이 시장 진출 소식을 보도했습니다.",
      "기사 전문은 와우테일에서 볼 수 있습니다.",
    ],
  },
  {
    slug: "artist-goods-patent",
    date: "2026.08.26",
    kind: "소식",
    title: "아티스트 굿즈 특허 등록",
    source: "JSTWorks",
    body: [
      "조슈아트리웍스가 아티스트 굿즈 특허를 등록했습니다.",
      "2026년 1월에 출원한 특허로, 같은 해 8월 등록을 마쳤습니다.",
    ],
  },
  {
    slug: "yorien-us-exclusive",
    date: "2026 3Q",
    kind: "소식",
    title: "삼익제약 YORIEN 정수기 미국 독점 영업권 계약",
    source: "JSTWorks",
    cover: { src: "/images/business/yorien.webp", alt: "YORIEN 정수기" },
    body: [
      "삼익제약 YORIEN 정수기의 미국 독점 영업권을 확보했습니다.",
      "YORIEN은 2026년 12월 Amazon, TikTok Shop, Shopify에서 미국 판매를 시작할 예정입니다.",
    ],
  },
  {
    slug: "k-ganada-us-trademark",
    date: "2026.06.08",
    kind: "소식",
    title: "K-GANADA™ 미국 상표 출원",
    source: "USPTO",
    cover: {
      src: "/images/news/k-ganada-us-trademark.webp",
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
  {
    slug: "gentle-vox-press",
    date: "[날짜]",
    kind: "보도",
    title: "[Gentle Vox 기사 제목]",
    source: "[매체]",
    body: ["[기사 요약]"],
    placeholder: true,
  },
  {
    slug: "k-ganada-store-open",
    date: "[오픈일]",
    kind: "소식",
    title: "[K-GANADA 스토어 오픈 소식]",
    source: "JSTWorks",
    body: ["[본문]"],
    placeholder: true,
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
