"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Chip, IconChevronLeft, Input, Label, Tabs, ToggleButton, ToggleButtonGroup, ToggleButtonGroupSeparator } from "@heroui/react";
import { useStore } from "@/hooks/useStore";
import { useState, useEffect } from "react";
import { ScheduleRule } from "@/types";

const TAB_ITEMS = [
    { label: "Еженедельно" },
    { label: "Нечёт" },
    { label: "Чёт" },
    { label: "Кастом" },
  ] as const;

const DAYS = [
    { id: 1, short: "Пн", full: "Понедельник" },
    { id: 2, short: "Вт", full: "Вторник" },
    { id: 3, short: "Ср", full: "Среда" },
    { id: 4, short: "Чт", full: "Четверг" },
    { id: 5, short: "Пт", full: "Пятница" },
    { id: 6, short: "Сб", full: "Суббота" },
  ];

const PARS = [
    {id: 1, time: "9:00"},
    {id: 2, time: "10:30"},
    {id: 3, time: "12:40"},
    {id: 4, time: "14:20"},
    {id: 5, time: "16:20"},
    {id: 6, time: "18:00"},
];

const getColorByType = (type: string) => {
  switch(type) {
    case "Еженедельно":
      return "accent";
    case "Нечёт":
      return "success";
    case "Чёт":
      return "warning";
    case "Кастом":
      return "danger";
    default:
      return "default";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(date);
};

const ensureLessonArray = (lesson: number | number[]): number[] => {
  if (Array.isArray(lesson)) return lesson;
  if (typeof lesson === 'number') return [lesson];
  return [];
};

export default function SubjectPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, store } = useStore();
  const [typeRule, setTypeRule] = useState("weekly");
  const [date, setDate] = useState("");
  const [lesson, setLesson] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !data) return null;

  const subject = data.subjects.find((s) => s.id === id);
  if (!subject) return <div>Discipline not found</div>;

  // Сортировка: сначала по дням недели и парам, потом кастомные по датам
  const sortedRules = [...subject.rules].sort((a, b) => {
  const aIsCustom = a.type === "Кастом";
  const bIsCustom = b.type === "Кастом";
  
  if (aIsCustom === bIsCustom) {
    if (!aIsCustom) {
      // Оба не кастомные - сортируем по dayOfWeek, потом по lesson
      const aNonCustom = a as Extract<ScheduleRule, { dayOfWeek: number }>;
      const bNonCustom = b as Extract<ScheduleRule, { dayOfWeek: number }>;
      
      if (aNonCustom.dayOfWeek !== bNonCustom.dayOfWeek) {
        return aNonCustom.dayOfWeek - bNonCustom.dayOfWeek;
      }
      return (ensureLessonArray(aNonCustom.lesson)[0] ?? 0) - (ensureLessonArray(bNonCustom.lesson)[0] ?? 0);
    } else {
      // Оба кастомные - сортируем по date
      const aCustom = a as Extract<ScheduleRule, { date: string }>;
      const bCustom = b as Extract<ScheduleRule, { date: string }>;
      return aCustom.date.localeCompare(bCustom.date);
    }
  }
  // Один кастомный, другой нет - некастомный идёт первым
  return aIsCustom ? 1 : -1;
});

  return (
    <div className="flex flex-col gap-4 w-full">
        <Button variant="tertiary" className="fixed" onPress={() => router.back()}>
            <IconChevronLeft className="size-4" />
            Назад
        </Button>

        <h1 className="text-2xl font-medium text-center mt-12">
            {subject.name}
        </h1>

        {/* список */}
        {sortedRules.length === 0 ? (
          <div className="w-full text-center font-regular text-lg">
            Пока пары не добавлены...
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
            {sortedRules.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                    {r.type != "Кастом" ? (
                        <div className="flex flex-col gap-2 p-3 bg-white rounded-3xl w-full cursor-pointer" onClick={() => {
                          if (confirm("Вы уверены, что хотите удалить эту пару?")) {
                            store.deleteRule(subject.id, r.id);
                          }
                        }}>
                            <div className="flex justify-between items-center gap-2">
                                <span className="font-medium text-xl">{DAYS.find(d => d.id === r.dayOfWeek)?.full}</span>
                                <Chip size="lg" variant="soft" color={getColorByType(r.type)}>{r.type}</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {ensureLessonArray(r.lesson).sort((a, b) => a - b).map((l) => (
                                <Chip key={l} size="lg">{l} пара</Chip>
                              ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 p-3 bg-white rounded-3xl w-full cursor-pointer" onClick={() => {
                          if (confirm("Вы уверены, что хотите удалить эту пару?")) {
                            store.deleteRule(subject.id, r.id);
                          }
                        }}>
                            <div className="flex justify-between items-center gap-2">
                                <span className="font-medium text-xl">{formatDate(r.date)}</span>
                                <Chip size="lg" variant="soft" color={getColorByType(r.type)}>{r.type}</Chip>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {ensureLessonArray(r.lesson).map((l) => (
                                <Chip key={l} size="lg">{l} пара</Chip>
                              ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* добавление пары */}
        <div className="flex flex-col gap-2 bg-white p-3 rounded-3xl">
            <Tabs onSelectionChange={(t) => setTypeRule(t as ScheduleRule["type"])} className="w-full">
                <Tabs.ListContainer>
                    <Tabs.List>
                      {TAB_ITEMS.map((tab) => (
                        <Tabs.Tab key={tab.label} id={tab.label}>
                          {tab.label}
                          <Tabs.Indicator />
                        </Tabs.Tab>
                      ))}
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>

            {typeRule !== "Кастом" ? (
              <>
                {/* ДЕНЬ */}
                <ToggleButtonGroup
                  className="w-full"
                  selectedKeys={date ? new Set([date]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setDate(value ? String(value) : "");
                  }}
                >
                  {DAYS.map((day) => (
                    <ToggleButton key={day.id} id={String(day.id)} className="flex-1">
                      {day.id !== 1 && <ToggleButtonGroupSeparator />}
                      {day.short}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                {/* ПАРА */}
                <ToggleButtonGroup
                  className="w-full"
                  selectionMode="multiple"
                  selectedKeys={lesson}
                  onSelectionChange={(keys) => {
                    setLesson(new Set(Array.from(keys).map(String)));
                  }}
                >
                  {PARS.map((para) => (
                    <ToggleButton key={para.id} id={String(para.id)} className="flex-1">
                      {para.id !== 1 && <ToggleButtonGroupSeparator />}
                      {para.id}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                {/* КНОПКА */}
                <Button
                  className="w-full"
                  isDisabled={!date || lesson.size === 0}
                  onPress={() => {
                    store.addRule(subject.id, {
                      id: crypto.randomUUID(),
                      type: typeRule as "Еженедельно" | "Нечёт" | "Чёт",
                      dayOfWeek: Number(date),
                      lesson: Array.from(lesson).map(Number),
                    });

                    setDate("");
                    setLesson(new Set());
                  }}
                >
                  Добавить
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                    
                    <div className="flex flex-col gap-1">
                        <Label>Дата пары</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            variant="secondary"
                        />
                    </div>
                    {/* ПАРА */}
                    <ToggleButtonGroup
                      className="w-full"
                      selectionMode="multiple"
                      selectedKeys={lesson}
                      onSelectionChange={(keys) => {
                        setLesson(new Set(Array.from(keys).map(String)));
                      }}
                    >
                      {PARS.map((para) => (
                        <ToggleButton key={para.id} id={String(para.id)} className="flex-1">
                          {para.id !== 1 && <ToggleButtonGroupSeparator />}
                          {para.id}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    </div>

                {/* КНОПКА */}
                <Button
                  className="w-full"
                  isDisabled={!date || lesson.size === 0}
                  onPress={() => {
                    store.addRule(subject.id, {
                      id: crypto.randomUUID(),
                      type: typeRule as "Кастом",
                      date: String(date),
                      lesson: Array.from(lesson).map(Number),
                    });

                    setDate("");
                    setLesson(new Set());
                  }}
                >
                  Добавить
                </Button>
              </>
            )}
        </div>

        <Button variant="danger-soft" className="w-full" onPress={() => {
            if (confirm("Вы уверены, что хотите удалить эту дисциплину?")) {
                store.deleteSubject(subject.id);
                router.back();
            }
        }}>
            Удалить дисциплину
        </Button>

    </div>
  );
}