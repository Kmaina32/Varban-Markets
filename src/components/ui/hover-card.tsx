'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Refined to use namespaced subpath imports for stable resolution in Base UI 1.0 Beta.
 */

import * as React from "react"
import { PreviewCard as HoverCardPrimitive } from "@base-ui/react/preview-card"
import { cn } from "@/app/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardPortal = HoverCardPrimitive.Portal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Popup> & { sideOffset?: number }
>(({ className, sideOffset = 12, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Positioner side="right" align="center" sideOffset={sideOffset}>
      <HoverCardPrimitive.Popup
        ref={ref}
        className={cn(
          "z-[700] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Positioner>
  </HoverCardPrimitive.Portal>
))
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardPortal }
