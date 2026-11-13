# JSTWorks 홈페이지

조슈아트리웍스(Joshua Tree WORKS) 회사 홈페이지. Next.js 16 (App Router) + Tailwind CSS v4.

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 정적 빌드 확인
```

## 구조

| 경로 | 페이지 |
| --- | --- |
| `/` | ABOUT (히어로 · 소개 · 연혁 · 특허/상표) |
| `/people` | PEOPLE |
| `/business` | BUSINESS (자사 IP · 독점 판권 브랜드) |
| `/media` | MEDIA (보도/소식 필터) |
| `/contact` | CONTACT (오시는 길 · 문의 폼) |

- `src/content/site.ts` — 연혁, 특허, 구성원, 브랜드, 뉴스, 사무실 정보 등 모든 텍스트 데이터
- `src/components/` — 헤더, 푸터, 로고, 배지·컨테이너 등 공통 UI
- `src/app/globals.css` — Gmarket Sans 폰트와 디자인 토큰 (`brand`, `mint`, `muted` 등)
- `public/images/`, `public/fonts/` — 이미지·폰트 에셋

## 확정 전 항목

- `[대괄호]` 값: 사업자등록번호, Gentle Vox 기사, K-GANADA 스토어 오픈 소식
- 부스 사진 2장, Google 지도 2곳은 자리 표시
- KO/EN 전환은 선택 상태만 바뀜 (영문 콘텐츠 미작성)
- 문의 폼은 입력 내용으로 메일 앱(info@jstworks.com)을 엶 — 서버 전송 없음
