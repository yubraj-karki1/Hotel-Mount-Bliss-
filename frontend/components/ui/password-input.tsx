"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & { inputClassName?: string };

export function PasswordInput({ className, inputClassName, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return <div className={cn("relative", className)}>
    <Input {...props} type={visible ? "text" : "password"} className={cn("pr-11", inputClassName)} />
    <button type="button" className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-[var(--radius)] text-muted-foreground transition-colors hover:text-primary focus-visible:z-10" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} title={visible ? "Hide password" : "Show password"} onClick={() => setVisible(current => !current)}>
      {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
    </button>
  </div>;
}
