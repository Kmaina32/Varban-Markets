'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Refined to use root package namespace imports to resolve runtime resolution failures.
 */

import * as React from "react"
import * as BaseUI from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const HoverCard = BaseUI.HoverCard.Root

const HoverCardTrigger = BaseUI.HoverCard.Trigger

const HoverCardPortal = BaseUI.HoverCard.Portal

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof BaseUI.HoverCard.Popup>,
  React.ComponentPropsWithoutRef<typeof BaseUI.HoverCard.Popup>
>(({ className, sideOffset = 12, ...props }, ref) => (
  <BaseUI.HoverCard.Portal>
    <BaseUI.HoverCard.Positioner side="right" align="center" sideOffset={sideOffset}>
      <BaseUI.HoverCard.Popup
        ref={ref}
        className={cn(
          "z-[700] w-64 overflow-hidden border border-[#E4E4E4] bg-white p-4 text-[#0A0A0A] shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </BaseUI.HoverCard.Positioner>
  </BaseUI.HoverCard.Portal>
))
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardPortal }
