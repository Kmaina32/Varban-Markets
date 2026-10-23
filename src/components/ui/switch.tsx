'use client';

/**
 * @fileOverview Institutional Switch component.
 * Refined with high-visibility pill motion and state-specific color fills.
 * Engineered for deterministic feedback in the Account Context selector.
 */

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/app/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-[#E4E4E4] transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner",
      "data-[state=checked]:bg-[#0055FF] data-[state=checked]:border-[#0055FF]",
      "data-[state=unchecked]:bg-[#E5E7EB] data-[state=unchecked]:border-[#E4E4E4]",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "data-[state=checked]:translate-x-[22px]",
        "data-[state=unchecked]:translate-x-[4px]"
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = "Switch"

export { Switch }
