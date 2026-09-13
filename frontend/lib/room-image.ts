const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export function roomImageUrl(path?: string) {
  if (!path) return "/images/gallery/guest-room.webp";
  if (!path.startsWith("/uploads/")) return path;
  if (apiUrl.startsWith("http")) return `${new URL(apiUrl).origin}${path}`;
  return path;
}
