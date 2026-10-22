'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/app/lib/utils"

const attachmentVariants = cva(
  "relative flex w-full border bg-white transition-colors group",
  {
    variants: {
      state: {
        idle: "border-[#E4E4E4]",
        uploading: "border-[#0055FF]/20",
        processing: "border-[#C9A227]/20",
        error: "border-[#C43D3D] bg-[#C43D3D]/5",
        done: "border-[#E4E4E4] hover:border-[#0055FF]",
      },
      size: {
        default: "p-4 gap-4",
        sm: "p-3 gap-3",
        xs: "p-2 gap-2",
      },
      orientation: {
        horizontal: "flex-row items-center",
        vertical: "flex-col",
      },
    },
    defaultVariants: {
      state: "done",
      size: "default",
      orientation: "horizontal",
    },
  }
)

const Attachment = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof attachmentVariants>
>(({ className, state, size, orientation, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(attachmentVariants({ state, size, orientation }), className)}
    {...props}
  />
))
Attachment.displayName = "Attachment"

const AttachmentMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "icon" | "image" }
>(({ className, variant = "icon", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex shrink-0 items-center justify-center overflow-hidden bg-[#F7F7F5] border border-[#E4E4E4]",
      variant === "icon" ? "w-10 h-10 text-[#6B7280]" : "w-full aspect-video",
      className
    )}
    {...props}
  />
))
AttachmentMedia.displayName = "AttachmentMedia"

const AttachmentContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col min-w-0 justify-center", className)}
    {...props}
  />
))
AttachmentContent.displayName = "AttachmentContent"

const AttachmentTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const isShimmering = React.useContext(AttachmentContext)?.state === 'uploading' || 
                      React.useContext(AttachmentContext)?.state === 'processing';
  
  return (
    <h4
      ref={ref}
      className={cn(
        "text-[11px] font-bold uppercase tracking-tight text-[#0A0A0A] truncate",
        isShimmering && "animate-pulse opacity-50",
        className
      )}
      {...props}
    />
  )
})
AttachmentTitle.displayName = "AttachmentTitle"

const AttachmentDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[9px] font-bold uppercase tracking-widest text-[#6B7280] truncate", className)}
    {...props}
  />
))
AttachmentDescription.displayName = "AttachmentDescription"

const AttachmentActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-1 shrink-0 ml-auto", className)}
    {...props}
  />
))
AttachmentActions.displayName = "AttachmentActions"

const AttachmentAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-7 w-7 items-center justify-center border border-[#E4E4E4] bg-white text-[#6B7280] hover:bg-[#F7F7F5] hover:text-[#0A0A0A] transition-all",
      className
    )}
    {...props}
  />
))
AttachmentAction.displayName = "AttachmentAction"

const AttachmentTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { render?: React.ReactNode }
>(({ className, render, ...props }, ref) => {
  const Comp = render ? Slot : "button"
  return (
    <Comp
      ref={ref}
      className={cn(
        "absolute inset-0 z-0 bg-transparent cursor-pointer ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055FF] focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
AttachmentTrigger.displayName = "AttachmentTrigger"

const AttachmentGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x",
      className
    )}
    {...props}
  />
))
AttachmentGroup.displayName = "AttachmentGroup"

// Context to share state between root and sub-components
const AttachmentContext = React.createContext<VariantProps<typeof attachmentVariants> | null>(null)

const AttachmentRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof attachmentVariants>
>(({ state, ...props }, ref) => (
  <AttachmentContext.Provider value={{ state }}>
    <Attachment ref={ref} state={state} {...props} />
  </AttachmentContext.Provider>
))
AttachmentRoot.displayName = "AttachmentRoot"

export {
  AttachmentRoot as Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
  AttachmentGroup,
}
