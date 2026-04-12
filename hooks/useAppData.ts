"use client";

import { useEffect, useState } from "react";
import { AppData } from "@/types";
import { getAppData, saveAppData } from "@/lib/storage";

export function useAppData() {
  const [data, setData] = useState<AppData>(() => getAppData());

  // 🔥 синхронизация (если localStorage изменился в другой вкладке)
  useEffect(() => {
    const handler = () => {
      setData(getAppData());
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // 🔥 главный update
  const update = (fn: (prev: AppData) => AppData) => {
    setData((prev) => {
      const updated = fn(prev);
      saveAppData(updated);
      return updated;
    });
  };

  // 🔥 полная замена
  const replace = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  return {
    data,
    update,
    setData: replace,
  };
}