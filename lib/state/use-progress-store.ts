import { create } from 'zustand';
import {
  isModuleUnlocked,
  isLessonUnlocked,
  lessonKey,
  normalizeCompleted,
} from '@/lib/progress/selectors';

// ─── Seed data ────────────────────────────────────────────────────────────────
// Realistic mid-flight state: Module 1 fully done, Module 2 lessons 0-2 done.
// No gaps — each completed lesson has all predecessors also complete.
const SEED_COMPLETED: string[] = [
  // Module 1 — Perp Fundamentals (4 lessons, all done)
  '1-0', '1-1', '1-2', '1-3',
  // Module 2 — SENSEI Signal Mastery (5 lessons, first 3 done)
  '2-0', '2-1', '2-2',
  // Module 3-5: untouched — locked until M2 is fully complete
];

interface ProgressStore {
  completed: Set<string>;
  markComplete: (lessonKey: string) => void;
  isComplete: (lessonKey: string) => boolean;
  getModuleProgress: (moduleId: number, totalLessons: number) => number;
  isModuleUnlocked: (moduleId: number) => boolean;
  isLessonUnlocked: (moduleId: number, lessonIdx: number) => boolean;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  // Initialize with normalized seed (guarantees no gaps at startup)
  completed: normalizeCompleted(new Set(SEED_COMPLETED)),

  markComplete: (key: string) =>
    set((s) => ({
      completed: new Set(Array.from(s.completed).concat(key)),
    })),

  isComplete: (key: string) => get().completed.has(key),

  getModuleProgress: (moduleId, totalLessons) => {
    const { completed } = get();
    let count = 0;
    for (let i = 0; i < totalLessons; i++) {
      if (completed.has(lessonKey(moduleId, i))) count++;
    }
    return totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;
  },

  isModuleUnlocked: (moduleId) => isModuleUnlocked(get().completed, moduleId),
  isLessonUnlocked: (moduleId, lessonIdx) => isLessonUnlocked(get().completed, moduleId, lessonIdx),
}));
