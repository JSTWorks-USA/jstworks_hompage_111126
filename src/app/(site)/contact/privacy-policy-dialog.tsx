"use client";

import type { RefObject } from "react";
import { XmarkIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PRIVACY_POLICY, type PolicySection } from "@/content/privacy-policy";
import { Bi, T } from "@/lib/i18n";
import { useT } from "@/lib/language";

function Sections({ intro, sections }: { intro: string; sections: PolicySection[] }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="m-0">{intro}</p>
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-1">
          <h3 className="m-0 text-base font-bold text-foreground">{section.title}</h3>
          <p className="m-0">{section.body}</p>
        </section>
      ))}
    </div>
  );
}

/**
 * 개인정보처리방침 창. 브라우저 기본 <dialog>(showModal)를 써서
 * 창 안에서만 Tab 이 돌고, Esc 로 닫히며, 닫으면 연 단추로 포커스가 돌아갑니다.
 * 창 바깥(어두운 막)을 눌러도 닫힙니다. 여는 쪽에서 dialogRef.current.showModal() 을 부릅니다.
 */
export function PrivacyPolicyDialog({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  const t = useT();
  const close = () => dialogRef.current?.close();
  return (
    // 어두운 막을 누르면 dialog 자신이 눌린 것으로 오므로 그때만 닫습니다(키보드는 Esc 로 닫힘)
    <dialog
      ref={dialogRef}
      aria-labelledby="privacy-policy-title"
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-auto max-h-[min(85svh,44rem)] w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/50"
    >
      <div className="flex max-h-[min(85svh,44rem)] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border py-2 pr-2 pl-6">
          <h2 id="privacy-policy-title" className="m-0 text-lg font-bold">
            <Bi ko={PRIVACY_POLICY.ko.title} en={PRIVACY_POLICY.en.title} />
          </h2>
          <Button type="button" variant="ghost" size="iconLg" aria-label={t("닫기")} onClick={close} className="cursor-pointer">
            <XmarkIcon aria-hidden="true" className="size-6" />
          </Button>
        </div>
        <div className="overflow-y-auto px-6 py-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <div data-l="ko">
            <Sections intro={PRIVACY_POLICY.ko.intro} sections={PRIVACY_POLICY.ko.sections} />
          </div>
          <div data-l="en" lang="en">
            <Sections intro={PRIVACY_POLICY.en.intro} sections={PRIVACY_POLICY.en.sections} />
          </div>
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button type="button" size="lg" onClick={close} className="cursor-pointer px-6">
            <T>확인</T>
          </Button>
        </div>
      </div>
    </dialog>
  );
}
