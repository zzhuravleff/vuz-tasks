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

    const activedTasks = data.tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).filter((t) => (t.status === "active" && new Date(t.deadline) > new Date()));
    
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

    const overdueTasks24H = data.tasks.filter((t) => {
        if (t.status === "completed") return false;
        if (((new Date().getTime() - new Date(t.deadline).getTime()) / (1000 * 60 * 60)) <= 24)
        return new Date(t.deadline) < new Date();
    });
    
    return (
        <div className="flex flex-col gap-2">
            {overdueTasks24H.map(task => (
                <div key={task.id} className="bg-white border-danger/16 border-2 rounded-3xl p-3 flex flex-col cursor-pointer active:scale-105 transition" onClick={() => {router.push(`/task/${task.id}`)}}>
                    <div className="flex justify-between">
                        <span className="font-medium text-xl line-clamp-2 text-danger">
                            {task.type === "Расписание" ? task.subjectName : task.title}
                        </span>
                    </div>
                    {task.description && (
                        <div className="text-base font-regular text-gray-800 whitespace-pre-line">{task.description}</div>
                    )}
                    <div className="flex justify-end">
                        <Chip color="danger" size="lg" variant="soft">
                            Просрочено
                        </Chip>
                    </div>
                </div>
            ))}
            {activedTasks.length === 0 ? (
                <div className="w-full flex items-center justify-center text-center mt-64">
                    <span className="font-medium text-xl">
                        Нет активных задач...
                    </span>
                </div>
            ) : (
            <div className="flex flex-col gap-2">
            {activedTasks.map(task => (
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
                    </div>
                    {task.description && (
                        <div className="text-base font-regular text-gray-700 whitespace-pre-line">{task.description}</div>
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