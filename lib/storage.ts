"use client";

import { AppData, Subject, Task } from "@/types";

const STORAGE_KEY = "app_data_v1";

/**
 * Дефолтные данные
 */
const defaultData: AppData = {
  semester: {
    startDate: new Date().toISOString(),
    weeks: 16,
  },
  subjects: [],
  tasks: [],
  version: 1,
};

/**
 * Получить данные
 */
export function getAppData(): AppData {
  if (typeof window === "undefined") return defaultData;

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return defaultData;

  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return defaultData;
  }
}

/**
 * Сохранить данные
 */
export function saveAppData(data: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Универсальный updater
 */
export function updateAppData(
  updater: (data: AppData) => AppData
): AppData {
  const data = getAppData();
  const updated = updater(data);
  saveAppData(updated);
  return updated;
}

//
// ================= SUBJECTS =================
//

export function getSubjects(): Subject[] {
  return getAppData().subjects;
}

export function addSubject(subject: Subject) {
  return updateAppData((data) => ({
    ...data,
    subjects: [...data.subjects, subject],
  }));
}

export function updateSubject(updatedSubject: Subject) {
  return updateAppData((data) => ({
    ...data,
    subjects: data.subjects.map((s) =>
      s.id === updatedSubject.id ? updatedSubject : s
    ),
  }));
}

export function deleteSubject(id: string) {
  return updateAppData((data) => ({
    ...data,
    subjects: data.subjects.filter((s) => s.id !== id),
  }));
}

//
// ================= TASKS =================
//

export function getTasks(): Task[] {
  return getAppData().tasks;
}

export function addTask(task: Task) {
  return updateAppData((data) => ({
    ...data,
    tasks: [...data.tasks, task],
  }));
}

export function updateTask(updatedTask: Task) {
  return updateAppData((data) => ({
    ...data,
    tasks: data.tasks.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    ),
  }));
}

export function deleteTask(id: string) {
  return updateAppData((data) => ({
    ...data,
    tasks: data.tasks.filter((t) => t.id !== id),
  }));
}

export function completeTask(id: string) {
  return updateAppData((data) => ({
    ...data,
    tasks: data.tasks.map((t) =>
      t.id === id ? { ...t, status: "completed" } : t
    ),
  }));
}

//
// ================= FILTERS / HELPERS =================
//

export function getTasksSorted(): Task[] {
  return [...getTasks()].sort(
    (a, b) =>
      new Date(a.deadline).getTime() -
      new Date(b.deadline).getTime()
  );
}

export function getTodayTasks(): Task[] {
  const now = new Date();

  return getTasksSorted().filter((task) => {
    const d = new Date(task.deadline);

    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
}

export function isOverdue(task: Task): boolean {
  return (
    task.status !== "completed" &&
    new Date(task.deadline) < new Date()
  );
}

export function getOverdueTasks(): Task[] {
  return getTasks().filter(isOverdue);
}