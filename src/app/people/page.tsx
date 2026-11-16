import type { Metadata } from "next";
import { PageHeader } from "@/components/site-ui";
import { PEOPLE } from "@/content/site";
import { PeopleRows } from "./people-rows";

export const metadata: Metadata = { title: "People" };

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
