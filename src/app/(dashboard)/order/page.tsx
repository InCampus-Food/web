"use client";

import { useEffect, useState } from "react";
import { canteenApi } from "@/lib/api/canteen";
import { menuApi } from "@/lib/api/menu";
import { useCategories } from "@/hooks/useCategories";
import { Canteen } from "@/types/canteen";
import { MenuItem } from "@/types/menu";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Search, ShoppingCart, Plus, Minus, Trash2, MapPin, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const router = useRouter();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingCanteens, setIsLoadingCanteens] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { categories } = useCategories();
  const { canteenId, canteenName, items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCartStore();

  useEffect(() => {
    canteenApi.list()
      .then(setCanteens)
      .catch(() => toast.error("Gagal memuat kantin"))
      .finally(() => setIsLoadingCanteens(false));
  }, []);

  const selectCanteen = async (canteen: Canteen) => {
    if (canteenId && canteenId !== canteen.id && items.length > 0) {
      const confirm = window.confirm(`Ganti kantin akan mengosongkan keranjang dari ${canteenName}. Lanjutkan?`);
      if (!confirm) return;
    }
    setSelectedCanteen(canteen);
    setIsLoadingMenu(true);
    try {
      const menu = await menuApi.list(canteen.id);
      setMenuItems(menu);
    } catch {
      toast.error("Gagal memuat menu");
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const getCategoryLabel = (category_id?: number) => {
    if (!category_id) return "Lainnya";
    const cat = categories.find((c) => c.id === category_id);
    return cat ? `${cat.icon ?? ""} ${cat.name}`.trim() : "Lainnya";
  };

  const filteredMenu = menuItems
    .filter((item) => item.is_available)
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  const groupedMenu = filteredMenu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = getCategoryLabel(item.category_id);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const getQty = (id: number) => items.find((i) => i.menu_item_id === id)?.quantity ?? 0;

  const handleAdd = (item: MenuItem) => {
    if (!selectedCanteen) return;
    addItem(selectedCanteen.id, selectedCanteen.name, {
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesan Makanan</h1>
          <p className="text-muted-foreground">
            {selectedCanteen ? `Menu dari ${selectedCanteen.name}` : "Pilih kantin"}
          </p>
        </div>
        {isMounted && totalItems() > 0 && (
          <Button onClick={() => setIsCartOpen(true)} className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Keranjang
            <Badge className="ml-2 bg-white rounded-full text-primary">{totalItems()}</Badge>
          </Button>
        )}
      </div>

      {/* Canteen List */}
      {!selectedCanteen && (
        isLoadingCanteens ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canteens.map((canteen) => (
              <Card
                key={canteen.id}
                className={`cursor-pointer transition-all hover:shadow-md ${!canteen.is_open ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}`}
                onClick={() => canteen.is_open && selectCanteen(canteen)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{canteen.name}</CardTitle>
                    <Badge variant={canteen.is_open ? "default" : "secondary"}>
                      {canteen.is_open ? "Buka" : "Tutup"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{canteen.description ?? "Tidak ada deskripsi"}</p>
                  {canteen.location && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {canteen.location}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Menu */}
      {selectedCanteen && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setSelectedCanteen(null); setMenuItems([]); }}>
              ← Kembali
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari menu..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {isLoadingMenu ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : Object.keys(groupedMenu).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <UtensilsCrossed className="h-10 w-10 mb-2" />
              <p>Tidak ada menu tersedia</p>
            </div>
          ) : (
            Object.entries(groupedMenu).map(([category, categoryItems]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryItems.map((item) => {
                    const qty = getQty(item.id);
                    return (
                      <Card key={item.id}>
                        <CardContent className="flex items-center justify-between p-4 gap-3">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                            <p className="text-sm font-bold mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {qty > 0 ? (
                              <>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(item.id, qty - 1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-4 text-center font-medium">{qty}</span>
                                <Button size="icon" className="h-8 w-8" onClick={() => handleAdd(item)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" onClick={() => handleAdd(item)}>
                                <Plus className="h-4 w-4 mr-1" /> Tambah
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Keranjang — {canteenName}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full px-5">
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map((item) => (
                <div key={item.menu_item_id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.menu_item_id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <SheetFooter className="flex-col gap-3 border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rp {totalPrice().toLocaleString("id-ID")}</span>
              </div>
              <Button className="w-full" onClick={() => { setIsCartOpen(false); router.push("/checkout"); }}>
                <ShoppingCart className="h-4 w-4 mr-2" /> Masuk ke pembayaran
              </Button>
              <Button variant="ghost" className="w-full text-destructive" onClick={() => { clearCart(); setIsCartOpen(false); }}>
                Kosongkan Keranjang
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
