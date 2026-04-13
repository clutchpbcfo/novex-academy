import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LeaderboardRow } from '@/components/academy/leaderboard-row';
import type { LeaderboardEntry } from '@/types';

const MOCK_ENTRY: LeaderboardEntry = {
  rank: 6,
  name: 'Clutch',
  handle: 'clutch.novex',
  avatarBg: 'linear-gradient(135deg,#00e5ff,#a855f7)',
  avatarInitials: 'CL',
  pnl: 24750,
  nxp: 11340,
  wr: 59,
  trend: '+14%',
  isYou: true,
};

describe('LeaderboardRow', () => {
  it('renders rank', () => {
    render(<LeaderboardRow entry={MOCK_ENTRY} metric="pnl" />);
    expect(screen.getByText('#6')).toBeInTheDocument();
  });

  it('renders name and handle', () => {
    render(<LeaderboardRow entry={MOCK_ENTRY} metric="pnl" />);
    expect(screen.getByText('Clutch')).toBeInTheDocument();
    expect(screen.getByText('@clutch.novex')).toBeInTheDocument();
  });

  it('shows YOU badge for isYou entry', () => {
    render(<LeaderboardRow entry={MOCK_ENTRY} metric="pnl" />);
    expect(screen.getByText('YOU')).toBeInTheDocument();
  });

  it('shows trend', () => {
    render(<LeaderboardRow entry={MOCK_ENTRY} metric="pnl" />);
    expect(screen.getByText('+14%')).toBeInTheDocument();
  });

  it('renders nxp metric correctly when metric is nxp', () => {
    render(<LeaderboardRow entry={MOCK_ENTRY} metric="nxp" />);
    expect(screen.getByText('11,340')).toBeInTheDocument();
  });
});
