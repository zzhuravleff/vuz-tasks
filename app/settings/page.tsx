"use client";

import { useStore } from "@/hooks/useStore";
import { Input, Button, Label, ListBox, Avatar, Skeleton, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { version } from "@/lib/version";
import DataActions from "@/components/dataActions";

// Константы
const COLORS = ["accent", "default", "success", "warning", "danger"] as const;
const SPINNER_COLORS = ["accent", "current", "success", "warning", "danger"] as const;

// Компонент скелетона для списка
const SubjectsSkeleton = () => (
  <div className="flex flex-col gap-2 w-full">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-2 p-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-5 rounded-xl w-32" />
      </div>
    ))}
  </div>
);

// Компонент скелетона для семестра
const SemesterSkeleton = () => (
  <div className="flex flex-col gap-2 p-3 bg-white w-full rounded-3xl">
    <Skeleton className="h-10 rounded-xl w-full" />
    <Skeleton className="h-10 rounded-xl w-full" />
  </div>
);

export default function SettingsPage() {
  const { data, store } = useStore();
  const router = useRouter();
  
  // Состояния
  const [newSubject, setNewSubject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [weeks, setWeeks] = useState(0);
  const [sortedSubjects, setSortedSubjects] = useState<any[]>([]);
  
  // Состояния загрузки
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);
  const [isSemesterLoading, setIsSemesterLoading] = useState(true);
  
  // Навигация
  const [isPending, startTransition] = useTransition();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  // Асинхронная загрузка дисциплин
  useEffect(() => {
    if (!data) return;
    
    // Имитация асинхронной загрузки (на самом деле данные уже в data)
    const timer = setTimeout(() => {
      const sorted = [...data.subjects].sort((a, b) => a.name.localeCompare(b.name));
      setSortedSubjects(sorted);
      setIsSubjectsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [data?.subjects]);

  // Асинхронная загрузка семестра
  useEffect(() => {
    if (!data) return;
    
    const timer = setTimeout(() => {
      setIsSemesterLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [data?.semester]);

  // Навигация
  const navigateToSubject = (id: string) => {
    setNavigatingId(id);
    startTransition(() => router.push(`/settings/subjects/${id}`));
  };

  // Добавление дисциплины
  const addSubject = () => {
    if (!newSubject.trim()) return;
    store.addSubject(newSubject);
    setNewSubject("");
    // Сбрасываем состояние загрузки, чтобы показать скелетон до обновления списка
    setIsSubjectsLoading(true);
    setTimeout(() => setIsSubjectsLoading(false), 100);
  };

  // Сохранение семестра
  const saveSemester = (updates: Partial<typeof data.semester>) => {
    store.updateSemester({ ...data.semester, ...updates });
    setIsSemesterLoading(true);
    setTimeout(() => setIsSemesterLoading(false), 100);
  };

  // Если данные ещё не загружены
  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-medium text-2xl">Семестр</h1>
          <SemesterSkeleton />
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl font-medium">Дисциплины</h1>
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-10 rounded-xl w-full" />
            <Skeleton className="h-10 rounded-xl w-full" />
          </div>
          <SubjectsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Блок семестра */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-medium text-2xl">Семестр</h1>

        {isSemesterLoading ? (
          <SemesterSkeleton />
        ) : (
          <div className="flex flex-col gap-2 p-3 bg-white w-full rounded-3xl">
            {/* Дата начала */}
            <div className="flex flex-col gap-1">
              <Label>Дата начала</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  defaultValue={data.semester.startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  variant="secondary"
                  className="flex-1"
                />
                {startDate && startDate !== data.semester.startDate && (
                  <Button onClick={() => saveSemester({ startDate })}>
                    Сохранить
                  </Button>
                )}
              </div>
            </div>

            {/* Количество недель */}
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
                {weeks > 0 && weeks !== data.semester.weeks && (
                  <Button onClick={() => saveSemester({ weeks })}>
                    Сохранить
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Блок дисциплин */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-2xl font-medium">Дисциплины</h1>

        <div className="flex flex-col gap-2 w-full">
          <Input
            variant="secondary"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Новая дисциплина"
          />
          <Button className="w-full" isDisabled={!newSubject.trim()} onClick={addSubject}>
            Добавить
          </Button>
        </div>

        {isSubjectsLoading ? (
          <SubjectsSkeleton />
        ) : (
          <ListBox>
            {sortedSubjects.map((subject, idx) => (
              <ListBox.Item
                key={subject.id}
                id={subject.id}
                className="relative cursor-pointer"
                onAction={() => navigateToSubject(subject.id)}
              >
                {navigatingId === subject.id && isPending && (
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                    <Spinner size="lg" color={SPINNER_COLORS[idx % SPINNER_COLORS.length]} />
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <Avatar variant="soft" color={COLORS[idx % COLORS.length]} className="shrink-0">
                    <Avatar.Fallback className="uppercase">
                      {subject.name[0]}
                      {subject.name.split(" ")[1]?.[0] || ""}
                    </Avatar.Fallback>
                  </Avatar>
                  <span>{subject.name}</span>
                </div>
              </ListBox.Item>
            ))}
          </ListBox>
        )}
      </div>

      <DataActions />

      <div className="w-full text-gray-600 text-center">
        Версия: {version}
      </div>
    </div>
  );
}