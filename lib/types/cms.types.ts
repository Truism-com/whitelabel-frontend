export interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  code?: string;
  coupon_code?: string;
  discount_type?: "flat" | "percentage";
  discount_value?: number;
  image_url?: string;
  valid_from?: string;
  valid_to?: string;
  valid_until?: string;
  is_active: boolean;
  slug?: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_url?: string;
  featured_image?: string;
  category?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
