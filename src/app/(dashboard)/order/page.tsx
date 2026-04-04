"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Plus, MapPin } from "lucide-react";

const canteens = [
  { id: 1, name: "Kantin A", description: "Masakan Indonesia & Minuman", isOpen: true },
  { id: 2, name: "Kantin B", description: "Mie & Bakso Spesial", isOpen: true },
  { id: 3, name: "Kantin C", description: "Makanan Sehat & Jus", isOpen: false },
];

const menuItems = [
  { id: 1, canteenId: 1, name: "Nasi Goreng Spesial", price: 15000, category: "Makanan" },
  { id: 2, canteenId: 1, name: "Ayam Bakar", price: 18000, category: "Makanan" },
  { id: 3, canteenId: 1, name: "Es Teh Manis", price: 5000, category: "Minuman" },
  { id: 4, canteenId: 2, name: "Mie Ayam Bakso", price: 14000, category: "Makanan" },
  { id: 5, canteenId: 2, name: "Bakso Urat", price: 16000, category: "Makanan" },
];

export default function OrderPage() {
  const [selectedCanteen, setSelectedCanteen] = useState<number | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");

  const filteredMenu = menuItems.filter(
    (item) => item.canteenId === selectedCanteen &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = menuItems.find((m) => m.id === Number(id));
    return total + (item?.price ?? 0) * qty;
  }, 0);

  const addToCart = (id: number) => setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const removeFromCart = (id: number) => setCart((prev) => {
    if ((prev[id] ?? 0) <= 1) { const next = { ...prev }; delete next[id]; return next; }
    return { ...prev, [id]: prev[id] - 1 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pesan Makanan</h1>
        <p className="text-muted-foreground">Pilih kantin dan menu favoritmu.</p>
      </div>

      {/* Canteen Selection */}
      {!selectedCanteen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {canteens.map((canteen) => (
            <Card
              key={canteen.id}
              className={`cursor-pointer transition-all hover:shadow-md ${!canteen.isOpen ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => canteen.isOpen && setSelectedCanteen(canteen.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{canteen.name}</CardTitle>
                  <Badge variant={canteen.isOpen ? "default" : "secondary"}>
                    {canteen.isOpen ? "Buka" : "Tutup"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{canteen.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Menu */}
      {selectedCanteen && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setSelectedCanteen(null); setCart({}); }}>
              ← Kembali
            </Button>
            <span className="font-medium">{canteens.find(c => c.id === selectedCanteen)?.name}</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMenu.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-sm font-semibold mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cart[item.id] ? (
                      <>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>-</Button>
                        <span className="w-4 text-center text-sm font-medium">{cart[item.id]}</span>
                        <Button size="icon" className="h-7 w-7" onClick={() => addToCart(item.id)}>+</Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => addToCart(item.id)}>
                        <Plus className="h-4 w-4 mr-1" /> Tambah
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          {totalItems > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <Card className="shadow-lg border-primary">
                <CardContent className="flex items-center gap-6 p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-medium">{totalItems} item</span>
                  </div>
                  <span className="font-bold">Rp {totalPrice.toLocaleString("id-ID")}</span>
                  <Button size="sm">
                    <MapPin className="h-4 w-4 mr-1" /> Pilih Titik Antar
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
