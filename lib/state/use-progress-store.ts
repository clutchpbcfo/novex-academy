import { create } from 'zustand';
import {
    isModuleUnlocked,
    isLessonUnlocked,
    lessonKey,
    normalizeCompleted,
} from '@/lib/progress/selectors';

// ─── No seed data — real users start fresh ──────────────────────────────────
// Module 1 is always unlocked via selectors.ts logic.
// Each subsequent module unlocks only after completing the previous module's quiz.
const SEED_COMPLETED: string[] = [];

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

    isLessonUnlocked: (moduleId, lessonIdx) =>
          isLessonUnlocked(get().completed, moduleId, lessonIdx),
}));
