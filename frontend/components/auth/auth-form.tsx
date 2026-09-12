"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/toast";
import { authApi } from "@/services/auth-api";
import { useCurrentUser } from "@/hooks/use-current-user";

const authSchema = z.object({
  name: z.string().optional(),
  email: z.email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string()
    .min(8, "Use at least 8 characters")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/\d/, "Include a number"),
  confirmPassword: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;
type AuthMode = "login" | "register";

export function AuthForm({ mode, checkCurrentUser = true }: { mode: AuthMode; checkCurrentUser?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isRegistering = mode === "register";
  const { data: currentUser } = useCurrentUser(checkCurrentUser);

  useEffect(() => {
    if (currentUser) router.replace(currentUser.role === "CUSTOMER" ? "/home" : currentUser.role === "HOUSEKEEPER" ? "/admin/housekeeping" : "/admin");
  }, [currentUser, router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ resolver: zodResolver(authSchema) });

  function validateRegistration(values: AuthFormValues) {
    if (!values.name || values.name.trim().length < 2) {
      setError("name", { message: "Enter your full name" });
      return false;
    }

    if (!values.phone || values.phone.trim().length < 7) {
      setError("phone", { message: "Enter a valid phone number" });
      return false;
    }

    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return false;
    }

    return true;
  }

  async function submitForm(values: AuthFormValues) {
    if (isRegistering && !validateRegistration(values)) return;

    try {
      let role = "CUSTOMER";
      if (isRegistering) {
        const response = await authApi.register({
          name: values.name!.trim(),
          email: values.email,
          phone: values.phone!.trim(),
          password: values.password,
        }); role = response.data.data.user.role;
      } else {
        const response = await authApi.login({
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe ?? false,
        }); role = response.data.data.user.role;
      }

      toast.success(isRegistering ? "Account created" : "Login successful");
      await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const safeNext = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : null;
      router.replace(role === "CUSTOMER" ? (safeNext ?? "/home") : role === "HOUSEKEEPER" ? "/admin/housekeeping" : "/admin");
      router.refresh();
    } catch (error) {
      const serverMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      setError("root", {
        message: serverMessage ?? "Unable to connect to the server. Please try again.",
      });
    }
  }

  function renderField(
    name: keyof AuthFormValues,
    label: string,
    type = "text",
    autoComplete?: string,
  ) {
    return (
      <label className="grid gap-1.5 text-sm font-semibold">
        {label}
        {type === "password" ? <PasswordInput autoComplete={autoComplete} aria-invalid={Boolean(errors[name])} {...register(name)} /> : <Input type={type} autoComplete={autoComplete} aria-invalid={Boolean(errors[name])} {...register(name)} />}
        {errors[name] && (
          <span className="text-xs font-normal text-destructive">
            {errors[name]?.message}
          </span>
        )}
      </label>
    );
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit(submitForm)} noValidate>
      {isRegistering && renderField("name", "Full name", "text", "name")}
      {renderField("email", "Email", "email", "email")}
      {isRegistering && renderField("phone", "Phone", "tel", "tel")}
      {renderField("password", "Password", "password", isRegistering ? "new-password" : "current-password")}
      {isRegistering && renderField("confirmPassword", "Confirm password", "password", "new-password")}

      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      {!isRegistering && (
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="size-4 accent-primary" {...register("rememberMe")} /> Remember me for 30 days
          </label>
          <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Please wait..." : isRegistering ? "Create account" : "Login"}
      </Button>

      {isRegistering && <p className="text-center text-sm text-muted-foreground">Already have an account? <Link className="font-semibold text-primary hover:underline" href="/login">Login</Link></p>}
    </form>
  );
}
