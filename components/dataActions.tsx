"use client";

import { Button } from "@heroui/react";
import { useStore } from "@/hooks/useStore";
import { useRef } from "react";

export default function DataActions() {
  const { data, store } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= EXPORT =================
  const handleExport = () => {
    try {
      const json = JSON.stringify(store.exportData(), null, 2);

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `vuz-tasks-backup-${new Date()
        .toISOString()
        .split("T")[0]}.json`;

      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка экспорта");
    }
  };

  // ================= OPEN FILE =================
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // ================= IMPORT =================
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        if (!confirm("Это заменит все данные. Продолжить?")) return;

        // 💾 backup
        localStorage.setItem(
          "backup_before_import",
          JSON.stringify(data)
        );

        store.importData(parsed);
      } catch (err: any) {
        alert("Ошибка: " + err.message);
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  // ================= RESET =================
  const handleReset = () => {
        if (confirm("Вы уверены, что хотите сбросить все данные? Это действие необратимо.")) {
            store.clearAllData();
        }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* EXPORT */}
      <Button size="sm" variant="secondary" className="w-full" onPress={handleExport}>
        Экспорт
      </Button>

      {/* IMPORT */}
      <Button size="sm" variant="secondary" className="w-full" onPress={openFilePicker}>
        Импорт
      </Button>

      {/* hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* RESET */}
      <Button size="sm" variant="danger-soft" className="w-full" onPress={handleReset}>
        Сброс данных
      </Button>
    </div>
  );
}