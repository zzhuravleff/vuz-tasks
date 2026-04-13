"use client";

import { useStore } from "@/hooks/useStore";
import { Input, Button, Label, ListBox, Avatar } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {

    const { data, store } = useStore();
    const [newSubject, setNewSubject] = useState("");

    const [startDate, setStartDate] = useState("");
    const [weeks, setWeeks] = useState(0);

    const router = useRouter();

    const colors = ["accent", "default", "success", "warning", "danger"] as const;

    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    if (!isMounted || !data) return null;

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
                        <Button className={`w-full ${!startDate || startDate === data.semester.startDate ? "hidden" : ""}`} isDisabled={!startDate || startDate === data.semester.startDate} onClick={() => store.updateSemester({ ...data.semester, startDate })}>
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
                        <Button className={`w-full ${!weeks || weeks === data.semester.weeks ? "hidden" : ""}`} isDisabled={!weeks || weeks === data.semester.weeks} onClick={() => store.updateSemester({ ...data.semester, weeks })}>
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

            <ListBox
            onAction={(key) => {
                router.push(`/settings/subjects/${key}`);
            }}
            >
            {data.subjects.sort((a, b) => a.name.localeCompare(b.name)).map((s, i) => (
                    <ListBox.Item key={s.id} id={s.id} className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <Avatar variant="soft" color={colors[i % colors.length]} className="shrink-0">
                                <Avatar.Fallback className="uppercase">{s.name[0]}{s.name.split(" ").length > 1 ? s.name.split(" ")[1][0] : ""}</Avatar.Fallback>
                            </Avatar>
                            <span>{s.name}</span>
                        </div>
                    </ListBox.Item>
            ))}
            </ListBox>
        </div>

        <Button variant="danger-soft" className="w-full" onClick={() => {
            if (confirm("Вы уверены, что хотите сбросить все данные? Это действие необратимо.")) {
                store.clearAllData();
            }
        }}>Сбросить все данные</Button>
        
      
    </div>
    );
}