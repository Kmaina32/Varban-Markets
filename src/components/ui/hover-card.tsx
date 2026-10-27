'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Refined for ref-forwarding and stable layout.
 */

import * as React from "react"
import { PreviewCard } from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const HoverCard = PreviewCard.Root

const HoverCardTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof PreviewCard.Trigger>
>(({ className, ...props }, ref) => (
  <PreviewCard.Trigger
    ref={ref}
    className={cn("outline-none cursor-pointer", className)}
    {...props}
  />
))
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardPortal = PreviewCard.Portal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof PreviewCard.Popup>,
  React.ComponentPropsWithoutRef<typeof PreviewCard.Popup> & { 
    sideOffset?: number;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  }
>(({ className, sideOffset = 12, side = "right", align = "center", ...props }, ref) => (
  <PreviewCard.Portal>
    <PreviewCard.Positioner side={side} align={align} sideOffset={sideOffset}>
      <PreviewCard.Popup
        ref={ref}
        className={cn(
          "z-[1000] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
))
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardPortal }