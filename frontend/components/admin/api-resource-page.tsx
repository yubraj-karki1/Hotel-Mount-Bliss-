"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from "@/components/ui/table";
import type { Envelope,Paged } from "@/types/domain";

type Row=Record<string,unknown>&{_id?:string};
type Field={key:string;label:string};
const value=(row:Row,key:string)=>key.split(".").reduce<unknown>((v,k)=>v&&typeof v==="object"?(v as Record<string,unknown>)[k]:undefined,row);
const display=(raw:unknown)=>typeof raw==="object"?JSON.stringify(raw):String(raw??"—");

export function ApiResourcePage({title,description,endpoint,fields,paged=true}:{title:string;description:string;endpoint:string;fields:Field[];paged?:boolean}){
  const [search,setSearch]=useState("");
  const q=useQuery({queryKey:["admin",endpoint,paged],queryFn:async()=>{const r=await apiClient.get<Envelope<Paged<Row>|Row[]>>(endpoint);const data=r.data.data;return Array.isArray(data)?data:data.items}});
  const rows=useMemo(()=>{const term=search.trim().toLowerCase();return term?(q.data??[]).filter(row=>fields.some(field=>display(value(row,field.key)).toLowerCase().includes(term))):q.data??[]},[fields,q.data,search]);
  return <div className="mx-auto max-w-[1500px]"><PageHeading title={title} description={description}/><label className="relative mt-7 block max-w-lg"><span className="sr-only">Search {title}</span><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground"/><Input className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}`}/></label><div className="mt-4 overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow>{fields.map(f=><TableHead key={f.key}>{f.label}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row,i)=><TableRow key={row._id??i}>{fields.map((f,j)=>{const text=display(value(row,f.key));return <TableCell key={f.key}>{j===fields.length-1?<Badge variant="secondary">{text}</Badge>:text}</TableCell>})}</TableRow>)}</TableBody></Table>{q.isLoading&&<p className="p-5">Loading…</p>}{q.isError&&<p className="p-5 text-destructive">Data could not be loaded.</p>}{!q.isLoading&&rows.length===0&&<p className="p-5 text-muted-foreground">No matching records.</p>}</div></div>
}
