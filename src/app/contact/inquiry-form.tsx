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
 * 서버 연동 전까지는 입력 내용을 담아 메일 앱을 엽니다.
 */
export function InquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    const subject = `[${kindLabel}] ${values.name} (${values.company})`;
    const body = [
      `문의 유형: ${kindLabel}`,
      `이름: ${values.name}`,
      `회사: ${values.company}`,
      `이메일: ${values.email}`,
      "",
      values.message,
    ].join("\n");

    window.location.href = `mailto:info@jstworks.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
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

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" size="lg" aria-describedby="inquiry-note">
          문의 보내기
        </Button>
        <p id="inquiry-note" className="m-0 text-sm text-muted-foreground">
          메일 앱이 열리고 입력한 내용이 채워집니다.
        </p>
      </div>
    </form>
  );
}
