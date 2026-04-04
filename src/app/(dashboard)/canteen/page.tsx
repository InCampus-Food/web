"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChefHat, CheckCircle, Clock, AlertCircle } from "lucide-react";

const stats = [
  { label: "Pesanan Masuk", value: "24", icon: ShoppingCart, color: "text-blue-500" },
  { label: "Sedang Dimasak", value: "6", icon: ChefHat, color: "text-orange-500" },
  { label: "Selesai Hari Ini", value: "51", icon: CheckCircle, color: "text-green-500" },
  { label: "Rata-rata Waktu", value: "12m", icon: Clock, color: "text-purple-500" },
];

const incomingOrders = [
  { id: "#ORD-010", customer: "Budi S.", items: ["Nasi Goreng", "Es Teh"], status: "pending", time: "2 menit lalu" },
  { id: "#ORD-011", customer: "Siti A.", items: ["Mie Ayam"], status: "preparing", time: "8 menit lalu" },
  { id: "#ORD-012", customer: "Andi P.", items: ["Nasi Ayam", "Jus Jeruk"], status: "pending", time: "1 menit lalu" },
  { id: "#ORD-013", customer: "Dewi L.", items: ["Gado-gado"], status: "preparing", time: "15 menit lalu" },
];

export default function CanteenDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Kantin</h1>
        <p className="text-muted-foreground">Kelola pesanan dan menu kantinmu.</p>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Incoming Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Pesanan Masuk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incomingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{order.id}</span>
                      <Badge variant={order.status === "pending" ? "destructive" : "secondary"}>
                        {order.status === "pending" ? "Baru" : "Dimasak"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{order.customer} · {order.time}</p>
                    <p className="text-sm mt-1">{order.items.join(", ")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button size="sm">Terima</Button>
                  )}
                  {order.status === "preparing" && (
                    <Button size="sm" variant="outline">Selesai</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
