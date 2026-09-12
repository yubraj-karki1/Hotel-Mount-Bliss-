"use client";

import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BedDouble, BookOpen, ConciergeBell, LogOut, Menu, MessageSquare, Sparkles, User, Users, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { authApi } from "@/services/auth-api";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { AuthForm } from "@/components/auth/auth-form";

const allStaff = ["ADMIN","MANAGER","RECEPTIONIST","HOUSEKEEPER"];
const operations = ["ADMIN","MANAGER","RECEPTIONIST"];
const management = ["ADMIN","MANAGER"];
const adminLinks = [{label:"Dashboard",href:"/admin",icon:BarChart3,roles:allStaff},{label:"Reservations",href:"/admin/reservations",icon:BookOpen,roles:operations},{label:"Rooms",href:"/admin/rooms",icon:BedDouble,roles:operations},{label:"Guests",href:"/admin/guests",icon:Users,roles:operations},{label:"Staff",href:"/admin/staff",icon:User,roles:management},{label:"Housekeeping",href:"/admin/housekeeping",icon:Sparkles,roles:allStaff},{label:"Services",href:"/admin/services",icon:ConciergeBell,roles:management},{label:"Reviews",href:"/admin/reviews",icon:MessageSquare,roles:management},{label:"Enquiries",href:"/admin/inquiries",icon:MessageSquare,roles:operations},{label:"Reports",href:"/admin/reports",icon:BarChart3,roles:management},{label:"Settings",href:"/admin/settings",icon:Wrench,roles:management}];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, error } = useCurrentUser();
  const links = adminLinks.filter((link) => user && link.roles.includes(user.role) && !(user.role === "HOUSEKEEPER" && link.href === "/admin"));
  const displayName = user?.name ?? "Administrator";
  const initials = displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (user && !["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPER"].includes(user.role)) router.replace("/forbidden");
  }, [error, router, user]);

  async function logout() {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      queryClient.removeQueries({ queryKey: ["auth"] });
      toast.success("You have been logged out");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Unable to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  if (!user && !error) return <main className="grid min-h-screen place-items-center bg-muted/35 px-5"><p className="text-muted-foreground">Loading secure administration…</p></main>;
  if (axios.isAxiosError(error) && error.response?.status === 401) return <main className="grid min-h-screen place-items-center bg-muted/35 px-5 py-14"><section className="w-full max-w-md rounded-2xl border bg-background p-7 shadow-soft"><p className="text-xs font-bold uppercase tracking-[.3em] text-accent">Hotel administration</p><h1 className="mt-3 font-serif text-4xl text-primary">Staff login</h1><p className="mt-3 text-sm text-muted-foreground">Enter the email and password provided by the hotel administrator.</p><AuthForm mode="login" checkCurrentUser={false}/></section></main>;
  if (!user) return <main className="grid min-h-screen place-items-center px-5 text-destructive">Administration could not be loaded.</main>;

  return <div className="min-h-screen bg-muted/35">
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary text-primary-foreground transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6"><Link href="/admin" className="font-serif text-xl">Mount Bliss <span className="block font-sans text-[9px] uppercase tracking-[.25em] text-white/55">Hotel administration</span></Link><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close sidebar"><X /></button></div>
      <nav className="flex-1 overflow-y-auto p-4">{links.map(({label,href,icon:Icon}) => <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", pathname === href ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/8 hover:text-white")}><Icon className="size-4" />{label}</Link>)}</nav>
      {user&&<div className="mx-4 flex items-center gap-2 border-t border-white/10 py-3 text-sm text-white/70"><NotificationCenter/>Notifications</div>}
      <button type="button" disabled={isLoggingOut} onClick={() => void logout()} className="m-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 hover:bg-white/8 disabled:opacity-50"><LogOut className="size-4" />{isLoggingOut ? "Logging out..." : "Logout"}</button>
    </aside>
    {open && <button className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
    <div className="lg:pl-72"><header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/95 px-5 backdrop-blur lg:px-8"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar"><Menu /></Button><div className="ml-auto flex items-center gap-3"><Avatar>{user?.profileImage && <AvatarImage src={user.profileImage} alt={displayName} />}<AvatarFallback>{initials}</AvatarFallback></Avatar><div className="hidden sm:block"><p className="max-w-48 truncate text-sm font-semibold">{displayName}</p><p className="text-xs capitalize text-muted-foreground">{user?.role?.toLowerCase() ?? "Account"}</p></div></div></header><main className="p-5 lg:p-8">{children}</main></div>
  </div>;
}
