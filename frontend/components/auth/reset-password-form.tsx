"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authApi } from "@/services/auth-api";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (password !== confirm) { setError("Passwords do not match"); return; } setBusy(true); setError(""); try { await authApi.resetPassword(token, password); setDone(true); } catch { setError("The reset link is invalid or expired."); } finally { setBusy(false); } }
  if (!token) return <p className="text-destructive">This password-reset link is invalid.</p>;
  if (done) return <div><p className="text-muted-foreground">Your password has been changed successfully.</p><Button asChild className="mt-6"><Link href="/login">Continue to login</Link></Button></div>;
  return <form onSubmit={submit} className="grid gap-5">
    <label className="grid gap-2 text-sm font-semibold">New password<PasswordInput required minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
    <label className="grid gap-2 text-sm font-semibold">Confirm password<PasswordInput required minLength={8} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} /></label>
    {error && <p className="text-sm text-destructive">{error}</p>}
    <Button disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
  </form>;
}
