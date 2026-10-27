'use client';

/**
 * @fileOverview Institutional Hover Card component.
 * Standardized for consistent asChild prop merging with Base UI PreviewCard.
 */

import * as React from "react"
import { PreviewCard } from "@base-ui/react/preview-card"
import { cn } from "@/app/lib/utils"

/* ---------- HoverCard (Root wrapper) ---------- */

export interface HoverCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof PreviewCard.Root>, 'delay' | 'closeDelay'> {
  /** Radix-style alias – silently ignored; Base UI controls delay internally. */
  openDelay?: number;
  closeDelay?: number;
}

function HoverCard({ openDelay, closeDelay, ...props }: HoverCardProps) {
  return <PreviewCard.Root {...props} />;
}

/* ---------- HoverCardTrigger ---------- */

export interface HoverCardTriggerProps
  extends React.ComponentPropsWithoutRef<typeof PreviewCard.Trigger> {
  asChild?: boolean;
}

const HoverCardTrigger = React.forwardRef<
  HTMLElement,
  HoverCardTriggerProps
>(({ className, asChild, children, render, ...props }, ref) => {
  const triggerRender = asChild && React.isValidElement(children) ? children : render;
  return (
    <PreviewCard.Trigger
      ref={ref}
      render={triggerRender}
      className={cn("outline-none cursor-pointer", className)}
      {...props}
    >
      {triggerRender ? null : children}
    </PreviewCard.Trigger>
  );
})
HoverCardTrigger.displayName = "HoverCardTrigger"

/* ---------- Portal / Content ---------- */

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
