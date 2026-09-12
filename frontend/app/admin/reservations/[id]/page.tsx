"use client";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { bookingApi } from "@/services/booking-api";
import type { Booking, Room } from "@/types/domain";

export default function ReservationDetails() {
  const { id } = useParams<{id:string}>();
  const client=useQueryClient();
  const q=useQuery({queryKey:["booking",id],queryFn:async()=> (await bookingApi.detail(id)).data.data});
  const change=useMutation({mutationFn:(status:Booking["status"])=>bookingApi.updateStatus(id,status),onSuccess:()=>{toast.success("Reservation updated");client.invalidateQueries({queryKey:["booking",id]});client.invalidateQueries({queryKey:["admin","bookings"]})},onError:()=>toast.error("Reservation could not be updated")});
  if(q.isLoading)return <p>Loading reservation…</p>;
  if(q.isError||!q.data)return <div><PageHeading title="Reservation unavailable" description="This reservation could not be found or loaded."/></div>;
  const reservation=q.data;
  const room=typeof reservation.room==="object"?(reservation.room as Room).name:reservation.room;
  const guest=typeof reservation.guest==="object"?reservation.guest.name:reservation.guestContact.name;
  const nights=Math.max(1,Math.ceil((new Date(reservation.checkOut).getTime()-new Date(reservation.checkIn).getTime())/86_400_000));
  return <div className="mx-auto max-w-5xl"><PageHeading title={`Reservation ${reservation.reference}`} description="Reception workflow with guest, booking, and room context."/><div className="mt-7 grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Guest and stay</CardTitle></CardHeader><CardContent><dl className="grid gap-4">{Object.entries({Guest:guest,Email:reservation.guestContact.email,Phone:reservation.guestContact.phone,Room:room,"Check-in":new Date(reservation.checkIn).toLocaleDateString(),"Check-out":new Date(reservation.checkOut).toLocaleDateString(),Nights:String(nights),Guests:String(reservation.guests)}).map(([key,value])=><div key={key} className="flex justify-between gap-4 border-b pb-3 text-sm"><dt className="text-muted-foreground">{key}</dt><dd className="font-semibold text-right">{value}</dd></div>)}</dl></CardContent></Card><Card><CardHeader><CardTitle>Status and actions</CardTitle></CardHeader><CardContent><Badge variant="secondary">{reservation.status.replaceAll("_"," ")}</Badge>{reservation.specialRequests&&<><p className="mt-6 text-sm font-semibold">Special requests</p><p className="mt-2 text-sm text-muted-foreground">{reservation.specialRequests}</p></>}<div className="mt-7 grid gap-3"><Button disabled={change.isPending||!["PENDING","CONFIRMED"].includes(reservation.status)} onClick={()=>change.mutate("CHECKED_IN")}>Check in guest</Button><Button variant="outline" disabled={change.isPending||reservation.status!=="CHECKED_IN"} onClick={()=>change.mutate("CHECKED_OUT")}>Complete check-out</Button><Button variant="destructive" disabled={change.isPending||["CHECKED_IN","CHECKED_OUT","CANCELLED"].includes(reservation.status)} onClick={()=>change.mutate("CANCELLED")}>Cancel reservation</Button></div></CardContent></Card></div></div>;
}
