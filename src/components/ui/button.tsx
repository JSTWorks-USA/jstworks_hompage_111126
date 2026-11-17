import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Luxe Button — browser-extracted from the original site (2026)
// Light theme: #f5f5f5 bg, #4a4c52 text, black primary buttons
// Key trait: NO box-shadows on buttons — clean minimal border-only styling
// Primary: black fill (site uses oklab(0 0 0/0.8) ~ near-black), white text, fontWeight 600
// Secondary: light gray bg, dark text, 1px border, no shadow
// Radius: 12px throughout
// Transitions smooth (200ms)

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-semibold",
    "outline-none transition-all duration-base ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary: black fill — no shadow (luxeui's clean signature)
        default:
          "rounded-xl bg-primary text-primary-foreground " +
          "hover:bg-primary/80 active:bg-primary/70",

        // Secondary: light gray, 1px border, no shadow
        secondary:
          "rounded-xl bg-secondary text-secondary-foreground border border-border " +
          "hover:bg-accent hover:border-border/60",

        // Outline: border only — luxeui's minimal style
        outline:
          "rounded-xl border border-border bg-transparent text-foreground " +
          "hover:bg-accent hover:border-border/80",

        // Ghost: no border, no shadow
        ghost:
          "rounded-xl text-muted-foreground " +
          "hover:bg-accent hover:text-foreground",

        // Destructive
        destructive:
          "rounded-xl bg-destructive text-destructive-foreground " +
          "hover:bg-destructive/90",

        // Link
        link:
          "text-foreground underline-offset-4 hover:underline",

        // Muted
        muted:
          "rounded-xl bg-muted text-muted-foreground " +
          "hover:bg-accent hover:text-foreground",

        // Switch: a bare hit area around a track the child draws itself (e.g. the KO/EN
        // language switch). Press feedback belongs to the child, so the button does not scale.
        switch:
          "rounded-full bg-transparent active:scale-100 focus-visible:ring-offset-0",

        // Tile: 아이콘 + 이름 카드형 선택 버튼 (Business 카테고리). 고른 카드(aria-pressed)는 초록 테두리·글자
        tile:
          "rounded-xl border border-border bg-background text-foreground " +
          "hover:border-primary/40 aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:text-primary",
      },
      size: {
        sm:      "h-8 px-4 text-xs rounded-lg",
        default: "h-[2.375rem] px-4",
        lg:      "h-[2.75rem] px-4 text-base",
        xl:      "h-14 px-10 text-base",
        icon:    "h-[2.375rem] w-[2.375rem] rounded-xl",
        // 알약 모양 탭 버튼 (Media 글 종류 탭 등), 44px 높이
        pill:    "h-11 px-5 rounded-full text-base",
        // 44px 터치 영역의 아이콘 버튼 (모바일 햄버거·닫기 등)
        iconLg:  "size-11 rounded-xl",
        // 44px tall target with an even ring gap around a 30px track; the negative margin
        // cancels the side padding so the visible track keeps its place in the layout
        switch:  "-mx-2 h-11 px-2",
        // 카드형 선택 버튼: 아이콘 위, 이름 아래 (세로로 쌓고 가운데 정렬)
        tile:    "h-auto w-full flex-col gap-3 px-2 py-4 text-sm md:px-3 md:py-6 md:text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        type={asChild ? undefined : "button"}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
