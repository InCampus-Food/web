"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { deliveryPointApi } from "@/lib/api/delivery-point";
import { orderApi } from "@/lib/api/order";
import { DeliveryPoint } from "@/types/order";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MapPin, ShoppingBag, Loader2, CheckCircle,
  Navigation, Plus, Star, Trash2, Crosshair,
  ArrowRight,
  ClipboardList
} from "lucide-react";

type SelectionMode = "saved" | "gps";

export default function CheckoutPage() {
  const router = useRouter();
  const { canteenId, canteenName, items, totalPrice, clearCart } = useCartStore();

  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("saved");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSavingPoint, setIsSavingPoint] = useState(false);

  const { location: gpsLocation, isLoading: isGpsLoading, error: gpsError, getLocation } = useGeolocation();

  const [newPoint, setNewPoint] = useState({
    name: "",
    building: "",
    floor: "",
    notes: "",
    useGps: false,
  });

  useEffect(() => {
    if (!canteenId || items.length === 0) {
      router.replace("/order");
      return;
    }
    loadDeliveryPoints();
  }, []);

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
      setDeliveryPoints((prev) =>
        prev.map((p) => ({ ...p, is_default: p.id === id }))
      );
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
    try {
      let deliveryPointId = selectedPointId!;

      if (selectionMode === "gps" && gpsLocation) {
        const tempPoint = await deliveryPointApi.create({
          name: "Lokasi Saat Ini",
          building: "GPS",
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        });
        deliveryPointId = tempPoint.id;
      }

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

      clearCart();
      toast.success("Pesanan berhasil dibuat!");
      router.push(`/track?order_id=${order.id}`);
    } catch (error: any) {
      const msg = typeof error?.response?.data?.detail === "string"
        ? error.response.data.detail
        : "Gagal membuat pesanan";
      toast.error(msg);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header section styled beautifully */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Review Your Order
        </h1>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Ordering from: <span className="font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors px-3 py-1.5 rounded-lg">{canteenName}</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <ClipboardList className="h-5 w-5 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-4 px-6 md:px-8">
              {items.map((item, idx) => (
                <div key={item.menu_item_id} className={cn("flex justify-between items-center py-4", idx !== items.length - 1 && "border-b border-border/50")}>
                  <span className="flex items-center gap-4 text-base font-semibold text-foreground">
                    <span className="bg-primary/10 text-primary w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm">
                      {item.quantity}x
                    </span>
                    {item.name} 
                  </span>
                  <span className="font-bold text-lg text-foreground">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Point Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Delivery Point
              </h2>
              <Button size="sm" variant="outline" className="font-bold text-xs h-9 px-4 bg-white hover:bg-slate-50 border-gray-200" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add New
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* GPS Option Card */}
              <Card
                onClick={handleGetGps}
                className={cn(
                  "cursor-pointer transition-all duration-300 flex flex-col justify-between group",
                  selectionMode === "gps" 
                    ? "ring-2 ring-primary bg-primary/5 shadow-md" 
                    : "hover:ring-1 hover:ring-primary/40 bg-muted/40"
                )}
              >
                <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "p-2.5 rounded-xl shadow-sm transition-colors", 
                      selectionMode === "gps" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground border"
                    )}>
                      <Crosshair className="h-5 w-5" />
                    </div>
                    {selectionMode === "gps" && gpsLocation && <CheckCircle className="h-6 w-6 text-primary" />}
                  </div>
                  
                  <div>
                    <p className="font-bold text-[16px] text-foreground">Current Location</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Use device GPS</p>
                    {isGpsLoading && <p className="text-xs text-primary font-medium flex items-center gap-1 mt-2"><Loader2 className="h-3 w-3 animate-spin" /> Locating...</p>}
                    {gpsError && <p className="text-xs text-destructive font-medium mt-2">{gpsError}</p>}
                    {gpsLocation && selectionMode === "gps" && (
                      <p className="text-xs text-green-700 font-semibold mt-2 bg-green-100 w-fit px-2 py-0.5 rounded-md">
                        Accuracy: ±{Math.round(gpsLocation.accuracy!)}m
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Saved Points Loading / Empty State */}
              {isLoading ? (
                <Skeleton className="h-36 rounded-2xl" />
              ) : deliveryPoints.length === 0 ? (
                <Card className="flex flex-col items-center justify-center text-center gap-2 h-36 bg-muted/20 border-2 border-dashed">
                  <p className="text-sm font-medium text-muted-foreground">No saved locations.</p>
                </Card>
              ) : (
                deliveryPoints.map((point) => (
                  <Card
                    key={point.id}
                    onClick={() => { setSelectionMode("saved"); setSelectedPointId(point.id); }}
                    className={cn(
                      "cursor-pointer transition-all duration-300 flex flex-col justify-between group",
                      selectionMode === "saved" && selectedPointId === point.id
                        ? "ring-2 ring-primary bg-primary/5 shadow-md"
                        : "hover:ring-1 hover:ring-primary/40 bg-muted/40"
                    )}
                  >
                    <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-2.5 rounded-xl shadow-sm transition-colors", 
                            selectionMode === "saved" && selectedPointId === point.id ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground border"
                          )}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <p className="font-bold text-[16px] leading-tight truncate text-foreground ml-2">{point.name}</p>
                        </div>
                        
                        {/* Actions / Active tick */}
                        <div className="flex items-center gap-1">
                          {!point.is_default && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleSetDefault(point.id); }}>
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeletePoint(point.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground font-medium truncate">
                          {point.building}{point.floor ? ` — Floor ${point.floor}` : ""}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {point.is_default && <span className="text-[10px] bg-foreground text-background font-bold px-2 py-0.5 rounded-md">Default</span>}
                          {point.latitude && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">GPS Set</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar sticky summary */}
        <div className="lg:sticky lg:top-24 space-y-6">
          {/* Notes */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Additional Notes</h2>
            <Textarea
              placeholder="E.g., Extra spicy, provide cutlery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none shadow-sm bg-muted/20 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4 py-3 font-medium rounded-xl"
            />
          </div>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center font-bold text-muted-foreground mb-2">
                <span>Subtotal</span>
                <span>Rp {totalPrice().toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-muted-foreground mb-4">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-center font-extrabold text-2xl pt-4 border-t border-border mt-4">
                <span>Total</span>
                <span className="text-primary">Rp {totalPrice().toLocaleString("id-ID")}</span>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <Button
                  className="w-full h-14 text-lg font-bold shadow-md shadow-primary/20 group hover:-translate-y-0.5 transition-all"
                  onClick={handleOrder}
                  disabled={isOrdering || (selectionMode === "saved" && !selectedPointId) || (selectionMode === "gps" && !gpsLocation)}
                >
                  {isOrdering ? (
                    <><Loader2 className="h-5 w-5 mr-3 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      Order Me <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground font-semibold h-12 hover:bg-muted/50" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Delivery Point Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="font-bold">Location Name *</Label>
              <Input
                className="bg-muted/40 border-transparent h-11 px-4 focus-visible:ring-primary"
                placeholder="E.g., Library Corner, Room 301"
                value={newPoint.name}
                onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Building *</Label>
                <Input
                  className="bg-muted/40 border-transparent h-11 px-4 focus-visible:ring-primary"
                  placeholder="Building A"
                  value={newPoint.building}
                  onChange={(e) => setNewPoint({ ...newPoint, building: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Floor</Label>
                <Input
                  className="bg-muted/40 border-transparent h-11 px-4 focus-visible:ring-primary"
                  placeholder="Floor 2"
                  value={newPoint.floor}
                  onChange={(e) => setNewPoint({ ...newPoint, floor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Extra Notes</Label>
              <Input
                className="bg-muted/40 border-transparent h-11 px-4 focus-visible:ring-primary"
                placeholder="Next to the vending machine..."
                value={newPoint.notes}
                onChange={(e) => setNewPoint({ ...newPoint, notes: e.target.value })}
              />
            </div>

            {/* GPS Toggle */}
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-none ring-0 p-1">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-xl">
                      <Crosshair className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-sm">Save GPS Coordinates?</span>
                  </div>
                  <Button
                    size="sm"
                    className="shadow-sm text-xs h-8 px-4 font-bold"
                    variant={newPoint.useGps ? "default" : "secondary"}
                    onClick={() => {
                      setNewPoint({ ...newPoint, useGps: !newPoint.useGps });
                      if (!gpsLocation) getLocation();
                    }}
                  >
                    {newPoint.useGps ? "Active" : "Enable"}
                  </Button>
                </div>
                {newPoint.useGps && (
                  <div className="text-xs font-semibold bg-white rounded-lg p-3 shadow-sm border">
                    {isGpsLoading && <p className="text-primary flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Locating...</p>}
                    {gpsError && <p className="text-destructive">{gpsError}</p>}
                    {gpsLocation && <p className="text-green-600">✓ Point Found: {gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude.toFixed(5)}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button variant="ghost" className="font-bold hover:bg-muted/50" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="font-bold min-w-[120px] shadow-sm" onClick={handleSaveNewPoint} disabled={isSavingPoint}>
              {isSavingPoint ? "Saving..." : "Save Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}