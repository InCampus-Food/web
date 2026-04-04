export interface Canteen {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  location?: string;
  is_open: boolean;
  created_at: string;
}
