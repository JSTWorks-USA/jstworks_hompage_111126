import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container, PageHeader } from "@/components/site-ui";
import { NEWS } from "@/content/site";
import { articlePreview } from "./article-body";
import { ArticleContent } from "./article-content";
import { NewsList, type FeedItem } from "./news-list";

export const metadata: Metadata = pageMetadata("media", "/media");

/** 카드에 보일 본문 앞부분: 서버에서 마크다운을 읽어 만들고, 빌드 때 한 번만 계산해 둡니다. */
async function getFeedItems(): Promise<FeedItem[]> {
  "use cache";
  return NEWS.map((item) => ({ ...item, preview: articlePreview(item.slug, item.body) }));
}

export default async function MediaPage() {
  const items = await getFeedItems();
  // 글 창(모달)에 넣을 글 내용을 서버에서 미리 그려 둡니다. 누르는 즉시 열리고, 따로 불러오지 않습니다.
  const articles = Object.fromEntries(
    NEWS.map((item) => [item.slug, <ArticleContent key={item.slug} item={item} heading="h2" />]),
  );
  return (
    <>
      <PageHeader title="Media" />
      <section aria-label="뉴스 목록" className="bg-neutral-cool">
        <Container className="py-(--section-pad)">
          <NewsList items={items} articles={articles} />
        </Container>
      </section>
    </>
  );
}
