import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Container, KeepTogether, PageHeader } from "@/components/site-ui";
import { BRANDS } from "@/content/site";
import { GentleVoxFlow } from "./gentle-vox-flow";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Business" };

/**
 * 사진을 칸에 꽉 채우고, 제품 위치(focus)를 칸 안의 기준점(--tx, --ty)에 맞춥니다.
 * 기준점: 휴대폰은 사진 칸 가운데(0.5), 넓은 화면은 카피 상자를 피해 오른쪽(0.7).
 * 기준점까지 옮겨도 사진 끝이 드러나지 않도록 필요한 만큼만 사진을 키웁니다.
 * 칸 크기는 컨테이너 단위(cqw·cqh)로 읽으므로 화면 비율·방향과 상관없이 같은 규칙이 적용됩니다.
 */
function focusCover(ratio: number, focus: { x: number; y: number }): CSSProperties {
  const kx = `max(var(--tx) / ${focus.x}, (1 - var(--tx)) / ${1 - focus.x})`;
  const ky = `max(var(--ty) / ${focus.y}, (1 - var(--ty)) / ${1 - focus.y})`;
  const width = `max(100cqw * ${kx}, 100cqh * ${ky} * ${ratio.toFixed(4)})`;
  return {
    width: `calc(${width})`,
    height: "auto",
    left: `calc(100cqw * var(--tx) - ${width} * ${focus.x})`,
    top: `calc(100cqh * var(--ty) - ${width} / ${ratio.toFixed(4)} * ${focus.y})`,
  };
}

export default function BusinessPage() {
  return (
    <>
      <PageHeader title="Business" />

      {/* 자사 IP: 넓은 화면에서는 섹션 제목과 Gentle Vox 카드가 한 화면(헤더 아래 높이)에 들어오게 합니다 */}
      <section
        id="ip-contents"
        aria-label="자사 IP"
        className="md:flex md:min-h-[calc(100svh-var(--header-height))] md:flex-col md:justify-center"
      >
        <Container className="flex flex-col gap-6 py-(--section-pad) md:py-8 short:gap-4 short:py-4">
          <SectionHeader title="K-GANADA IP Contents" description="자사 IP" />

          {/* 제품 외형은 비공개 — 사진 없이 카피와 작동 흐름으로 소개합니다 */}
          <article
            aria-labelledby="gentle-vox"
            className="rounded-xl border border-border bg-background p-6 text-foreground md:p-8 short:p-6"
          >
            <GentleVoxFlow
              product={
                <div className="flex flex-col gap-1">
                  {/* 아래 YORIEN 카드 이름과 같은 글씨 규격(type-title) */}
                  <h3 id="gentle-vox" className="m-0 type-title">
                    Gentle Vox
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <p className="m-0 type-label text-muted-foreground">스마트 오디오 토이</p>
                    <Badge>2027 하반기 출시 예정</Badge>
                  </div>
                </div>
              }
            />
          </article>
        </Container>
      </section>

      {/* 독점 판권 브랜드: 가로 전체 이미지 위에 반투명 카피 박스를 좌·우 번갈아 둡니다.
          넓은 화면에서는 섹션 제목 띠와 첫 브랜드 사진이 한 화면(헤더 아래 높이)에 함께 보입니다. */}
      <section
        id="brands"
        aria-label="독점 판권 브랜드"
        className="md:flex md:min-h-[calc(100svh-var(--header-height))] md:flex-col"
      >
        <div className="bg-secondary">
          <Container className="py-(--section-pad) md:py-8">
            <SectionHeader
              title="K-BRAND Reseller"
              description="독점 판권 브랜드 — 한국 브랜드의 미국 독점 영업권"
            />
          </Container>
        </div>

        <ul className="m-0 flex list-none flex-col p-0 md:flex-1">
          {BRANDS.map((brand, i) => {
            const right = i % 2 === 1;
            return (
              <li key={brand.name} className="md:flex md:flex-1 md:flex-col">
                {/* 휴대폰: 사진 위, 카피 상자 아래 / 넓은 화면: 사진을 배경으로 깔고 빈 쪽에 카피 상자 */}
                <article
                  aria-labelledby={`brand-${i}`}
                  className="relative isolate flex flex-col overflow-hidden bg-night md:min-h-96 md:flex-1 md:flex-row"
                >
                  {brand.background && (
                    <div className="relative aspect-square w-full overflow-hidden [--tx:0.5] [--ty:0.5] [container-type:size] md:absolute md:inset-0 md:-z-10 md:aspect-auto md:[--tx:0.7]">
                      <Image
                        src={brand.background.src}
                        alt={brand.background.alt}
                        width={brand.background.width}
                        height={brand.background.height}
                        sizes="(max-width: 767px) 160vw, 120vw"
                        className="absolute max-w-none"
                        style={focusCover(brand.background.width / brand.background.height, brand.background.focus)}
                      />
                    </div>
                  )}
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
                          className="m-0 type-title"
                        >
                          {brand.name}
                        </h3>
                        <p className="m-0 type-label text-mint-line">{brand.category}</p>
                      </div>
                      <p className="m-0 type-title text-balance">
                        <KeepTogether text={brand.tagline} />
                      </p>
                      <p className="m-0 type-body text-mint-line">
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
