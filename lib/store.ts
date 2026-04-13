"use client";

import { AppData, Subject, Task, ScheduleRule } from "@/types";

const STORAGE_KEY = "app_data_vuz_tasks_v1";

/* =========================================================
   🧱 DEFAULT DATA
========================================================= */

const defaultData: AppData = {
  semester: {
    startDate: new Date().toISOString(),
    weeks: 16,
  },
  subjects: [],
  tasks: [],
  version: 1,
};

/* =========================================================
   💾 LOCAL STORAGE
========================================================= */

function load(): AppData {
  if (typeof window === "undefined") return defaultData;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData;

  try {
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function save(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* =========================================================
   🧠 STATE CORE
========================================================= */

let state: AppData = load();
let listeners: ((data: AppData) => void)[] = [];

/* =========================================================
   🔔 CORE ENGINE
========================================================= */

function emit() {
  save(state);
  listeners.forEach((l) => l(state));
}

function subscribe(fn: (data: AppData) => void) {
  listeners.push(fn);
  fn(state);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function get() {
  return state;
}

function set(updater: (prev: AppData) => AppData) {
  state = updater(state);
  emit();
}

/* =========================================================
   📅 SEMESTER
========================================================= */

function updateSemester(semester: AppData["semester"]) {
  set((d) => ({
    ...d,
    semester,
  }));
}

/* =========================================================
   📚 SUBJECTS (ADD / UPDATE / DELETE)
========================================================= */

function addSubject(name: string) {
  set((d) => ({
    ...d,
    subjects: [
      ...d.subjects,
      {
        id: crypto.randomUUID(),
        name,
        rules: [],
      },
    ],
  }));
}

function updateSubject(updated: Subject) {
  set((d) => ({
    ...d,
    subjects: d.subjects.map((s) =>
      s.id === updated.id ? updated : s
    ),
  }));
}

function deleteSubject(id: string) {
  set((d) => ({
    ...d,
    subjects: d.subjects.filter((s) => s.id !== id),
  }));
}

/* =========================================================
   📌 RULES (ADD / UPDATE / DELETE)
========================================================= */

function addRule(subjectId: string, rule: ScheduleRule) {
  set((d) => ({
    ...d,
    subjects: d.subjects.map((s) =>
      s.id === subjectId
        ? { ...s, rules: [...s.rules, rule] }
        : s
    ),
  }));
}

function updateRule(subjectId: string, updatedRule: ScheduleRule) {
  set((d) => ({
    ...d,
    subjects: d.subjects.map((s) =>
      s.id === subjectId
        ? {
            ...s,
            rules: s.rules.map((r) =>
              r.id === updatedRule.id ? updatedRule : r
            ),
          }
        : s
    ),
  }));
}

function deleteRule(subjectId: string, ruleId: string) {
  set((d) => ({
    ...d,
    subjects: d.subjects.map((s) =>
      s.id === subjectId
        ? {
            ...s,
            rules: s.rules.filter((r) => r.id !== ruleId),
          }
        : s
    ),
  }));
}

/* =========================================================
   📝 TASKS (ADD / UPDATE / DELETE)
========================================================= */

function addTask(task: Task) {
  set((d) => ({
    ...d,
    tasks: [...d.tasks, task],
  }));
}

function updateTask(updated: Task) {
  set((d) => ({
    ...d,
    tasks: d.tasks.map((t) =>
      t.id === updated.id ? updated : t
    ),
  }));
}

function deleteTask(id: string) {
  set((d) => ({
    ...d,
    tasks: d.tasks.filter((t) => t.id !== id),
  }));
}

function completeTask(id: string) {
  set((d) => ({
    ...d,
    tasks: d.tasks.map((t) =>
      t.id === id ? { ...t, status: "completed" } : t
    ),
  }));
}


function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  state = defaultData;
  emit();
}

/* =========================================================
   📦 EXPORT
========================================================= */

export const store = {
  get,
  set,
  subscribe,

  updateSemester,

  addSubject,
  updateSubject,
  deleteSubject,

  addRule,
  updateRule,
  deleteRule,

  addTask,
  updateTask,
  deleteTask,
  completeTask,
  
  clearAllData,
};