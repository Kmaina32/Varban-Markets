'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/app/lib/utils"

const bubbleVariants = cva(
  "relative flex w-full transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-[#0055FF] text-white border-[#0055FF]",
        secondary: "bg-[#F7F7F5] text-[#0A0A0A] border-[#E4E4E4]",
        muted: "bg-[#F3F4F6] text-[#6B7280] border-[#F3F4F6]",
        tinted: "bg-[#0055FF]/5 text-[#0055FF] border-[#0055FF]/10",
        outline: "bg-white text-[#0A0A0A] border-[#E4E4E4]",
        ghost: "bg-transparent text-[#0A0A0A] border-transparent p-0 max-w-none",
        destructive: "bg-[#C43D3D]/5 text-[#C43D3D] border-[#C43D3D]/20",
      },
      align: {
        start: "justify-start",
        end: "justify-end",
      },
    },
    defaultVariants: {
      variant: "default",
      align: "start",
    },
  }
)

const Bubble = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof bubbleVariants>
>(({ className, variant, align, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(bubbleVariants({ variant, align }), className)}
    {...props}
  />
))
Bubble.displayName = "Bubble"

const BubbleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { render?: React.ReactElement }
>(({ className, render, ...props }, ref) => {
  const Comp = render ? Slot : "div"
  return (
    <Comp
      ref={ref}
      className={cn(
        "max-w-[85%] px-4 py-3 text-xs leading-relaxed border shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055FF]",
        className
      )}
      {...props}
    />
  )
})
BubbleContent.displayName = "BubbleContent"

const BubbleReactions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "bottom"
    align?: "start" | "end"
  }
>(({ className, side = "bottom", align = "end", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute flex items-center gap-1 bg-white border border-[#E4E4E4] p-1 shadow-md z-10",
      side === "top" ? "-top-3" : "-bottom-3",
      align === "start" ? "left-2" : "right-2",
      className
    )}
    {...props}
  />
))
BubbleReactions.displayName = "BubbleReactions"

const BubbleGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2 w-full", className)}
    {...props}
  />
))
BubbleGroup.displayName = "BubbleGroup"

export {
  Bubble,
  BubbleContent,
  BubbleReactions,
  BubbleGroup,
}
