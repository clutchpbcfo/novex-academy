'use client';

import { useMemo } from 'react';

interface PnlChartProps {
  points: number[];
  width?: number;
  height?: number;
}

export function PnlChart({ points, width = 600, height = 180 }: PnlChartProps) {
  const path = useMemo(() => {
    if (points.length < 2) return '';
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const xStep = width / (points.length - 1);

    return points
      .map((p, i) => {
        const x = i * xStep;
        const y = height - ((p - min) / range) * (height - 16) - 8;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points, width, height]);

  const fillPath = path ? `${path} L ${width} ${height} L 0 ${height} Z` : '';
  const isUp = points.length > 1 && points[points.length - 1] >= points[0];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isUp ? 'var(--green)' : 'var(--red)'} stopOpacity="0.18" />
          <stop offset="100%" stopColor={isUp ? 'var(--green)' : 'var(--red)'} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fillPath && (
        <path d={fillPath} fill="url(#chartFill)" />
      )}
      {path && (
        <path
          d={path}
          fill="none"
          stroke={isUp ? 'var(--green)' : 'var(--red)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
