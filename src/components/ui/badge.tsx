import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-infra-primary/30 focus:ring-offset-2 shadow-[0_2px_6px_rgba(0,0,0,0.08)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-infra-gradient-start to-infra-gradient-end text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
        full: "font-bold text-white bg-infra-primary border-gray-200 shadow-none border-0 ",
        secondary:
          "border-transparent bg-infra-secondary/90 text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
        destructive:
          "border-transparent bg-infra-error text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-infra-error/90",
        outline: "text-infra-text-primary border-gray-400 border-1 bg-white ",
        success:
          "border-transparent bg-infra-success/90 text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
        warning:
          "border-transparent bg-infra-warning/90 text-black shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
        error:
          "border-transparent bg-infra-error/90 text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
        soft: "border border-white/80 bg-white/70 backdrop-blur-sm text-infra-primary shadow-[0_2px_6px_rgba(0,0,0,0.06)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
