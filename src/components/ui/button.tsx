import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none cursor-pointer disabled:opacity-50 hover-lift",
  {
    variants: {
      variant: {
        solid: "",
        outline: "border-2",
        ghost: "",
      },
      color: {
        gradient:
          "bg-gradient-to-r from-primary-400 to-tetriary-300 text-white ",
        primary: "bg-primary-400 border-primary-400 text-white",
        secondary: "bg-secondary-300 border-secondary-300",
        tetriary: "bg-tetriary-300 border-tetriary-300",
        success: "bg-green-300 border-green-300",
        warning: "bg-yellow-300 border-yellow-300",
        danger: "bg-red-300 border-red-300",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 py-1 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
      color: "gradient",
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "gradient",
        className: "border-0",
      },
      {
        variant: "outline",
        color: "primary",
        className: "bg-white border-primary-400 text-infra-text-primary",
      },
      {
        variant: "outline",
        color: "secondary",
        className: "bg-white border-secondary-300",
      },
      {
        variant: "outline",
        color: "tetriary",
        className: "bg-white border-tetriary-300",
      },
      {
        variant: "outline",
        color: "success",
        className: "bg-white border-green-300",
      },
      {
        variant: "outline",
        color: "warning",
        className: "bg-white border-yellow-300",
      },
      {
        variant: "outline",
        color: "danger",
        className: "bg-white border-red-300",
      },
    ],
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  color,
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
      className={cn(buttonVariants({ color, variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

Button.displayName = "Button";

export { Button, buttonVariants };
