import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Markdown, { type Components } from "react-markdown";

/**
 * 글 본문 마크다운: src/content/news/<slug>.md
 * 파일이 있으면 그 내용을 블로그 본문처럼 보여 주고, 없으면 null 을 돌려줍니다.
 * 제목·날짜·종류·대표 이미지는 site.ts 의 NEWS 에서 가져오므로, 마크다운에는 본문만 씁니다.
 */
export function readArticleMarkdown(slug: string): string | null {
  // slug 는 site.ts 에 적힌 값만 들어옵니다(generateStaticParams). 경로 문자는 한 번 더 막습니다.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const file = join(process.cwd(), "src/content/news", `${slug}.md`);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

/** 마크다운 요소별 모양. 블록마다 위쪽 간격만 두어 리듬을 맞춥니다(부모의 [&>*+*] 규칙). */
const components: Components = {
  h2: ({ children }) => (
    <h2 className="m-0 text-2xl leading-tight font-bold tracking-[-0.01em] text-balance md:text-[1.75rem]">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="m-0 text-xl leading-snug font-bold">{children}</h3>,
  p: ({ children }) => <p className="m-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-4"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {external && <span className="sr-only"> (새 창에서 열림)</span>}
      </a>
    );
  },
  ul: ({ children }) => <ul className="m-0 flex list-disc flex-col gap-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="m-0 flex list-decimal flex-col gap-2 pl-6">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="m-0 flex flex-col gap-3 rounded-xl bg-secondary px-6 py-6 text-xl leading-relaxed font-medium text-primary md:px-10 md:py-8">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="m-0 border-0 border-t border-border" />,
  // 본문 안 이미지는 글 폭에 맞춰 둥근 모서리로 보여 줍니다.
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element -- 마크다운 이미지는 크기를 미리 알 수 없어 img 를 씁니다
      <img src={src} alt={alt ?? ""} className="block h-auto w-full rounded-xl" loading="lazy" />
    ) : null,
};

export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="flex max-w-[65ch] flex-col text-lg leading-[1.8] [&>*+*]:mt-6 [&>h2]:mt-14 [&>h2+*]:mt-4 [&>h3]:mt-10 [&>h3+*]:mt-3">
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  );
}
