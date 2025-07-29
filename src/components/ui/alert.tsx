import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/cn";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 shadow-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-white/80 backdrop-blur-sm border-gray-200 text-infra-text-primary",
        destructive:
          "border-red-100 bg-red-50/80 backdrop-blur-sm text-red-600 [&>svg]:text-red-600",
        success:
          "border-green-100 bg-green-50/80 backdrop-blur-sm text-green-700 [&>svg]:text-green-700",
        warning:
          "border-yellow-100 bg-yellow-50/80 backdrop-blur-sm text-yellow-800 [&>svg]:text-yellow-800",
        info:
          "border-blue-100 bg-blue-50/80 backdrop-blur-sm text-blue-700 [&>svg]:text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const alertIconMap = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  showIcon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", showIcon = true, children, ...props }, ref) => {
    const IconComponent = alertIconMap[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {showIcon && <IconComponent className="h-4 w-4" />}
        {children}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
