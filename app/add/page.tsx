"use client";

import { useRouter } from "next/navigation";
import { Button, IconChevronLeft, Input, Label, ListBox, Select, Tabs, TextArea, DateField, TimeField } from "@heroui/react";
import { useStore } from "@/hooks/useStore";
import { useState, useEffect, useMemo } from "react";
import { Task, ScheduleRule } from "@/types";
import { parseDate, getLocalTimeZone, today, Time } from "@internationalized/date";

const TAB_ITEMS = [
    { label: "Расписание" },
    { label: "Кастомная" },
] as const;

// Константы для времени пар
const LESSON_TIMES: Record<number, string> = {
    1: "9:00",
    2: "10:30",
    3: "12:40",
    4: "14:20",
    5: "16:20",
    6: "18:00",
};

interface GeneratedLesson {
    id: string;
    date: Date;
    lessonNumber: number;
    startTime: string;
    displayText: string;
    dateISO: string;
}

export default function SubjectPage() {
    const router = useRouter();
    const { data, store } = useStore();
    const [isMounted, setIsMounted] = useState(false);
    const [typeTask, setTypeTask] = useState<"Расписание" | "Кастомная">("Расписание");
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [customDate, setCustomDate] = useState<any>(null);
    const [customTime, setCustomTime] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Функция для проверки чётности недели
    const isEvenWeek = (date: Date, semesterStart: Date): boolean => {
        const diffTime = Math.abs(date.getTime() - semesterStart.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.ceil(diffDays / 7);
        return weekNumber % 2 === 0;
    };

    // Функция для генерации всех дат в семестре по правилу
    const generateDatesForRule = (rule: ScheduleRule, semesterStart: Date, semesterEnd: Date): Date[] => {
        const dates: Date[] = [];
        
        if (rule.type === "Кастом") {
            const customDate = new Date(rule.date);
            if (customDate >= semesterStart && customDate <= semesterEnd) {
                dates.push(customDate);
            }
            return dates;
        }
        
        let currentDate = new Date(semesterStart);
        
        while (currentDate.getDay() !== rule.dayOfWeek && currentDate <= semesterEnd) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        while (currentDate <= semesterEnd) {
            let shouldInclude = true;
            
            if (rule.type === "Чёт") {
                shouldInclude = isEvenWeek(currentDate, semesterStart);
            } else if (rule.type === "Нечёт") {
                shouldInclude = !isEvenWeek(currentDate, semesterStart);
            }
            
            if (shouldInclude) {
                dates.push(new Date(currentDate));
            }
            
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        return dates;
    };

    // Функция для генерации всех пар по выбранной дисциплине
    const generateLessonsForSubject = (subjectId: string): GeneratedLesson[] => {
        const subject = data.subjects.find(s => s.id === subjectId);
        if (!subject || !subject.rules) return [];

        const lessons: GeneratedLesson[] = [];
        const semesterStart = new Date(data.semester.startDate);
        const semesterEnd = new Date(semesterStart);
        semesterEnd.setDate(semesterEnd.getDate() + (data.semester.weeks * 7));

        subject.rules.forEach((rule) => {
            const dates = generateDatesForRule(rule, semesterStart, semesterEnd);
            
            dates.forEach((date) => {
                rule.lesson.forEach((lessonNumber) => {
                    lessons.push({
                        id: `${date.toISOString()}-${lessonNumber}`,
                        date: date,
                        lessonNumber: lessonNumber,
                        startTime: LESSON_TIMES[lessonNumber] || "Время не указано",
                        displayText: `${date.toLocaleDateString()} — ${lessonNumber} пара (${LESSON_TIMES[lessonNumber] || "?"})`,
                        dateISO: date.toISOString(),
                    });
                });
            });
        });
        
        return lessons.sort((a, b) => {
            if (a.date.getTime() !== b.date.getTime()) {
                return a.date.getTime() - b.date.getTime();
            }
            return a.lessonNumber - b.lessonNumber;
        });
    };

        // Мемоизируем сгенерированные пары для выбранной дисциплины
        const lessons = useMemo(() => {
            if (!selectedSubjectId) return [];
            
            // Генерируем все пары
            const allLessons = generateLessonsForSubject(selectedSubjectId);
            
            const now = new Date();
            
            // Получаем ID уже занятых пар (только из задач типа "Расписание")
            const occupiedLessonIds = new Set(
                data.tasks
                    .filter((task): task is Extract<Task, { type: "Расписание" }> => 
                        task.type === "Расписание" && 
                        task.subjectId === selectedSubjectId && 
                        task.status === "active"
                    )
                    .map(task => `${task.deadline}-${task.lessons}`)
            );
            
            // Фильтруем: 
            // 1. Убираем занятые пары
            // 2. Убираем прошедшие пары (дата + время уже прошли)
            return allLessons.filter(lesson => {
                // Проверяем, не занята ли пара
                if (occupiedLessonIds.has(lesson.id)) return false;
                
                // Проверяем, не прошла ли уже пара
                const lessonDateTime = new Date(lesson.date);
                const [hours, minutes] = lesson.startTime.split(':').map(Number);
                lessonDateTime.setHours(hours, minutes, 0, 0);
                
                return lessonDateTime > now;
            });
        }, [selectedSubjectId, data]);

    // Функция для получения комбинированной даты и времени
    const getCombinedDeadline = () => {
        if (!customDate || !customTime) return null;
        
        // customDate - это CalendarDate, customTime - это Time
        const date = customDate.toDate(getLocalTimeZone());
        
        // У Time нет toDate(), нужно использовать его свойства
        date.setHours(customTime.hour, customTime.minute, 0, 0);
        
        return date.toISOString();
    };

    if (!isMounted || !data) return null;

    return (
        <div className="flex flex-col gap-4 w-full">
            <Button variant="tertiary" className="fixed" onPress={() => router.back()}>
                <IconChevronLeft className="size-4" />
                Назад
            </Button>

            <h1 className="text-2xl font-medium text-center mt-12">
                Новая задача
            </h1>

            <div className={`flex flex-col gap-2 ${typeTask === "Расписание" ? "hidden" : ""}`}>
                <Label isRequired>Название задачи</Label>
                <Input 
                    variant="secondary" 
                    placeholder="Название задачи"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Описание задачи</Label>
                <TextArea 
                    rows={6} 
                    variant="secondary" 
                    placeholder="Введите описание вашей задачи"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                />
            </div>

            <Tabs 
                selectedKey={typeTask}
                onSelectionChange={(t) => {
                    setTypeTask(t as "Расписание" | "Кастомная");
                    // Сбрасываем специфичные для типа значения при переключении
                    if (t === "Расписание") {
                        setCustomDate(null);
                        setCustomTime(null);
                    } else {
                        setSelectedSubjectId(null);
                        setSelectedLesson(null);
                    }
                }} 
                className="w-full"
            >
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

            {/* Блок для задач по расписанию */}
            {typeTask === "Расписание" ? (
                <>
                    <Select 
                        className="w-full" 
                        variant="secondary" 
                        placeholder="Выберите одну дисциплину"
                        selectedKey={selectedSubjectId}
                        onChange={(key) => {
                            setSelectedSubjectId(key as string);
                            setSelectedLesson(null);
                        }}
                    >
                        <Label isRequired>Выбрать дисциплину</Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {data.subjects.map((subject) => (
                                    <ListBox.Item key={subject.id} id={subject.id}>
                                        {subject.name}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>

                    <Select 
                        isDisabled={!selectedSubjectId || lessons.length === 0}
                        className="w-full" 
                        variant="secondary" 
                        placeholder={
                            !selectedSubjectId 
                                ? "Сначала выберите дисциплину" 
                                : lessons.length === 0 
                                    ? "Нет пар по расписанию" 
                                    : "Выберите пару по расписанию"
                        }
                        selectedKey={selectedLesson}
                        onChange={(key) => setSelectedLesson(key as string)}
                    >
                        <Label isRequired>Выбрать пару</Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {lessons.map((lesson) => (
                                    <ListBox.Item key={lesson.id} id={lesson.id}>
                                        {lesson.displayText}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </>
            ) :

            
             (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <DateField 
                            className="w-full"
                            value={customDate}
                            onChange={setCustomDate}
                            minValue={today(getLocalTimeZone())}
                        >
                            <Label>Выберите дату</Label>
                            <DateField.Group variant="secondary">
                                <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                            </DateField.Group>
                        </DateField>
                    </div>

                    <div className="flex flex-col gap-2">
                        <TimeField 
                            className="w-full"
                            value={customTime}
                            onChange={setCustomTime}
                            hourCycle={24}
                        >
                            <Label>Выберите время</Label>
                            <TimeField.Group variant="secondary">
                                <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
                            </TimeField.Group>
                        </TimeField>
                    </div>
                </div>
            )}

            <Button 
                className="mt-4" 
                size="lg" 
                isDisabled={
                    typeTask === "Расписание" 
                        ? !selectedLesson 
                        : !taskTitle.trim() || !customDate || !customTime
                }
                onPress={() => {
                    if (typeTask === "Расписание") {
                        const selectedLessonData = lessons.find(l => l.id === selectedLesson);
                        if (!selectedLessonData) return;
                        
                        store.addTask({
                            id: crypto.randomUUID(),
                            type: "Расписание",
                            subjectId: selectedSubjectId!,
                            deadline: selectedLessonData.dateISO,
                            lessons: selectedLessonData.lessonNumber,
                            description: taskDescription || undefined,
                            status: "active",
                            createdAt: new Date().toISOString(),
                        });
                    } else {
                        const deadline = getCombinedDeadline();
                        if (!deadline) return;
                        
                        store.addTask({
                            id: crypto.randomUUID(),
                            type: "Кастомная",
                            title: taskTitle,
                            description: taskDescription || undefined,
                            deadline: deadline,
                            status: "active",
                            createdAt: new Date().toISOString(),
                        });
                    }
                    
                    router.back();
                }}
            >
                Создать задачу
            </Button>
        </div>
    );
}