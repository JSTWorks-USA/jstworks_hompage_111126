// 홈페이지 콘텐츠. [대괄호] 값은 확정 전 자리 표시입니다.

/* ──────────────────────────── 연혁 ──────────────────────────── */

/**
 * 연혁 장면에서의 위치
 * - root: 땅속에서 모으는 자산(특허·상표·법인·영업권)
 * - revenue: 뿌리 중심, 매출이 시작되는 시점
 * - trunk: 줄기를 타고 오르는 다음 단계
 */
export type HistoryStage = "root" | "revenue" | "trunk";
export type HistoryItem = {
  month: string;
  text: string;
  stage: HistoryStage;
  planned?: boolean;
};
export type HistoryYear = { year: string; future?: boolean; items: HistoryItem[] };

export const HISTORY: HistoryYear[] = [
  {
    year: "2025",
    items: [{ month: "12", text: "조슈아트리웍스 창업, 연구소 설립", stage: "root" }],
  },
  {
    year: "2026",
    items: [
      { month: "01", text: "아티스트 굿즈 특허 출원", stage: "root" },
      { month: "03", text: "캘리포니아 얼바인에 미국 법인 설립", stage: "root" },
      { month: "06", text: "K-GANADA™ 미국 상표 출원 4건", stage: "root" },
      { month: "08", text: "캐릭터 굿즈 특허 출원, 아티스트 굿즈 특허 등록", stage: "root" },
      { month: "3Q", text: "YORIEN, 제오니스 등 6개 브랜드 미국 독점 영업권", stage: "root" },
      { month: "10", text: "아마존 K-GANADA™ 브랜드 레지스트리 등록", stage: "root" },
      {
        month: "12",
        text: "YORIEN 미국 런칭 (Amazon, TikTok Shop, Shopify)",
        stage: "revenue",
        planned: true,
      },
    ],
  },
  {
    year: "2027",
    future: true,
    items: [
      { month: "01", text: "PCT 국제특허 출원", stage: "trunk", planned: true },
      { month: "하반기", text: "Gentle Vox 출시", stage: "trunk", planned: true },
    ],
  },
];

/** 연혁 장면 맨 위(가지 끝)에 보여 줄 비전 */
export const VISION = {
  title: "K-컬처 유통 시장을 만듭니다",
  description:
    "다양한 사업과 매장 오픈으로 K-Beauty, K-Play, K-Pop, K-Food를 미국의 일상에 잇겠습니다.",
  branches: ["K-Beauty", "K-Play", "K-Pop", "매장 오픈", "K-Food"],
};

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

export const IP_ITEMS: IpItem[] = [
  {
    status: "registered",
    badge: "특허 등록",
    title: "아티스트 굿즈",
    date: "2026.08.26",
    document: "한국 특허증 이미지 자리",
    image: "/images/certificates/patent-10-3012294.webp",
    note: ["특허 제10-3012294호"],
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
    note: ["99870826, 99870856", "99870920, 99870958"],
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
    note: ["유효기간 2029.09.22까지"],
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

/* ──────────────────────────── 구성원 ──────────────────────────── */

export const PEOPLE_INTRO =
  "한국의 문화가 세계인의 일상이 될 때까지, 우리는 K-컬처가 미국에서 자라날 다음 장면을 만듭니다.";

export type Person = {
  name: string;
  role: string;
  /** 팀명은 작게 표시합니다 */
  team: string;
  photo: string;
  alt: string;
  /** 확정 전 자리 표시 인원 */
  placeholder?: boolean;
};

export const PEOPLE: Person[] = [
  { name: "이우용", role: "대표이사 (CEO)", team: "경영", photo: "/images/people/lee-wooyong.webp", alt: "이우용 대표이사" },
  { name: "박재모", role: "부사장 (Co-founder)", team: "경영", photo: "/images/people/park-jaemo.webp", alt: "박재모 부사장" },
  { name: "김종효", role: "COO", team: "운영", photo: "/images/people/kim-jonghyo.webp", alt: "김종효 COO" },
  { name: "이주황", role: "CTO", team: "기술", photo: "/images/people/lee-juhwang.webp", alt: "이주황 CTO" },
  { name: "길용준", role: "CIPO (지식재산)", team: "지식재산", photo: "/images/people/gil-yongjun.webp", alt: "길용준 CIPO" },
  { name: "김진욱", role: "상품개발 부장", team: "상품개발", photo: "/images/people/kim-jinwook.webp", alt: "김진욱 상품개발 부장" },
  // 추가 인원 2명: 사진·이름은 확정 전까지 기존 사진으로 대신합니다.
  { name: "[이름]", role: "[직책]", team: "[팀명]", photo: "/images/people/lee-juhwang.webp", alt: "임시 사진", placeholder: true },
  { name: "[이름]", role: "[직책]", team: "[팀명]", photo: "/images/people/kim-jonghyo.webp", alt: "임시 사진", placeholder: true },
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
  {
    name: "제오니스",
    category: "뷰티 디바이스",
    tagline: "집에서 이어 가는 K-뷰티 관리",
    description: "제오니스와 제오니스3, 한국의 뷰티 디바이스를 미국 소비자의 일상 루틴에 더합니다.",
    images: [
      { src: "/images/business/zeonis.webp", alt: "제오니스" },
      { src: "/images/business/zeonis3.webp", alt: "제오니스3" },
    ],
  },
  {
    name: "고네트",
    category: "식기",
    tagline: "한국의 식탁을 미국의 테이블로",
    description: "한식의 멋을 담은 고네트 식기로 미국의 식탁에 한국의 손님맞이를 전합니다.",
    images: [{ src: "/images/business/hankook-sikgi.webp", alt: "고네트 식기 세트" }],
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
  /** 대표 이미지 (없으면 자리 표시) */
  cover?: { src: string; alt: string };
  /** 원문 링크 (보도) */
  href?: string;
  /** 확정 전 자리 표시 항목 */
  placeholder?: boolean;
};

export const NEWS: NewsItem[] = [
  {
    slug: "ai-fandom-goods-patent",
    date: "2026.10.14",
    kind: "보도",
    title: "조슈아트리웍스, AI 팬덤 굿즈 특허 등록…美 스마트 토이 시장 진출",
    source: "와우테일",
    href: "https://wowtale.net/2026/10/14/266252/",
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
    title: "K-GANADA™ 미국 상표 출원 4건",
    source: "USPTO",
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

/* ──────────────────────────── 오시는 길 ──────────────────────────── */

export const OFFICE_LOCATIONS = [
  {
    eyebrow: "한국 본사",
    name: "조슈아트리웍스 주식회사",
    address: "3F Joshuatree Building, Yeoksam-ro 26-gil 5, Gangnam-Gu, Seoul, Republic of Korea",
    localAddress: "서울 강남구 역삼로26길 5, 조슈아트리빌딩 3층",
    mapCaption: "Google 지도 자리",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Yeoksam-ro%2026-gil%205%2C%20Gangnam-gu%2C%20Seoul",
  },
  {
    eyebrow: "미국 법인",
    name: "H&H USA LLC",
    address: "17595 Harvard Ave, Suite C, Irvine, CA 92614",
    localAddress: "캘리포니아 얼바인",
    mapCaption: "Google 지도 자리",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=17595%20Harvard%20Ave%2C%20Suite%20C%2C%20Irvine%2C%20CA%2092614",
  },
];
