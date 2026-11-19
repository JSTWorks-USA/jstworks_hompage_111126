/**
 * 영어(EN) 문구 사전 — 열쇠는 화면의 한국어 원문, 값은 영어 문구입니다.
 *
 * 한국어 문구를 고치면 여기 열쇠도 같이 고쳐야 영어가 계속 보입니다(열쇠가 다르면 그 자리는 한국어로 남습니다).
 * 빠진 문구 확인: EN 으로 바꾼 뒤 화면에 한글이 남아 있는 곳을 찾습니다(본문이 한국어인 Media 글 본문은 제외).
 *
 * 이름·직함·회사명 영문 표기는 확정 전 시안입니다(대표님 확인 필요한 곳은 // 확인 표시).
 * 사이트 전체가 이 사전을 씁니다.
 */
export const EN: Record<string, string> = {
  /* ───────── 공통 ───────── */
  "본문으로 건너뛰기": "Skip to main content",
  "메뉴 열기": "Open menu",
  "메뉴 닫기": "Close menu",
  "메뉴": "Menu",
  "주 메뉴": "Main menu",
  "Joshua Tree WORKS 홈": "Joshua Tree WORKS home",
  "영어로 보기 (EN)": "View in English (EN)",
  "(새 창에서 열림)": "(opens in a new window)",
  " (새 창에서 열림)": " (opens in a new window)",
  "준비중": "Coming soon",
  "조슈아트리웍스 주식회사": "Joshua Tree Works Co., Ltd.",

  /* ───────── 홈: 히어로 ───────── */
  "미국향 커머스 플랫폼": "Commerce platform for the US Market",
  "은하수가 보이는 밤하늘 아래 조슈아 트리 실루엣": "A Joshua tree silhouetted under the Milky Way",

  /* ───────── 홈: 연혁 ───────── */
  "연혁": "Our milestones",
  "조슈아트리웍스": "Joshua Tree Works",
  "젠틀복스": "Gentle Vox",
  "타사 제품 독점영업권": "Exclusive Partner Distribution",
  "조슈아트리웍스 창업, 연구소 설립": "Joshua Tree Works founded and R&D lab established",
  "캐릭터 굿즈 특허 아이디어 발의": "Character goods patent idea proposed",
  "아티스트 굿즈 특허출원": "Artist goods patent filed",
  "미국법인설립": "US subsidiary established",
  "(캘리포니아 얼바인)": "(Irvine, California)",
  "젠틀복스 개발 착수": "Launch of GentleVox Development",
  "미국 상표권 출원": "US trademark applications filed",
  "미국 독점영업권계약 체결": "US exclusive distribution agreement signed",
  "캐릭터 굿즈 특허 출원": "Character goods patent filed",
  "뷰티 디바이스": "Beauty devices",
  "(제우스 III, 제오니스)": "(ZEUS III, ZEONIS)", // 확인: 제품 영문 표기
  "미국 및 중동 독점계약 체결": "Exclusive US and Middle East agreements signed",
  "벤처확인기업 등록": "Certified as a Korean venture company",
  "초도 물량 미국 선적": "First shipment to the US",
  "검증된 한국 브랜드의 독점영업권 및 자사 IP를 결합한": "Combining exclusive rights to proven Korean brands with our own IP",
  "젠틀복스 Gentle Vox": "Gentle Vox",
  "가족이 앱에 남긴 목소리를 큐브 스피커로 들려주는 스마트 오디오 토이입니다.":
    "A smart audio toy that plays family voices, recorded in the app, through a cube speaker.",
  "삼익제약 요리엔 정수기": "Samik Pharmaceutical YORIEN Water Purifier",
  "조슈아트리웍스와 삼익제약은 미국 독점영업권계약을 체결하여 미국 시장에 진출합니다.":
    "Joshua Tree Works and Samik Pharmaceutical signed a US exclusive distribution agreement to enter the American market.",
  "제오니스 · 제우스 III": "ZEONIS · ZEUS III",
  "뷰티 디바이스 제오니스와 제우스 III의 미국 및 중동 독점계약을 체결했습니다.":
    "We signed exclusive US and Middle East agreements for the beauty devices ZEONIS and ZEUS III.",
  "주방 조리대 위에 놓인 나무 손잡이 YORIEN 정수 피처": "A YORIEN water pitcher with a wooden handle on a kitchen counter",
  "뷰티 디바이스 제오니스(왼쪽)와 제우스 III(오른쪽)": "Beauty devices ZEONIS (left) and ZEUS III (right)",

  /* ───────── 홈: 특허·상표권 ───────── */
  "특허와 상표권, 인증": "Patents, trademarks, and certifications",
  "특허, 상표권, 인증": "Patents, trademarks, and certifications",
  "특허 등록": "Patent granted",
  "특허 출원": "Patent filed",
  "USPTO 상표 출원": "USPTO trademark filed",
  "예정": "Planned",
  "정회원": "Full member",
  "아티스트 굿즈": "Artist Goods",
  "캐릭터 굿즈": "Character Goods",
  "K-GANADA™ 4건": "K-GANADA™ (4 marks)",
  "PCT 국제특허": "PCT International Patent",
  "벤처기업협회": "Korea Venture Business Association",
  // 서류 사진 설명(alt): 사진이 들어간 칸은 site.ts 의 document 에서 " 이미지 자리"를 뗀 문구가 사진 설명이 됩니다
  "한국 특허증": "Korean patent certificate",
  "벤처기업협회 회원증": "Korea Venture Business Association membership certificate",
  "USPTO 상표 출원 접수증": "USPTO trademark filing receipt",
  "한국 특허 출원서": "Korean patent application",
  "예정중": "Scheduled",

  /* ───────── People ───────── */
  "구성원": "Our people",
  "경력": "Career",
  // 이름: 영문은 이름-성 순서 (사진 파일 이름의 로마자 표기를 따름) — 확인
  "이우용": "Scott Lee",
  "길용준": "Steven Ghill",
  "박재모": "Jamssi Park",
  "이주황": "Juhwang Lee",
  "윤정원": "Jeongwon Yoon",
  "김종효": "John Kim",
  "김진욱": "James Kim",
  // 직함 — 확인
  "대표이사": "CEO",
  "CIPO": "Chief Intellectual Property Officer (CIPO)",
  "책임연구원": "Principal Researcher",
  "COO / 전무": "COO / Executive Vice President",
  "상품개발": "Head of Product Development",
  // 사진 설명
  "이우용 대표이사": "Scott Lee, CEO",
  "길용준 CIPO": "Steven Ghill, CIPO",
  "박재모 Co-founder & Creative Director": "Jamssi Park, Co-founder & Creative Director",
  "이주황 CTO": "Juhwang Lee, CTO",
  "윤정원 책임연구원": "Jeongwon Yoon, Principal Researcher",
  "김종효 COO": "John Kim, COO",
  "김진욱 상품개발": "James Kim, Head of Product Development",
  // 경력 — 회사명 영문 표기 확인
  "덕우전자 미국법인장": "Head of US Subsidiary, Dukwoo Electronics",
  "LG전자 해외영업": "Global Sales, LG Electronics",
  "미국공인회계사": "U.S. Certified Public Accountant (CPA)",
  "LG전자": "LG Electronics",
  "삼성에버랜드": "Samsung Everland",
  "상암 커뮤니케이션즈 CD": "Creative Director, Sangam Communications",
  "타이타늄22 CD": "Creative Director, Titanium22",
  "현대자동차 R&D": "R&D, Hyundai Motor Company",
  "서울대학교 기계항공공학부 졸업": "B.S. in Mechanical & Aerospace Engineering, Seoul National University",
  "브라이트랩": "Brightlab",
  "유즈브레인넷": "Usebrain.net",
  "LG전자 해외영업 30년": "30 years in Global Sales, LG Electronics",
  "(호주 등 5개국 17년 해외 주재)": "(17 years posted abroad in 5 countries, including Australia)",
  "플랫코퍼레이션": "PLAT Corporation",
  "크리에이티브그룹폼": "Creative Groupform",
  // 헤드라인 (\n 위치에서 줄바꿈)
  "한국의 좋은 제품과\n미국의 일상을 잇습니다.": "We connect great Korean products\nto everyday American life.",
  "아이디어를 권리로 지켜,\n자산으로 완성합니다.": "We secure ideas as rights\nand turn them into assets.",
  "고객이 사는 건 물건이 아니라,\n그 물건이 바꿀 일상입니다.": "Customers don’t buy things.\nThey buy the everyday those things change.",
  "기술은 앞에 서지 않아도\n경험을 바꿀 수 있습니다.": "Technology can change the experience\nwithout taking center stage.",
  "기술의 가능성을 설계하고,\n현실로 구현합니다.": "We design what technology can do\nand make it real.",
  "시장과 실행 사이,\n빈틈을 남기지 않습니다.": "Between market and execution,\nwe leave no gaps.",
  "좋은 제품은 결국\n디테일에서 차이가 납니다.": "In the end, it's the details\nthat set great products apart.",

  /* ───────── Business ───────── */
  "비즈니스 카테고리": "Business categories",
  "카테고리": "Categories",
  "자사 IP": "Our IP",
  "스마트 오디오 토이": "Smart Audio Toy",
  "2027년 하반기 출시 예정": "Launching 2H 2027",
  "삼익제약 정수기": "Samik Pharmaceutical water purifier",
  "에이글로벌 뷰티 디바이스": "A.GLOBAL Beauty Device",
  "일본 프리미엄 홈에스테틱의 정점": "The pinnacle of Japanese home aesthetics",
  "24K 금도금 소자 13개와 6가지 모드로 얼굴부터 바디까지 하루 5분 케어합니다.":
    "13 gold-plated (24K) elements and 6 care modes, from face to body, in just 5 minutes a day.",
  "제우스 III의 프리미엄 케어를, 매일 10분": "ZEUS III premium care, 10 minutes a day",
  "5가지 기능을 동시에 출력하는 128g 무선 디바이스로 일본 A.GLOBAL의 홈에스테틱을 일상에서 만나보세요.":
    "A 128g cordless device delivering five technologies at once. Japanese home aesthetics for your everyday routine.",
  "검은 대리석 받침 위에 세워 둔 검정·금색 제우스 III 뷰티 디바이스": "A black and gold ZEUS III beauty device standing on a black marble pedestal",
  "제오니스 뷰티 디바이스를 턱선에 대고 있는 검은 원피스 차림의 모델": "A model in a black dress holding the ZEONIS beauty device to her jawline",
  "매일 마시는 물, 제약사가 만듭니다": "The water you drink every day, made by a pharmaceutical company",
  "삼익제약의 정수기 YORIEN을 미국 가정의 주방에 소개합니다.":
    "We're bringing Samik Pharmaceutical's YORIEN water purifier to American kitchens.",
  "2026년 12월 미국 출시 예정": "US launch planned for December 2026",
  "나무 손잡이가 달린 YORIEN 정수 피처와 물이 담긴 유리잔": "A YORIEN water pitcher with a wooden handle and a glass of water",
  // Gentle Vox 작동 흐름
  "앱으로 남긴 진심, 큐브로 듣는 안부": "Heartfelt words from the app, heard through the Cube",
  "젠틀복스 앱에 안부를 녹음하면, 가족의 큐브에서 내 목소리가 흘러나옵니다.":
    "Record a message in the Gentle Vox app, and your family hears your voice from their Cube.",
  "녹음": "Record",
  "Gentle Vox 앱에 안부 메시지를 말하거나 입력합니다.": "Speak or type a message in the Gentle Vox app.",
  "전달": "Deliver",
  "메시지가 안전하게 저장되어 가족의 큐브로 전해집니다.": "The message is stored securely and sent to your family's Cube.",
  "재생": "Play",
  "큐브에서 가족의 목소리로 안부가 흘러나옵니다.": "The Cube plays the message in a loved one's voice.",
  "안심": "Reassure",
  "듣고 스위치를 누르면, 보낸 사람 휴대폰에 확인 알림이 뜹니다.":
    "After listening, they press the switch and the sender gets a confirmation on their phone.",
  "주요 핵심기술": "Key technologies",
  "특허기술1": "Patent 1",
  "특허기술2": "Patent 2",
  "특허기술3": "Patent 3",
  "구매자 1:1 매칭": "1:1 buyer matching",
  "식별 ID와 사용자 단말 1:1 대조 인증": "Verifies the product ID against the buyer's device, one to one",
  "초개인화 맞춤형 경험": "Hyper-personalized experience",
  "구매자가 지정한 사람의 이름을 직접 부름": "Calls out the name of the person the buyer chooses",
  "위조품 원천차단": "Counterfeits blocked at the source",
  "고유번호와 구매자 스마트폰 정보가 일치해야만 작동": "Works only when the serial number matches the buyer's smartphone",
  "예: 요양원에 계신 엄마": "Example: Mom in a care home",
  "딸이 앱에 안부를 남기면 엄마의 큐브에서 딸 목소리가 나오고, 엄마가 스위치를 누르면 딸에게 “엄마 잘 지내니 걱정 마” 알림이 도착합니다.":
    "When a daughter leaves a message in the app, Mom's Cube plays it in her daughter's voice. When Mom presses the switch, her daughter gets a notification: “I'm doing fine, don't worry.”",

  /* ───────── Media ───────── */
  "뉴스 목록": "News list",
  "글 종류": "Post type",
  "전체": "All",
  "보도": "Press",
  "소식": "News",
  "더보기": "Load more",
  "링크 복사됨": "Link copied",
  "공유하기": "Share",
  "Media 목록": "Back to Media",
  "다른 글": "More posts",
  "이전 글": "Previous",
  "다음 글": "Next",
  "이전 페이지": "Previous page",
  "닫기": "Close",
  "출처:": "Source:",
  "서울경제TV": "Seoul Economic Network",
  "메디칼타임즈": "Medical Times",
  // 글 제목
  "미국 법인 설립": "US Subsidiary Established",
  "“피규어가 이름 불러줘요”…조슈아트리웍스, 팬덤 굿즈 특허":
    "“The Figure Calls Your Name”: Joshua Tree Works Patents Fandom Goods",
  "아티스트 굿즈 특허 등록": "Artist Goods Patent Granted",
  "삼익제약, 프리미엄 정수기 '요리엔 샤블리' 미국 첫 수출":
    "Samik Pharmaceutical Ships Premium Water Purifier 'YORIEN Chablis' to the US for the First Time",
  "K-GANADA™ 미국 상표 출원": "K-GANADA™ US Trademark Filed",
  // 대표 사진 설명(alt)
  "K-GANADA™ 로고": "K-GANADA™ logo",
  "특허증 제10-3012294호": "Patent Certificate No. 10-3012294",
  "밤하늘을 배경으로 횃불을 든 자유의 여신상과 옛 미국 문서": "The Statue of Liberty holding her torch against a night sky, with an old American document",

  /* ───────── Contact ───────── */
  "오시는 길": "Locations",
  "한국 본사": "Korea HQ",
  "미국 법인": "US Subsidiary",
  "서울시 강남구 역삼로26길 5, 조슈아트리빌딩": "Gangnam-Gu, Seoul, Republic of Korea",
  "캘리포니아 얼바인": "Irvine, California",
  "문의하기": "Contact Us",
  "협업, 투자, 일반 문의를 남겨 주세요.": "Send us your partnership, investment, or general inquiries.",
  "문의 유형": "Inquiry type",
  "협업": "Partnership",
  "투자": "Investment",
  "일반 문의": "General",
  "이름": "Name",
  "회사": "Company",
  "이메일": "Email",
  "연락처": "Phone",
  "문의 내용": "Message",
  "선택을 해주세요": "Please choose an inquiry type.",
  "성명을 입력하세요": "Please enter your name.",
  "회사명을 기입하세요": "Please enter your company name.",
  "이메일주소를 입력하세요": "Please enter your email address.",
  "올바른 이메일 주소를 입력하세요": "Please enter a valid email address.",
  "연락처를 입력하세요": "Please enter your phone number.",
  "올바른 연락처를 입력하세요 (예: 010-1234-5678)": "Please enter a valid phone number (e.g., +1 949-555-0123 or 010-1234-5678).",
  "문의 보내기": "Send inquiry",
  "보내는 중입니다…": "Sending…",
  "문의를 보냈습니다. 감사합니다.": "Your inquiry has been sent. Thank you.",
  "개인정보처리방침": "Privacy Policy",
  "개인정보처리방침에 동의합니다": "I agree to the Privacy Policy",
  "개인정보처리방침에 동의해 주세요": "Please agree to the Privacy Policy.",
  "확인": "OK",
};

/**
 * Media 글의 영어 요약 (글 번호별). 목록의 본문 앞부분 자리와 글 보기 맨 위에 보입니다.
 * 본문 전체는 한국어로 둡니다.
 */
export const NEWS_SUMMARY_EN: Record<number, string> = {
  7: "Joshua Tree Works has established its US subsidiary, H&H USA LLC, in Irvine, California. The subsidiary sells directly on major US channels such as Amazon, TikTok Shop, Shopify, and Etsy, manages the K-GANADA brand in the US, and helps Korean brands enter the American market—from export and customs to logistics and sales.",
  4: "Seoul Economic Network reported on Joshua Tree Works' fandom goods patents: figures verified by NFC that call the buyer by name and play birthday messages only for genuine owners. The first product, the smart audio toy Gentle Vox (K-GANADA edition), is set to launch in the US in 2027 through Amazon and pop-culture retailers such as Hot Topic and BoxLunch.",
  3: "Joshua Tree Works has been granted a patent for artist goods. The patent, filed in January 2026, was registered in August of the same year.",
  2: "Medical Times reported the first US export of Samik Pharmaceutical's premium pitcher-type water purifier, YORIEN Chablis. Joshua Tree Works is the exclusive US sales and marketing partner, starting with Amazon and expanding step by step to premium kitchen retailers.",
  1: "Joshua Tree Works has filed four K-GANADA™ trademark applications with the USPTO (Serial Nos. 99870826, 99870856, 99870920, and 99870958). The name comes from “ga-na-da,” the first letters of the Korean alphabet—a place where American consumers first meet Korean brands.",
};
