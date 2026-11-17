import Image from "next/image";
import { HeroNightSky } from "@/components/home/hero-night-sky";
import { HistoryRoots } from "@/components/home/history-roots";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Container, Placeholder } from "@/components/site-ui";
import { IP_ITEMS, type IpStatus } from "@/content/site";

const ipBadgeVariant: Record<IpStatus, "primary" | "outline" | "default"> = {
  registered: "primary",
  filed: "outline",
  planned: "default",
  certified: "default",
};

export default function AboutPage() {
  return (
    <>
      <HeroNightSky />

      <HistoryRoots />

      {/* Patents & Trademarks */}
      <section id="patents" aria-label="특허, 상표권, 인증">
        <Container className="flex flex-col gap-[var(--layout-section-gap)] py-(--section-pad)">
          <SectionHeader title="Patents & Trademarks" description="특허와 상표권, 인증" />
          {/* 휴대폰 두 칸, 태블릿 세 칸, 넓은 화면 다섯 칸 */}
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 lg:grid-cols-5">
            {IP_ITEMS.map((ip) => (
              <li key={ip.title}>
                <Card className="flex h-full flex-col overflow-hidden">
                  {/* 특허증·인증서 (A4 비율, 저해상도 이미지) */}
                  <div className="bg-muted p-3">
                    {ip.image ? (
                      <div className="relative aspect-[210/297] overflow-hidden bg-background shadow-sm">
                        <Image
                          src={ip.image}
                          alt={ip.document.replace(" 이미지 자리", "")}
                          fill
                          sizes="(min-width: 1024px) 200px, (min-width: 768px) 30vw, 45vw"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <Placeholder
                        icon="camera"
                        caption={ip.document}
                        className="aspect-[210/297] bg-background shadow-sm"
                      />
                    )}
                  </div>
                  <CardHeader className="gap-2 space-y-0 p-3 md:p-4">
                    <CardTitle className="text-[0.9375rem] leading-snug font-medium break-keep">
                      {ip.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <Badge variant={ipBadgeVariant[ip.status]} size="default">
                        {ip.badge}
                      </Badge>
                      <CardDescription className="text-[0.8125rem] tabular-nums">
                        {ip.date}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  {ip.note && (
                    <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
                      <p className="m-0 text-xs leading-relaxed text-muted-foreground tabular-nums">
                        {ip.note.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
