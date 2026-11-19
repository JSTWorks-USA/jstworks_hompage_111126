import * as React from "react";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * 체크 상자. 눈에 보이는 상자는 20px 이지만 누르는 영역은 44px 입니다
 * (실제 체크 상자가 44px 영역 전체를 투명하게 덮고, 보이는 상자와 체크 표시는 그 위에 그립니다).
 * 처음에는 체크하지 않은 상태이고, 잘못된 값(aria-invalid)이면 테두리가 붉어집니다.
 * 이름표(글)는 바깥에서 <label htmlFor={id}> 로 잇거나 aria-label 로 줍니다.
 * className 은 44px 누름 영역(바깥 label)에 붙습니다(자리 맞춤용 여백 등).
 */
const Checkbox = React.forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">>(
  ({ className, id, ...props }, ref) => (
    <label htmlFor={id} className={cn("relative grid size-11 shrink-0 cursor-pointer place-items-center", className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full"
        {...props}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none size-5 rounded-[0.3125rem] border-2 border-subtle bg-background transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-aria-invalid:border-destructive"
      />
      <CheckIcon aria-hidden="true" className="pointer-events-none absolute size-4 text-background opacity-0 peer-checked:opacity-100" />
    </label>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
