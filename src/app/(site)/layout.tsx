import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * 사이트 공통 틀: 머리글 · 본문 · 바닥글.
 * 폴더 이름의 괄호((site))는 주소에 나타나지 않습니다(/people 그대로).
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
