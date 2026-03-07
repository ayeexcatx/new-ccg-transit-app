import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white shadow-sm",
        secondary:
          "border-transparent bg-slate-100 text-slate-700",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: "border-slate-200 bg-white text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
