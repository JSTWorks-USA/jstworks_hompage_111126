import Image from "next/image";
import Link from "next/link";
import { StableLocalizedText } from "./localized-text";
import { Container } from "./site-ui";

const CONTACT_EMAIL = "info@jstworks.com";

/** 주소 줄. en 이 있으면 영문(EN) 화면에서 그 문구로 바뀝니다(두 문구 중 긴 쪽 높이로 자리를 잡아 푸터 크기는 그대로). */
type Line = { ko: string; en?: string; /** 영어 문구는 "en" (화면 낭독기가 영어로 읽음) */ lang?: "en" };

const OFFICES: { label: string; lines: Line[] }[] = [
  {
    label: "Korea",
    lines: [
      { ko: "조슈아트리웍스 주식회사" },
      { ko: "Joshua Tree Works CO., Ltd.", lang: "en" },
      {
        ko: "서울 강남구 역삼로26길 5, 조슈아트리빌딩",
        en: "Joshuatree Building, Yeoksam-ro 26-gil 5, Gangnam-Gu, Seoul, Republic of Korea",
      },
    ],
  },
  {
    // 미국 주소는 언어와 관계없이 영어로 둡니다.
    label: "USA",
    lines: [
      { ko: "H&H USA LLC", lang: "en" },
      { ko: "17595 Harvard Ave, Suite C, Irvine, CA 92614", lang: "en" },
    ],
  },
];

const label = "m-0 text-sm text-footer-muted";
const body = "m-0 text-[0.9375rem] leading-relaxed";

/**
 * 하단 영역
 * 1줄: 왼쪽 로고
 * 2줄: Korea · USA · Contact 세 칸 (칸 이름은 흐리게, 첫 줄은 흰색, 나머지는 흐리게)
 * 3줄: 구분선 아래 저작권 (휴대폰 왼쪽, 넓은 화면 오른쪽)
 */
export function SiteFooter() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <Container className="flex flex-col gap-10 pt-12 pb-10 md:gap-12 md:pt-16">
        <Link href="/" aria-label="Joshua Tree WORKS 홈" className="inline-flex shrink-0 self-start">
          {/* 흰색 세로형 로고(투명 배경). 어두운 푸터 위에서만 씁니다. */}
          <Image
            src="/images/joshua-tree-logo-white.webp"
            alt=""
            width={655}
            height={604}
            className="block h-20 w-auto md:h-28"
          />
        </Link>

        <div className="grid gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:gap-y-8">
          {OFFICES.map((office) => (
            <div key={office.label} className="flex flex-col gap-3">
              <h2 className={label}>{office.label}</h2>
              <p className={body}>
                {office.lines.map((line, i) => (
                  <span key={line.ko} lang={line.lang} className={i === 0 ? "block" : "block text-footer-muted"}>
                    {line.en ? <StableLocalizedText ko={line.ko} en={line.en} /> : line.ko}
                  </span>
                ))}
              </p>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <h2 className={label}>Contact</h2>
            <p className={body}>
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline-offset-4 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>

        <div className="flex justify-start border-t border-footer-line pt-6 text-sm text-footer-muted md:justify-end">
          <p className="m-0">© 2026 Joshua Tree Works CO., Ltd.</p>
        </div>
      </Container>
    </footer>
  );
}
