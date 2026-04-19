"use client";

import { useStore } from "@/hooks/useStore";
import { Input, Button, Label, ListBox, Avatar, Skeleton, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { version } from "../../lib/version"
import DataActions from "@/components/dataActions";

export default function SettingsPage() {

    const { data, store } = useStore();
    const [newSubject, setNewSubject] = useState("");

    const [startDate, setStartDate] = useState("");
    const [weeks, setWeeks] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [sortedSubjects, setSortedSubjects] = useState<any[]>([]);
    
    // Для навигации с обратной связью
    const [isPending, startTransition] = useTransition();
    const [navigatingSubjectId, setNavigatingSubjectId] = useState<string | null>(null);

    const router = useRouter();

    const colors = ["accent", "default", "success", "warning", "danger"] as const;
    const colorsSpinner = ["accent", "current", "success", "warning", "danger"] as const;

    // Функция для навигации с обратной связью
    const navigateToSubject = (subjectId: string) => {
        setNavigatingSubjectId(subjectId);
        startTransition(() => {
            router.push(`/settings/subjects/${subjectId}`);
        });
    };

    // Асинхронная сортировка дисциплин (без блокировки UI)
    useEffect(() => {
        if (!data) return;

        const timerId = setTimeout(() => {
            const sorted = [...data.subjects].sort((a, b) => a.name.localeCompare(b.name));
            setSortedSubjects(sorted);
            setIsLoading(false);
        }, 0);

        return () => clearTimeout(timerId);
    }, [data]);

    // Показываем скелетон во время загрузки
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3">
                    <h1 className="font-medium text-2xl">Семестр</h1>
                    <div className="flex flex-col gap-2 p-3 bg-white w-full rounded-3xl">
                        <Skeleton className="h-10 rounded-lg w-full" />
                        <Skeleton className="h-10 rounded-lg w-full" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-2xl font-medium">Дисциплины</h1>
                    <div className="flex flex-col gap-2 w-full">
                        <Skeleton className="h-10 rounded-lg w-full" />
                        <Skeleton className="h-10 rounded-lg w-full" />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-2 p-2">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-5 rounded w-32" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4" suppressHydrationWarning={false}>
            <div className="flex flex-col items-center gap-3">
                <h1 className="font-medium text-2xl">Семестр</h1>

                <div className="flex flex-col gap-2 p-3 bg-white w-full rounded-3xl">
                    <div className="flex flex-col gap-1">
                        <Label>Дата начала</Label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                defaultValue={data.semester.startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                variant="secondary"
                                className="w-full"
                            />
                            <Button className={`w-full ${!startDate || startDate === data.semester.startDate ? "hidden" : ""}`} 
                                isDisabled={!startDate || startDate === data.semester.startDate} 
                                onClick={() => store.updateSemester({ ...data.semester, startDate })}>
                                Сохранить
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Количество недель</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                defaultValue={data.semester.weeks}
                                onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
                                variant="secondary"
                                className="w-full"
                            />
                            <Button className={`w-full ${!weeks || weeks === data.semester.weeks ? "hidden" : ""}`} 
                                isDisabled={!weeks || weeks === data.semester.weeks} 
                                onClick={() => store.updateSemester({ ...data.semester, weeks })}>
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-3">
                <h1 className="text-2xl font-medium">Дисциплины</h1>

                <div className="flex flex-col gap-2 w-full">
                    <Input
                        className="w-full"
                        variant="secondary"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Новая дисциплина"
                    />

                    <Button
                        className="w-full"
                        isDisabled={!newSubject.trim()}
                        onClick={() => {
                            store.addSubject(newSubject);
                            setNewSubject("");
                        }}
                    >
                        Добавить
                    </Button>
                </div>

                <ListBox>
                    {sortedSubjects.map((s, i) => (
                        <ListBox.Item 
                            key={s.id} 
                            id={s.id} 
                            className="relative cursor-pointer"
                            onAction={() => navigateToSubject(s.id)}
                        >
                            {/* Спиннер при навигации */}
                            {navigatingSubjectId === s.id && isPending && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                                    <Spinner size="lg" color={colorsSpinner[i % colors.length]} />
                                </div>
                            )}
                            <div className="flex gap-2 items-center">
                                <Avatar variant="soft" color={colors[i % colors.length]} className="shrink-0">
                                    <Avatar.Fallback className="uppercase">
                                        {s.name[0]}
                                        {s.name.split(" ").length > 1 ? s.name.split(" ")[1][0] : ""}
                                    </Avatar.Fallback>
                                </Avatar>
                                <span>{s.name}</span>
                            </div>
                        </ListBox.Item>
                    ))}
                </ListBox>
            </div>

            <DataActions />

            <div className="w-full text-gray-600 text-center font-regular">
                Версия: {version}
            </div>
        </div>
    );
}