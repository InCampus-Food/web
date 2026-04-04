"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UtensilsCrossed,
  ShoppingCart,
  Truck,
  TrendingUp,
  Clock,
} from "lucide-react";

const stats = [
  { label: "Total Pengguna", value: "1,240", icon: Users, trend: "+12%", color: "text-blue-500" },
  { label: "Total Kantin", value: "8", icon: UtensilsCrossed, trend: "+1", color: "text-orange-500" },
  { label: "Pesanan Hari Ini", value: "134", icon: ShoppingCart, trend: "+23%", color: "text-green-500" },
  { label: "Sedang Diantar", value: "17", icon: Truck, trend: "live", color: "text-purple-500" },
];

const recentOrders = [
  { id: "#ORD-001", customer: "Ihsan Restuadi", canteen: "Kantin A", status: "delivered", total: "Rp 25.000" },
  { id: "#ORD-002", customer: "Budi Santoso", canteen: "Kantin B", status: "delivering", total: "Rp 18.000" },
  { id: "#ORD-003", customer: "Siti Aminah", canteen: "Kantin C", status: "preparing", total: "Rp 32.000" },
  { id: "#ORD-004", customer: "Andi Pratama", canteen: "Kantin A", status: "pending", total: "Rp 15.000" },
  { id: "#ORD-005", customer: "Dewi Lestari", canteen: "Kantin B", status: "delivered", total: "Rp 27.000" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  delivered: { label: "Terkirim", variant: "default" },
  delivering: { label: "Diantar", variant: "secondary" },
  preparing: { label: "Dimasak", variant: "outline" },
  pending: { label: "Menunggu", variant: "destructive" },
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang kembali! Ini ringkasan hari ini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">{stat.trend} dari kemarin</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-medium">{order.id}</span>
                  <div>
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.canteen}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{order.total}</span>
                  <Badge variant={statusConfig[order.status].variant}>
                    {statusConfig[order.status].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
