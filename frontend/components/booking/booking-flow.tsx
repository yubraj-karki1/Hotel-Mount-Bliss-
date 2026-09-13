"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { bookingApi } from "@/services/booking-api";
import { roomApi } from "@/services/room-api";
import { serviceApi } from "@/services/service-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

export function BookingFlow() {
  const client = useQueryClient();
  const initial = useSearchParams().get("room") ?? "";
  const [form, setForm] = useState({ roomId: initial, checkIn: "", checkOut: "", guests: 1, specialRequests: "", guestName: "", guestEmail: "", guestPhone: "", addOnIds: [] as string[] });
  const [created, setCreated] = useState<{ reference: string; totalAmount: number } | null>(null);
  const [waitlisted, setWaitlisted] = useState(false);
  const rooms = useQuery({ queryKey: ["rooms", "booking"], queryFn: async () => (await roomApi.list()).data.data.items, refetchInterval: 15_000, refetchOnWindowFocus: true });
  const services = useQuery({ queryKey: ["services"], queryFn: async () => (await serviceApi.list()).data.data });
  const selectedRoom = rooms.data?.find(room => room._id === form.roomId);
  const selectedRoomBookable = selectedRoom?.status === "AVAILABLE";
  const stayReady = Boolean(form.roomId && form.checkIn && form.checkOut && form.checkOut > form.checkIn);
  const contactReady = form.guestName.trim().length >= 2 && form.guestEmail.includes("@") && form.guestPhone.trim().length >= 7;
  const valid = stayReady && contactReady;
  const alternatives = useQuery({ queryKey: ["room-alternatives", form.roomId, form.checkIn, form.checkOut, form.guests], enabled: stayReady, queryFn: async () => (await roomApi.alternatives(form.roomId, { checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests })).data.data });
  const quote = useMutation({ mutationFn: () => bookingApi.quote(form) });
  const create = useMutation({ mutationFn: () => bookingApi.create(form), onSuccess: response => { setCreated(response.data.data); client.invalidateQueries({ queryKey: ["rooms"] }); toast.success("Booking submitted"); }, onError: error => { client.invalidateQueries({ queryKey: ["rooms"] }); const message = axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined; toast.error(message ?? "Booking could not be submitted. Please try again."); } });
  const waitlist = useMutation({ mutationFn: () => bookingApi.joinWaitlist({ roomId: form.roomId, checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests, name: form.guestName, email: form.guestEmail, phone: form.guestPhone }), onSuccess: () => { setWaitlisted(true); toast.success("You joined the waitlist"); }, onError: () => toast.error("Could not join the waitlist. You may already be listed or the room is available.") });
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => { setForm(current => ({ ...current, [key]: value })); quote.reset(); setWaitlisted(false); };
  const toggleAddOn = (id: string) => update("addOnIds", form.addOnIds.includes(id) ? form.addOnIds.filter(value => value !== id) : [...form.addOnIds, id]);

  if (created) return <Card><CardContent className="grid place-items-center p-10 text-center"><span className="grid size-16 place-items-center rounded-full bg-success/10 text-success"><Check /></span><h2 className="mt-5 font-serif text-3xl text-primary">Booking received</h2><p className="mt-2">Reference: <strong>{created.reference}</strong></p><p className="mt-1 text-muted-foreground">Total: {formatCurrency(created.totalAmount)}. Hotel staff will confirm your stay.</p></CardContent></Card>;

  return <Card><CardContent className="grid gap-5 p-6 sm:p-8">
    <h2 className="font-serif text-3xl text-primary">Reserve your stay</h2>
    <p className="text-sm text-muted-foreground">No account is required. If your first choice is unavailable, choose an alternative or join its waitlist.</p>
    <label className="grid gap-2 text-sm font-semibold">Room<select className="h-11 rounded-md border bg-card px-3" value={form.roomId} onChange={event => update("roomId", event.target.value)}><option value="">Select a room</option>{rooms.data?.map(room => <option key={room._id} value={room._id}>{room.name} — {formatCurrency(room.price)}/night{room.status !== "AVAILABLE" ? ` (${room.status.replaceAll("_", " ").toLowerCase()})` : ""}</option>)}</select></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Check-in<Input type="date" min={new Date().toISOString().slice(0, 10)} value={form.checkIn} onChange={event => update("checkIn", event.target.value)} /></label><label className="grid gap-2 text-sm font-semibold">Check-out<Input type="date" min={form.checkIn} value={form.checkOut} onChange={event => update("checkOut", event.target.value)} /></label></div>
    <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Full name<Input required value={form.guestName} onChange={event => update("guestName", event.target.value)} /></label><label className="grid gap-2 text-sm font-semibold">Email<Input required type="email" value={form.guestEmail} onChange={event => update("guestEmail", event.target.value)} /></label><label className="grid gap-2 text-sm font-semibold">Phone<Input required type="tel" value={form.guestPhone} onChange={event => update("guestPhone", event.target.value)} /></label><label className="grid gap-2 text-sm font-semibold">Guests<Input type="number" min={1} max={20} value={form.guests} onChange={event => update("guests", Number(event.target.value))} /></label></div>
    {services.data?.length ? <fieldset className="grid gap-3"><legend className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-accent" />Enhance your stay</legend>{services.data.map(service => <label key={service._id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"><input className="mt-1 size-4 accent-primary" type="checkbox" checked={form.addOnIds.includes(service._id)} onChange={() => toggleAddOn(service._id)} /><span className="flex-1"><span className="block font-semibold">{service.name}</span><span className="text-sm text-muted-foreground">{service.description}</span></span><strong className="text-sm">+{formatCurrency(service.price)}</strong></label>)}</fieldset> : null}
    <label className="grid gap-2 text-sm font-semibold">Special requests<Textarea value={form.specialRequests} onChange={event => update("specialRequests", event.target.value)} /></label>
    {quote.data && <div className="grid gap-1 rounded-lg bg-secondary p-4 text-sm"><p>Room ({quote.data.data.data.nights} night(s))<strong className="float-right">{formatCurrency(quote.data.data.data.roomTotal)}</strong></p>{quote.data.data.data.addOnTotal > 0 && <p>Add-ons<strong className="float-right">{formatCurrency(quote.data.data.data.addOnTotal)}</strong></p>}<p className="mt-1 border-t pt-2 text-base font-semibold">Total<span className="float-right">{formatCurrency(quote.data.data.data.totalAmount)}</span></p></div>}
    {(!selectedRoomBookable || quote.isError) && stayReady && <div className="grid gap-3 rounded-lg border border-accent/40 bg-accent/5 p-4"><strong>{selectedRoom?.name} is unavailable</strong><p className="text-sm text-muted-foreground">We’ll email you if it becomes available for these dates. Alerts are first-come, first-served.</p><Button type="button" variant="outline" disabled={!valid || waitlist.isPending || waitlisted} onClick={() => waitlist.mutate()}>{waitlisted ? "You’re on the waitlist" : waitlist.isPending ? "Joining…" : "Join waitlist"}</Button></div>}
    {alternatives.data?.length && (!selectedRoomBookable || quote.isError) ? <div className="grid gap-3"><h3 className="font-serif text-2xl text-primary">Available alternatives</h3>{alternatives.data.map(room => <button type="button" key={room._id} onClick={() => update("roomId", room._id!)} className="flex items-center justify-between rounded-lg border p-4 text-left transition hover:border-primary"><span><strong className="block">{room.name}</strong><span className="text-sm text-muted-foreground">Up to {room.capacity} guests{selectedRoom && room.price > selectedRoom.price ? " · Upgrade" : ""}</span></span><span className="font-semibold">{formatCurrency(room.price)}/night</span></button>)}</div> : null}
    <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={!valid || quote.isPending || !selectedRoomBookable} onClick={() => quote.mutate()}>Check price</Button><Button disabled={!valid || create.isPending || !selectedRoomBookable} onClick={() => create.mutate()}>{create.isPending ? "Submitting…" : "Create booking"}</Button></div>
  </CardContent></Card>;
}
