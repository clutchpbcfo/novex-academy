import { NextRequest, NextResponse } from 'next/server';
import type { BlobTrader } from '@/types';

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_BASE ??
  'https://gbifpfm0chnluoyc.public.blob.vercel-storage.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'wallet param required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BLOB_BASE}/traders.json`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);

    const traders: BlobTrader[] = await res.json();

    const trader = traders.find(
      (t) => t.wallet.toLowerCase() === wallet.toLowerCase(),
    );

    return NextResponse.json(trader ?? null);
  } catch (err) {
    console.error('[trader] fetch error:', err);
    return NextResponse.json(
      { error: 'Unable to fetch trader data' },
      { status: 503 },
    );
  }
}
