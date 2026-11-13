import Link from "next/link";
import { TreeMark } from "./logo";
import { NAV_ITEMS } from "./site-nav";
import { Container } from "./site-ui";

const OFFICES = [
  {
    label: "Korea",
    lines: [
      "조슈아트리웍스 주식회사",
      "Joshua Tree Works Inc.",
      "3F Joshuatree Building, Yeoksam-ro 26-gil 5, Gangnam-Gu, Seoul, Republic of Korea",
    ],
  },
  {
    label: "USA",
    lines: ["H&H USA LLC", "17595 Harvard Ave, Suite C, Irvine, CA 92614"],
  },
];

const label = "m-0 text-sm text-footer-muted";
const body = "m-0 text-[0.9375rem] leading-relaxed";

export function SiteFooter() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <Container className="flex flex-col gap-12 pt-16 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <Link
            href="/"
            aria-label="Joshua Tree WORKS 홈"
            className="inline-flex min-h-11 items-center gap-3 text-footer-foreground no-underline"
          >
            <TreeMark width={22} height={26} className="block" />
            <span className="text-lg font-bold tracking-[-0.02em]">
              Joshua Tree WORKS
            </span>
          </Link>
          <nav aria-label="하단 메뉴">
            <ul className="m-0 flex list-none flex-wrap items-center gap-x-6 p-0">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-footer-foreground no-underline underline-offset-4 hover:underline"
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
                  <span key={line} className={i === 0 ? "block" : "block text-footer-muted"}>
                    {line}
                  </span>
                ))}
              </p>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <h2 className={label}>Contact</h2>
            <p className={body}>
              <a
                href="mailto:info@jstworks.com"
                className="underline-offset-4 hover:underline"
              >
                info@jstworks.com
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
