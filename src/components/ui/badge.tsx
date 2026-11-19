import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Luxe Badge: pill-shaped, monochromatic — default is dark secondary bg,
// primary is white (the premium accent), outline is border-only, muted is barely there

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full",
    "font-medium tracking-wide transition-colors duration-base",
    "border border-transparent",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "text-secondary-foreground border-border hover:bg-accent bg-ceramic",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "bg-transparent text-foreground hover:bg-accent border border-muted-foreground",
        muted:
          "hover:bg-accent hover:text-foreground bg-neutral-warm text-muted-foreground",
        // 어두운 바탕(밤하늘·땅속 장면) 위의 테두리 배지
        inverse:
          "bg-transparent text-night-foreground border border-mint-line",
      },
      size: {
        sm:      "h-4 px-2 text-[0.625rem]",
        default: "h-5 px-2.5 text-xs",
        lg:      "h-6 px-3 text-xs",
        // 좁은 칸용: 글이 길면 배지 안에서 줄을 바꿔 테두리 밖으로 넘치지 않습니다. 영어는 글이 길어 한 단계 작게 씁니다
        wrap:    "h-auto min-h-5 max-w-full px-2.5 py-0.5 text-center text-xs leading-tight en:px-2 en:text-[0.6875rem] en:tracking-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  )
}

export { Badge, badgeVariants }
