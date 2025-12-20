export interface Crop {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CropRotation {
  id: string;
  user_id: string;
  name: string;
  property_id?: string | null;
  plot_name: string;
  year: number;
  season: string;
  crop_name: string;
  plant_date?: string | null;
  harvest_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}
