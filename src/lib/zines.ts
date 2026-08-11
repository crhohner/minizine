import { supabase } from "./supabaseClient";
import type { CropData, UploadedImage } from "../ImageUpload";

export const DEFAULT_ZINE_NAME = "my minizine";

export interface ZinePage {
  id: string;
  name: string;
  dataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  crop: CropData;
}

export interface ZineSummary {
  id: string;
  name: string;
  firstPage: ZinePage | null;
}

export interface ZineRecord {
  id: string;
  name: string;
  pages: ZinePage[];
}

const zinesCache = new Map<string, ZineSummary[]>();

async function toDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function saveZine({
  id,
  userId,
  name,
  images,
}: {
  id: string | null;
  userId: string;
  name: string;
  images: UploadedImage[];
}): Promise<{ id: string | null; error: string | null }> {
  const pages: ZinePage[] = await Promise.all(
    images.map(async (image) => ({
      id: image.id,
      name: image.name,
      dataUrl: image.url.startsWith("data:")
        ? image.url
        : await toDataUrl(image.url),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      crop: image.crop,
    })),
  );

  if (id) {
    const { error } = await supabase
      .from("zines")
      .update({ name, pages, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) zinesCache.delete(userId);
    return { id, error: error?.message ?? null };
  }

  const { data, error } = await supabase
    .from("zines")
    .insert({ user_id: userId, name, pages })
    .select("id")
    .single();

  if (!error) zinesCache.delete(userId);
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function deleteZine(
  id: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("zines").delete().eq("id", id);
  if (!error) zinesCache.delete(userId);
  return { error: error?.message ?? null };
}

export async function listZines(
  userId: string,
): Promise<{ zines: ZineSummary[]; error: string | null }> {
  const cached = zinesCache.get(userId);
  if (cached) return { zines: cached, error: null };

  const { data, error } = await supabase
    .from("zines")
    .select("id, name, first_page:pages->0")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return { zines: [], error: error.message };

  const zines: ZineSummary[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    firstPage: (row.first_page as ZinePage | null) ?? null,
  }));

  zinesCache.set(userId, zines);
  return { zines, error: null };
}

export async function getZine(
  id: string,
): Promise<{ zine: ZineRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from("zines")
    .select("id, name, pages")
    .eq("id", id)
    .single();

  if (error) return { zine: null, error: error.message };
  return { zine: data as ZineRecord, error: null };
}
