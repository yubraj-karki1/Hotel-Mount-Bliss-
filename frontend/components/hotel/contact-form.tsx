"use client";
import { useState, type FormEvent } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
export function ContactForm(){const [busy,setBusy]=useState(false);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);const form=new FormData(e.currentTarget);try{await apiClient.post("/contact",Object.fromEntries(form));toast.success("Your enquiry has been received");e.currentTarget.reset()}catch{toast.error("Your enquiry could not be sent")}finally{setBusy(false)}}return <form onSubmit={submit} className="grid gap-5 rounded-2xl border bg-card p-6 shadow-soft sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Name<Input name="name" required minLength={2}/></label><label className="grid gap-2 text-sm font-semibold">Email<Input name="email" type="email" required/></label><label className="grid gap-2 text-sm font-semibold sm:col-span-2">Subject<Input name="subject" required minLength={3}/></label><label className="grid gap-2 text-sm font-semibold sm:col-span-2">Message<Textarea name="message" required minLength={10}/></label><Button disabled={busy} className="sm:col-span-2 sm:w-fit" type="submit">{busy?"Sending…":"Send enquiry"}</Button></form>}
