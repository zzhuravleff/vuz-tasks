"use client";

import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { Input, Button, Label, ListBox, Description, Avatar } from "@heroui/react";

export default function SettingsPage() {
  const { data, update } = useAppData();

  const [newSubject, setNewSubject] = useState("");

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">

        <div className="flex flex-col items-center gap-3">
            <h1 className="font-medium text-2xl">Семестр</h1>

            <div className="flex flex-col gap-2 p-3 bg-white w-full rounded-3xl">
                <div className="flex flex-col gap-1">
                    <Label>Дата начала</Label>
                    <Input
                        type="date"
                        value={data.semester.startDate.split("T")[0]}
                        onChange={(e) =>
                            update((d) => ({
                            ...d,
                            semester: {
                                ...d.semester,
                                startDate: e.target.value,
                            },
                            }))
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
                        update((d) => ({
                        ...d,
                        semester: {
                            ...d.semester,
                            weeks: Number(e.target.value),
                        },
                        }))
                    }
                    variant="secondary"
                    className="w-full"
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-3">
            <h1 className="text-xl font-semibold">Дисциплины</h1>

            {/* ================= ADD SUBJECT ================= */}
            <div className="flex flex-col gap-2 w-full">
                <Input
                className="w-full"
                variant="secondary"
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                placeholder="Новая дисциплина"
                />

                <Button
                className="w-full"
                isDisabled={!newSubject.trim()}
                onClick={() => {
                    if (!newSubject.trim()) return;

                    update((d) => ({
                    ...d,
                    subjects: [
                        ...d.subjects,
                        {
                        id: crypto.randomUUID(),
                        name: newSubject,
                        rules: [],
                        },
                    ],
                    }));

                    setNewSubject("");
                }}
                >
                Добавить
                </Button>
            </div>

            {/* ================= SUBJECTS ================= */}
            <ListBox>
            {data.subjects.map((s, i) => (
                    <ListBox.Item key={s.id} className="flex justify-between items-center p-0">
                        <div className="flex gap-2 items-center">
                            <Avatar variant="soft" color={["accent", "default", "success", "warning", "danger"][i % 5] as any}>
                                <Avatar.Fallback>{s.name[0]}</Avatar.Fallback>
                            </Avatar>
                            <span>{s.name}</span>
                        </div>
                        <Button variant="danger-soft"
                            onClick={() =>
                            update((d) => ({
                                ...d,
                                subjects: d.subjects.filter((x) => x.id !== s.id),
                            }))
                            }
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