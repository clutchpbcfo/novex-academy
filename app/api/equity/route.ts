import { NextRequest, NextResponse } from 'next/server';

function generateEquityPoints(n: number): number[] {
  const pts: number[] = [10000];
  for (let i = 1; i < n; i++) {
    const prev = pts[i - 1];
    const delta = (Math.random() - 0.38) * 300;
    pts.push(Math.max(8000, prev + delta));
  }
  return pts;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') ?? '30D';
  const n = range === '7D' ? 7 : range === '90D' ? 90 : 30;

  const points = generateEquityPoints(n);
  const first = points[0];
  const last = points[points.length - 1];
  const total = last - first;
  const pct = ((last - first) / first) * 100;

  return NextResponse.json({ points, total: Math.round(total), pct: Math.round(pct * 10) / 10 });
}
