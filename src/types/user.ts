export type Role = "admin" | "canteen" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}
