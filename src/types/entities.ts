export interface User {
  id: string;
  email: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  is_coach?: boolean;
  isCoach?: boolean;
  created_at?: string;
}

export interface Category {
  id: string | number;
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  image_url?: string;
  image_path?: string;
  is_public?: boolean;
}

export interface Video {
  id?: string | number;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  category_id?: string | number;
  video_url?: string;
  video_path?: string;
  thumbnail_url?: string;
  thumbnail_path?: string;
  is_public?: boolean;
  duration_seconds?: number;
  categories?: Category;
}

export interface Package {
  id: string | number;
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  price_egp?: number;
  price_usd?: number;
  price_egp_3m?: number;
  price_usd_3m?: number;
  price_egp_6m?: number;
  price_usd_6m?: number;
  duration_days?: number;
  allow_1_month?: boolean;
  allow_3_months?: boolean;
  allow_6_months?: boolean;
  available_durations?: number[];
}
