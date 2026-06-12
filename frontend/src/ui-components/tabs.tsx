import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "../lib/utils";

export const Tabs = TabsPrimitive.Root;

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>;
type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

export function TabsList({ className, ...props }: TabsListProps) {
  return <TabsPrimitive.List className={cn("inline-flex rounded-md border border-[var(--border)] bg-white p-1", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn("rounded px-3 py-1.5 text-sm data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white", className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsContentProps) {
  return <TabsPrimitive.Content className={cn("mt-3", className)} {...props} />;
}
