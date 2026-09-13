"use client";

import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { roomApi } from "@/services/room-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { roomStatusStyles } from "@/constants/status";
import { roomImageUrl } from "@/lib/room-image";
import type { Room, RoomStatus } from "@/types/domain";

const MAX_PHOTOS = 8;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const initialForm: Omit<Room, "_id"> = { name: "", type: "", price: 0, capacity: 2, floor: 1, bed: "Double bed", description: "", status: "AVAILABLE", amenities: [], images: [], isActive: true };

export function RoomsTable() {
  const client = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const photosRef = useRef(photos);
  const [photoError, setPhotoError] = useState("");
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.preview)), []);

  const rooms = useQuery({ queryKey: ["rooms"], queryFn: async () => (await roomApi.list({ pageSize: 100 })).data.data.items });
  const refresh = () => client.invalidateQueries({ queryKey: ["rooms"] });
  const update = useMutation({ mutationFn: ({ id, status }: { id: string; status: RoomStatus }) => roomApi.update(id, { status }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: roomApi.remove, onSuccess: () => { refresh(); toast.success("Room archived"); } });
  const create = useMutation({
    mutationFn: async () => {
      if (!photos.length) throw new Error("Please upload at least one room photo.");
      const uploaded = await roomApi.uploadPhotos(photos.map(photo => photo.file));
      return roomApi.create({ ...form, images: uploaded.data.data });
    },
    onSuccess: () => {
      refresh(); photos.forEach(photo => URL.revokeObjectURL(photo.preview)); setPhotos([]); setForm(initialForm); setOpen(false); toast.success("Room created");
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ?? (error as Error).message ?? "Room could not be created";
      if (!photos.length) setPhotoError("Please upload at least one room photo.");
      toast.error(message);
    },
  });

  const choosePhotos = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    if (photos.length + selected.length > MAX_PHOTOS) return setPhotoError(`You can upload up to ${MAX_PHOTOS} photos.`);
    if (selected.some(file => !PHOTO_TYPES.includes(file.type))) return setPhotoError("Room photos must be JPEG, PNG, or WebP images.");
    if (selected.some(file => file.size > MAX_PHOTO_SIZE)) return setPhotoError("Each room photo must be 5 MB or smaller.");
    setPhotoError("");
    setPhotos(current => [...current, ...selected.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    if (inputRef.current) inputRef.current.value = "";
  };
  const removePhoto = (index: number) => setPhotos(current => current.filter((photo, photoIndex) => { if (photoIndex === index) URL.revokeObjectURL(photo.preview); return photoIndex !== index; }));
  const submit = () => { if (!photos.length) { setPhotoError("Please upload at least one room photo."); return; } create.mutate(); };
  const visible = (rooms.data ?? []).filter(room => room.name.toLowerCase().includes(query.toLowerCase()));

  return <>
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1"><Search className="absolute left-3 top-3.5 size-4" /><Input className="pl-9" placeholder="Search rooms" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus />Add room</Button></DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Add room</DialogTitle><DialogDescription>Create a room in the hotel inventory. Fields marked * are required.</DialogDescription></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2"><Input aria-label="Room name" placeholder="Room name *" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /><Input aria-label="Room type" placeholder="Room type *" value={form.type} onChange={event => setForm({ ...form, type: event.target.value })} /></div>
            <Input aria-label="Bed" placeholder="Bed *" value={form.bed} onChange={event => setForm({ ...form, bed: event.target.value })} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><Input aria-label="Price" type="number" min="0" placeholder="Price *" value={form.price || ""} onChange={event => setForm({ ...form, price: Number(event.target.value) })} /><Input aria-label="Capacity" type="number" min="1" value={form.capacity} onChange={event => setForm({ ...form, capacity: Number(event.target.value) })} /><Input aria-label="Floor" type="number" value={form.floor} onChange={event => setForm({ ...form, floor: Number(event.target.value) })} /></div>
            <section aria-labelledby="room-photos-label" className="rounded-xl border bg-muted/35 p-4">
              <div className="flex items-start justify-between gap-4"><div><h3 id="room-photos-label" className="text-sm font-semibold">Room Photos <span className="text-destructive">*</span></h3><p className="mt-1 text-xs text-muted-foreground">Upload 1–8 JPEG, PNG, or WebP photos. Maximum 5 MB each.</p></div><ImagePlus className="size-5 text-accent" /></div>
              <input ref={inputRef} className="sr-only" id="room-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => choosePhotos(event.target.files)} />
              <Button className="mt-4" type="button" variant="outline" onClick={() => inputRef.current?.click()}><ImagePlus />{photos.length ? "Add more photos" : "Choose photos"}</Button>
              {photos.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo, index) => <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-secondary" key={`${photo.file.name}-${index}`}><Image src={photo.preview} alt={`Selected room photo ${index + 1}`} fill unoptimized className="object-cover" /><button type="button" onClick={() => removePhoto(index)} aria-label={`Remove photo ${index + 1}`} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-destructive"><X className="size-4" /></button>{index === 0 && <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Cover</span>}</div>)}</div>}
              {photoError && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{photoError}</p>}
            </section>
          </div>
          <DialogFooter><Button disabled={create.isPending || !form.name || !form.type || !form.bed || form.price < 0} onClick={submit}>{create.isPending ? "Uploading & saving…" : "Save room"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    <div className="mt-5 overflow-x-auto rounded-xl border bg-card"><Table><TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Type</TableHead><TableHead>Floor</TableHead><TableHead>Capacity</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map(room => <TableRow key={room._id}><TableCell><div className="flex items-center gap-3"><div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-secondary"><Image src={roomImageUrl(room.images[0])} alt="" fill unoptimized className="object-cover" /></div><span className="font-semibold">{room.name}</span></div></TableCell><TableCell>{room.type}</TableCell><TableCell>{room.floor}</TableCell><TableCell>{room.capacity}</TableCell><TableCell>Rs. {room.price}</TableCell><TableCell><Badge variant={roomStatusStyles[room.status]}>{room.status}</Badge></TableCell><TableCell><div className="flex gap-2"><Select value={room.status} onValueChange={value => update.mutate({ id: room._id!, status: value as RoomStatus })}><SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger><SelectContent>{Object.keys(roomStatusStyles).map(status => <SelectItem key={status} value={status}>{status.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select><Button size="icon" variant="ghost" aria-label={`Archive ${room.name}`} onClick={() => remove.mutate(room._id!)}><Trash2 /></Button></div></TableCell></TableRow>)}</TableBody></Table></div>
  </>;
}
