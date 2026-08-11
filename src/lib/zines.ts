import { supabase } from "./supabaseClient";
import type { CropData, UploadedImage } from "../ImageUpload";

export interface ZinePage {
  id: string;
  name: string;
  dataUrl: string;
  crop: CropData;
}

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
      crop: image.crop,
    })),
  );

  if (id) {
    const { error } = await supabase
      .from("zines")
      .update({ name, pages, updated_at: new Date().toISOString() })
      .eq("id", id);
    return { id, error: error?.message ?? null };
  }

  const { data, error } = await supabase
    .from("zines")
    .insert({ user_id: userId, name, pages })
    .select("id")
    .single();

  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function deleteZine(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("zines").delete().eq("id", id);
  return { error: error?.message ?? null };
}
