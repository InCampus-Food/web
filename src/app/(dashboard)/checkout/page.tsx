"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { deliveryPointApi } from "@/lib/api/delivery-point";
import { orderApi } from "@/lib/api/order";
import { paymentApi } from "@/lib/api/payment";
import { DeliveryPoint } from "@/types/order";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, ShoppingBag, Loader2, CheckCircle,
  Navigation, Plus, Star, Trash2, Crosshair,
  Banknote, CreditCard,
} from "lucide-react";

type PaymentMethod = "cod" | "midtrans";
type SelectionMode = "saved" | "gps";

export default function CheckoutPage() {
  const router = useRouter();
  const { canteenId, canteenName, items, totalPrice, clearCart } = useCartStore();

  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("saved");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSavingPoint, setIsSavingPoint] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { location: gpsLocation, isLoading: isGpsLoading, error: gpsError, getLocation } = useGeolocation();

  const [newPoint, setNewPoint] = useState({
    name: "", building: "", floor: "", notes: "", useGps: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!canteenId || items.length === 0) {
      router.replace("/order");
      return;
    }
    loadDeliveryPoints();
  }, [isMounted]);

  const loadDeliveryPoints = async () => {
    try {
      const data = await deliveryPointApi.list();
      setDeliveryPoints(data);
      const def = data.find((p) => p.is_default);
      if (def) setSelectedPointId(def.id);
    } catch {
      toast.error("Gagal memuat titik antar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetGps = () => {
    setSelectionMode("gps");
    getLocation();
  };

  const handleSaveNewPoint = async () => {
    if (!newPoint.name || !newPoint.building) {
      toast.error("Nama dan gedung wajib diisi");
      return;
    }
    setIsSavingPoint(true);
    try {
      const created = await deliveryPointApi.create({
        name: newPoint.name,
        building: newPoint.building,
        floor: newPoint.floor || undefined,
        notes: newPoint.notes || undefined,
        latitude: newPoint.useGps && gpsLocation ? gpsLocation.latitude : undefined,
        longitude: newPoint.useGps && gpsLocation ? gpsLocation.longitude : undefined,
        is_default: deliveryPoints.length === 0,
      });
      setDeliveryPoints((prev) => [...prev, created]);
      setSelectedPointId(created.id);
      setSelectionMode("saved");
      setIsAddOpen(false);
      setNewPoint({ name: "", building: "", floor: "", notes: "", useGps: false });
      toast.success("Titik antar berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan titik antar");
    } finally {
      setIsSavingPoint(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await deliveryPointApi.setDefault(id);
      setDeliveryPoints((prev) => prev.map((p) => ({ ...p, is_default: p.id === id })));
      toast.success("Titik default diperbarui!");
    } catch {
      toast.error("Gagal mengubah titik default");
    }
  };

  const handleDeletePoint = async (id: number) => {
    try {
      await deliveryPointApi.delete(id);
      setDeliveryPoints((prev) => prev.filter((p) => p.id !== id));
      if (selectedPointId === id) setSelectedPointId(null);
      toast.success("Titik antar dihapus");
    } catch {
      toast.error("Gagal menghapus titik antar");
    }
  };

  const handleOrder = async () => {
    if (selectionMode === "saved" && !selectedPointId) {
      toast.error("Pilih titik antar dulu!");
      return;
    }
    if (selectionMode === "gps" && !gpsLocation) {
      toast.error("Ambil lokasi GPS dulu!");
      return;
    }
    if (!canteenId) return;

    setIsOrdering(true);
    let tempGpsPointId: number | null = null;

    try {
      let deliveryPointId = selectedPointId!;

      if (selectionMode === "gps" && gpsLocation) {
        const tempPoint = await deliveryPointApi.create({
          name: "Lokasi Saat Ini",
          building: "GPS",
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        });
        tempGpsPointId = tempPoint.id;
        deliveryPointId = tempPoint.id;
      }

      // Buat order dulu (tanpa status payment)
      const order = await orderApi.create({
        canteen_id: canteenId,
        delivery_point_id: deliveryPointId,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          notes: i.notes,
        })),
        notes: notes || undefined,
      });

      // Buat payment
      const payment = await paymentApi.create(order.id, paymentMethod);

      clearCart();

      if (paymentMethod === "cod") {
        toast.success("Pesanan berhasil dibuat! Bayar saat tiba.");
        router.push(`/track?order_id=${order.id}`);
        setIsOrdering(false);
        return;
      }

      // Midtrans Snap popup — keep isOrdering=true until popup closes
      if (payment.snap_token) {
        toast.success("Pesanan dibuat! Selesaikan pembayaran.");
        window.snap.pay(payment.snap_token, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            setIsOrdering(false);
            router.push(`/track?order_id=${order.id}`);
          },
          onPending: () => {
            toast.info("Pembayaran pending, cek status di halaman lacak.");
            setIsOrdering(false);
            router.push(`/track?order_id=${order.id}`);
          },
          onError: () => {
            toast.error("Pembayaran gagal, silakan coba lagi.");
            setIsOrdering(false);
            router.push(`/track?order_id=${order.id}`);
          },
          onClose: () => {
            toast.warning("Pembayaran ditutup. Kamu masih bisa bayar dari halaman lacak.");
            setIsOrdering(false);
            router.push(`/track?order_id=${order.id}`);
          },
        });
      }
    } catch (error: any) {
      // Cleanup GPS temp point jika order gagal dibuat
      if (tempGpsPointId) {
        deliveryPointApi.delete(tempGpsPointId).catch(() => {});
      }
      const msg = typeof error?.response?.data?.detail === "string"
        ? error.response.data.detail : "Gagal membuat pesanan";
      toast.error(msg);
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Konfirmasi pesanan dari {canteenName}</p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" /> Ringkasan Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isMounted && items.map((item) => (
            <div key={item.menu_item_id} className="flex justify-between text-sm">
              <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
              <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>Rp {isMounted ? totalPrice().toLocaleString("id-ID") : "0"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" /> Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setPaymentMethod("cod")}
            className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 ${
              paymentMethod === "cod" ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
            }`}
          >
            <Banknote className={`h-6 w-6 ${paymentMethod === "cod" ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium">Bayar di Tempat</p>
            <p className="text-xs text-muted-foreground text-center">Bayar tunai saat pesanan tiba</p>
            {paymentMethod === "cod" && <CheckCircle className="h-4 w-4 text-primary" />}
          </div>
          <div
            onClick={() => setPaymentMethod("midtrans")}
            className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 ${
              paymentMethod === "midtrans" ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
            }`}
          >
            <CreditCard className={`h-6 w-6 ${paymentMethod === "midtrans" ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium">Transfer / E-Wallet</p>
            <p className="text-xs text-muted-foreground text-center">Bayar via Midtrans (10 menit)</p>
            {paymentMethod === "midtrans" && <CheckCircle className="h-4 w-4 text-primary" />}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Point */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" /> Titik Antar
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* GPS Option */}
          <div
            onClick={handleGetGps}
            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
              selectionMode === "gps" ? "border-primary bg-primary/5" : "hover:border-muted-foreground"
            }`}
          >
            <div className={`p-2 rounded-full ${selectionMode === "gps" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Crosshair className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Gunakan Lokasi Saat Ini</p>
              {isGpsLoading && <p className="text-xs text-muted-foreground">Mengambil lokasi...</p>}
              {gpsError && <p className="text-xs text-destructive">{gpsError}</p>}
              {gpsLocation && selectionMode === "gps" && (
                <p className="text-xs text-green-600">
                  ✓ {gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude.toFixed(5)}
                </p>
              )}
            </div>
            {isGpsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {selectionMode === "gps" && gpsLocation && <CheckCircle className="h-5 w-5 text-primary" />}
          </div>

          {/* Saved Points */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : deliveryPoints.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Belum ada titik antar.{" "}
              <button onClick={() => setIsAddOpen(true)} className="text-primary underline">Tambah sekarang</button>
            </div>
          ) : (
            deliveryPoints.map((point) => (
              <div
                key={point.id}
                className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                  selectionMode === "saved" && selectedPointId === point.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground"
                }`}
              >
                <div className="flex-1 cursor-pointer" onClick={() => { setSelectionMode("saved"); setSelectedPointId(point.id); }}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{point.name}</p>
                    {point.is_default && <Badge variant="secondary" className="text-xs gap-1"><Star className="h-2.5 w-2.5" /> Default</Badge>}
                    {point.latitude && <Badge variant="outline" className="text-xs gap-1"><Navigation className="h-2.5 w-2.5" /> GPS</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {point.building}{point.floor ? ` — Lt. ${point.floor}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!point.is_default && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSetDefault(point.id)}>
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeletePoint(point.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {selectionMode === "saved" && selectedPointId === point.id && <CheckCircle className="h-5 w-5 text-primary ml-1" />}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Catatan (opsional)</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Contoh: tanpa sambal, tambah nasi..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>Kembali</Button>
        <Button
          className="flex-1"
          onClick={handleOrder}
          disabled={isOrdering || (selectionMode === "saved" && !selectedPointId) || (selectionMode === "gps" && !gpsLocation)}
        >
          {isOrdering
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</>
            : paymentMethod === "cod" ? "Pesan Sekarang" : "Lanjut Bayar"
          }
        </Button>
      </div>

      {/* Add Delivery Point Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Titik Antar</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Titik *</Label>
              <Input placeholder="Meja Pojok Perpus" value={newPoint.name} onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Gedung *</Label>
                <Input placeholder="Gedung A" value={newPoint.building} onChange={(e) => setNewPoint({ ...newPoint, building: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Lantai</Label>
                <Input placeholder="2" value={newPoint.floor} onChange={(e) => setNewPoint({ ...newPoint, floor: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Input placeholder="Dekat lift..." value={newPoint.notes} onChange={(e) => setNewPoint({ ...newPoint, notes: e.target.value })} />
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Simpan koordinat GPS</span>
                </div>
                <Button size="sm" variant={newPoint.useGps ? "default" : "outline"} onClick={() => { setNewPoint({ ...newPoint, useGps: !newPoint.useGps }); if (!gpsLocation) getLocation(); }}>
                  {newPoint.useGps ? "Aktif" : "Aktifkan"}
                </Button>
              </div>
              {newPoint.useGps && (
                <div className="text-xs">
                  {isGpsLoading && <p className="text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Mengambil lokasi...</p>}
                  {gpsError && <p className="text-destructive">{gpsError}</p>}
                  {gpsLocation && <p className="text-green-600">✓ {gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude.toFixed(5)}</p>}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleSaveNewPoint} disabled={isSavingPoint}>{isSavingPoint ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
