import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Container, KeepTogether, PageHeader } from "@/components/site-ui";
import { BRANDS, BUSINESS_CATEGORIES, type Brand, type BusinessCategory } from "@/content/site";
import { BusinessCategories } from "./business-categories";
import { GentleVoxFlow } from "./gentle-vox-flow";
import { Bi, T } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata("business", "/business");

/**
 * 사진을 칸에 꽉 채우고, 제품 위치(focus)를 칸 안의 기준점(--tx, --ty)에 맞춥니다.
 * 기준점: 휴대폰은 사진 칸 가운데(0.5), 넓은 화면은 카피 상자를 피해 반대쪽(상자가 왼쪽이면 0.7, 오른쪽이면 0.3).
 * 기준점까지 옮겨도 사진 끝이 드러나지 않도록 필요한 만큼만 사진을 키웁니다.
 * focus.y 가 0 이면 사진 맨 위를 칸 맨 위에 붙이고, 칸 비율이 달라 넘치는 부분은 아래쪽만 잘라 냅니다(머리 위 여백이 짧은 사진).
 * 칸 크기는 컨테이너 단위(cqw·cqh)로 읽으므로 화면 비율·방향과 상관없이 같은 규칙이 적용됩니다.
 */
function focusCover(ratio: number, focus: { x: number; y: number }): CSSProperties {
  const topPinned = focus.y <= 0;
  const kx = `max(var(--tx) / ${focus.x}, (1 - var(--tx)) / ${1 - focus.x})`;
  const ky = topPinned ? "1" : `max(var(--ty) / ${focus.y}, (1 - var(--ty)) / ${1 - focus.y})`;
  const width = `max(100cqw * ${kx}, 100cqh * ${ky} * ${ratio.toFixed(4)})`;
  return {
    width: `calc(${width})`,
    height: "auto",
    left: `calc(100cqw * var(--tx) - ${width} * ${focus.x})`,
    top: topPinned ? "0px" : `calc(100cqh * var(--ty) - ${width} / ${ratio.toFixed(4)} * ${focus.y})`,
  };
}

/**
 * 사진 전체 보기(브랜드가 여럿인 카테고리): 사진 높이를 칸 높이에 맞추고 너비는 사진 비율을 따릅니다.
 * - 칸이 사진보다 가로로 짧으면(일반 화면·휴대폰) 사진이 칸을 꽉 채우고 넘치는 좌우만 잘립니다.
 *   이때 사진 위치는 focusCover 와 같은 기준점 규칙(--tx)을 따르되, 칸 끝이 드러나지 않게 멈춥니다.
 * - 칸이 사진보다 가로로 길면(와이드 모니터) 사진을 더 키우지 않고 전체를 보여 줍니다.
 *   사진은 카피 상자 반대쪽(photoSide) 끝에 붙고, 남는 쪽은 흐린 같은 사진(BlurFill)이 채웁니다.
 *   사진 안쪽 가장자리는 남는 폭만큼(최대 8rem) 서서히 투명해져 흐린 배경과 이어집니다.
 */
function fitHeight(ratio: number, focus: { x: number; y: number }, photoSide: "left" | "right"): CSSProperties {
  const width = `100cqh * ${ratio.toFixed(4)}`;
  const ideal = `100cqw * var(--tx) - ${width} * ${focus.x}`;
  const left =
    photoSide === "right" ? `clamp(100cqw - ${width}, ${ideal}, 0px)` : `min(0px, max(100cqw - ${width}, ${ideal}))`;
  const fade = `min(8rem, max(0px, 100cqw - ${width}))`;
  const mask = `linear-gradient(to ${photoSide === "right" ? "right" : "left"}, transparent, black calc(${fade}))`;
  return { width: `calc(${width})`, height: "auto", left: `calc(${left})`, top: 0, maskImage: mask, WebkitMaskImage: mask };
}

/** 자사 IP 제품의 카테고리 */
const GENTLE_VOX_CATEGORY: BusinessCategory = "K-Play";

/** 자사 IP: Gentle Vox (제품 외형은 비공개 — 사진 없이 카피와 작동 흐름으로 소개합니다) */
function IpSection() {
  return (
    <section id="ip-contents" aria-label="자사 IP">
      {/* 제목 띠: 아래 '타사 제품 독점영업권' 제목 띠와 같은 크기·색 */}
      <div className="bg-secondary">
        <Container className="py-(--section-pad) md:py-8">
          <SectionHeader title="자사 IP" />
        </Container>
      </div>
      <Container className="py-(--section-pad) md:py-12">
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
                  <p className="m-0 type-label text-muted-foreground">
                    <T>스마트 오디오 토이</T>
                  </p>
                  <Badge>
                    <T>2027년 하반기 출시 예정</T>
                  </Badge>
                </div>
              </div>
            }
          />
        </article>
      </Container>
    </section>
  );
}

/**
 * 타사 제품 독점영업권: 가로 전체 이미지 위에 반투명 카피 박스를 좌·우 번갈아 둡니다.
 * 넓은 화면에서는 섹션 제목 띠와 첫 브랜드 사진이 한 화면(헤더 아래 높이)에 함께 보입니다.
 */
function BrandsSection({ brands, category }: { brands: Brand[]; category: BusinessCategory }) {
  // 첫 브랜드 사진의 가로:세로 비율. 세로로 긴 창(세로 모니터·창을 좁고 길게 연 경우)에서
  // 한 화면을 채우려고 사진 칸이 원본 비율보다 길어지면 사진이 크게 확대되어 일부만 보이므로,
  // 사진 칸 높이를 "화면 너비 ÷ 사진 비율"(원본 비율 그대로의 높이)까지만 늘립니다.
  const first = brands[0]?.background;
  // 브랜드가 여럿이면(K-Beauty) 와이드 모니터에서 사진을 가로폭에 맞춰 크게 키우지 않고 사진 전체를 보여 줍니다(fitHeight).
  // 하나면(YORIEN) 지금처럼 칸을 꽉 채웁니다(focusCover).
  const fitWhole = brands.length > 1;
  return (
    <section
      aria-label="타사 제품 독점영업권"
      // 5.5rem = 위 제목 띠 높이(88px)
      className={cn(
        "md:flex md:flex-col",
        first
          ? "md:min-h-[min(calc(100svh-var(--header-height)),calc(5.5rem+100vw/var(--photo-ratio)))]"
          : "md:min-h-[calc(100svh-var(--header-height))]",
      )}
      style={first ? ({ "--photo-ratio": (first.width / first.height).toFixed(4) } as CSSProperties) : undefined}
    >
      <div className="bg-secondary">
        <Container className="py-(--section-pad) md:py-8">
          <SectionHeader title="타사 제품 독점영업권" />
        </Container>
      </div>

      <ul className="m-0 flex list-none flex-col p-0 md:flex-1">
        {brands.map((brand, i) => {
          const right = i % 2 === 1;
          const headingId = `brand-${category.toLowerCase()}-${i}`;
          return (
            <li key={brand.name} className="md:flex md:flex-1 md:flex-col">
              {/* 휴대폰: 사진 위, 카피 상자 아래 / 넓은 화면: 사진을 배경으로 깔고 빈 쪽에 카피 상자 */}
              {/* 넓은 화면의 줄 높이(최소 24rem): 브랜드마다 "화면 높이 - 제목 띠"와 "사진 비율 그대로의 높이" 중 작은 값.
                  브랜드가 여럿이어도 한 화면을 나눠 쓰지 않고 각자 이 높이를 씁니다 */}
              <article
                aria-labelledby={headingId}
                className={cn(
                  "relative isolate flex flex-col overflow-hidden bg-night md:flex-1 md:flex-row",
                  brand.background
                    ? "md:min-h-[max(24rem,min(calc(100svh-var(--header-height)-5.5rem),calc(100vw/var(--photo-ratio))))]"
                    : "md:min-h-96",
                )}
                style={
                  brand.background
                    ? ({ "--photo-ratio": (brand.background.width / brand.background.height).toFixed(4) } as CSSProperties)
                    : undefined
                }
              >
                {brand.background && (
                  <div
                    className={cn(
                      "relative aspect-square w-full overflow-hidden [--tx:0.5] [--ty:0.5] [container-type:size] md:absolute md:inset-0 md:-z-10 md:aspect-auto",
                      right ? "md:[--tx:0.3]" : "md:[--tx:0.7]",
                    )}
                  >
                    {fitWhole && (
                      // 와이드 모니터에서 사진 옆에 남는 자리를 채우는 흐린 같은 사진(작은 파일로 받습니다). 휴대폰은 사진이 꽉 차서 그리지 않습니다
                      <Image
                        src={brand.background.src}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="20vw"
                        className="hidden scale-110 object-cover blur-2xl md:block"
                      />
                    )}
                    <Image
                      src={brand.background.src}
                      alt={brand.background.alt}
                      width={brand.background.width}
                      height={brand.background.height}
                      sizes="(max-width: 767px) 160vw, 120vw"
                      className="absolute max-w-none"
                      style={
                        fitWhole
                          ? fitHeight(brand.background.width / brand.background.height, brand.background.focus, right ? "left" : "right")
                          : focusCover(brand.background.width / brand.background.height, brand.background.focus)
                      }
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
                      <h3 id={headingId} className="m-0 type-title">
                        {brand.name}
                      </h3>
                      <p className="m-0 type-label text-mint-line">
                        <T>{brand.category}</T>
                      </p>
                    </div>
                    {brand.tagline && (
                      <p className="m-0 type-title text-balance">
                        <KeepTogether text={brand.tagline} />
                      </p>
                    )}
                    {brand.description && (
                      <p className="m-0 type-body text-mint-line">
                        <KeepTogether text={brand.description} />
                      </p>
                    )}
                    {brand.status && (
                      <Badge size="lg" variant="inverse" className="self-start">
                        <T>{brand.status}</T>
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
  );
}

/** 아직 소개할 제품이 없는 카테고리 */
function EmptyCategory({ category }: { category: BusinessCategory }) {
  return (
    <Container className="pb-(--section-pad) md:pb-12">
      <div className="flex flex-col items-center gap-2 rounded-xl bg-muted px-6 py-16 text-center">
        <p className="m-0 type-title">
          <Bi ko={`${category} 제품을 준비하고 있습니다`} en={`${category} products are coming soon`} />
        </p>
      </div>
    </Container>
  );
}

function CategoryPanel({ category }: { category: BusinessCategory }) {
  const hasIp = category === GENTLE_VOX_CATEGORY;
  const brands = BRANDS.filter((brand) => brand.kCategory === category);
  if (!hasIp && brands.length === 0) return <EmptyCategory category={category} />;
  return (
    <>
      {hasIp && <IpSection />}
      {brands.length > 0 && <BrandsSection brands={brands} category={category} />}
    </>
  );
}

export default function BusinessPage() {
  const panels = Object.fromEntries(
    BUSINESS_CATEGORIES.map((category) => [category, <CategoryPanel key={category} category={category} />]),
  ) as Record<BusinessCategory, ReactNode>;
  return (
    <>
      <PageHeader title="Business" />
      <BusinessCategories panels={panels} />
    </>
  );
}
