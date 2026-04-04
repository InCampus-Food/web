"use client";

import { useEffect, useState } from "react";
import { canteenApi } from "@/lib/api/canteen";
import { Canteen } from "@/types/canteen";
import { useAuthStore } from "@/stores/authStore";

export function useMyCanteen() {
  const { user } = useAuthStore();
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    canteenApi.list()
      .then((canteens) => {
        const mine = canteens.find((c) => c.user_id === Number(user.id));
        setCanteen(mine ?? null);
      })
      .catch(() => setError("Gagal memuat data kantin"))
      .finally(() => setIsLoading(false));
  }, [user]);

  return { canteen, isLoading, error, setCanteen };
}
