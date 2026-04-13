"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { AppData } from "@/types";

export function useStore() {
  const [data, setData] = useState<AppData>(store.get());

  useEffect(() => {
    const unsubscribe = store.subscribe(setData);
    return unsubscribe;
  }, []);

  return {
    data,
    store,
  };
}