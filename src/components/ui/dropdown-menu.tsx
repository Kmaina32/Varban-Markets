'use client';

/**
 * @fileOverview Institutional Dropdown Menu component.
 * Migrated to root package namespace imports to ensure deterministic component resolution.
 */

import * as React from "react"
import * as BaseUI from "@base-ui/react"
import { Check, ChevronRight, Circle } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/app/lib/utils"

const DropdownMenu = BaseUI.Menu.Root

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseUI.Menu.Trigger> & { render?: React.ReactElement }
>(({ className, render, children, ...props }, ref) => {
  if (render) {
    return (
      <BaseUI.Menu.Trigger {...props} asChild>
        <Slot ref={ref} className={className}>
          {render}
        </Slot>
      </BaseUI.Menu.Trigger>
    )
  }
  return (
    <BaseUI.Menu.Trigger
      ref={ref}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </BaseUI.Menu.Trigger>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuPortal = BaseUI.Menu.Portal

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof BaseUI.Menu.Popup>,
  React.ComponentPropsWithoutRef<typeof BaseUI.Menu.Popup>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <BaseUI.Menu.Portal>
    <BaseUI.Menu.Positioner sideOffset={sideOffset}>
      <BaseUI.Menu.Popup
        ref={ref}
        className={cn(
          "z-[600] min-w-[8rem] overflow-hidden border border-[#E4E4E4] bg-white p-1 text-[#0A0A0A] shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </BaseUI.Menu.Positioner>
  </BaseUI.Menu.Portal>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof BaseUI.Menu.Item>,
  React.ComponentPropsWithoutRef<typeof BaseUI.Menu.Item>
>(({ className, ...props }, ref) => (
  <BaseUI.Menu.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-none px-2 py-1.5 text-xs font-bold uppercase tracking-wider outline-none transition-colors focus:bg-[#F7F7F5] focus:text-[#0055FF] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof BaseUI.Menu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof BaseUI.Menu.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <BaseUI.Menu.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-none py-1.5 pl-8 pr-2 text-xs font-bold uppercase tracking-wider outline-none transition-colors focus:bg-[#F7F7F5] focus:text-[#0055FF] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <BaseUI.Menu.CheckboxItemIndicator>
        <Check className="h-4 w-4 text-[#0055FF]" />
      </BaseUI.Menu.CheckboxItemIndicator>
    </span>
    {children}
  </BaseUI.Menu.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof BaseUI.Menu.Separator>,
  React.ComponentPropsWithoutRef<typeof BaseUI.Menu.Separator>
>(({ className, ...props }, ref) => (
  <BaseUI.Menu.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[#E4E4E4]", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuGroup = BaseUI.Menu.Group

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
}
