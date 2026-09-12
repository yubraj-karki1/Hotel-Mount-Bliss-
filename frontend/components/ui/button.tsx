import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-semibold transition-[color,background-color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px", { variants: { variant: { default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 hover:shadow-md", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/75", outline: "border bg-transparent hover:bg-secondary/60", ghost: "hover:bg-secondary/70", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", link: "text-primary underline-offset-4 hover:underline" }, size: { default: "h-10 px-4 py-2", sm: "h-9 px-3", lg: "h-12 px-6 text-base", icon: "size-10" } }, defaultVariants: { variant: "default", size: "default" } });

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) { const Comp = asChild ? Slot : "button"; return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />; }
export { buttonVariants };
