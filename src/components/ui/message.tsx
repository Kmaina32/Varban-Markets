'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/app/lib/utils"

const messageVariants = cva("flex w-full items-end gap-2 p-4", {
  variants: {
    align: {
      start: "flex-row",
      end: "flex-row-reverse",
    },
  },
  defaultVariants: {
    align: "start",
  },
})

const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof messageVariants>
>(({ className, align, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(messageVariants({ align }), className)}
    {...props}
  />
))
Message.displayName = "Message"

const MessageGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
))
MessageGroup.displayName = "MessageGroup"

const MessageAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex shrink-0 items-end mb-1", className)} {...props} />
))
MessageAvatar.displayName = "MessageAvatar"

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 max-w-full", className)} {...props} />
))
MessageContent.displayName = "MessageContent"

const MessageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[10px] font-bold uppercase tracking-widest text-[#6B7280] px-1 mb-1", className)} {...props} />
))
MessageHeader.displayName = "MessageHeader"

const MessageFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2 text-[9px] text-[#6B7280] uppercase font-bold px-1 mt-1", className)} {...props} />
))
MessageFooter.displayName = "MessageFooter"

export {
  Message,
  MessageGroup,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
}
