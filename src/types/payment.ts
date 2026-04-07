export type PaymentMethod = "cod" | "midtrans";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export interface Payment {
  id: number;
  order_id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  snap_token?: string;
  payment_url?: string;
  expired_at?: string;
  paid_at?: string;
  created_at: string;
}

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}
