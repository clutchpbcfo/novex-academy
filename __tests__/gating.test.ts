import { describe, it, expect } from 'vitest';
import { MODULES } from '@/lib/data/modules';
import {
  isModuleUnlocked,
  isLessonUnlocked,
  nextUnlockedLesson,
  normalizeCompleted,
  lessonKey,
} from '@/lib/progress/selectors';

// Helper: build a Set from an array of "moduleId-lessonIdx" strings
const keys = (...args: string[]) => new Set(args);

// Module lesson counts for convenience
const m1len = MODULES.find((m) => m.id === 1)!.items.length; // 4
const m2len = MODULES.find((m) => m.id === 2)!.items.length; // 5
const m3len = MODULES.find((m) => m.id === 3)!.items.length; // 4
const m4len = MODULES.find((m) => m.id === 4)!.items.length; // 4

/** All keys for a module */
const allOf = (moduleId: number, len: number) =>
  Array.from({ length: len }, (_, i) => lessonKey(moduleId, i));

// ─── Case 1: Fresh user can only access M1 L1 ────────────────────────────────
describe('fresh user (no completions)', () => {
  const completed = new Set<string>();

  it('Module 1 is unlocked', () => {
    expect(isModuleUnlocked(completed, 1)).toBe(true);
  });

  it('Module 2 is locked', () => {
    expect(isModuleUnlocked(completed, 2)).toBe(false);
  });

  it('Module 1 Lesson 0 is unlocked', () => {
    expect(isLessonUnlocked(completed, 1, 0)).toBe(true);
  });

  it('Module 1 Lesson 1 is locked (Lesson 0 not done)', () => {
    expect(isLessonUnlocked(completed, 1, 1)).toBe(false);
  });

  it('nextUnlockedLesson points to M1 L0', () => {
    expect(nextUnlockedLesson(completed)).toBe('/academy/1/0');
  });
});

// ─── Case 2: Completing M1L1 unlocks M1L2 ────────────────────────────────────
describe('after completing M1 L0', () => {
  const completed = keys('1-0');

  it('M1 L1 is now unlocked', () => {
    expect(isLessonUnlocked(completed, 1, 1)).toBe(true);
  });

  it('M1 L2 is still locked', () => {
    expect(isLessonUnlocked(completed, 1, 2)).toBe(false);
  });

  it('nextUnlockedLesson points to M1 L1', () => {
    expect(nextUnlockedLesson(completed)).toBe('/academy/1/1');
  });
});

// ─── Case 3: Completing all M1 unlocks M2 L1 ─────────────────────────────────
describe('after completing all of Module 1', () => {
  const completed = new Set(allOf(1, m1len));

  it('Module 2 is now unlocked', () => {
    expect(isModuleUnlocked(completed, 2)).toBe(true);
  });

  it('Module 2 Lesson 0 is available', () => {
    expect(isLessonUnlocked(completed, 2, 0)).toBe(true);
  });

  it('Module 3 is still locked', () => {
    expect(isModuleUnlocked(completed, 3)).toBe(false);
  });

  it('nextUnlockedLesson points to M2 L0', () => {
    expect(nextUnlockedLesson(completed)).toBe('/academy/2/0');
  });
});

// ─── Case 4: Direct nav to M3L1 with only M1 done → selector returns false ───
describe('direct nav to M3 with only M1 done', () => {
  const completed = new Set(allOf(1, m1len));

  it('Module 3 is locked', () => {
    expect(isModuleUnlocked(completed, 3)).toBe(false);
  });

  it('M3 L0 is not accessible', () => {
    expect(isLessonUnlocked(completed, 3, 0)).toBe(false);
  });

  it('redirect target is M2 L0 (highest unlocked lesson)', () => {
    expect(nextUnlockedLesson(completed)).toBe('/academy/2/0');
  });
});

// ─── Case 5: M5 locked until M4 fully done ───────────────────────────────────
describe('Module 5 (exam) gating', () => {
  const m1All = allOf(1, m1len);
  const m2All = allOf(2, m2len);
  const m3All = allOf(3, m3len);
  const m4Partial = allOf(4, m4len - 1); // M4 missing last lesson

  const almostDone = new Set([...m1All, ...m2All, ...m3All, ...m4Partial]);
  const fullyDone = new Set([...m1All, ...m2All, ...m3All, ...allOf(4, m4len)]);

  it('M5 locked when M4 is not fully complete', () => {
    expect(isModuleUnlocked(almostDone, 5)).toBe(false);
  });

  it('M5 unlocked only after all M4 lessons are done', () => {
    expect(isModuleUnlocked(fullyDone, 5)).toBe(true);
  });

  it('M5 L0 accessible once unlocked', () => {
    expect(isLessonUnlocked(fullyDone, 5, 0)).toBe(true);
  });
});

// ─── Case 6: Gap-state seed is normalized ────────────────────────────────────
describe('gap-state normalization', () => {
  // Lesson 4 of M3 done, Lessons 1-3 not done — impossible gap
  const gapped = keys('1-0', '1-1', '1-2', '1-3', '2-0', '3-3');

  it('normalizeCompleted strips the orphaned M3-3 entry', () => {
    const clean = normalizeCompleted(gapped);
    expect(clean.has('3-3')).toBe(false);
  });

  it('keeps contiguous prefix of M1', () => {
    const clean = normalizeCompleted(gapped);
    expect(clean.has('1-0')).toBe(true);
    expect(clean.has('1-3')).toBe(true);
  });

  it('keeps contiguous M2 prefix (only 2-0 present)', () => {
    const clean = normalizeCompleted(gapped);
    expect(clean.has('2-0')).toBe(true);
    expect(clean.has('2-1')).toBe(false); // was not in gapped
  });

  it('normalized state has no entries for M3 (only 3-3 was present, no 3-0)', () => {
    const clean = normalizeCompleted(gapped);
    expect(clean.has('3-0')).toBe(false);
    expect(clean.has('3-3')).toBe(false);
  });
});
