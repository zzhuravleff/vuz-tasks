"use client";

import { useStore } from "@/hooks/useStore";
import { Chip, Skeleton, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function HomePage() {
  const { data, store } = useStore();
  const router = useRouter();
  
  // Состояния
  const [activedTasks, setActivedTasks] = useState<any[]>([]);
  const [overdueTasks24H, setOverdueTasks24H] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Для навигации
  const [isPending, startTransition] = useTransition();
  const [navigatingTaskId, setNavigatingTaskId] = useState<string | null>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Навигация с обратной связью
  const navigateToTask = (taskId: string) => {
    setNavigatingTaskId(taskId);
    startTransition(() => {
      router.push(`/task/${taskId}`);
    });
  };

  // Загрузка и фильтрация задач
  useEffect(() => {
    if (!data) return;

    const timerId = setTimeout(() => {
      // Активные задачи
      const active = data.tasks
        .filter((t) => t.status === "active" && new Date(t.deadline) > new Date())
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      
      // Просроченные за 24 часа
      const overdue = data.tasks.filter((t) => {
        if (t.status === "completed") return false;
        const hoursDiff = (new Date().getTime() - new Date(t.deadline).getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24 && new Date(t.deadline) < new Date();
      });

      setActivedTasks(active);
      setOverdueTasks24H(overdue);
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timerId);
  }, [data]);

  // Проверка загрузки данных
  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Скелетон загрузки задач
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-3 animate-pulse">
            <Skeleton className="h-6 rounded-xl w-3/4 mb-2" />
            <Skeleton className="h-4 rounded-xl w-full mb-2" />
            <Skeleton className="h-4 rounded-xl w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Проверка на полное отсутствие задач
  const hasNoTasks = overdueTasks24H.length === 0 && activedTasks.length === 0;

  if (hasNoTasks) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center mt-32 gap-4">
        <span className="font-medium text-xl text-gray-500">
          📭 У вас пока нет задач
        </span>
        <span className="text-gray-400">
          Нажмите на кнопку &quot;+&quot; в правом нижнем углу, чтобы создать новую задачу
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Просроченные задачи */}
      {overdueTasks24H.map((task) => (
        <div
          key={task.id}
          className="relative bg-white border-danger/16 border-2 rounded-3xl p-3 flex flex-col gap-2 cursor-pointer active:scale-105 transition overflow-hidden"
          onClick={() => navigateToTask(task.id)}
        >
          {navigatingTaskId === task.id && isPending && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
              <Spinner size="lg" color="danger" />
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="font-medium text-xl line-clamp-2 text-danger leading-6">
              {task.type === "Расписание" ? task.subjectName : task.title}
            </span>
          </div>
          
          {task.description && (
            <div className="text-base font-regular text-gray-800 whitespace-pre-line line-clamp-2">
              {task.description}
            </div>
          )}
          
          <div className="flex justify-end">
            <Chip color="danger" size="lg" variant="soft">
              Просрочено
            </Chip>
          </div>
        </div>
      ))}
      
      {/* Активные задачи */}
      {activedTasks.length > 0 && (
        <div className="flex flex-col gap-2">
          {activedTasks.map((task) => (
            <div
              key={task.id}
              className="relative bg-white rounded-3xl p-3 gap-2 flex flex-col cursor-pointer active:scale-105 transition overflow-hidden"
              onClick={() => navigateToTask(task.id)}
            >
              {navigatingTaskId === task.id && isPending && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                  <Spinner size="lg" />
                </div>
              )}
              
              {((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60)) < 48 && (
                <div className="p-0 m-0">
                  <Chip color="danger" variant="soft" size="lg">Скоро</Chip>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-medium text-xl line-clamp-2 leading-6">
                  {task.type === "Расписание" ? task.subjectName : task.title}
                </span>
              </div>
              
              {task.description && (
                <div className="text-base font-regular text-gray-700 whitespace-pre-line line-clamp-2">
                  {task.description}
                </div>
              )}
              
              {task.type === "Расписание" && (
                <div className="flex justify-between">
                  <div className="flex gap-1 flex-wrap">
                    <Chip variant="soft" size="lg">{formatDate(task.deadline)}</Chip>
                    <Chip variant="soft" size="lg">{task.lessons} Пара</Chip>
                  </div>
                  <Chip color="accent" size="lg" variant="soft">
                    {task.type}
                  </Chip>
                </div>
              )}
              
              {task.type === "Кастомная" && (
                <div className="flex justify-between">
                  <div className="flex gap-1 flex-wrap">
                    <Chip variant="soft" size="lg">{formatDate(task.deadline)}</Chip>
                    <Chip variant="soft" size="lg">{formatTime(task.deadline)}</Chip>
                  </div>
                  <Chip color="warning" size="lg" variant="soft">
                    {task.type}
                  </Chip>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}