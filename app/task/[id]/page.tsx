"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, IconChevronLeft, Input, Label, ListBox, Select, TextArea, Spinner } from "@heroui/react";
import { useStore } from "@/hooks/useStore";
import { useEffect, useState, useTransition } from "react";
import { ScheduleRule, Task } from "@/types";
import { TrashBin } from "@gravity-ui/icons";

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

export default function EditTaskPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data, store } = useStore();

  // Состояния формы
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [customDate, setCustomDate] = useState<string>("");
  const [customTime, setCustomTime] = useState<string>("");

  // Состояния данных
  const [lessons, setLessons] = useState<GeneratedLesson[]>([]);
  const [isGeneratingLessons, setIsGeneratingLessons] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Для действий
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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
          const timeStr = LESSON_TIMES[lessonNumber];
          const [hours, minutes] = timeStr.split(':').map(Number);
          
          const lessonDate = new Date(date);
          lessonDate.setHours(hours, minutes, 0, 0);
          
          const year = lessonDate.getFullYear();
          const month = String(lessonDate.getMonth() + 1).padStart(2, '0');
          const day = String(lessonDate.getDate()).padStart(2, '0');
          const hour = String(lessonDate.getHours()).padStart(2, '0');
          const minute = String(lessonDate.getMinutes()).padStart(2, '0');
          const localDateTimeString = `${year}-${month}-${day}T${hour}:${minute}:00`;
          
          lessons.push({
            id: `${localDateTimeString}-${lessonNumber}`,
            date: lessonDate,
            lessonNumber: lessonNumber,
            startTime: timeStr,
            displayText: `${date.toLocaleDateString()} — ${lessonNumber} пара (${timeStr})`,
            dateISO: localDateTimeString,
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

  // Генерация пар для выбранной дисциплины
  useEffect(() => {
    if (!selectedSubjectId || !data) {
      setLessons([]);
      return;
    }

    setIsGeneratingLessons(true);

    const timerId = setTimeout(() => {
      const allLessons = generateLessonsForSubject(selectedSubjectId);
      const now = new Date();
      
      const occupiedLessonIds = new Set(
        data.tasks
          .filter((task): task is Extract<Task, { type: "Расписание" }> =>
            task.type === "Расписание" &&
            task.subjectId === selectedSubjectId &&
            task.status === "active" &&
            task.id !== id
          )
          .map((task) => `${task.deadline}-${task.lessons}`)
      );

      const filtered = allLessons.filter((lesson) => {
        if (occupiedLessonIds.has(lesson.id)) return false;
        const lessonDateTime = new Date(lesson.date);
        const [hours, minutes] = lesson.startTime.split(":").map(Number);
        lessonDateTime.setHours(hours, minutes, 0, 0);
        return lessonDateTime > now;
      });

      setLessons(filtered);
      setIsGeneratingLessons(false);
    }, 0);

    return () => clearTimeout(timerId);
  }, [selectedSubjectId, data, id]);

  // Загрузка задачи
  useEffect(() => {
    if (!data) return;

    const foundTask = data.tasks.find((t) => t.id === id);
    if (!foundTask) {
      router.back();
      return;
    }

    setTask(foundTask);
    setTaskDescription(foundTask.description || "");

    if (foundTask.type === "Расписание") {
      setSelectedSubjectId(foundTask.subjectId);
      setSelectedLesson(`${foundTask.deadline}-${foundTask.lessons}`);
    }

    if (foundTask.type === "Кастомная") {
      const [date, time] = foundTask.deadline.split("T");
      setTaskTitle(foundTask.title || "");
      setCustomDate(date);
      setCustomTime(time?.split(".")[0] || "");
    }

    setIsLoading(false);
  }, [data, id, router]);

  // Функция для получения комбинированной даты и времени
  const getCombinedDeadline = () => {
    if (!customDate || !customTime) return null;
    return `${customDate}T${customTime}`;
  };

  // Сохранение задачи
  const handleSave = () => {
    startTransition(() => {
      if (task?.type === "Расписание") {
        const lessonData = lessons.find(x => x.id === selectedLesson);
        if (!lessonData) return;

        store.updateTask({
          ...task,
          subjectId: selectedSubjectId!,
          deadline: lessonData.dateISO,
          lessons: lessonData.lessonNumber,
          description: taskDescription,
        });
      } else {
        const deadline = getCombinedDeadline();
        if (!deadline) return;

        store.updateTask({
          ...task!,
          title: taskTitle,
          description: taskDescription || undefined,
          deadline: deadline,
        });
      }

      router.back();
    });
  };

  // Удаление задачи
  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
      setIsDeleting(true);
      startTransition(() => {
        store.deleteTask(id || "");
        router.back();
      });
    }
  };

  // Выполнение задачи
  const handleComplete = () => {
    setIsCompleting(true);
    startTransition(() => {
      store.updateTask({
        ...task!,
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      router.back();
    });
  };

  // Проверка изменений
  const isScheduleChanged = task?.type === "Расписание" && (
    selectedSubjectId !== task.subjectId ||
    selectedLesson !== `${task.deadline}-${task.lessons}` ||
    taskDescription !== (task.description || "")
  );

  const isCustomChanged = task?.type === "Кастомная" && (
    taskTitle !== task.title ||
    taskDescription !== (task.description || "") ||
    customDate !== task.deadline.split("T")[0] ||
    customTime !== task.deadline.split("T")[1]?.split(".")[0]
  );

  const hasRequiredFields = task?.type === "Расписание"
    ? !!selectedLesson
    : !!taskTitle.trim() && !!customDate && !!customTime;

  const isDisabled = task?.type === "Расписание"
    ? (!selectedLesson || !isScheduleChanged)
    : (!hasRequiredFields || !isCustomChanged);

  // Загрузка данных
  if (isLoading || !task) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full pb-24">
        <Button variant="tertiary" className="fixed" onPress={() => router.back()}>
          <IconChevronLeft className="size-4" />
          Назад
        </Button>

        <h1 className="text-2xl font-medium text-center mt-12">Редактирование задачи</h1>

        {/* Название задачи (только для кастомных) */}
        {task.type === "Кастомная" && (
          <div className="flex flex-col gap-2">
            <Label isRequired>Название задачи</Label>
            <Input 
              variant="secondary"
              value={taskTitle} 
              placeholder="Название задачи"
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </div>
        )}

        {/* Описание задачи */}
        <div className="flex flex-col gap-2">
          <Label>Описание задачи</Label>
          <TextArea
            rows={6} 
            variant="secondary"
            disabled={data.subjects.length === 0 && task.type === "Расписание"} 
            placeholder={
              (data.subjects.length === 0 && task.type === "Расписание") 
                ? "Нет доступных дисциплин" 
                : "Введите описание вашей задачи"
            }
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>

        {/* Блок для задач по расписанию */}
        {task.type === "Расписание" ? (
          <>
            <Select
              isDisabled={data.subjects.length === 0} 
              className="w-full" 
              variant="secondary" 
              placeholder={
                data.subjects.length === 0 
                  ? "Нет доступных дисциплин" 
                  : "Выберите одну дисциплину"
              }
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
              isDisabled={!selectedSubjectId || isGeneratingLessons || lessons.length === 0}
              className="w-full"
              variant="secondary"
              placeholder={
                !selectedSubjectId
                  ? "Сначала выберите дисциплину"
                  : isGeneratingLessons
                  ? "Загрузка пар..."
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
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2 w-full">
              <Label isRequired>Дата дедлайна</Label>
              <Input 
                type="date"
                variant="secondary"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Label isRequired>Время дедлайна</Label>
              <Input 
                type="time"
                variant="secondary"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Кнопки сохранения и удаления */}
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="w-full"
            isDisabled={isDisabled || isPending}
            onPress={handleSave}
          >
            {({ isPending: isBtnPending }) => (
              <>
                {isPending && isBtnPending ? <Spinner color="current" size="sm" /> : null}
                Сохранить
              </>
            )}
          </Button>

          <Button 
            variant="danger-soft" 
            className="shrink-0" 
            isIconOnly 
            isDisabled={isDeleting}
            onPress={handleDelete}
          >
            {isDeleting && isPending ? <Spinner color="current" size="sm" /> : <TrashBin />}
          </Button>
        </div>
      </div>

      {/* Кнопка "Выполнить" */}
      <Button 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-3/4 bg-success shadow-success/65 shadow-2xl" 
        size="lg" 
        variant="primary"
        isDisabled={isCompleting}
        onPress={handleComplete}
      >
        {({ isPending: isBtnPending }) => (
          <>
            {isCompleting && isBtnPending ? <Spinner color="current" size="sm" /> : null}
            Выполнить
          </>
        )}
      </Button>
    </>
  );
}