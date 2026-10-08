import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
export function Button({
  asChild = false,
  className,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("button", className)} {...props} />;
}
