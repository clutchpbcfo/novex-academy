import { NextRequest, NextResponse } from 'next/server';

const TOTAL_LESSONS = 19;

const mockProgress = {
  completed: 14,
  total: TOTAL_LESSONS,
  modules: { '1': 100, '2': 100, '3': 100, '4': 100, '5': 0 },
};

export async function GET() {
  return NextResponse.json(mockProgress);
}

export async function POST(req: NextRequest) {
  const { moduleId, lessonIndex } = await req.json() as { moduleId: number; lessonIndex: number };
  // In real implementation: persist to DB
  console.log(`Lesson complete: module=${moduleId} lesson=${lessonIndex}`);
  return NextResponse.json({ ok: true });
}
