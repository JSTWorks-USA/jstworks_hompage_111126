"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const KINDS = [
  { value: "collab", label: "협업" },
  { value: "invest", label: "투자" },
  { value: "general", label: "일반 문의" },
];

type Field = "kind" | "name" | "company" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

/** 검사 순서 = 화면 순서 (첫 오류로 포커스를 옮길 때 씁니다) */
const FIELD_ORDER: Field[] = ["kind", "name", "company", "email", "message"];
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
  message: `문의내용을 최소 ${MIN_MESSAGE}자 이상 입력하세요`,
};

type Values = Record<Field, string>;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.kind) errors.kind = MESSAGES.kind;
  if (!values.name) errors.name = MESSAGES.name;
  if (!values.company) errors.company = MESSAGES.company;
  if (!values.email) errors.email = MESSAGES.email;
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = MESSAGES.emailFormat;
  if (values.message.length < MIN_MESSAGE) errors.message = MESSAGES.message;
  return errors;
}

// 옅은 입력 우물 위에서도 경계가 보이도록 테두리를 3:1 이상으로 둡니다.
const field = "border-subtle text-base hover:border-muted-foreground";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="m-0 text-sm text-destructive">
      {message}
    </p>
  );
}

/**
 * 문의 폼. 모든 항목을 채워야 보낼 수 있고, 오류 문구는 보내기를 누른 뒤에만 보입니다.
 * 새로고침 없이 Web3Forms 로 보내고, 보내는 동안 버튼을 잠그며, 결과를 폼 아래에 알립니다.
 * 실패하면 입력한 내용을 그대로 두어 다시 보낼 수 있게 합니다.
 */
export function InquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  function readValues(nextKind = kind): Values {
    const data = new FormData(formRef.current ?? undefined);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    return {
      kind: nextKind,
      name: text("name"),
      company: text("company"),
      email: text("email"),
      message: text("message"),
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
    // 메일에 화면과 같은 순서·이름으로 보이게 합니다. name·email 은 Web3Forms 가 보낸 사람·답장 주소로 쓰는 예약 이름입니다.
    data.append("문의 유형", kindLabel);
    data.append("name", values.name);
    data.append("회사", values.company);
    data.append("email", values.email);
    data.append("문의 내용", values.message);

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
        <legend className="mb-3 p-0 text-sm font-medium">문의 유형</legend>
        <RadioGroup
          name="kind"
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
              {option.label}
            </Label>
          ))}
        </RadioGroup>
        <FieldError id="inquiry-kind-error" message={errors.kind} />
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inquiry-name">이름</Label>
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
          <Label htmlFor="inquiry-company">회사</Label>
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="inquiry-email">이메일</Label>
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
        <Label htmlFor="inquiry-message">문의 내용</Label>
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
          className={`min-h-40 py-3 ${field}`}
        />
        <div className="flex items-start justify-between gap-4">
          <FieldError id="inquiry-message-error" message={errors.message} />
          <p
            id="inquiry-message-count"
            className="m-0 ml-auto shrink-0 text-sm text-muted-foreground tabular-nums"
          >
            {messageLength}/{MIN_MESSAGE}자
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

      <div className="flex flex-col items-start gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={status === "sending"}
          aria-describedby="inquiry-note"
        >
          {status === "sending" && (
            <span
              aria-hidden="true"
              className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
            />
          )}
          문의 보내기
        </Button>
        <p id="inquiry-note" className="m-0 text-sm text-muted-foreground">
          보내 주신 문의는 {CONTACT_EMAIL}으로 전달됩니다.
        </p>
        {/* 결과 알림: 보내는 중·성공은 늘 있는 한 영역에서 차분히(polite), 실패는 바로(alert) 읽어 줍니다 */}
        <div role="status" className="contents">
          {status === "sending" && (
            <p className="m-0 text-sm text-muted-foreground">보내는 중입니다…</p>
          )}
          {status === "sent" && (
            <p className="m-0 rounded-lg bg-secondary px-4 py-3 text-base text-secondary-foreground">
              문의를 보냈습니다. 감사합니다.
            </p>
          )}
        </div>
        {status === "failed" && (
          <p role="alert" className="m-0 rounded-lg border border-destructive px-4 py-3 text-base text-destructive">
            문의를 보내지 못했습니다. 입력한 내용은 그대로 있으니 다시 보내 주시거나,{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
            으로 메일을 보내 주세요.
          </p>
        )}
      </div>
    </form>
  );
}
