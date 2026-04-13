import { MODULES } from '@/lib/data/modules';

// Lesson key format: "${moduleId}-${lessonIdx}"
export const lessonKey = (moduleId: number, lessonIdx: number) => `${moduleId}-${lessonIdx}`;

/** True if a specific lesson is marked complete. */
export function isLessonComplete(
  completed: Set<string>,
  moduleId: number,
  lessonIdx: number,
): boolean {
  return completed.has(lessonKey(moduleId, lessonIdx));
}

/** True if every lesson in the module is complete. */
export function isModuleComplete(
  completed: Set<string>,
  moduleId: number,
  totalLessons: number,
): boolean {
  for (let i = 0; i < totalLessons; i++) {
    if (!completed.has(lessonKey(moduleId, i))) return false;
  }
  return true;
}

/**
 * Module unlock rules:
 * - Module 1 is always unlocked.
 * - Module N (N > 1) requires ALL lessons in Module N-1 complete.
 * - Module 5 (exam) additionally requires Modules 1-4 complete — this falls
 *   out naturally from the sequential chain.
 */
export function isModuleUnlocked(completed: Set<string>, moduleId: number): boolean {
  if (moduleId <= 1) return true;
  const prev = MODULES.find((m) => m.id === moduleId - 1);
  if (!prev) return false;
  return isModuleComplete(completed, prev.id, prev.items.length);
}

/**
 * Lesson unlock rules (within an already-unlocked module):
 * - Lesson 0 is always available once the module is unlocked.
 * - Lesson N requires Lesson N-1 complete.
 * Returns false if the module itself is locked.
 */
export function isLessonUnlocked(
  completed: Set<string>,
  moduleId: number,
  lessonIdx: number,
): boolean {
  if (!isModuleUnlocked(completed, moduleId)) return false;
  if (lessonIdx === 0) return true;
  return completed.has(lessonKey(moduleId, lessonIdx - 1));
}

/**
 * Returns the URL for the next lesson the user should work on:
 * the first lesson that is unlocked but not yet complete.
 * Falls back to /academy if nothing is actionable.
 */
export function nextUnlockedLesson(completed: Set<string>): string {
  for (const mod of MODULES) {
    if (!isModuleUnlocked(completed, mod.id)) break; // sequential — no point looking further
    for (let i = 0; i < mod.items.length; i++) {
      if (!completed.has(lessonKey(mod.id, i))) {
        return `/academy/${mod.id}/${i}`;
      }
    }
    // All lessons in this module done — continue to next module
  }
  return '/academy';
}

/**
 * Normalize a completed set so it contains no gaps.
 * A "gap" is a completed lesson whose predecessor is not complete.
 * We keep only the contiguous prefix of each module.
 */
export function normalizeCompleted(completed: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const mod of MODULES) {
    for (let i = 0; i < mod.items.length; i++) {
      if (!completed.has(lessonKey(mod.id, i))) break; // stop at first gap
      out.add(lessonKey(mod.id, i));
    }
  }
  return out;
}
