"use client";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/services/booking-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from "@/components/ui/table";
import type { Booking,Room } from "@/types/domain";

type Filters = { search?: string; from?: string; to?: string };

export function ReservationsTable({ compact=false, filters={} }:{ compact?:boolean; filters?:Filters }) {
  const client=useQueryClient();
  const params=Object.fromEntries(Object.entries(filters).filter((entry): entry is [string,string]=>Boolean(entry[1])));
  const q=useQuery({queryKey:["admin","bookings",params],queryFn:async()=> (await bookingApi.list({...params,pageSize:compact?"5":"100"})).data.data.items});
  const change=useMutation({mutationFn:({id,status}:{id:string;status:Booking["status"]})=>bookingApi.updateStatus(id,status),onSuccess:()=>{toast.success("Reservation updated");client.invalidateQueries({queryKey:["admin","bookings"]})},onError:()=>toast.error("Reservation could not be updated")});
  return <div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Booking</TableHead><TableHead>Guest</TableHead><TableHead>Room</TableHead><TableHead>Check-in</TableHead><TableHead>Check-out</TableHead><TableHead>Status</TableHead>{!compact&&<TableHead>Actions</TableHead>}</TableRow></TableHeader><TableBody>{q.data?.map(r=><TableRow key={r._id}><TableCell className="font-semibold"><Link className="hover:underline" href={`/admin/reservations/${r._id}`}>{r.reference}</Link></TableCell><TableCell>{typeof r.guest==="object"?r.guest.name:r.guestContact?.name??"Guest"}</TableCell><TableCell>{typeof r.room==="object"?(r.room as Room).name:r.room}</TableCell><TableCell>{new Date(r.checkIn).toLocaleDateString()}</TableCell><TableCell>{new Date(r.checkOut).toLocaleDateString()}</TableCell><TableCell><Badge variant="secondary">{r.status.replaceAll("_"," ")}</Badge></TableCell>{!compact&&<TableCell className="flex gap-2"><Button size="sm" disabled={change.isPending||!["PENDING","CONFIRMED"].includes(r.status)} onClick={()=>change.mutate({id:r._id,status:"CHECKED_IN"})}>Check in</Button><Button size="sm" variant="outline" disabled={change.isPending||r.status!=="CHECKED_IN"} onClick={()=>change.mutate({id:r._id,status:"CHECKED_OUT"})}>Check out</Button></TableCell>}</TableRow>)}</TableBody></Table>{q.isLoading&&<p className="p-5">Loading…</p>}{q.isError&&<p className="p-5 text-destructive">Reservations could not be loaded.</p>}{q.data?.length===0&&<p className="p-5 text-muted-foreground">No reservations match these filters.</p>}</div>;
}
