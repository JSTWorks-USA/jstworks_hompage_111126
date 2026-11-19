# JSTWorks 홈페이지

조슈아트리웍스(Joshua Tree WORKS) 회사 홈페이지입니다. Next.js 16 (App Router) + Tailwind CSS v4.

- 운영 주소: https://www.jstworks.com
- 배포: GitHub `main` 브랜치에 올리면 Vercel 이 자동으로 배포합니다.

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 배포와 같은 방식으로 빌드 확인
npm run lint    # 코드 검사
```

문의 폼(Contact)은 Web3Forms 로 메일을 보냅니다. `.env.example` 을 `.env.local` 로 복사해 `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` 를 넣어야 로컬에서 전송됩니다(배포 값은 Vercel 환경변수에 있습니다).

## 페이지

| 주소 | 페이지 |
| --- | --- |
| `/` | About: 히어로 · 연혁(스크롤 장면) · 특허/상표/인증 |
| `/people` | People: 구성원 |
| `/business` | Business: 카테고리별 자사 IP · 타사 제품 독점영업권 (`?category=K-Living` 처럼 주소에 카테고리가 남습니다) |
| `/media` | Media: 보도·소식 목록 (`?type=보도`), 글은 `/media/번호` |
| `/contact` | Contact: 오시는 길 · 문의 폼 |

## 내용을 고치는 곳

| 고칠 것 | 파일 |
| --- | --- |
| 연혁, 특허·상표, 구성원, 브랜드(Business), 보도·소식 목록, 사무실 주소, 문의 메일 | `src/content/site.ts` |
| 영어 문구 | `src/content/en.ts` |
| Media 글 본문 | `src/content/news/<글 이름>.md` |
| 개인정보처리방침 | `src/content/privacy-policy.ts` |
| 사진 | `public/images/` |

### 한국어 · 영어 (KO/EN)

- 화면의 한국어 문구는 `site.ts` 등에 있고, 영어는 `en.ts` 사전에서 **한국어 원문을 열쇠로** 찾습니다.
- 그래서 한국어 문구를 고치면 `en.ts` 의 같은 문구(열쇠)도 똑같이 고쳐야 합니다. 열쇠가 다르면 영어 화면에서 그 자리만 한국어로 남습니다.
- Media 글 본문은 한국어로만 있고, 영어 화면에는 `en.ts` 의 글별 요약(`NEWS_SUMMARY_EN`)이 본문 위에 보입니다.

### 사진

- 사이트에 쓰는 사진은 `public/images/` 에 둡니다. 같은 이름으로 바꿔 넣으면 예전 사진이 한동안 보일 수 있으니 파일 이름을 바꿔 주세요.
- 원본(고해상도)은 `assets/originals/` 에 보관하고 GitHub 에는 올리지 않습니다.

## 폴더 구조

| 경로 | 내용 |
| --- | --- |
| `src/app/(site)/` | 페이지 (about · people · business · media · contact) |
| `src/app/globals.css` | 색·글자 크기 등 디자인 토큰과 공통 스타일 |
| `src/app/fonts.ts` | 글꼴: 영문·숫자 Inter, 한글 Nanum Gothic |
| `src/components/` | 머리글·바닥글·메뉴, 홈 히어로·연혁 장면(`home/`), 아이콘(`icons/`) |
| `src/components/ui/` | 디자인 시스템 부품 (버튼·배지·카드·입력 칸 등) |
| `src/content/` | 사이트 내용 (위 표) |
| `src/lib/` | 한영 전환(`i18n.tsx`, `language.ts`), 검색엔진용 정보(`seo.ts`) 등 |

## 그 밖의 자료 (사이트 동작과 무관)

| 경로 | 내용 |
| --- | --- |
| `.better-design/`, `CLAUDE.md`, `AGENTS.md` | AI 코딩 도구와 디자인 점검(Better Design) 설정 |

디자인 점검은 `npx better-design review src` 로 돌립니다(규칙에서 뺄 파일은 `.better-design/review.config.json`).
