"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, Check, Users } from "lucide-react";
import { roomApi } from "@/services/room-api";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function RoomDetails() {
  const id = String(useParams().id);
  const q = useQuery({ queryKey: ["room", id], queryFn: async () => (await roomApi.detail(id)).data.data });
  if (q.isLoading) return <SiteShell><p className="mx-auto max-w-7xl p-10">Loading room…</p></SiteShell>;
  if (!q.data) return <SiteShell><p className="mx-auto max-w-7xl p-10 text-destructive">Room not found.</p></SiteShell>;

  const room = q.data;
  const available = !["MAINTENANCE", "OUT_OF_SERVICE"].includes(room.status);
  return <SiteShell><section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="grid aspect-[16/9] place-items-center rounded-2xl bg-secondary"><BedDouble className="size-24 opacity-25" /></div>
        <Badge className="mt-8" variant={available ? "accent" : "destructive"}>{available ? room.type : "Booked"}</Badge>
        <h1 className="mt-3 font-serif text-5xl text-primary">{room.name}</h1>
        <p className="mt-6 leading-8 text-muted-foreground">{room.description}</p>
        <h2 className="mt-10 font-serif text-3xl text-primary">Room details</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <p className="flex gap-2"><Users />Up to {room.capacity} guests</p>
          <p className="flex gap-2"><BedDouble />{room.bed}</p>
          {room.amenities.map((amenity) => <p key={amenity} className="flex gap-2"><Check className="text-success" />{amenity}</p>)}
        </div>
      </div>
      <aside><Card><CardContent className="p-6">
        <p className="text-sm text-muted-foreground">Rate from</p>
        <p className="font-serif text-4xl text-primary">{formatCurrency(room.price)} <span className="text-sm">/ night</span></p>
        {available ? <Button className="mt-5 w-full" asChild><Link href={`/booking?room=${room._id}`}>Reserve now</Link></Button> : <>
          <Button className="mt-5 w-full" asChild><Link href={`/booking?room=${room._id}`}>Join waitlist</Link></Button>
          <p className="mt-3 text-sm text-muted-foreground">Choose your dates to receive an availability alert or see alternative rooms.</p>
        </>}
      </CardContent></Card></aside>
    </div>
  </section></SiteShell>;
}
