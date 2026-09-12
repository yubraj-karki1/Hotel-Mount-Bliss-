import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { RoomBrowser } from "@/components/rooms/room-browser";
export const metadata: Metadata = { title: "Rooms", description: "Browse rooms and plan your stay at Hotel Mount Bliss." };
export default async function RoomsPage({searchParams}:{searchParams:Promise<{checkIn?:string;checkOut?:string;guests?:string;type?:string}>}) { const filters=await searchParams;return <SiteShell><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Stay your way</p><h1 className="mt-4 font-serif text-5xl text-primary sm:text-6xl">Find your room</h1><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Compare room options, amenities, and current availability.</p><div className="mt-10"><RoomBrowser initialFilters={filters}/></div></section></SiteShell>; }
