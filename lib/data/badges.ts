export interface Badge {
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

export const BADGES: Badge[] = [
  { icon: '🎓', name: 'Initiate', desc: 'Completed Perp Fundamentals', earned: true },
  { icon: '🧠', name: 'Signal Savant', desc: 'SENSEI module cleared', earned: true },
  { icon: '⚔️', name: 'Fleet Commander', desc: 'Fleet module cleared', earned: true },
  { icon: '🛡️', name: 'Risk Custodian', desc: 'Risk module cleared', earned: true },
  { icon: '👑', name: 'Operator', desc: 'Passed graduation exam', earned: false },
  { icon: '🔥', name: 'Hot Streak', desc: '5 wins in a row', earned: true },
  { icon: '💎', name: 'Diamond Hands', desc: 'Held a trade 24h+', earned: false },
  { icon: '🎯', name: 'Sniper', desc: '10 LEGENDARY trades', earned: false },
];
