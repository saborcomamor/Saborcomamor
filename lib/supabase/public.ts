import type { SitePhoto, PhotoCategory } from "@/lib/photos";

const categories: Record<string, PhotoCategory> = {
  pratos: "Pratos", eventos: "Eventos", buffets: "Buffets", bastidores: "Bastidores",
};

type PhotoRow = {
  id: string; published_storage_path: string | null; alt_text: string;
  caption: string | null; album_id: string | null;
};
type AlbumRow = { id: string; category: string };

/** Apenas registros publicados e autorizados por RLS entram na galeria pública. */
export async function getPublishedPhotos(): Promise<SitePhoto[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return [];
  const headers = { apikey: key };
  try {
    const [photosResult, albumsResult] = await Promise.all([
      fetch(`${base}/rest/v1/photos?select=id,published_storage_path,alt_text,caption,album_id&is_published=eq.true&order=sort_order.asc`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/rest/v1/albums?select=id,category&is_published=eq.true`, { headers, next: { revalidate: 60 } }),
    ]);
    if (!photosResult.ok || !albumsResult.ok) return [];
    const images: PhotoRow[] = await photosResult.json();
    const albums: AlbumRow[] = await albumsResult.json();
    const categoryByAlbum = new Map(albums.map(album => [album.id, album.category]));
    return images.filter(item => item.published_storage_path && (!item.album_id || categoryByAlbum.has(item.album_id)))
      .map(item => ({
        id: item.id,
        src: `${base}/storage/v1/object/public/sabor-publicadas/${item.published_storage_path!.split("/").map(encodeURIComponent).join("/")}`,
        alt: item.alt_text,
        category: categories[categoryByAlbum.get(item.album_id ?? "") ?? "buffets"] ?? "Buffets",
        label: item.caption || "Um momento cheio de sabor",
      }));
  } catch {
    // Sem imagens ou rede não impede renderização das seções de apresentação.
    return [];
  }
}
