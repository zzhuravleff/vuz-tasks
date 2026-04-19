"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Chip, IconChevronLeft, Input, Label, Skeleton, Tabs, ToggleButton, ToggleButtonGroup, ToggleButtonGroupSeparator, Spinner } from "@heroui/react";
import { useStore } from "@/hooks/useStore";
import { useEffect, useState, useTransition } from "react";
import { ScheduleRule } from "@/types";

// Константы
const TAB_ITEMS = [
  { label: "Еженед" },
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
  { id: 1, time: "9:00" },
  { id: 2, time: "10:30" },
  { id: 3, time: "12:40" },
  { id: 4, time: "14:20" },
  { id: 5, time: "16:20" },
  { id: 6, time: "18:00" },
];

// Вспомогательные функции
const getColorByType = (type: string) => {
  switch (type) {
    case "Еженедельно": return "accent";
    case "Нечёт": return "success";
    case "Чёт": return "warning";
    case "Кастом": return "danger";
    default: return "default";
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

// Компонент скелетона для списка правил
const RulesSkeleton = () => (
  <div className="flex flex-col gap-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex flex-col gap-2 p-3 bg-white rounded-3xl w-full animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 rounded-xl w-32" />
          <Skeleton className="h-8 rounded-xl w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 rounded-xl w-16" />
          <Skeleton className="h-8 rounded-xl w-16" />
        </div>
      </div>
    ))}
  </div>
);

export default function SubjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, store } = useStore();
  
  // Состояния формы
  const [typeRule, setTypeRule] = useState("Еженедельно");
  const [date, setDate] = useState("");
  const [lesson, setLesson] = useState<Set<string>>(new Set());
  
  // Состояния данных
  const [sortedRules, setSortedRules] = useState<ScheduleRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Для навигации и действий
  const [isPending, startTransition] = useTransition();
  const [isDeletingRule, setIsDeletingRule] = useState<string | null>(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);

  const subject = data?.subjects?.find((s) => s.id === id);

  // Асинхронная сортировка правил
  useEffect(() => {
    if (!subject) return;

    const timerId = setTimeout(() => {
      const sorted = [...subject.rules].sort((a, b) => {
        const aIsCustom = a.type === "Кастом";
        const bIsCustom = b.type === "Кастом";
        
        if (aIsCustom === bIsCustom) {
          if (!aIsCustom) {
            const aNonCustom = a as Extract<ScheduleRule, { dayOfWeek: number }>;
            const bNonCustom = b as Extract<ScheduleRule, { dayOfWeek: number }>;
            if (aNonCustom.dayOfWeek !== bNonCustom.dayOfWeek) {
              return aNonCustom.dayOfWeek - bNonCustom.dayOfWeek;
            }
            return (ensureLessonArray(aNonCustom.lesson)[0] ?? 0) - (ensureLessonArray(bNonCustom.lesson)[0] ?? 0);
          } else {
            const aCustom = a as Extract<ScheduleRule, { date: string }>;
            const bCustom = b as Extract<ScheduleRule, { date: string }>;
            return aCustom.date.localeCompare(bCustom.date);
          }
        }
        return aIsCustom ? 1 : -1;
      });
      
      setSortedRules(sorted);
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timerId);
  }, [subject]);

  // Удаление правила
  const handleDeleteRule = (ruleId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту пару?")) {
      setIsDeletingRule(ruleId);
      startTransition(() => {
        store.deleteRule(subject!.id, ruleId);
        setIsDeletingRule(null);
      });
    }
  };

  // Удаление дисциплины
  const handleDeleteSubject = () => {
    if (confirm("Вы уверены, что хотите удалить эту дисциплину?")) {
      setIsDeletingSubject(true);
      startTransition(() => {
        store.deleteSubject(subject!.id);
        router.back();
      });
    }
  };

  // Добавление правила
  const handleAddRule = () => {
    if (typeRule !== "Кастом") {
      if (!date || lesson.size === 0) return;
      
      store.addRule(subject!.id, {
        id: crypto.randomUUID(),
        type: typeRule as "Еженедельно" | "Нечёт" | "Чёт",
        dayOfWeek: Number(date),
        lesson: Array.from(lesson).map(Number),
      });
    } else {
      if (!date || lesson.size === 0) return;
      
      store.addRule(subject!.id, {
        id: crypto.randomUUID(),
        type: "Кастом",
        date: String(date),
        lesson: Array.from(lesson).map(Number),
      });
    }
    
    setDate("");
    setLesson(new Set());
  };

  // Загрузка данных
  if (!data || !subject) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Button variant="tertiary" className="fixed" onPress={() => router.back()}>
          <IconChevronLeft className="size-4" />
          Назад
        </Button>
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full pb-8">
      <Button variant="tertiary" className="fixed" onPress={() => router.back()}>
        <IconChevronLeft className="size-4" />
        Назад
      </Button>

      <h1 className="text-2xl font-medium text-center mt-12">
        {subject.name}
      </h1>

      {/* Список правил */}
      {!isLoading && sortedRules.length === 0 && (
        <div className="w-full text-center text-gray-500 text-lg">
          Пока пары не добавлены...
        </div>
      )}

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <RulesSkeleton />
        ) : (
          sortedRules.map((rule) => (
            <div
              key={rule.id}
              className="relative flex flex-col gap-2 p-3 bg-white rounded-3xl w-full cursor-pointer active:scale-105 transition"
              onClick={() => handleDeleteRule(rule.id)}
            >
              {isDeletingRule === rule.id && isPending && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                  <Spinner size="lg" />
                </div>
              )}
              
              {rule.type !== "Кастом" ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xl">{DAYS.find(d => d.id === rule.dayOfWeek)?.full}</span>
                    <Chip size="lg" variant="soft" color={getColorByType(rule.type)}>
                      {rule.type}
                    </Chip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ensureLessonArray(rule.lesson).sort((a, b) => a - b).map((l) => (
                      <Chip key={l} size="lg">{l} пара</Chip>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xl">{formatDate(rule.date)}</span>
                    <Chip size="lg" variant="soft" color={getColorByType(rule.type)}>
                      {rule.type}
                    </Chip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ensureLessonArray(rule.lesson).map((l) => (
                      <Chip key={l} size="lg">{l} пара</Chip>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Форма добавления пары */}
      <div className="flex flex-col gap-2 bg-white p-3 rounded-3xl">
        <Tabs onSelectionChange={(t) => setTypeRule(t as string)} className="w-full">
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
          </>
        ) : (
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
        )}

        <Button
          className="w-full"
          isDisabled={!date || lesson.size === 0}
          onPress={handleAddRule}
        >
          Добавить
        </Button>
      </div>

      {/* Кнопка удаления дисциплины */}
      <Button 
        variant="danger-soft" 
        className="w-full" 
        onPress={handleDeleteSubject}
        isDisabled={isDeletingSubject}
      >
        {({ isPending }) => (
          <>
            {isDeletingSubject && isPending ? <Spinner color="current" size="sm" /> : null}
            Удалить дисциплину
          </>
        )}
      </Button>
    </div>
  );
}