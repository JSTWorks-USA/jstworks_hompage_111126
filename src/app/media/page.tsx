import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/site-ui";
import { NEWS } from "@/content/site";
import { NewsList } from "./news-list";

export const metadata: Metadata = { title: "Media" };

export default function MediaPage() {
  return (
    <>
      <PageHeader title="Media" />
      <section aria-label="뉴스 목록">
        <Container className="py-16 md:py-24">
          <NewsList items={NEWS} />
        </Container>
      </section>
    </>
  );
}
