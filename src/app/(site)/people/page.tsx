import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site-ui";
import { PEOPLE } from "@/content/site";
import { PeopleRows } from "./people-rows";

export const metadata: Metadata = pageMetadata("people", "/people");

export default function PeoplePage() {
  return (
    <>
      <PageHeader title="We are" bordered={false} />
      <section aria-label="구성원">
        <PeopleRows people={PEOPLE} />
      </section>
    </>
  );
}
