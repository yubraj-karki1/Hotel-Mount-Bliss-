import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide", { variants: { variant: { default: "border-transparent bg-primary text-primary-foreground", secondary: "border-transparent bg-secondary text-secondary-foreground", accent: "border-accent/20 bg-accent/15 text-accent-foreground", success: "border-success/20 bg-success/12 text-success", warning: "border-warning/20 bg-warning/12 text-warning", destructive: "border-destructive/20 bg-destructive/10 text-destructive", outline: "text-foreground" } }, defaultVariants: { variant: "default" } });
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) { return <span className={cn(badgeVariants({ variant }), className)} {...props} />; }
