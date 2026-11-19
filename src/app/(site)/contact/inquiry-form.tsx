"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CheckIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { applyPhoneFormat, isValidPhone } from "@/lib/korean-phone";
import { Bi, T } from "@/lib/i18n";
import { useT } from "@/lib/language";
import { PrivacyPolicyDialog } from "./privacy-policy-dialog";
import { cn } from "@/lib/utils";

const KINDS = [
  { value: "collab", label: "협업" },
  { value: "invest", label: "투자" },
  { value: "general", label: "일반 문의" },
];

type Field = "kind" | "name" | "company" | "email" | "phone" | "message" | "consent";
type Errors = Partial<Record<Field, string>>;

/** 검사 순서 = 화면 순서 (첫 오류로 포커스를 옮길 때 씁니다) */
const FIELD_ORDER: Field[] = ["kind", "name", "company", "email", "phone", "message", "consent"];
const MIN_MESSAGE = 30;

/**
 * Web3Forms 로 보냅니다. 받은 문의는 Web3Forms 계정(info@jstworks.com)으로 메일이 갑니다.
 * 접근 키는 환경변수(.env.local, 배포는 Vercel 환경변수)에서 읽습니다. 브라우저에서 쓰므로 NEXT_PUBLIC_ 이 붙고,
 * Web3Forms 가 공개용으로 만든 키라 브라우저에 보여도 됩니다.
 */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";
const MAIL_SUBJECT = "[JSTWorks 홈페이지 문의]";
const CONTACT_EMAIL = "info@jstworks.com";

type Status = "idle" | "sending" | "sent" | "failed";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGES = {
  kind: "선택을 해주세요",
  name: "성명을 입력하세요",
  company: "회사명을 기입하세요",
  email: "이메일주소를 입력하세요",
  emailFormat: "올바른 이메일 주소를 입력하세요",
  phone: "연락처를 입력하세요",
  phoneFormat: "올바른 연락처를 입력하세요 (예: 010-1234-5678)",
  message: `최소 ${MIN_MESSAGE}자 이상 입력하세요!!`,
  consent: "개인정보처리방침에 동의해 주세요",
};

type Values = Record<Field, string>;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.kind) errors.kind = MESSAGES.kind;
  if (!values.name) errors.name = MESSAGES.name;
  if (!values.company) errors.company = MESSAGES.company;
  if (!values.email) errors.email = MESSAGES.email;
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = MESSAGES.emailFormat;
  if (!values.phone) errors.phone = MESSAGES.phone;
  else if (!isValidPhone(values.phone)) errors.phone = MESSAGES.phoneFormat;
  if (values.message.length < MIN_MESSAGE) errors.message = MESSAGES.message;
  if (!values.consent) errors.consent = MESSAGES.consent;
  return errors;
}

// 옅은 입력 우물 위에서도 경계가 보이도록 테두리를 3:1 이상으로 둡니다.
const field = "border-subtle rounded-sm text-base hover:border-muted-foreground";

/**
 * 필수 항목 표시: 이름표 끝의 붉은 별표.
 * 화면 낭독기는 입력 칸의 required 로 "필수"를 이미 읽으므로 별표는 읽지 않게 숨깁니다.
 */
function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-destructive">
      *
    </span>
  );
}

function FieldError({ id, message, className }: { id: string; message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={cn("m-0 text-sm text-destructive", className)}>
      <T>{message}</T>
    </p>
  );
}

/**
 * 문의 폼. 모든 항목을 채워야 보낼 수 있고, 오류 문구는 보내기를 누른 뒤에만 보입니다.
 * 새로고침 없이 Web3Forms 로 보내고, 보내는 동안 버튼을 잠그며, 결과를 폼 아래에 알립니다.
 * 실패하면 입력한 내용을 그대로 두어 다시 보낼 수 있게 합니다.
 */
export function InquiryForm() {
  const t = useT();
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  /** 개인정보처리방침 창 */
  const policyRef = useRef<HTMLDialogElement>(null);

  function readValues(nextKind = kind): Values {
    const data = new FormData(formRef.current ?? undefined);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    return {
      kind: nextKind,
      name: text("name"),
      company: text("company"),
      email: text("email"),
      phone: text("phone"),
      message: text("message"),
      // 개인정보 동의 체크(체크하면 "on")
      consent: text("consent"),
    };
  }

  // 한 번 보내기를 시도한 뒤에는 고치는 즉시 오류 문구를 지웁니다.
  function revalidate(nextKind?: string) {
    if (attempted) setErrors(validate(readValues(nextKind)));
  }

  function focusField(name: Field) {
    const form = formRef.current;
    if (!form) return;
    if (name === "kind") {
      form.querySelector<HTMLButtonElement>('[role="radio"]')?.focus();
      return;
    }
    const element = form.elements.namedItem(name);
    if (element instanceof HTMLElement) element.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 보내는 중에 다시 누르거나 ⌘/Ctrl+Enter 를 눌러도 두 번 보내지 않습니다.
    if (status === "sending") return;
    setAttempted(true);

    const values = readValues();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstError = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstError) {
      focusField(firstError);
      return;
    }

    const kindLabel = KINDS.find((k) => k.value === values.kind)?.label ?? "문의";
    const data = new FormData();
    data.append("access_key", WEB3FORMS_ACCESS_KEY);
    data.append("subject", `${MAIL_SUBJECT} ${kindLabel} · ${values.name} (${values.company})`);
    data.append("from_name", "JSTWorks 홈페이지");
    // 사람은 볼 수 없는 스팸 방지 칸. 자동 입력 봇이 체크하면 Web3Forms 가 걸러 냅니다.
    const botcheck = formRef.current?.elements.namedItem("botcheck");
    if (botcheck instanceof HTMLInputElement && botcheck.checked) data.append("botcheck", "on");
    // 메일에 화면과 같은 순서로 보이게 합니다. name·email 은 Web3Forms 가 보낸 사람·답장 주소로 쓰는 예약 이름입니다.
    // 칸 이름(키)은 영어로 둡니다. Web3Forms 가 한글 칸 이름을 메일에서 깨뜨려 보여 주기 때문입니다(값의 한글은 괜찮습니다).
    data.append("Inquiry Type", kindLabel);
    data.append("name", values.name);
    data.append("Company", values.company);
    data.append("email", values.email);
    data.append("Phone", values.phone);
    data.append("Message", values.message);
    data.append("Privacy Consent", "Agreed");

    setStatus("sending");
    try {
      if (!WEB3FORMS_ACCESS_KEY) {
        throw new Error("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY 환경변수가 없습니다 (.env.local 또는 Vercel 환경변수 확인)");
      }
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? `HTTP ${response.status}`);
      }
      setStatus("sent");
      formRef.current?.reset();
      setKind("");
      setMessageLength(0);
      setAttempted(false);
      setErrors({});
    } catch (error) {
      // 원인은 개발자 도구에 남기고, 화면에는 다시 시도할 방법을 알립니다.
      console.error("문의 전송 실패:", error);
      setStatus("failed");
    }
  }

  // textarea에서는 Enter가 줄바꿈이므로 ⌘/Ctrl + Enter로 보냅니다.
  function handleMessageKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  const describedBy = (name: Field) => (errors[name] ? `inquiry-${name}-error` : undefined);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onChange={() => revalidate()}
      className="flex flex-col gap-6"
    >
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend id="inquiry-kind-label" className="mb-3 p-0 text-sm font-medium">
          <T>문의 유형</T>
          <RequiredMark />
        </legend>
        <RadioGroup
          name="kind"
          aria-labelledby="inquiry-kind-label"
          aria-required="true"
          value={kind}
          onValueChange={(value) => {
            setKind(value);
            revalidate(value);
          }}
          aria-invalid={errors.kind ? true : undefined}
          aria-describedby={describedBy("kind")}
          className="flex flex-wrap gap-2"
        >
          {KINDS.map((option) => (
            <Label
              key={option.value}
              htmlFor={`kind-${option.value}`}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-subtle bg-background px-4 text-[0.9375rem] font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary has-[[data-state=checked]]:text-secondary-foreground",
                errors.kind && "border-destructive",
              )}
            >
              <RadioGroupItem id={`kind-${option.value}`} value={option.value} />
              <T>{option.label}</T>
            </Label>
          ))}
        </RadioGroup>
        <FieldError id="inquiry-kind-error" message={errors.kind} />
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inquiry-name">
            <T>이름</T>
            <RequiredMark />
          </Label>
          <Input
            id="inquiry-name"
            type="text"
            name="name"
            autoComplete="name"
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            className={`h-11 ${field}`}
          />
          <FieldError id="inquiry-name-error" message={errors.name} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="inquiry-company">
            <T>회사</T>
            <RequiredMark />
          </Label>
          <Input
            id="inquiry-company"
            type="text"
            name="company"
            autoComplete="organization"
            required
            aria-invalid={errors.company ? true : undefined}
            aria-describedby={describedBy("company")}
            className={`h-11 ${field}`}
          />
          <FieldError id="inquiry-company-error" message={errors.company} />
        </div>
      </div>

      {/* 이메일 · 연락처: 넓은 화면에서 이름 · 회사처럼 두 칸으로 나란히 */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inquiry-email">
            <T>이메일</T>
            <RequiredMark />
          </Label>
          <Input
            id="inquiry-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            className={`h-11 ${field}`}
          />
          <FieldError id="inquiry-email-error" message={errors.email} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="inquiry-phone">
            <T>연락처</T>
            <RequiredMark />
          </Label>
          <Input
            id="inquiry-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="010-1234-5678"
            // 숫자만 입력해도 번호 종류(휴대폰·02·031·0505·1588 등)에 맞춰 하이픈을 넣습니다
            onChange={(e) => applyPhoneFormat(e.currentTarget)}
            required
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy("phone")}
            className={`h-11 ${field}`}
          />
          <FieldError id="inquiry-phone-error" message={errors.phone} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="inquiry-message">
          <T>문의 내용</T>
          <RequiredMark />
        </Label>
        <Textarea
          id="inquiry-message"
          name="message"
          rows={6}
          required
          minLength={MIN_MESSAGE}
          onKeyDown={handleMessageKeyDown}
          onChange={(e) => setMessageLength(e.currentTarget.value.trim().length)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={cn("inquiry-message-count", describedBy("message"))}
          // 안내 문구는 입력 칸 안에 검정색 굵은 글씨로 보여 줍니다
          placeholder={t(`최소 ${MIN_MESSAGE}자 이상 입력하세요.`)}
          className={`min-h-40 py-3 placeholder:font-bold placeholder:text-foreground ${field}`}
        />
        {/* 입력 칸 아래: 왼쪽에 오류(붉은 글씨), 오른쪽에 입력한 글자수. 좁은 화면에서 한 줄에 다 안 들어가면
            오류 문구는 끊지 않고 글자수를 다음 줄 오른쪽으로 내립니다 */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <FieldError id="inquiry-message-error" message={errors.message} className="shrink-0" />
          <p
            id="inquiry-message-count"
            className="m-0 ml-auto shrink-0 text-sm text-muted-foreground tabular-nums"
          >
            <Bi
              ko={`입력한 글자수 ${messageLength} / ${MIN_MESSAGE}자`}
              en={`Characters: ${messageLength} / ${MIN_MESSAGE}`}
            />
          </p>
        </div>
      </div>

      {/* 스팸 방지용 숨김 체크박스(Web3Forms botcheck). 화면·키보드·화면 낭독기 모두에서 숨깁니다.
          봇이 실제 체크박스로 인식하도록 키트의 Input 을 체크박스로 씁니다(키트에 Checkbox 컴포넌트가 없음). */}
      <Input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* 개인정보 동의(필수) + 문의 보내기: 넓은 화면에서는 한 줄에 나란히, 좁으면 동의가 위에 */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            {/* 체크 상자를 감싼 44px 누름 영역. 처음에는 체크하지 않은 상태입니다 */}
            <label htmlFor="inquiry-consent" className="relative -ml-3 grid size-11 shrink-0 cursor-pointer place-items-center">
              <input
                id="inquiry-consent"
                type="checkbox"
                name="consent"
                required
                aria-label={t("개인정보처리방침에 동의합니다")}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={describedBy("consent")}
                // 실제 체크 상자는 44px 누름 영역 전체(보이지 않음), 눈에 보이는 20px 상자는 아래 span 이 그립니다
                className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none size-5 rounded-[0.3125rem] border-2 border-subtle bg-background transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-aria-invalid:border-destructive"
              />
              <CheckIcon aria-hidden="true" className="pointer-events-none absolute size-4 text-background opacity-0 peer-checked:opacity-100" />
            </label>
            <p className="m-0 text-[0.9375rem] text-foreground">
              {/* 영어: "I agree to the Privacy Policy" / 한국어: "개인정보처리방침에 동의합니다" (밑줄 친 부분을 누르면 내용 창) */}
              <label htmlFor="inquiry-consent" className="hidden cursor-pointer en:inline">
                I agree to the{" "}
              </label>
              <Button
                type="button"
                variant="link"
                onClick={() => policyRef.current?.showModal()}
                className="h-auto cursor-pointer p-0 -my-[0.6875rem] py-[0.6875rem] align-baseline text-[0.9375rem] font-medium underline underline-offset-4"
              >
                <T>개인정보처리방침</T>
              </Button>
              <label htmlFor="inquiry-consent" className="cursor-pointer en:hidden">
                에 동의합니다
              </label>
            </p>
          </div>
          <FieldError id="inquiry-consent-error" message={errors.consent} />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={status === "sending"}
        >
          {status === "sending" && (
            <span
              aria-hidden="true"
              className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
            />
          )}
          <T>문의 보내기</T>
        </Button>
      </div>
      <PrivacyPolicyDialog dialogRef={policyRef} />
      <div className="flex flex-col items-start gap-3">
        {/* 결과 알림: 보내는 중·성공은 늘 있는 한 영역에서 차분히(polite), 실패는 바로(alert) 읽어 줍니다 */}
        <div role="status" className="contents">
          {status === "sending" && (
            <p className="m-0 text-sm text-muted-foreground">
              <T>보내는 중입니다…</T>
            </p>
          )}
          {status === "sent" && (
            <p className="m-0 rounded-lg bg-secondary px-4 py-3 text-base text-secondary-foreground">
              <T>문의를 보냈습니다. 감사합니다.</T>
            </p>
          )}
        </div>
        {status === "failed" && (
          <p role="alert" className="m-0 rounded-lg border border-destructive px-4 py-3 text-base text-destructive">
            <Bi
              ko="문의를 보내지 못했습니다. 입력한 내용은 그대로 있으니 다시 보내 주시거나, "
              en="We couldn't send your inquiry. Your entries are still here, so please try again or email us at "
            />
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
            <Bi ko="으로 메일을 보내 주세요." en="." />
          </p>
        )}
      </div>
    </form>
  );
}
