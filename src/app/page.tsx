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
      <section aria-label="특허, 상표권, 인증">
        <Container className="flex flex-col gap-[var(--layout-section-gap)] py-16 md:py-24">
          <SectionHeader title="Patents & Trademarks" description="특허와 상표권, 인증" />
          <ul className="m-0 grid list-none gap-[var(--layout-column-gap)] p-0 sm:grid-cols-2 lg:grid-cols-3">
            {IP_ITEMS.map((ip) => (
              <li key={ip.title}>
                <Card className="flex h-full flex-col overflow-hidden">
                  {/* 특허증·인증서 (A4 비율, 저해상도 이미지) */}
                  <div className="bg-muted p-6">
                    {ip.image ? (
                      <div className="relative aspect-[210/297] overflow-hidden bg-background shadow-sm">
                        <Image
                          src={ip.image}
                          alt={ip.document.replace(" 이미지 자리", "")}
                          fill
                          sizes="(min-width: 1024px) 320px, (min-width: 640px) 40vw, 80vw"
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
                  <CardHeader className="gap-3 space-y-0">
                    <CardTitle className="text-xl font-medium leading-snug">
                      {ip.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Badge variant={ipBadgeVariant[ip.status]} size="lg">
                        {ip.badge}
                      </Badge>
                      <CardDescription className="tabular-nums">
                        {ip.date}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  {ip.note && (
                    <CardContent>
                      <p className="m-0 text-sm leading-relaxed text-muted-foreground tabular-nums">
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
