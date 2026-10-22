'use client';

/**
 * @fileOverview Institutional Dropdown Menu component.
 * Uses the namespaced Menu object from the root @base-ui/react package.
 * Updated to support positioning props required by the Data Table.
 */

import * as React from "react"
import { 
  MenuRoot, 
  MenuTrigger, 
  MenuPortal, 
  MenuPositioner, 
  MenuPopup, 
  MenuItem, 
  MenuCheckboxItem, 
  MenuCheckboxItemIndicator, 
  MenuSeparator, 
  MenuGroup 
} from "@base-ui/react"
import { Check } from "lucide-react"
import { cn } from "@/app/lib/utils"

const DropdownMenu = MenuRoot

const DropdownMenuTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof MenuTrigger>
>(({ className, render, ...props }, ref) => (
  <MenuTrigger
    ref={ref}
    render={render}
    className={cn("outline-none", className)}
    {...props}
  />
))
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuPortal = MenuPortal

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof MenuPopup>,
  React.ComponentPropsWithoutRef<typeof MenuPopup> & {
    align?: "start" | "center" | "end";
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
    alignOffset?: number;
  }
>(({ className, align = "start", side = "bottom", sideOffset = 4, alignOffset = 0, ...props }, ref) => (
  <MenuPortal>
    <MenuPositioner align={align} side={side} sideOffset={sideOffset} alignOffset={alignOffset}>
      <MenuPopup
        ref={ref}
        className={cn(
          "z-[600] min-w-[8rem] overflow-hidden border border-[#E4E4E4] bg-white p-1 text-[#0A0A0A] shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-none",
          className
        )}
        {...props}
      />
    </MenuPositioner>
  </MenuPortal>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof MenuItem>,
  React.ComponentPropsWithoutRef<typeof MenuItem>
>(({ className, ...props }, ref) => (
  <MenuItem
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
  React.ElementRef<typeof MenuCheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenuCheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenuCheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-none py-1.5 pl-8 pr-2 text-xs font-bold uppercase tracking-wider outline-none transition-colors focus:bg-[#F7F7F5] focus:text-[#0055FF] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenuCheckboxItemIndicator>
        <Check className="h-4 w-4 text-[#0055FF]" />
      </MenuCheckboxItemIndicator>
    </span>
    {children}
  </MenuCheckboxItem>
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
  React.ElementRef<typeof MenuSeparator>,
  React.ComponentPropsWithoutRef<typeof MenuSeparator>
>(({ className, ...props }, ref) => (
  <MenuSeparator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[#E4E4E4]", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuGroup = MenuGroup

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
