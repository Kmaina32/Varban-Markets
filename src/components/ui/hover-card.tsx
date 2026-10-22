'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Refined to use lowercase namespaced subpath imports for stable resolution in Base UI 1.0 Beta.
 */

import * as React from "react"
import { HoverCard } from "@base-ui/react/hover-card"
import { cn } from "@/app/lib/utils"

const HoverCardRoot = HoverCard.Root

const HoverCardTrigger = HoverCard.Trigger

const HoverCardPortal = HoverCard.Portal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCard.Popup>,
  React.ComponentPropsWithoutRef<typeof HoverCard.Popup> & { sideOffset?: number }
>(({ className, sideOffset = 12, ...props }, ref) => (
  <HoverCard.Portal>
    <HoverCard.Positioner side="right" align="center" sideOffset={sideOffset}>
      <HoverCard.Popup
        ref={ref}
        className={cn(
          "z-[700] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </HoverCard.Positioner>
  </HoverCard.Portal>
))
HoverCardContent.displayName = "HoverCardContent"

export { 
  HoverCardRoot as HoverCard, 
  HoverCardTrigger, 
  HoverCardContent, 
  HoverCardPortal 
}
