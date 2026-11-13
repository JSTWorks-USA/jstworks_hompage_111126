import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Container, KeepTogether, PageHeader, Placeholder } from "@/components/site-ui";
import { BRANDS } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Business" };

const GENTLE_VOX_STEPS = ["앱으로 보내고", "블록으로 듣고", "버튼으로 답하기"];

const BOOTHS = [
  { title: "K-POP 아티스트 부스", status: "특허 등록", variant: "primary" as const },
  { title: "캐릭터 부스", status: "특허 출원", variant: "outline" as const },
];

export default function BusinessPage() {
  return (
    <>
      <PageHeader title="Business" />

      {/* 자사 IP */}
      <section aria-label="자사 IP">
        <Container className="flex flex-col gap-[var(--layout-section-gap)] py-16 md:py-24">
          <SectionHeader title="K-GANADA IP Contents" description="자사 IP" />

          {/* 제품 외형은 비공개 — 사진 없이 카피로만 소개합니다 */}
          <article
            aria-labelledby="gentle-vox"
            className="grid gap-12 rounded-xl bg-primary p-8 text-primary-foreground md:p-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
          >
            <div className="flex flex-col gap-6">
              <h3
                id="gentle-vox"
                className="m-0 text-[2rem] leading-none font-bold tracking-[-0.03em] md:text-[2.5rem]"
              >
                Gentle Vox
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="m-0 text-base text-mint-line">스마트 오디오 토이</p>
                <Badge size="lg">2027 하반기 출시 예정</Badge>
              </div>
              <p className="m-0 text-2xl leading-snug">
                앱으로 남긴 진심,
                <br />
                블록으로 듣는 안부
              </p>
            </div>
            <ol className="m-0 flex list-none flex-col p-0">
              {GENTLE_VOX_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="flex items-baseline gap-6 border-t border-mint-line/40 py-6 last:pb-0"
                >
                  <span className="text-sm text-mint-line tabular-nums">{i + 1}</span>
                  <span className="text-xl">{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <ul className="m-0 grid list-none gap-[var(--layout-column-gap)] p-0 md:grid-cols-2">
            {BOOTHS.map((booth) => (
              <li key={booth.title}>
                <Card className="h-full overflow-hidden">
                  <Placeholder
                    icon="camera"
                    caption={`${booth.title} 사진 자리`}
                    className="aspect-video"
                  />
                  <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
                    <CardTitle className="text-xl font-medium">{booth.title}</CardTitle>
                    <Badge variant={booth.variant} size="lg">
                      {booth.status}
                    </Badge>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 독점 판권 브랜드: 가로 전체 이미지 위에 반투명 카피 박스를 좌·우·좌로 둡니다 */}
      <section aria-label="독점 판권 브랜드">
        <div className="bg-secondary">
          <Container className="py-16 md:py-24">
            <SectionHeader
              title="K-BRAND Reseller"
              description="독점 판권 브랜드 — 한국 브랜드의 미국 독점 영업권"
            />
          </Container>
        </div>

        <ul className="m-0 list-none p-0">
          {BRANDS.map((brand, i) => {
            const right = i % 2 === 1;
            return (
              <li key={brand.name}>
                <article
                  aria-labelledby={`brand-${i}`}
                  className="relative isolate flex h-160 overflow-hidden bg-night md:h-[min(46rem,85svh)]"
                >
                  <Container
                    className={cn(
                      "relative flex items-end py-8 md:items-center md:py-16",
                      right ? "md:justify-end" : "md:justify-start",
                    )}
                  >
                    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-night-foreground/15 bg-night/70 p-6 text-night-foreground backdrop-blur-md md:p-8">
                      <div className="flex flex-col gap-1">
                        <h3
                          id={`brand-${i}`}
                          className="m-0 text-3xl leading-tight font-bold tracking-[-0.02em]"
                        >
                          {brand.name}
                        </h3>
                        <p className="m-0 text-sm text-mint-line">{brand.category}</p>
                      </div>
                      <p className="m-0 text-2xl leading-snug text-balance">
                        <KeepTogether text={brand.tagline} />
                      </p>
                      <p className="m-0 text-base leading-relaxed text-mint-line">
                        <KeepTogether text={brand.description} />
                      </p>
                      {brand.status && (
                        <Badge size="lg" variant="inverse" className="self-start">
                          {brand.status}
                        </Badge>
                      )}
                    </div>
                  </Container>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
