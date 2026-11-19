import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { MailIcon } from "@/components/icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Container, PageHeader } from "@/components/site-ui";
import { LocalizedFrame, Region } from "@/components/localized";
import { CONTACT_EMAIL, OFFICE_LOCATIONS } from "@/content/site";
import { InquiryForm } from "./inquiry-form";
import { Bi, T, en } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata("contact", "/contact");

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" />

      <Region id="location" label="오시는 길">
        <Container className="grid gap-[var(--layout-column-gap)] py-(--section-pad) md:grid-cols-2">
          {OFFICE_LOCATIONS.map((office) => (
            <Card key={office.name} className="flex flex-col overflow-hidden">
              {/* Google 지도 임베드(키 없이 쓰는 공개 지도). 지도 안에서 확대·이동이 됩니다.
                  왼쪽 위에 Google이 자동으로 붙이는 장소 카드("지도에서 열기")는 지도 안이라 지울 수 없어서,
                  지도를 위로 8rem 더 크게 그리고 그만큼 잘라 가립니다.
                  아래쪽 Google 로고·저작권 표시는 약관상 가리면 안 되므로 위만 자릅니다. */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <LocalizedFrame
                  title={`${office.name} 위치 지도`}
                  titleEn={`${en(office.name)} location map`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(office.mapQuery)}&hl=ko&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-x-0 -top-32 block h-[calc(100%+8rem)] w-full border-0"
                />
              </div>
              <CardHeader className="gap-2 space-y-0">
                {/* 페이지 h1 바로 아래 단계라 CardTitle(h3) 대신 h2를 씁니다 */}
                <h2 className="m-0 type-title">
                  <T>{office.name}</T>
                </h2>
                <p className="m-0 type-label text-muted-foreground">
                  <T>{office.eyebrow}</T>
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2">
                {/* 한국 본사: 한국어 화면은 한글 주소 한 줄, 영어 화면은 영문 주소 + 지역 줄.
                    미국 법인: 언어와 관계없이 영문 주소 + 지역 줄 */}
                <p className="m-0 type-body">
                  {office.addressKo ? <Bi ko={office.addressKo} en={office.address} /> : office.address}
                </p>
                <p className={cn("m-0 type-meta text-muted-foreground", office.addressKo && "hidden en:block")}>
                  <T>{office.localAddress}</T>
                </p>
              </CardContent>
            </Card>
          ))}
        </Container>
      </Region>

      <Region id="inquiry" label="문의하기" className="bg-secondary">
        <Container className="grid gap-x-16 gap-y-12 py-(--section-pad) lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col gap-6">
            <SectionHeader
              title="문의하기"
              description="협업, 투자, 일반 문의를 남겨 주세요."
            />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-11 items-center gap-3 self-start text-base text-primary underline underline-offset-4"
            >
              <MailIcon aria-hidden="true" className="size-5" />
              {CONTACT_EMAIL}
            </a>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <InquiryForm />
            </CardContent>
          </Card>
        </Container>
      </Region>
    </>
  );
}
