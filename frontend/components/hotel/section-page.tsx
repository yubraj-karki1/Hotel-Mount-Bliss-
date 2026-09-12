import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";
export function SectionPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) { return <SiteShell><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">{eyebrow}</p><h1 className="mt-4 max-w-3xl font-serif text-5xl tracking-tight text-primary sm:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>{children}<Button asChild variant="outline" className="mt-10"><Link href="/home"><ArrowLeft /> Back to home</Link></Button></section></SiteShell>; }
