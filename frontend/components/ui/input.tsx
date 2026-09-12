import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({ className, type, ...props }: React.ComponentProps<"input">) { return <input type={type} className={cn("flex h-11 w-full rounded-[var(--radius)] border border-input bg-card px-3.5 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/75 hover:border-primary/35 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />; }
