"use client";

import { useStore } from "@/hooks/useStore";
import { Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TasksList() {
    const { data, store } = useStore();
    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();
    
    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted || !data) return null;

    const activedTasks = data.tasks.filter((t) => (t.status === "active" && new Date(t.deadline) > new Date()));
    
    const sortedTasks = activedTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    
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
        
        return `${day} ${month} ${year}`;
    };

    // Форматирование времени: "12:40"
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes}`;
    };

    if (sortedTasks.length === 0) return (
        <div className="w-full flex items-center justify-center text-center mt-64">
                    <span className="font-medium text-xl">
                        Нет активных задач...
                    </span>
        </div>
    );

    
    
    return (
        <div className="flex flex-col gap-2">
            {sortedTasks.map(task => (
                <div key={task.id} className="bg-white rounded-3xl p-3 gap-2 flex flex-col cursor-pointer active:scale-105 transition" onClick={() => {router.push(`/task/${task.id}`)}}>
                    {((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60)) < 48 && (
                        <div className="p-0 m-0">
                            <Chip color="danger" variant="soft" size="lg">Скоро</Chip>
                        </div>
                    )}
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
                              <Chip variant="soft" size="lg">{formatDatePars(task.deadline)}</Chip>
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
    );
}