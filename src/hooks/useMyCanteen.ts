"use client";

import { useEffect, useState } from "react";
import { canteenApi } from "@/lib/api/canteen";
import { Canteen } from "@/types/canteen";

export function useMyCanteen() {
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    canteenApi.me()
      .then(setCanteen)
      .catch(() => setCanteen(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { canteen, isLoading, error, setCanteen };
}
