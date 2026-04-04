"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, ChefHat, Truck, MapPin } from "lucide-react";

const activeOrder = {
  id: "#ORD-042",
  canteen: "Kantin A",
  items: ["Nasi Goreng Spesial", "Es Teh Manis"],
  total: "Rp 20.000",
  deliveryPoint: "Gedung B - Lantai 3",
  status: "delivering",
  estimatedTime: "5 menit lagi",
};

const steps = [
  { key: "pending", label: "Pesanan Diterima", icon: Clock, desc: "Kantinmu telah menerima pesanan" },
  { key: "preparing", label: "Sedang Dimasak", icon: ChefHat, desc: "Makananmu sedang disiapkan" },
  { key: "delivering", label: "Sedang Diantar", icon: Truck, desc: "Pesananmu dalam perjalanan" },
  { key: "delivered", label: "Tiba di Titik", icon: MapPin, desc: "Pesananmu sudah tiba!" },
];

const statusOrder = ["pending", "preparing", "delivering", "delivered"];

export default function TrackPage() {
  const currentStep = statusOrder.indexOf(activeOrder.status);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Lacak Pesanan</h1>
        <p className="text-muted-foreground">Pantau status pesananmu secara real-time.</p>
      </div>

      {/* Order Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-mono">{activeOrder.id}</CardTitle>
          <Badge>{activeOrder.estimatedTime}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm"><span className="text-muted-foreground">Kantin:</span> {activeOrder.canteen}</p>
          <p className="text-sm"><span className="text-muted-foreground">Menu:</span> {activeOrder.items.join(", ")}</p>
          <p className="text-sm"><span className="text-muted-foreground">Titik Antar:</span> {activeOrder.deliveryPoint}</p>
          <p className="text-sm font-semibold">{activeOrder.total}</p>
        </CardContent>
      </Card>

      {/* Tracking Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isDone = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full p-1.5 ${isDone ? "text-primary" : "text-muted-foreground"}`}>
                      {isDone ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
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
    </div>
  );
}
