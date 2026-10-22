'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Uses the Base UI PreviewCard primitive as the authoritative hover implementation.
 * Updated to use the Base UI 'render' pattern to avoid hydration errors.
 */

import * as React from "react"
import { PreviewCard } from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const HoverCardRoot = PreviewCard.Root

const HoverCardTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof PreviewCard.Trigger>
>(({ className, render, ...props }, ref) => (
  <PreviewCard.Trigger
    ref={ref}
    render={render}
    className={cn("outline-none", className)}
    {...props}
  />
))
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardPortal = PreviewCard.Portal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof PreviewCard.Popup>,
  React.ComponentPropsWithoutRef<typeof PreviewCard.Popup> & { sideOffset?: number }
>(({ className, sideOffset = 12, ...props }, ref) => (
  <PreviewCard.Portal>
    <PreviewCard.Positioner side="right" align="center" sideOffset={sideOffset}>
      <PreviewCard.Popup
        ref={ref}
        className={cn(
          "z-[700] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
))
HoverCardContent.displayName = "HoverCardContent"

export { 
  HoverCardRoot as HoverCard, 
  HoverCardTrigger, 
  HoverCardContent, 
  HoverCardPortal 
}
