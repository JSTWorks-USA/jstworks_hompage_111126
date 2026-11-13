import type { Metadata } from "next";
import { Container, KeepTogether, PageHeader } from "@/components/site-ui";
import { PEOPLE, PEOPLE_INTRO } from "@/content/site";
import { PeopleGrid } from "./people-grid";

export const metadata: Metadata = { title: "People" };

export default function PeoplePage() {
  return (
    <>
      <PageHeader title="People" description="K-GANADA™를 만드는 사람들" />
      <section aria-label="구성원">
        <Container className="flex flex-col gap-16 py-16 md:gap-24 md:py-24">
          {/* K-컬처를 향한 포부 */}
          <p className="m-0 max-w-[36ch] text-2xl leading-snug font-medium tracking-[-0.01em] text-primary md:text-[2rem]">
            <KeepTogether text={PEOPLE_INTRO} />
          </p>
          <PeopleGrid people={PEOPLE} />
        </Container>
      </section>
    </>
  );
}
