"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AvailabilityNotice } from "@/components/hotel/availability-notice";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roomApi } from "@/services/room-api";
import { RoomCard } from "./room-card";

type AvailabilityFilters = { checkIn?: string; checkOut?: string; guests?: string; type?: string };
export function RoomBrowser({ initialFilters = {} }: { initialFilters?: AvailabilityFilters }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const hasAvailabilitySearch = Boolean(initialFilters.checkIn || initialFilters.checkOut || initialFilters.guests || (initialFilters.type && initialFilters.type !== "any"));
  const roomParams = { ...(initialFilters.type && initialFilters.type !== "any" ? { type: initialFilters.type } : {}), ...(hasAvailabilitySearch ? { bookable: "true", ...(initialFilters.checkIn ? { checkIn: initialFilters.checkIn } : {}), ...(initialFilters.checkOut ? { checkOut: initialFilters.checkOut } : {}), ...(initialFilters.guests ? { guests: initialFilters.guests } : {}) } : {}) };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey:["rooms","public",roomParams], queryFn: async()=> (await roomApi.list(roomParams)).data.data.items });

  const filteredRooms = useMemo(() => {
    const requestedGuests = Number(initialFilters.guests) || 0;
    const matchingRooms = (data ?? []).filter((room) => room.capacity >= requestedGuests &&
      `${room.name} ${room.type} ${room.amenities.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

    return [...matchingRooms].sort((first, second) => {
      if (sort === "low") return first.price - second.price;
      if (sort === "high") return second.price - first.price;
      return 0;
    });
  }, [data, initialFilters.guests, query, sort]);

  if(isLoading) return <p className="py-12 text-muted-foreground">Loading rooms…</p>;
  if(isError) return <div className="py-12"><p className="text-destructive">Rooms could not be loaded.</p><button className="mt-3 underline" onClick={()=>void refetch()}>Try again</button></div>;
  return <>
    <AvailabilityNotice />
    {hasAvailabilitySearch&&<p className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">Showing available rooms{initialFilters.type&&initialFilters.type!=="any"?` · ${initialFilters.type}`:""}{initialFilters.guests?` · ${initialFilters.guests} guest(s)`:""}{initialFilters.checkIn?` · from ${initialFilters.checkIn}`:""}{initialFilters.checkOut?` to ${initialFilters.checkOut}`:""}.</p>}
    <div className="mt-8 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search rooms</span>
        <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search rooms or amenities" />
      </label>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Recommended</SelectItem>
          <SelectItem value="low">Price: low to high</SelectItem>
          <SelectItem value="high">Price: high to low</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <p className="mt-6 text-sm text-muted-foreground">{filteredRooms.length} rooms found</p>
    <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {filteredRooms.map((room) => <RoomCard key={room._id} room={room} />)}
    </div>
  </>;
}
