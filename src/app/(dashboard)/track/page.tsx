"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { orderApi } from "@/lib/api/order";
import { Order, OrderStatus } from "@/types/order";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Circle, Clock, ChefHat, Truck, MapPin, XCircle, RefreshCw } from "lucide-react";

const steps = [
  { key: "pending", label: "Pesanan Diterima", icon: Clock, desc: "Menunggu konfirmasi kantin" },
  { key: "confirmed", label: "Dikonfirmasi ", icon: CheckCircle, desc: "Kantin telah mengkonfirmasi pesanan anda" },
  { key: "preparing", label: "Sedang Dimasak", icon: ChefHat, desc: "Makananmu sedang disiapkan" },
  { key: "delivering", label: "Sedang Diantar", icon: Truck, desc: "Pesananmu dalam perjalanan" },
  { key: "delivered", label: "Tiba!", icon: MapPin, desc: "Pesananmu sudah tiba!" },
];

const statusOrder: OrderStatus[] = ["pending", "confirmed", "preparing", "delivering", "delivered"];

const statusBadge: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Menunggu", variant: "outline" },
  confirmed: { label: "Dikonfirmasi", variant: "secondary" },
  preparing: { label: "Dimasak", variant: "secondary" },
  delivering: { label: "Diantar", variant: "default" },
  delivered: { label: "Terkirim", variant: "default" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
};

export default function TrackPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.myOrders();
      setOrders(data);
      if (orderId) {
        const found = data.find((o) => o.id === Number(orderId));
        setSelectedOrder(found ?? data[0] ?? null);
      } else {
        setSelectedOrder(data[0] ?? null);
      }
    } catch {
      toast.error("Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async () => {
    if (!selectedOrder) return;
    setIsCancelling(true);
    try {
      const updated = await orderApi.cancel(selectedOrder.id);
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
      toast.success("Pesanan dibatalkan");
    } catch (error: any) {
      const msg = typeof error?.response?.data?.detail === "string"
        ? error.response.data.detail
        : "Gagal membatalkan pesanan";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const currentStep = selectedOrder
    ? statusOrder.indexOf(selectedOrder.status as OrderStatus)
    : -1;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lacak Pesanan</h1>
          <p className="text-muted-foreground">{orders.length} pesanan</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <ShoppingBagIcon className="h-10 w-10 mb-2" />
          <p>Belum ada pesanan</p>
          <Button className="mt-4" onClick={() => window.location.href = "/order"}>Pesan Sekarang</Button>
        </div>
      ) : (
        <>
          {/* Order List */}
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  selectedOrder?.id === order.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
                }`}
              >
                <div>
                  <p className="font-mono font-medium text-sm">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.ordered_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rp {order.total_price.toLocaleString("id-ID")}</span>
                  <Badge variant={statusBadge[order.status as OrderStatus]?.variant ?? "outline"}>
                    {statusBadge[order.status as OrderStatus]?.label ?? order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Order Detail */}
          {selectedOrder && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-mono text-base">#{selectedOrder.id}</CardTitle>
                  <Badge variant={statusBadge[selectedOrder.status as OrderStatus]?.variant ?? "outline"}>
                    {statusBadge[selectedOrder.status as OrderStatus]?.label ?? selectedOrder.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.menu_item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                        <span>Rp {item.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span>Rp {selectedOrder.total_price.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {(selectedOrder.status === "pending" || selectedOrder.status === "confirmed") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Membatalkan..." : "Batalkan Pesanan"}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Tracking Steps */}
              {selectedOrder.status !== "cancelled" ? (
                <Card>
                  <CardHeader><CardTitle className="text-base">Status Pesanan</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isDone = index <= currentStep;
                        const isCurrent = index === currentStep;
                        return (
                          <div key={step.key} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={isDone ? "text-primary" : "text-muted-foreground"}>
                                {isDone ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                              </div>
                              {index < steps.length - 1 && (
                                <div className={`w-0.5 h-8 mt-1 ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
                              )}
                            </div>
                            <div className={`pt-1 ${!isDone ? "opacity-40" : ""}`}>
                              <p className={`text-sm font-medium ${isCurrent ? "text-primary" : ""}`}>{step.label}</p>
                              <p className="text-xs text-muted-foreground">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-destructive">
                  <CardContent className="flex items-center gap-3 p-4 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">Pesanan ini telah dibatalkan</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
