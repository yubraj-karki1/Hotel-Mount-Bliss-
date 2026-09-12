import * as React from "react";
import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) { return <textarea className={cn("min-h-28 w-full resize-y rounded-[var(--radius)] border border-input bg-card px-3.5 py-3 text-sm shadow-sm placeholder:text-muted-foreground/75 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />; }
