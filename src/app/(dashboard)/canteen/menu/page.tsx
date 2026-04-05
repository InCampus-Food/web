"use client";

import { useEffect, useState } from "react";
import { useMyCanteen } from "@/hooks/useMyCanteen";
import { useCategories } from "@/hooks/useCategories";
import { menuApi } from "@/lib/api/menu";
import { MenuItem } from "@/types/menu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, UtensilsCrossed } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  is_available: true,
};

export default function MenuPage() {
  const { canteen, isLoading: canteenLoading } = useMyCanteen();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!canteen) return;
    setIsLoading(true);
    menuApi.list(canteen.id)
      .then(setItems)
      .catch(() => toast.error("Gagal memuat menu"))
      .finally(() => setIsLoading(false));
  }, [canteen]);

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || String(item.category_id) === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setSelectedItem(null);
    setForm({ ...emptyForm, category_id: categories[0] ? String(categories[0].id) : "" });
    setIsDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      image_url: item.image_url ?? "",
      category_id: item.category_id ? String(item.category_id) : "",
      is_available: item.is_available,
    });
    setIsDialogOpen(true);
  };

  const openDelete = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!canteen) return;
    if (!form.name || !form.price) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    setIsSaving(true);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      image_url: form.image_url || undefined,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      is_available: form.is_available,
    };

    try {
      if (selectedItem) {
        const updated = await menuApi.update(canteen.id, selectedItem.id, payload);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast.success("Menu berhasil diupdate!");
      } else {
        const created = await menuApi.create(canteen.id, payload);
        setItems((prev) => [...prev, created]);
        toast.success("Menu berhasil ditambahkan!");
      }
      setIsDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canteen || !selectedItem) return;
    try {
      await menuApi.delete(canteen.id, selectedItem.id);
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      toast.success("Menu berhasil dihapus!");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("Gagal menghapus menu");
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    if (!canteen) return;
    try {
      const updated = await menuApi.update(canteen.id, item.id, { is_available: !item.is_available });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      toast.success(`Menu ${updated.is_available ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      toast.error("Gagal mengubah status menu");
    }
  };

  const getCategoryName = (category_id?: number) => {
    if (!category_id) return null;
    return categories.find((c) => c.id === category_id);
  };

  if (canteenLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Kamu belum punya kantin</h2>
        <p className="text-muted-foreground">Hubungi admin untuk mendaftarkan kantinmu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu — {canteen.name}</h1>
          <p className="text-muted-foreground">{items.length} item terdaftar</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Menu
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari menu..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <UtensilsCrossed className="h-10 w-10 mb-2" />
          <p>Belum ada menu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const cat = getCategoryName(item.category_id);
            return (
              <Card key={item.id} className={!item.is_available ? "opacity-60" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                    </div>
                    {cat && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {cat.icon} {cat.name}
                      </Badge>
                    )}
                  </div>

                  <p className="text-lg font-bold">Rp {item.price.toLocaleString("id-ID")}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch checked={item.is_available} onCheckedChange={() => handleToggleAvailable(item)} />
                      <span className="text-xs text-muted-foreground">
                        {item.is_available ? "Tersedia" : "Habis"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Menu *</Label>
              <Input placeholder="Nasi Goreng Spesial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi menu..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Harga (Rp) *</Label>
                <Input type="number" placeholder="15000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(val) => setForm({ ...form, category_id: val })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL Gambar</Label>
              <Input placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_available} onCheckedChange={(val) => setForm({ ...form, is_available: val })} />
              <Label>Tersedia</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : selectedItem ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Menu</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus <span className="font-semibold text-foreground">{selectedItem?.name}</span>? Tindakan ini tidak bisa dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
