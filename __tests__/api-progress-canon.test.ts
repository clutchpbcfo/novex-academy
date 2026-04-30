/**
 * Tests for the canon-aware /api/progress route.
 *
 * The pre-existing implementation hardcoded TOTAL_LESSONS = 19 which
 * conflicted with Canon v2 (18). This test pins the new behavior so
 * any future drift fails the build.
 */

import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from '@/app/api/progress/route';
import {
  ACADEMY_TOTAL_LESSONS,
  ACADEMY_TOTAL_NXP_CAP,
  MODULE_LESSONS,
} from '@/lib/academy/canon';

describe('/api/progress', () => {
  it('GET returns canonical totals (not the legacy 19)', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.total).toBe(ACADEMY_TOTAL_LESSONS);
    expect(body.total).toBe(18);
    expect(body.nxpCap).toBe(ACADEMY_TOTAL_NXP_CAP);
    expect(body.modules).toEqual({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 });
  });

  it('canon module lessons sum equals total', () => {
    const sum = Object.values(MODULE_LESSONS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(ACADEMY_TOTAL_LESSONS);
  });

  it('POST 400s on missing fields', async () => {
    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(400);
  });

  it('POST acknowledges valid lesson completion', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      body: JSON.stringify({ moduleId: 1, lessonIndex: 0 }),
    });
    const res = await POST(req as unknown as import('next/server').NextRequest);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
