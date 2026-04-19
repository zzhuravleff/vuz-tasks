"use client";

import { useStore } from "@/hooks/useStore";
import { Chip, Skeleton } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TasksList() {
    const { data, store } = useStore();

    const router = useRouter();

    const [activedTasks, setActivedTasks] = useState<any[]>([]);
    const [overdueTasks24H, setOverdueTasks24H] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
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

    useEffect(() => {
    if (!data) return;

    // Откладываем вычисления в микротаск, чтобы не блокировать рендер
    const timerId = setTimeout(() => {
        // Активные задачи (сортировка + фильтрация)
        const active = data.tasks
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .filter((t) => t.status === "active" && new Date(t.deadline) > new Date());
        
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
        
    // Если данные загружаются, показываем скелетон
    if (isLoading) {
    return (
        <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-3 animate-pulse">
                <Skeleton className="h-6 rounded w-3/4 mb-2" />
                <Skeleton className="h-4 rounded w-full mb-2" />
                <Skeleton className="h-4 rounded w-1/2" />
            </div>
        ))}
        </div>
    );
    }

    return (
    <div className="flex flex-col gap-2">
        {/* Просроченные задачи */}
        {overdueTasks24H.map(task => (
        <div key={task.id} className="bg-white border-danger/16 border-2 rounded-3xl p-3 flex flex-col gap-2 cursor-pointer active:scale-105 transition" onClick={() => {router.push(`/task/${task.id}`)}}>
            <div className="flex justify-between">
            <span className="font-medium text-xl line-clamp-2 text-danger leading-6">
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
        
        {/* Активные задачи */}
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
                <span className="font-medium text-xl line-clamp-2 leading-6">
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