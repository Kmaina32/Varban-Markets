'use client';

import * as React from "react"
import { 
  MessageScroller as MessageScrollerPrimitive,
  MessageScrollerButton as MessageScrollerButtonPrimitive,
  MessageScrollerContent as MessageScrollerContentPrimitive,
  MessageScrollerItem as MessageScrollerItemPrimitive,
  MessageScrollerProvider as MessageScrollerProviderPrimitive,
  MessageScrollerViewport as MessageScrollerViewportPrimitive,
  useMessageScroller
} from "@shadcn/react"
import { cn } from "@/app/lib/utils"
import { ChevronDown } from "lucide-react"

const MessageScrollerProvider = MessageScrollerProviderPrimitive

const MessageScroller = React.forwardRef<
  React.ElementRef<typeof MessageScrollerPrimitive>,
  React.ComponentPropsWithoutRef<typeof MessageScrollerPrimitive>
>(({ className, ...props }, ref) => (
  <MessageScrollerPrimitive
    ref={ref}
    className={cn("relative flex h-full w-full flex-col overflow-hidden", className)}
    {...props}
  />
))
MessageScroller.displayName = "MessageScroller"

const MessageScrollerViewport = React.forwardRef<
  React.ElementRef<typeof MessageScrollerViewportPrimitive>,
  React.ComponentPropsWithoutRef<typeof MessageScrollerViewportPrimitive>
>(({ className, ...props }, ref) => (
  <MessageScrollerViewportPrimitive
    ref={ref}
    className={cn(
      "flex-1 overflow-y-auto overflow-x-hidden p-2 outline-none no-scrollbar",
      "data-[pending-scroll=true]:invisible",
      className
    )}
    {...props}
  />
))
MessageScrollerViewport.displayName = "MessageScrollerViewport"

const MessageScrollerContent = React.forwardRef<
  React.ElementRef<typeof MessageScrollerContentPrimitive>,
  React.ComponentPropsWithoutRef<typeof MessageScrollerContentPrimitive>
>(({ className, ...props }, ref) => (
  <MessageScrollerContentPrimitive
    ref={ref}
    className={cn("flex flex-col gap-4 min-h-full", className)}
    {...props}
  />
))
MessageScrollerContent.displayName = "MessageScrollerContent"

const MessageScrollerItem = MessageScrollerItemPrimitive

const MessageScrollerButton = React.forwardRef<
  React.ElementRef<typeof MessageScrollerButtonPrimitive>,
  React.ComponentPropsWithoutRef<typeof MessageScrollerButtonPrimitive>
>(({ className, ...props }, ref) => (
  <MessageScrollerButtonPrimitive
    ref={ref}
    className={cn(
      "absolute bottom-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-lg transition-all hover:bg-[#0055FF] data-[active=false]:hidden animate-in fade-in zoom-in duration-200",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </MessageScrollerButtonPrimitive>
))
MessageScrollerButton.displayName = "MessageScrollerButton"

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller
}