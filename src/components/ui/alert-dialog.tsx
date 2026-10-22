'use client';

/**
 * @fileOverview Institutional Alert Dialog component.
 * Refined to use root package namespace imports for consistent runtime behavior.
 */

import * as React from 'react';
import * as BaseUI from '@base-ui/react';
import { cn } from '@/app/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const AlertDialog = BaseUI.AlertDialog.Root;

const AlertDialogTrigger = BaseUI.AlertDialog.Trigger;

const AlertDialogPortal = BaseUI.AlertDialog.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof BaseUI.AlertDialog.Backdrop>,
  React.ComponentPropsWithoutRef<typeof BaseUI.AlertDialog.Backdrop>
>(({ className, ...props }, ref) => (
  <BaseUI.AlertDialog.Backdrop
    className={cn(
      "fixed inset-0 z-50 bg-[#0A0A0A]/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof BaseUI.AlertDialog.Popup>,
  React.ComponentPropsWithoutRef<typeof BaseUI.AlertDialog.Popup> & { size?: 'default' | 'sm' }
>(({ className, size = 'default', ...props }, ref) => (
  <BaseUI.AlertDialog.Portal>
    <AlertDialogOverlay />
    <BaseUI.AlertDialog.Popup
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-6 border border-[#E4E4E4] bg-white p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-none",
        size === 'sm' && "max-w-sm",
        className
      )}
      {...props}
    />
  </BaseUI.AlertDialog.Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3",
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof BaseUI.AlertDialog.Title>,
  React.ComponentPropsWithoutRef<typeof BaseUI.AlertDialog.Title>
>(({ className, ...props }, ref) => (
  <BaseUI.AlertDialog.Title
    ref={ref}
    className={cn("text-lg font-bold uppercase tracking-tight text-[#0A0A0A]", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof BaseUI.AlertDialog.Description>,
  React.ComponentPropsWithoutRef<typeof BaseUI.AlertDialog.Description>
>(({ className, ...props }, ref) => (
  <BaseUI.AlertDialog.Description
    ref={ref}
    className={cn("text-xs text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant: "brand" }), "py-3", className)}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0 py-3",
      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
