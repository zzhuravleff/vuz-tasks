// /types/index.ts
export enum DayOfWeek {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

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
      id: string; // 🔥 обязательно
      type: "weekly";
      days: {
        dayOfWeek: DayOfWeek;
        lessons: number;
      }[];
    }
  | {
      id: string;
      type: "odd" | "even";
      days: {
        dayOfWeek: DayOfWeek;
        lessons: number;
      }[];
    }
  | {
      id: string;
      type: "custom";
      date: string;
      lessons: number;
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