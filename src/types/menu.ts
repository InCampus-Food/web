export interface MenuItem {
  id: number;
  canteen_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
}

export interface MenuItemCreate {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category?: string;
  is_available?: boolean;
}
