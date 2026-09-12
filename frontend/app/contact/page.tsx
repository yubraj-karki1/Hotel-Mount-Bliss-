import { Clock, ExternalLink, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { ContactForm } from "@/components/hotel/contact-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { hotelConfig } from "@/constants/hotel";

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.32em] text-accent">Find us</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-primary sm:text-6xl">A peaceful place is closer than you think</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Use the verified Google Maps location below for directions to Hotel Mount Bliss.</p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-2xl border bg-card shadow-soft lg:grid-cols-[1.3fr_.7fr]">
          <div className="min-h-96 bg-secondary">
            <iframe src={hotelConfig.mapEmbedUrl} title="Hotel Mount Bliss location on Google Maps" className="h-full min-h-96 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><MapPin /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[.25em] text-accent">Verified map listing</p>
            <h2 className="mt-2 font-serif text-3xl text-primary">{hotelConfig.mapLabel}</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Coordinates: {hotelConfig.coordinates.latitude}, {hotelConfig.coordinates.longitude}</p>
            <Button asChild className="mt-7 w-fit"><a href={hotelConfig.googleMapsUrl} target="_blank" rel="noreferrer">Open directions <ExternalLink /></a></Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6">
            <Mail className="size-6 text-accent" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</p>
            <a href={`mailto:${hotelConfig.email}`} className="mt-2 block font-semibold text-primary hover:text-accent">{hotelConfig.email}</a>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Phone className="size-6 text-accent" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
            <div className="mt-2 grid gap-1">{hotelConfig.phones.map(phone => <a key={phone} href={`tel:${phone}`} className="font-semibold text-primary hover:text-accent">{phone}</a>)}</div>
          </div>
          <div className="rounded-2xl border bg-card p-6 sm:col-span-2 lg:col-span-1">
            <Clock className="size-6 text-accent" />
            <dl className="mt-4 grid gap-3 text-sm"><div><dt className="font-bold text-primary">Check-in</dt><dd className="mt-1 text-muted-foreground">{hotelConfig.checkIn}</dd></div><div><dt className="font-bold text-primary">Check-out</dt><dd className="mt-1 text-muted-foreground">{hotelConfig.checkOut}</dd></div></dl>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div><MessageSquare className="size-8 text-accent"/><h2 className="mt-5 font-serif text-4xl text-primary">Send an enquiry</h2><p className="mt-4 leading-7 text-muted-foreground">Tell us how we can help and the hotel team will follow up.</p></div>
          <ContactForm />
        </div>
      </section>
    </SiteShell>
  );
}
