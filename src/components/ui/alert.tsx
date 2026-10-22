import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/app/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-none border border-[#E4E4E4] p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[#0A0A0A]",
  {
    variants: {
      variant: {
        default: "bg-white text-[#0A0A0A]",
        destructive:
          "border-[#C43D3D]/50 text-[#C43D3D] dark:border-[#C43D3D] [&>svg]:text-[#C43D3D] bg-[#C43D3D]/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight uppercase text-[10px]", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[11px] [&_p]:leading-relaxed uppercase font-bold tracking-tight opacity-70", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

const AlertAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("absolute right-4 top-4", className)}
    {...props}
  />
))
AlertAction.displayName = "AlertAction"

export { Alert, AlertTitle, AlertDescription, AlertAction }
