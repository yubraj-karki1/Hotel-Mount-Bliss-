"use client";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
export function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) { return <AvatarPrimitive.Root className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full bg-muted", className)} {...props} />; }
export function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) { return <AvatarPrimitive.Image className={cn("size-full object-cover", className)} {...props} />; }
export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) { return <AvatarPrimitive.Fallback className={cn("grid size-full place-items-center bg-secondary text-sm font-semibold text-secondary-foreground", className)} {...props} />; }
