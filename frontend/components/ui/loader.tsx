import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
export function Loader({ className, label = "Loading" }: { className?: string; label?: string }) { return <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /><span>{label}</span></span>; }
