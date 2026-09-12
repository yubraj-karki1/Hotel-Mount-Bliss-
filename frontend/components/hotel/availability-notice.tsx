import { Info } from "lucide-react";
import { availabilityNotice } from "@/constants/hotel";
export function AvailabilityNotice() { return <div className="flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-4 py-2 text-xs font-medium text-accent-foreground"><Info className="size-4 shrink-0" aria-hidden="true" />{availabilityNotice}</div>; }
