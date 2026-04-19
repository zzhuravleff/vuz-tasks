"use client";

import { useStore } from "@/hooks/useStore";
import { Chip, Tabs, Spinner, Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";

export default function StatsPage() {
  const { data, store } = useStore();
  
  // Состояния
  const [selectedTab, setSelectedTab] = useState("all");
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [allStatsTask, setAllStatsTask] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const getSortDate = (task: any) => {
    if (task.status === "completed") {
      return new Date(task.completedAt || task.deadline);
    } else {
      return new Date(task.deadline);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  
  // Асинхронное вычисление всех данных для статистики
  useEffect(() => {
    if (!data) return;

    const timerId = setTimeout(() => {
      // 1. Выполненные задачи
      const completed = data.tasks.filter(t => t.status === "completed");
      
      // 2. Просроченные задачи (не выполненные, с дедлайном более 24 часов назад)
      const overdue = data.tasks.filter(t => {
        if (t.status === "completed") return false;
        const hoursDiff = (new Date().getTime() - new Date(t.deadline).getTime()) / (1000 * 60 * 60);
        return hoursDiff > 24;
      });
      
      // 3. Все задачи для таба "Все"
      const all = data.tasks
        .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime())
        .filter(t => t.status === "completed" || ((new Date().getTime() - new Date(t.deadline).getTime()) / (1000 * 60 * 60)) > 24);
      
      setCompletedTasks(completed);
      setOverdueTasks(overdue);
      setAllStatsTask(all);
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timerId);
  }, [data]);

  // Обновление отображаемых задач при изменении таба
  useEffect(() => {
    if (!data || isLoading) return;

    const timerId = setTimeout(() => {
      let filtered: any[] = [];
      
      switch (selectedTab) {
        case "completed":
          filtered = [...data.tasks]
            .sort((a, b) => new Date(b.completedAt || b.deadline).getTime() - new Date(a.completedAt || a.deadline).getTime())
            .filter(t => t.status === "completed");
          break;
          
        case "overdue":
          filtered = [...data.tasks]
            .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
            .filter(t => {
              if (t.status === "completed") return false;
              const hoursDiff = (new Date().getTime() - new Date(t.deadline).getTime()) / (1000 * 60 * 60);
              return hoursDiff > 24;
            });
          break;
          
        default:
          filtered = [...data.tasks]
            .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime())
            .filter(t => {
              if (t.status === "completed") return true;
              const hoursDiff = (new Date().getTime() - new Date(t.deadline).getTime()) / (1000 * 60 * 60);
              return hoursDiff > 24;
            });
          break;
      }
      
      setFilteredTasks(filtered);
    }, 0);

    return () => clearTimeout(timerId);
  }, [selectedTab, data, isLoading]);

  // Проверка загрузки данных
  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  // Скелетон во время загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-full flex gap-2">
          <div className="bg-white p-3 rounded-3xl flex-1">
            <Skeleton className="h-6 rounded-xl w-24 mb-2" />
            <Skeleton className="h-12 rounded-xl w-16" />
          </div>
          <div className="bg-white p-3 rounded-3xl flex-1">
            <Skeleton className="h-6 rounded-xl w-24 mb-2" />
            <Skeleton className="h-12 rounded-xl w-16" />
          </div>
        </div>
        <Skeleton className="h-10 rounded-full w-full" />
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-3">
              <Skeleton className="h-6 rounded-xl w-3/4 mb-2" />
              <Skeleton className="h-4 rounded-xl w-full mb-2" />
              <Skeleton className="h-4 rounded-xl w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Пустое состояние
  if (!isLoading && allStatsTask.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-center mt-64">
        <span className="font-medium text-xl">
          Упс... Тут пусто
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Статистика */}
      <div className="w-full flex gap-2">
        <div className="bg-white p-3 rounded-3xl flex-1 flex flex-col justify-between">
          <span className="font-medium text-xl">Выполнено</span>
          <span className="font-black text-6xl text-success">
            {completedTasks.length < 10 ? "0" : ""}{completedTasks.length}
          </span>
        </div>
        <div className="bg-white p-3 rounded-3xl flex-1 flex flex-col justify-between">
          <span className="font-medium text-xl">Не выполнено</span>
          <span className="font-black text-6xl text-danger">
            {overdueTasks.length < 10 ? "0" : ""}{overdueTasks.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tabs.ListContainer>
          <Tabs.List>
            <Tabs.Tab key="all" id="all">
              Все {allStatsTask.length}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab key="completed" id="completed">
              Выполненные
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab key="overdue" id="overdue">
              Невыполненные
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {/* Список задач */}
      <div className="flex flex-col gap-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="relative bg-white rounded-3xl p-3 gap-2 flex flex-col cursor-pointer active:scale-105 transition overflow-hidden"
            onClick={() => store.deleteTask(task.id)}
          >
            
            <div className="flex justify-between">
              <span className="font-medium text-xl line-clamp-2">
                {task.type === "Расписание" ? task.subjectName : task.title}
              </span>
            </div>
            
            {task.description && (
              <div className="text-base font-regular text-gray-700 whitespace-pre-line line-clamp-2">
                {task.description}
              </div>
            )}

            <div className="flex">
              <div className="flex gap-1 flex-wrap">
                {task.status === "completed" ? (
                  <div>
                    {task.completedAt && (
                      <Chip 
                        color={new Date(task.completedAt) > new Date(task.deadline) ? "warning" : "success"} 
                        variant="soft"
                      >
                        Выполнено: {formatDate(task.completedAt)}
                      </Chip>
                    )}
                  </div>
                ) : (
                  <Chip color="danger" variant="soft">
                    Дедлайн: {formatDate(task.deadline)}
                  </Chip>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}