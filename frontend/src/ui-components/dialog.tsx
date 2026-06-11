import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/35" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 max-h-[90vh] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-md bg-white p-5 shadow-xl",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button aria-label="닫기" className="absolute right-3 top-3" size="icon" variant="ghost">
            <X size={18} />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("pr-10 text-lg font-bold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-1 text-sm text-slate-600", className)} {...props} />;
}
