import { createClient } from "@/lib/supabase/server";

export interface LifeArea {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export async function getLifeAreas(): Promise<LifeArea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("life_areas")
    .select("id, name, description, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load life areas: ${error.message}`);
  return data ?? [];
}
