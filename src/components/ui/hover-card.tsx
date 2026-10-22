'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Refined to use root package imports for stable runtime resolution in Next.js 15.
 */

import * as React from "react"
import { HoverCard as Primitive } from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const HoverCard = Primitive.Root

const HoverCardTrigger = Primitive.Trigger

const HoverCardPortal = Primitive.Portal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Popup>,
  React.ComponentPropsWithoutRef<typeof Primitive.Popup>
>(({ className, sideOffset = 12, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Positioner side="right" align="center" sideOffset={sideOffset}>
      <Primitive.Popup
        ref={ref}
        className={cn(
          "z-[700] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </Primitive.Positioner>
  </Primitive.Portal>
))
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardPortal }
