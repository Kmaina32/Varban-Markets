'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Refined to use direct named exports from the root package for stable resolution.
 */

import * as React from "react"
import { 
  HoverCardRoot, 
  HoverCardTrigger, 
  HoverCardPortal, 
  HoverCardPopup,
  HoverCardPositioner
} from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const HoverCard = HoverCardRoot

const HoverCardTrigger = HoverCardTrigger

const HoverCardPortal = HoverCardPortal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPopup>,
  React.ComponentPropsWithoutRef<typeof HoverCardPopup> & { sideOffset?: number }
>(({ className, sideOffset = 12, ...props }, ref) => (
  <HoverCardPortal>
    <HoverCardPositioner side="right" align="center" sideOffset={sideOffset}>
      <HoverCardPopup
        ref={ref}
        className={cn(
          "z-[700] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </HoverCardPositioner>
  </HoverCardPortal>
))
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardPortal }
