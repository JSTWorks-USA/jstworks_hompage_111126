import Image from "next/image";
import Link from "next/link";
import { LocalizedText } from "./localized-text";
import { NAV_ITEMS } from "./site-nav";
import { Container } from "./site-ui";

const CONTACT_EMAIL = "info@jstworks.com";

/** 주소 줄. en 이 있으면 영문(EN) 화면에서 그 문구로 바뀝니다. */
type Line = { ko: string; en?: string };

const OFFICES: { label: string; lines: Line[] }[] = [
  {
    label: "Korea",
    lines: [
      { ko: "조슈아트리웍스 주식회사" },
      { ko: "Joshua Tree Works Inc." },
      {
        ko: "서울 강남구 역삼로26길 5, 조슈아트리빌딩",
        en: "Joshuatree Building, Yeoksam-ro 26-gil 5, Gangnam-Gu, Seoul, Republic of Korea",
      },
    ],
  },
  {
    // 미국 주소는 언어와 관계없이 영어로 둡니다.
    label: "USA",
    lines: [{ ko: "H&H USA LLC" }, { ko: "17595 Harvard Ave, Suite C, Irvine, CA 92614" }],
  },
];

const label = "m-0 text-sm text-footer-muted";
const body = "m-0 text-[0.9375rem] leading-relaxed";

/**
 * 하단 영역
 * 1줄: 왼쪽 로고, 오른쪽 메뉴
 * 2줄: Korea · USA · Contact 세 칸 (칸 이름은 흐리게, 첫 줄은 흰색, 나머지는 흐리게)
 * 3줄: 구분선 아래 오른쪽 저작권
 */
export function SiteFooter() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <Container className="flex flex-col gap-12 pt-16 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
          <Link href="/" aria-label="Joshua Tree WORKS 홈" className="inline-flex shrink-0">
            {/* 흰색 세로형 로고(투명 배경). 어두운 푸터 위에서만 씁니다. */}
            <Image
              src="/images/joshua-tree-logo-white.webp"
              alt=""
              width={655}
              height={604}
              className="block h-24 w-auto md:h-28"
            />
          </Link>
          <nav aria-label="하단 메뉴">
            <ul className="m-0 flex list-none flex-wrap items-center gap-x-6 p-0">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-[0.9375rem] text-footer-foreground no-underline underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="grid gap-x-12 gap-y-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          {OFFICES.map((office) => (
            <div key={office.label} className="flex flex-col gap-3">
              <h2 className={label}>{office.label}</h2>
              <p className={body}>
                {office.lines.map((line, i) => (
                  <span key={line.ko} className={i === 0 ? "block" : "block text-footer-muted"}>
                    {line.en ? <LocalizedText ko={line.ko} en={line.en} /> : line.ko}
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

        <div className="flex justify-end border-t border-footer-line pt-6 text-sm text-footer-muted">
          <p className="m-0">© 2026 Joshua Tree Works Inc.</p>
        </div>
      </Container>
    </footer>
  );
}
