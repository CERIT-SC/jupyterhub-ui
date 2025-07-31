import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none cursor-pointer disabled:opacity-50 hover-lift",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-infra-gradient-start to-infra-gradient-end text-white shadow-sm hover:shadow-md hover:opacity-90",
        secondary: "bg-infra-secondary text-white shadow-sm hover:opacity-90",
        destructive:
          "bg-infra-error text-white shadow-sm hover:bg-infra-error/90",
        outline:
          "border border-infra-border text-infra-text-primary hover:bg-infra-gray-light/50",
        ghost:
          "bg-transparent hover:bg-infra-primary/20 text-infra-text-primary",
        link: "text-infra-primary underline-offset-4 hover:underline p-0 h-auto",
        soft: "bg-white border border-gray-200 text-infra-text-primary shadow hover:border-infra-primary",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 py-1 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

Button.displayName = "Button";

export { Button, buttonVariants };
