'use client';

/**
 * @fileOverview Institutional Switch component.
 * Uses the namespaced Switch object from the root @base-ui/react package.
 */

import * as React from "react"
import { Switch } from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const SwitchRoot = React.forwardRef<
  React.ElementRef<typeof Switch.Root>,
  React.ComponentPropsWithoutRef<typeof Switch.Root>
>(({ className, ...props }, ref) => (
  <Switch.Root
    ref={ref}
    className={cn(
      "group inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#0055FF] data-[state=unchecked]:bg-[#E4E4E4]",
      className
    )}
    {...props}
  >
    <Switch.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </Switch.Root>
))
SwitchRoot.displayName = "Switch"

export { SwitchRoot as Switch }
