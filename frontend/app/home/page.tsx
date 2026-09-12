import Link from "next/link";
import Image from "next/image";
import { ArrowRight, HeartHandshake, MapPin, MessageCircle, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeaturedRooms } from "@/components/hotel/featured-rooms";
import { PublicReviews } from "@/components/hotel/public-reviews";
import { Badge } from "@/components/ui/badge";
import { hotelConfig } from "@/constants/hotel";

export default function Homepage() {
  return (
    <SiteShell>
      <section className="relative isolate grid min-h-[calc(100vh-5rem)] place-items-center overflow-hidden px-5 py-24 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(70,107,122,.16),transparent_44%)]" />
        <div className="mx-auto max-w-4xl animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-accent">Welcome to Hotel Mount Bliss</p>
          <h1 className="mt-6 font-serif text-6xl leading-[1.05] tracking-tight text-primary sm:text-8xl">Find Your Bliss</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">Discover thoughtful hospitality, peaceful surroundings, and a stay designed around your comfort.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild><Link href="/rooms">Explore rooms <ArrowRight /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/booking">Book your stay</Link></Button>
          </div>
          <p className="mt-12 text-xs text-muted-foreground">Room information and availability are subject to confirmation by Hotel Mount Bliss.</p>
        </div>
      </section>
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-5 lg:px-8"><form action="/rooms" className="grid gap-4 rounded-2xl border bg-card p-5 shadow-soft md:grid-cols-5"><label className="grid gap-2 text-xs font-bold uppercase tracking-wider">Check-in<Input type="date" name="checkIn" /></label><label className="grid gap-2 text-xs font-bold uppercase tracking-wider">Check-out<Input type="date" name="checkOut" /></label><label className="grid gap-2 text-xs font-bold uppercase tracking-wider">Guests<Select name="guests" defaultValue="2"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4].map(n=><SelectItem key={n} value={`${n}`}>{n} guest{n>1?"s":""}</SelectItem>)}</SelectContent></Select></label><label className="grid gap-2 text-xs font-bold uppercase tracking-wider">Room type<Select name="type" defaultValue="any"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Any type</SelectItem><SelectItem value="deluxe">Deluxe</SelectItem><SelectItem value="family">Family</SelectItem><SelectItem value="standard">Standard</SelectItem></SelectContent></Select></label><Button className="self-end" size="lg">Check availability</Button></form></section>
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">Room collection</p><h2 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">Featured rooms</h2></div><Button asChild variant="ghost" className="hidden sm:flex"><Link href="/rooms">View all <ArrowRight/></Link></Button></div><FeaturedRooms/></section>
      <section className="bg-primary px-5 py-24 text-primary-foreground"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">Why Mount Bliss</p><h2 className="mt-3 max-w-xl font-serif text-4xl sm:text-5xl">Hospitality shaped around comfort</h2><p className="mt-4 text-sm text-white/60">Everything you need for a straightforward, comfortable mountain stay.</p><div className="mt-10 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{[[Sparkles,"Comfortable rooms"],[HeartHandshake,"Thoughtful hospitality"],[Wifi,"Connectivity"],[MapPin,"Verified location"],[MessageCircle,"Direct guest support"],[ShieldCheck,"Secure booking"]].map(([Icon,label])=><article key={String(label)} className="bg-primary p-7"><Icon className="size-6 text-accent"/><h3 className="mt-5 font-serif text-2xl">{String(label)}</h3><p className="mt-2 text-sm leading-6 text-white/60">Designed to make planning and enjoying your stay simple.</p></article>)}</div></div></section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8">
        <div className="relative min-h-[30rem] overflow-hidden rounded-3xl bg-secondary shadow-soft">
          <Image
            src="/images/gallery/guest-room.webp"
            alt="Warm, mountain-inspired guest room representing the Hotel Mount Bliss experience"
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent px-6 pb-6 pt-24 text-xs text-white/80">
            Mountain-inspired guest-room atmosphere
          </div>
        </div>
        <div>
          <Badge variant="accent">About Hotel Mount Bliss</Badge>
          <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight text-primary sm:text-5xl">A peaceful base for your time in the mountains</h2>
          <p className="mt-6 max-w-xl leading-8 text-muted-foreground">Hotel Mount Bliss brings together a comfortable stay, straightforward booking, and a team you can contact whenever you need help planning your visit.</p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Check-out</p>
              <p className="mt-2 font-medium text-primary">By 12:00 PM</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Need help?</p>
              <p className="mt-2 font-medium text-primary">Contact our hotel team</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><Link href="/about">Discover our story <ArrowRight /></Link></Button>
            <Button asChild variant="outline"><Link href="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
      <section className="bg-secondary/55 px-5 py-24"><div className="mx-auto max-w-7xl text-center"><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">Guest impressions</p><h2 className="mt-3 font-serif text-5xl text-primary">Guest reviews</h2><PublicReviews/></div></section>
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="grid overflow-hidden rounded-2xl bg-primary text-primary-foreground lg:grid-cols-2"><div className="p-8 sm:p-12"><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">Verified location</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">Find your way to Mount Bliss</h2><p className="mt-5 max-w-lg leading-7 text-white/65">Plan your journey using the hotel’s official shared Google Maps location.</p><Button asChild variant="secondary" className="mt-7"><a href={hotelConfig.googleMapsUrl} target="_blank" rel="noreferrer"><MapPin/>Open Google Maps</a></Button></div><iframe src={hotelConfig.mapEmbedUrl} title="Hotel Mount Bliss map" className="h-full min-h-80 w-full self-stretch border-0 lg:min-h-[28rem]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></section>
      <section className="px-5 py-24 text-center"><div className="mx-auto max-w-3xl"><h2 className="font-serif text-5xl text-primary">Make your stay memorable</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">Choose your room and reserve your stay in a few simple steps.</p><Button asChild size="lg" className="mt-8"><Link href="/booking">Book your room <ArrowRight/></Link></Button></div></section>
    </SiteShell>
  );
}
