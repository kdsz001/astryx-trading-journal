export type Side = '买' | '卖';
export type Mood = '冷静' | '兴奋' | '焦虑';
export type NavKey = 'overview' | 'trades' | 'rules' | 'review';

export interface Trade extends Record<string, unknown> {
  id: string;
  date: string;
  symbol: string;
  side: Side;
  price: number;
  qty: number;
  reason: string;
  mood: Mood;
  followsRules: boolean;
  pnl: number;
  cooled24h: boolean;
  askedAi: boolean;
  offenseOk: boolean;
}

export interface ExitRule {
  symbol: string;
  rule: string;
}

export const EXAMPLE_TRADES: Trade[] = [
  {
    id: 'ex-1',
    date: '2026-11-03',
    symbol: 'BTC',
    side: '买',
    price: 68420,
    qty: 0.05,
    reason: '【示例】突破盘整后回踩支撑，仓位很小试错',
    mood: '冷静',
    followsRules: true,
    pnl: 0,
    cooled24h: true,
    askedAi: true,
    offenseOk: true,
  },
  {
    id: 'ex-2',
    date: '2026-11-04',
    symbol: 'CRCL',
    side: '买',
    price: 112.4,
    qty: 20,
    reason: '【示例】稳定币叙事，Q3 数据好看，只开观察仓',
    mood: '冷静',
    followsRules: true,
    pnl: 0,
    cooled24h: true,
    askedAi: true,
    offenseOk: true,
  },
  {
    id: 'ex-3',
    date: '2026-11-05',
    symbol: 'DRAM-示例股',
    side: '买',
    price: 48.2,
    qty: 50,
    reason: '【示例】内存周期预期升温，占位标的非真实持仓',
    mood: '兴奋',
    followsRules: false,
    pnl: 0,
    cooled24h: false,
    askedAi: false,
    offenseOk: false,
  },
  {
    id: 'ex-4',
    date: '2026-11-06',
    symbol: 'BTC',
    side: '卖',
    price: 70110,
    qty: 0.02,
    reason: '【示例】部分止盈，兑现小利润，剩余继续拿',
    mood: '冷静',
    followsRules: true,
    pnl: 338,
    cooled24h: true,
    askedAi: true,
    offenseOk: true,
  },
  {
    id: 'ex-5',
    date: '2026-11-07',
    symbol: 'CRCL',
    side: '卖',
    price: 108.1,
    qty: 10,
    reason: '【示例】情绪上来想加仓，强制卖一半降温',
    mood: '焦虑',
    followsRules: true,
    pnl: -43,
    cooled24h: true,
    askedAi: true,
    offenseOk: true,
  },
  {
    id: 'ex-6',
    date: '2026-11-08',
    symbol: 'DRAM-示例股',
    side: '卖',
    price: 51.6,
    qty: 25,
    reason: '【示例】涨太快，按退出规则砍半仓',
    mood: '兴奋',
    followsRules: true,
    pnl: 85,
    cooled24h: false,
    askedAi: true,
    offenseOk: true,
  },
];

export const DEFAULT_RULES: ExitRule[] = [
  {
    symbol: 'BTC',
    rule: '【示例】跌破近 20 日低点或单日亏损超 3% 先砍一半；加仓前冷静 24 小时。',
  },
  {
    symbol: 'CRCL',
    rule: '【示例】基本面无重大变化则拿住；股价单日波动超 8% 只调仓不追涨。',
  },
  {
    symbol: 'DRAM-示例股',
    rule: '【示例】占位标的。涨幅超 15% 或情绪变「兴奋」时减半；非真实持仓。',
  },
];

/** Cumulative realized P&L series for the area chart (example only). */
export const PNL_SERIES = [
  {date: '11/01', value: 0},
  {date: '11/02', value: 40},
  {date: '11/03', value: 55},
  {date: '11/04', value: 120},
  {date: '11/05', value: 95},
  {date: '11/06', value: 433},
  {date: '11/07', value: 390},
  {date: '11/08', value: 475},
  {date: '11/09', value: 380},
];

export const ALLOCATION = [
  {symbol: 'BTC', weight: 42, color: '#2DD4BF'},
  {symbol: 'CRCL', weight: 28, color: '#60A5FA'},
  {symbol: 'DRAM-示例股', weight: 18, color: '#F59E0B'},
  {symbol: '现金', weight: 12, color: '#94A3B8'},
];

export const TICKER_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  CRCL: '#3B82F6',
  'DRAM-示例股': '#8B5CF6',
};
