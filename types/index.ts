// /types/index.ts
export type Semester = {
  startDate: string;
  weeks: number;
};

export type Subject = {
  id: string;
  name: string;
  rules: ScheduleRule[];
};

export type ScheduleRule =
  | {
      id: string;
      type: "Еженедельно";
      dayOfWeek: number;
      lesson: number;
    }
  | {
      id: string;
      type: "Нечёт" | "Чёт";
      dayOfWeek: number;
      lesson: number;
    }
  | {
      id: string;
      type: "Кастом";
      date: string;
      lesson: number;
    };

export type Task =
  | {
      id: string;
      type: "schedule";

      subjectId: string;

      deadline: string; // 🔥 ключевое поле

      lessons: number; // можно оставить для UI
      description?: string;

      status: "active" | "completed";
      createdAt: string; // ISO
    }
  | {
      id: string;
      type: "custom";

      title: string;
      description?: string;

      deadline: string; // 🔥 вместо date + time

      status: "active" | "completed";
      createdAt: string; // ISO
    };

export type AppData = {
  semester: Semester;
  subjects: Subject[];
  tasks: Task[];
  version: number;
};