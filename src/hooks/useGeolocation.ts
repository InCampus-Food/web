"use client";

import { useState, useCallback } from "react";
import { GpsLocation } from "@/types/order";

interface GeolocationState {
  location: GpsLocation | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLoading: false,
    error: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Browser tidak mendukung GPS" }));
      return;
    }

    setState({ location: null, isLoading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          isLoading: false,
          error: null,
        });
      },
      (error) => {
        const messages: Record<number, string> = {
          1: "Akses lokasi ditolak. Izinkan akses lokasi di browser.",
          2: "Lokasi tidak tersedia.",
          3: "Timeout saat mengambil lokasi.",
        };
        setState({
          location: null,
          isLoading: false,
          error: messages[error.code] ?? "Gagal mengambil lokasi",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { ...state, getLocation };
}