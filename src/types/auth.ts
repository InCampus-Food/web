export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "canteen";
}
