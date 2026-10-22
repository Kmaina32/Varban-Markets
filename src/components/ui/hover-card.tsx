'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Uses the Base UI PreviewCard primitive as the authoritative hover implementation.
 */

import * as React from "react"
import { 
  PreviewCardRoot, 
  PreviewCardTrigger, 
  PreviewCardPortal, 
  PreviewCardPositioner, 
  PreviewCardPopup 
} from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const HoverCard = PreviewCardRoot

const HoverCardTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof PreviewCardTrigger>
>(({ className, render, ...props }, ref) => (
  <PreviewCardTrigger
    ref={ref}
    render={render}
    className={cn("outline-none", className)}
    {...props}
  />
))
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardPortal = PreviewCardPortal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof PreviewCardPopup>,
  React.ComponentPropsWithoutRef<typeof PreviewCardPopup> & {
    align?: "start" | "center" | "end";
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
    alignOffset?: number;
  }
>(({ className, align = "center", side = "right", sideOffset = 12, alignOffset = 0, ...props }, ref) => (
  <PreviewCardPortal>
    <PreviewCardPositioner align={align} side={side} sideOffset={sideOffset} alignOffset={alignOffset}>
      <PreviewCardPopup
        ref={ref}
        className={cn(
          "z-[700] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </PreviewCardPositioner>
  </PreviewCardPortal>
))
HoverCardContent.displayName = "HoverCardContent"

export { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent, 
  HoverCardPortal 
}
