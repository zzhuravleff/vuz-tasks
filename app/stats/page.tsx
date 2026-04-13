"use client";

import { useStore } from "@/hooks/useStore";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const { data, store } = useStore();
  const router = useRouter();

  if (!data) return null;

  const completedTasks = data.tasks.filter(
    (t) => t.status === "completed"
  );

  const overdueTasks = data.tasks.filter((t) => {
    if (t.status === "completed") return false;
    return new Date(t.deadline) < new Date();
  });

  return (
    <div className="flex flex-col gap-6 w-full p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold text-center">
        Статистика
      </h1>

      {/* COMPLETED */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">
          Выполненные задачи
        </h2>

        {completedTasks.length === 0 ? (
          <div className="text-gray-400">
            Нет выполненных задач
          </div>
        ) : (
          completedTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => store.deleteTask(task.id)}
            >
              {task.type === "Расписание"
                ? `Задача по расписанию`
                : task.title}
            </div>
          ))
        )}
      </div>

      {/* OVERDUE */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">
          Просроченные задачи
        </h2>

        {overdueTasks.length === 0 ? (
          <div className="text-gray-400">
            Нет просроченных задач
          </div>
        ) : (
          overdueTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 border rounded cursor-pointer hover:bg-red-50"
              onClick={() => store.deleteTask(task.id)}
            >
              {task.type === "Расписание"
                ? `Просроченная задача`
                : task.title}
            </div>
          ))
        )}
      </div>

    </div>
  );
}