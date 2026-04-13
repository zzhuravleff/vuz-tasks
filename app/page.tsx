"use client";

import { useStore } from "@/hooks/useStore";
import { Chip } from "@heroui/react";
import { useEffect, useState } from "react";

export default function TasksList() {
    const { data, store } = useStore();
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted || !data) return null;
    
    const sortedTasks = [...data.tasks]
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    
    // Функция для правильного форматирования даты с учётом часового пояса
    const formatDatePars = (dateString: string) => {
        const date = new Date(dateString);
        const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    };

    
    
    return (
        <div className="flex flex-col gap-2">
            {sortedTasks.map(task => (
                <div key={task.id} className="bg-white rounded-3xl p-3 gap-2 flex flex-col" onClick={() => store.deleteTask(task.id)}>
                    <div className="flex justify-between">
                        <span className="font-medium text-xl line-clamp-2">
                            {task.type === "Расписание" ? task.subjectName : task.title}
                        </span>
                        {/* <span className="text-sm text-muted">
                            {formatDate(task.deadline)}
                        </span> */}
                    </div>
                    {task.description && (
                        <div className="text-base font-regular text-gray-700 line-clamp-3">{task.description}</div>
                    )}
                    {task.type === "Расписание" && (
                        <div className="flex justify-between">
                          <div className="flex gap-1 flex-wrap">
                            {((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60)) < 24 ? (
                              <Chip color="danger" variant="soft" size="lg">Скоро</Chip>
                            ) : (
                              <Chip variant="soft" size="lg">{formatDatePars(task.deadline)}</Chip>
                            )}
                            <Chip size="lg">{task.lessons} Пара</Chip>
                          </div>
                          <Chip color="accent" size="lg" variant="soft">
                            {task.type}
                          </Chip>
                        </div>
                    )}
                    {task.type === "Кастомная" && (
                        <div className="flex justify-between">
                          <div className="flex gap-1 flex-wrap">
                            {((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60)) < 24 && (
                              <Chip color="danger" variant="soft" size="lg">Скоро</Chip>
                            )}
                              <Chip variant="soft" size="lg">{formatDate(task.deadline)}</Chip>
                          </div>
                          <Chip color="warning" size="lg" variant="soft">
                            {task.type}
                          </Chip>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}