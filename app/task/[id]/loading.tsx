// app/task/[id]/loading.tsx
import { Spinner } from "@heroui/react";

export default function TaskLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <Spinner color="warning" />
        <span className="text-xs text-muted">Загрузка задачи...</span>
      </div>
    </div>
  );
}