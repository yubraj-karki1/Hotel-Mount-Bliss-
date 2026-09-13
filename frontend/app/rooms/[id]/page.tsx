"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, Check, Users } from "lucide-react";
import { roomApi } from "@/services/room-api";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { roomImageUrl } from "@/lib/room-image";

export default function RoomDetails() {
  const id = String(useParams().id);
  const q = useQuery({ queryKey: ["room", id], queryFn: async () => (await roomApi.detail(id)).data.data, refetchInterval: 15_000, refetchOnWindowFocus: true });
  if (q.isLoading) return <SiteShell><p className="mx-auto max-w-7xl p-10">Loading room…</p></SiteShell>;
  if (!q.data) return <SiteShell><p className="mx-auto max-w-7xl p-10 text-destructive">Room not found.</p></SiteShell>;

  const room = q.data;
  const available = room.status === "AVAILABLE";
  const statusLabel = room.status.replaceAll("_", " ");
  return <SiteShell><section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          {room.images.map((photo, index) => <div key={photo} className={`relative overflow-hidden rounded-2xl bg-secondary ${index === 0 ? "aspect-[16/9] sm:col-span-2" : "aspect-[4/3]"}`}><Image src={roomImageUrl(photo)} alt={`${room.name} photo ${index + 1}`} fill unoptimized priority={index === 0} sizes={index === 0 ? "(min-width: 1024px) 800px, 100vw" : "(min-width: 640px) 400px, 100vw"} className="object-cover" /></div>)}
        </div>
        <Badge className="mt-8" variant={available ? "accent" : "destructive"}>{available ? room.type : statusLabel}</Badge>
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
