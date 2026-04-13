"use client";

import { useStore } from "@/hooks/useStore";
import { Input, Button, Label, ListBox, Avatar } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {

    const { data, store } = useStore();
    const [newSubject, setNewSubject] = useState("");

    const router = useRouter();

    const colors = ["accent", "default", "success", "warning", "danger"] as const;

    if (!data) return null;

    return (
    <div className="flex flex-col gap-4" suppressHydrationWarning={false}>

        <div className="flex flex-col items-center gap-3">
            <h1 className="font-medium text-2xl">Семестр</h1>

            <div className="flex flex-col gap-2 p-3 bg-white w-full rounded-3xl">
                <div className="flex flex-col gap-1">
                    <Label>Дата начала</Label>
                    <Input
                        type="date"
                        value={data.semester.startDate}
                        onChange={(e) =>
                            store.updateSemester({
                            ...data.semester,
                            startDate: e.target.value,
                            })
                        }
                        variant="secondary"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label>Количество недель</Label>
                    <Input
                    type="number"
                    value={data.semester.weeks}
                    onChange={(e) =>
                        store.updateSemester({
                            ...data.semester,
                            weeks: parseInt(e.target.value) || 0,
                        })
                    }
                    variant="secondary"
                    className="w-full"
                    />
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
                            <Avatar variant="soft" color={colors[i % colors.length]}>
                                <Avatar.Fallback>{s.name[0]}</Avatar.Fallback>
                            </Avatar>
                            <span>{s.name}</span>
                        </div>
                        <Button variant="danger-soft"
                        onClick={(e) => {
                            e.stopPropagation();
                            store.deleteSubject(s.id);
                        }}
                        >
                            Delete
                        </Button>
                    </ListBox.Item>
            ))}
            </ListBox>
        </div>
        
      
    </div>
    );
}