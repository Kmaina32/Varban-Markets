'use client';

/**
 * @fileOverview Institutional Switch component.
 * Refined to use root package imports for stable runtime resolution in Next.js 15.
 */

import * as React from "react"
import { Switch as Primitive } from "@base-ui/react"
import { cn } from "@/app/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof Primitive.Root>,
  React.ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    className={cn(
      "group inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#0055FF] data-[state=unchecked]:bg-[#E4E4E4]",
      className
    )}
    {...props}
  >
    <Primitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </Primitive.Root>
))
Switch.displayName = "Switch"

export { Switch }
