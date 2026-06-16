import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  success: "border-transparent bg-green-100 text-green-800 hover:bg-green-100",
  info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100",
  warning: "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  danger: "border-transparent bg-red-100 text-red-800 hover:bg-red-100",
  neutral: "border-transparent bg-stone-100 text-stone-800 hover:bg-stone-100"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
