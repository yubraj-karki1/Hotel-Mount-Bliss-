import Image from "next/image";
import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hotelConfig } from "@/constants/hotel";

export default function AboutPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <Badge variant="accent">Our hotel</Badge>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-tight text-primary sm:text-6xl">A warmer, simpler kind of hospitality</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Hotel Mount Bliss is a place to settle in, slow down, and enjoy your time away. We keep planning simple with direct booking support and clear ways to reach our team.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link href="/booking">Book your stay</Link></Button>
              <Button asChild variant="outline"><a href={hotelConfig.googleMapsUrl} target="_blank" rel="noreferrer"><MapPin /> Get directions</a></Button>
            </div>
          </div>
          <div className="relative min-h-[28rem] overflow-hidden rounded-3xl bg-secondary shadow-soft">
            <Image src="/images/gallery/guest-room.webp" alt="Warm mountain-inspired guest room with natural wood furniture" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent px-6 pb-6 pt-24 text-xs text-white/80">Mountain-inspired comfort</p>
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-accent">Plan your stay</p>
            <h2 className="mt-3 font-serif text-4xl text-primary">The essentials, all in one place</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [Clock3, "Check-in", hotelConfig.checkIn],
                [Clock3, "Check-out", hotelConfig.checkOut],
                [Phone, "Call us", hotelConfig.phones.join(" / ")],
                [Mail, "Email", hotelConfig.email],
              ].map(([Icon, label, value]) => (
                <article key={String(label)} className="rounded-2xl border bg-card p-6 shadow-soft">
                  <Icon className="size-5 text-accent" />
                  <h3 className="mt-4 font-semibold text-primary">{String(label)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(value)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
