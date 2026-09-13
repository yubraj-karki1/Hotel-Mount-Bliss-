import Image from "next/image";
import Link from "next/link";
import { BedDouble, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Room } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { roomImageUrl } from "@/lib/room-image";

export function RoomCard({ room }: { room: Room }) {
  const id = room._id ?? room.id!;
  const image = roomImageUrl(room.images[0]);
  const available = !["MAINTENANCE", "OUT_OF_SERVICE"].includes(room.status);
  return <Card className="group overflow-hidden">
    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
      <Image src={image} alt={`${room.name} interior`} fill unoptimized loading="eager" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      <Badge className="absolute left-4 top-4" variant={available ? "accent" : "destructive"}>{available ? room.type : "Booked"}</Badge>
      <div className="absolute right-4 top-4"><FavoriteButton roomId={id} /></div>
    </div>
    <CardContent className="p-5">
      <h2 className="font-serif text-2xl text-primary">{room.name}</h2>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Users className="size-4" />Up to {room.capacity} guests</span>
        <span className="flex items-center gap-1.5"><BedDouble className="size-4" />{room.bed}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{room.amenities.map((amenity) => <Badge key={amenity} variant="secondary">{amenity}</Badge>)}</div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <p><span className="font-serif text-2xl font-semibold text-primary">{formatCurrency(room.price)}</span><span className="text-xs text-muted-foreground"> / night</span></p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild><Link href={`/rooms/${id}`}>Details</Link></Button>
          {available ? <Button size="sm" asChild><Link href={`/booking?room=${id}`}>Book</Link></Button> : <Button size="sm" disabled>Booked</Button>}
        </div>
      </div>
    </CardContent>
  </Card>;
}
