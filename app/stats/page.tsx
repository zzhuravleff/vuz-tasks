"use client";

import { useStore } from "@/hooks/useStore";
import { Chip, Tabs } from "@heroui/react";
import { useState } from "react";

export default function StatsPage() {
  const { data, store } = useStore();

  if (!data) return null;

  const completedTasks = data.tasks.filter(
    (t) => t.status === "completed"
  );

  const overdueTasks = data.tasks.filter((t) => {
    if (t.status === "completed") return false;
    return new Date(t.deadline) < new Date();
  });

  const [selectedTab, setSelectedTab] = useState("all");

  const getSortDate = (task: any) => {
    if (task.status === "completed") {
      // Для выполненных - используем дату выполнения
      return new Date(task.completedAt || task.deadline);
    } else {
      // Для просроченных и активных - используем дедлайн
      return new Date(task.deadline);
    }
  };

  const filteredTasks = () => {
    switch (selectedTab) {
        case "completed":
            // Только выполненные
            return data.tasks.sort((a, b) => new Date(b.completedAt || b.deadline).getTime() - new Date(a.completedAt || a.deadline).getTime()).filter(t => t.status === "completed");
            
        case "overdue":
            // Только просроченные (не выполненные, с прошедшим дедлайном)
            return data.tasks.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()).filter(t => 
                t.status !== "completed" && new Date(t.deadline) < new Date()
            );
            
        default: // "all"
            // Все НЕ активные = выполненные + просроченные
            return data.tasks.sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime()).filter(t => 
                t.status === "completed" || new Date(t.deadline) < new Date()
            );
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

  return (

    <div className="flex flex-col gap-4">
      <div className="w-full flex gap-2">
        <div className="bg-success/8 p-3 rounded-3xl flex-1 flex flex-col justify-between">
          <span className="font-medium text-xl">Выполнено</span>
          <span className="font-black text-6xl text-success">{completedTasks.length < 10 ? "0" : ""}{completedTasks.length}</span>
        </div>
        <div className="bg-danger/8 p-3 rounded-3xl flex-1 flex flex-col justify-between">
          <span className="font-medium text-xl">Просрочено</span>
          <span className="font-black text-6xl text-danger">{overdueTasks.length < 10 ? "0" : ""}{overdueTasks.length}</span>
        </div>
      </div>

      <Tabs className=""
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tabs.ListContainer>
          <Tabs.List>
            <Tabs.Tab key="all" id="all">
              Все
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab key="completed" id="completed">
              Выполненные
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab key="overdue" id="overdue">
              Просроченные
             <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <div className="flex flex-col gap-2">
        {filteredTasks().map((task) => (
        <div key={task.id} className="bg-white rounded-3xl p-3 gap-2 flex flex-col cursor-pointer active:scale-105 transition" onClick={() => store.deleteTask(task.id)}>
          <div className="flex justify-between">
            <span className="font-medium text-xl line-clamp-2">
              {task.type === "Расписание" ? task.subjectName : task.title}
            </span>
          </div>
          {task.description && (
            <div className="text-base font-regular text-gray-700 whitespace-pre-line line-clamp-2">{task.description}</div>
          )}

          <div className="flex justify-between">
            <div className="flex gap-1 flex-wrap">
              {task.status == "completed" ? (
                <Chip color="success" variant="soft">Выполнено: {formatDate(task.completedAt?? "Ошибка")}</Chip>
              ) : (
                 <Chip color="danger" variant="soft">Дедлайн: {formatDate(task.deadline)}</Chip>
              )}
            </div>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}