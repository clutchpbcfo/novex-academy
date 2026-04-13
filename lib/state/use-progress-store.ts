import { create } from 'zustand';

interface ProgressStore {
  completed: Set<string>;
  markComplete: (lessonKey: string) => void;
  isComplete: (lessonKey: string) => boolean;
  getModuleProgress: (moduleId: number, totalLessons: number) => number;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  completed: new Set(),
  markComplete: (lessonKey) =>
    set((s) => ({ completed: new Set(Array.from(s.completed).concat(lessonKey)) })),
  isComplete: (lessonKey) => get().completed.has(lessonKey),
  getModuleProgress: (moduleId, totalLessons) => {
    const { completed } = get();
    let count = 0;
    for (let i = 0; i < totalLessons; i++) {
      if (completed.has(`${moduleId}-${i}`)) count++;
    }
    return totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;
  },
}));
