import type { Metadata } from "next";
import { ArrowUpRightIcon, MailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Container, PageHeader, Placeholder } from "@/components/site-ui";
import { OFFICE_LOCATIONS } from "@/content/site";
import { InquiryForm } from "./inquiry-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" />

      <section aria-label="오시는 길">
        <Container className="grid gap-[var(--layout-column-gap)] py-16 md:grid-cols-2 md:py-24">
          {OFFICE_LOCATIONS.map((office) => (
            <Card key={office.name} className="flex flex-col overflow-hidden">
              <Placeholder
                icon="pin"
                caption={office.mapCaption}
                className="aspect-[16/9]"
              />
              <CardHeader className="gap-2 space-y-0">
                {/* 페이지 h1 바로 아래 단계라 CardTitle(h3) 대신 h2를 씁니다 */}
                <h2 className="m-0 text-xl leading-snug font-medium tracking-tight">
                  {office.name}
                </h2>
                <p className="m-0 text-sm text-muted-foreground">
                  {office.eyebrow}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2">
                <p className="m-0 text-base leading-relaxed">{office.address}</p>
                <p className="m-0 text-sm leading-relaxed text-muted-foreground">
                  {office.localAddress}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="lg">
                  <a href={office.mapUrl} target="_blank" rel="noopener noreferrer">
                    Google 지도에서 보기
                    <ArrowUpRightIcon aria-hidden="true" className="size-4" />
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Container>
      </section>

      <section aria-label="문의하기" className="bg-secondary">
        <Container className="grid gap-x-16 gap-y-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col gap-6">
            <SectionHeader
              title="문의하기"
              description="협업, 투자, 일반 문의를 남겨 주세요."
            />
            <a
              href="mailto:info@jstworks.com"
              className="inline-flex min-h-11 items-center gap-3 self-start text-base text-primary underline underline-offset-4"
            >
              <MailIcon aria-hidden="true" className="size-5" />
              info@jstworks.com
            </a>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <InquiryForm />
            </CardContent>
          </Card>
        </Container>
      </section>
    </>
  );
}
