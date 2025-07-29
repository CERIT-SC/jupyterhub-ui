import * as React from "react";

import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-base transition-colors placeholder:text-infra-text-secondary focus:border-infra-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-infra-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        type={type}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
