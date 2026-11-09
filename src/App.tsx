import {useEffect, useMemo, useState} from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  ShieldCheck,
  NotebookPen,
  Plus,
} from 'lucide-react';
import {Theme} from '@astryxdesign/core/theme';
import {AppShell} from '@astryxdesign/core/AppShell';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Selector} from '@astryxdesign/core/Selector';
import {StackItem} from '@astryxdesign/core/Stack';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, pixel} from '@astryxdesign/core/Table';
import {Text} from '@astryxdesign/core/Text';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';
import {fintechTheme} from './theme';
import {
  ALLOCATION,
  DEFAULT_RULES,
  EXAMPLE_TRADES,
  PNL_SERIES,
  TICKER_COLORS,
  type ExitRule,
  type Mood,
  type NavKey,
  type Side,
  type Trade,
} from './data';
import {AreaChart, DonutChart, ProgressRing, Sparkline} from './charts';

const STORAGE_KEY = 'astryx-demo-trades-v2';
const RULES_KEY = 'astryx-demo-exit-rules-v2';
const MODE_KEY = 'astryx-demo-mode-v2';

const CHECK_OPTIONS = [
  {value: 'cool24', label: '是否冷静 24 小时'},
  {value: 'asked', label: '是否问过黎明或 AI'},
  {value: 'offense', label: '是否超过 2 个进攻仓位'},
] as const;

function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EXAMPLE_TRADES;
    const parsed = JSON.parse(raw) as Trade[];
    return Array.isArray(parsed) && parsed.length ? parsed : EXAMPLE_TRADES;
  } catch {
    return EXAMPLE_TRADES;
  }
}

function loadRules(): ExitRule[] {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return DEFAULT_RULES;
    const parsed = JSON.parse(raw) as ExitRule[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
}

function loadMode(): 'light' | 'dark' {
  try {
    return localStorage.getItem(MODE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function formatMoney(n: number) {
  const sign = n > 0 ? '+' : '';
  return `${sign}$${n.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
}

function tickerInitials(symbol: string) {
  if (symbol === 'DRAM-示例股') return 'DR';
  return symbol.slice(0, 2).toUpperCase();
}

function TickerChip({symbol}: {symbol: string}) {
  const bg = TICKER_COLORS[symbol] || '#64748b';
  return (
    <span className="ticker-chip">
      <span className="ticker-avatar" style={{background: bg}}>
        {tickerInitials(symbol)}
      </span>
      <span className="ticker-name">{symbol}</span>
    </span>
  );
}

type FormState = {
  date: string;
  symbol: string;
  side: Side;
  price: number | null;
  qty: number | null;
  reason: string;
  mood: Mood;
  checks: string[];
  followsRules: boolean;
};

const emptyForm = (): FormState => ({
  date: new Date().toISOString().slice(0, 10),
  symbol: '',
  side: '买',
  price: null,
  qty: null,
  reason: '',
  mood: '冷静',
  checks: [],
  followsRules: true,
});

const NAV: {key: NavKey; label: string; icon: typeof LayoutDashboard}[] = [
  {key: 'overview', label: '总览', icon: LayoutDashboard},
  {key: 'trades', label: '交易明细', icon: ListOrdered},
  {key: 'rules', label: '退出规则', icon: ShieldCheck},
  {key: 'review', label: '复盘', icon: NotebookPen},
];

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(loadMode);
  const [nav, setNav] = useState<NavKey>('overview');
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [rules, setRules] = useState<ExitRule[]>(loadRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [review, setReview] = useState(
    '【示例复盘】本周胜率尚可，但 DRAM 那笔是在「兴奋」情绪下开的仓，冷静 24 小时没做到。下周进攻仓位上限继续压在 2 个。',
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);
  useEffect(() => {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  }, [rules]);
  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  const summary = useMemo(() => {
    const monthTrades = trades.filter((t) => t.date.startsWith('2026-11'));
    const closed = monthTrades.filter((t) => t.side === '卖');
    const wins = closed.filter((t) => t.pnl > 0).length;
    const winRate =
      closed.length === 0 ? 0 : Math.round((wins / closed.length) * 100);
    const realized = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const followed = monthTrades.filter((t) => t.followsRules).length;
    const ruleRate =
      monthTrades.length === 0
        ? 0
        : Math.round((followed / monthTrades.length) * 100);
    const cooled =
      monthTrades.length === 0
        ? 0
        : Math.round(
            (monthTrades.filter((t) => t.cooled24h).length /
              monthTrades.length) *
              100,
          );
    const asked =
      monthTrades.length === 0
        ? 0
        : Math.round(
            (monthTrades.filter((t) => t.askedAi).length / monthTrades.length) *
              100,
          );
    const offense =
      monthTrades.length === 0
        ? 0
        : Math.round(
            (monthTrades.filter((t) => t.offenseOk).length /
              monthTrades.length) *
              100,
          );
    return {
      count: monthTrades.length,
      winRate,
      realized,
      ruleRate,
      cooled,
      asked,
      offense,
      sparkPnl: PNL_SERIES.map((p) => p.value),
      sparkWin: [40, 45, 50, 55, 60, 58, 62, 65, 67],
      sparkCount: [1, 2, 3, 4, 5, 5, 6, 6, 6],
      sparkRule: [100, 100, 100, 75, 80, 83, 86, 83, ruleRate],
    };
  }, [trades]);

  function openDialog() {
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function addTrade() {
    if (!form.symbol.trim() || form.price == null || form.qty == null) return;
    const trade: Trade = {
      id: `user-${Date.now()}`,
      date: form.date,
      symbol: form.symbol.trim(),
      side: form.side,
      price: form.price,
      qty: form.qty,
      reason: form.reason.trim() || '（未填写理由）',
      mood: form.mood,
      followsRules: form.followsRules,
      pnl: 0,
      cooled24h: form.checks.includes('cool24'),
      askedAi: form.checks.includes('asked'),
      offenseOk: !form.checks.includes('offense'),
    };
    setTrades((prev) => [trade, ...prev]);
    setDialogOpen(false);
    setNav('trades');
  }

  const sideNav = (
    <SideNav
      collapsible
      header={
        <SideNavHeading
          heading="交易日志"
          subheading="Astryx Showcase"
          icon={
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg,#0F766E,#2DD4BF)',
                display: 'inline-block',
              }}
            />
          }
        />
      }
      topContent={
        <Button
          label="记一笔交易"
          variant="primary"
          icon={<Plus />}
          width="100%"
          onClick={openDialog}
        />
      }
    >
      <SideNavSection title="工作区">
        {NAV.map((item) => (
          <SideNavItem
            key={item.key}
            label={item.label}
            icon={item.icon}
            isSelected={nav === item.key}
            onClick={() => setNav(item.key)}
          />
        ))}
      </SideNavSection>
    </SideNav>
  );

  return (
    <Theme theme={fintechTheme} mode={mode}>
      <AppShell sideNav={sideNav} height="fill" variant="elevated" contentPadding={0} mobileNav={{breakpoint: 'md'}}>
        <div className="app-main">
          <div className="page-header">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>
                  {NAV.find((n) => n.key === nav)?.label ?? '总览'}
                </Heading>
                <span className="subtle-badge">示例数据</span>
              </HStack>
              <Text type="supporting">
                虚构演示 · 非真实持仓 · 本地保存在浏览器 localStorage
              </Text>
            </VStack>
            <div className="page-header-actions">
              <Switch
                label="深色模式"
                value={mode === 'dark'}
                onChange={(checked) => setMode(checked ? 'dark' : 'light')}
                size="sm"
              />
              <span className="hide-on-mobile">
                <Button
                  label="重置示例"
                  variant="ghost"
                  onClick={() => {
                    setTrades(EXAMPLE_TRADES);
                    setRules(DEFAULT_RULES);
                  }}
                />
              </span>
              <span className="hide-on-mobile">
                <Button
                  label="记一笔交易"
                  variant="primary"
                  icon={<Plus />}
                  onClick={openDialog}
                />
              </span>
            </div>
          </div>

          {nav === 'overview' && (
            <>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-label">本月交易笔数</div>
                  <div className="kpi-value">{summary.count}</div>
                  <div className="kpi-row">
                    <span className="delta up">+2 较上周</span>
                    <Sparkline values={summary.sparkCount} />
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">胜率（卖出笔）</div>
                  <div className="kpi-value">{summary.winRate}%</div>
                  <div className="kpi-row">
                    <span className="delta up">+7 pts</span>
                    <Sparkline values={summary.sparkWin} />
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">已实现盈亏（示例 USD）</div>
                  <div className="kpi-value">{formatMoney(summary.realized)}</div>
                  <div className="kpi-row">
                    <span
                      className={`delta ${summary.realized >= 0 ? 'up' : 'down'}`}
                    >
                      {summary.realized >= 0 ? '正向' : '回撤'}
                    </span>
                    <Sparkline values={summary.sparkPnl} />
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">规则遵守率</div>
                  <div className="kpi-value">{summary.ruleRate}%</div>
                  <div className="kpi-row">
                    <span
                      className={`delta ${summary.ruleRate >= 80 ? 'up' : 'down'}`}
                    >
                      {summary.ruleRate >= 80 ? '良好' : '需警惕'}
                    </span>
                    <Sparkline values={summary.sparkRule} />
                  </div>
                </div>
              </div>

              <div className="panel-grid">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">累计盈亏走势</div>
                      <div className="panel-sub">示例曲线 · 非实时行情</div>
                    </div>
                    <Badge label="本月" variant="teal" />
                  </div>
                  <AreaChart data={PNL_SERIES} height={240} />
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">仓位分配</div>
                      <div className="panel-sub">示意权重，非真实持仓</div>
                    </div>
                  </div>
                  <DonutChart slices={ALLOCATION} />
                </div>
              </div>

              <div className="bottom-grid">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">最近交易</div>
                      <div className="panel-sub">点击侧栏「交易明细」看全部</div>
                    </div>
                    <Button
                      label="查看全部"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNav('trades')}
                    />
                  </div>
                  <TradesTable trades={trades.slice(0, 4)} compact />
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">纪律检查</div>
                      <div className="panel-sub">下单前三项合规占比</div>
                    </div>
                  </div>
                  <div className="discipline-rings">
                    <ProgressRing value={summary.cooled} label="冷静 24 小时" />
                    <ProgressRing value={summary.asked} label="问过黎明或 AI" />
                    <ProgressRing value={summary.offense} label="进攻仓位 ≤ 2" />
                  </div>
                </div>
              </div>
            </>
          )}

          {nav === 'trades' && (
            <div className="table-shell" style={{padding: 8}}>
              <div style={{padding: '12px 12px 4px'}}>
                <Heading level={3}>全部交易 · {trades.length} 笔</Heading>
              </div>
              <TradesTable trades={trades} />
            </div>
          )}

          {nav === 'rules' && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">退出规则</div>
                  <div className="panel-sub">按标的编辑，保存在本机</div>
                </div>
              </div>
              <div className="rules-list">
                {rules.map((r) => (
                  <TextArea
                    key={r.symbol}
                    label={`${r.symbol} 退出规则`}
                    value={r.rule}
                    onChange={(value) =>
                      setRules((prev) =>
                        prev.map((x) =>
                          x.symbol === r.symbol ? {...x, rule: value} : x,
                        ),
                      )
                    }
                    width="100%"
                  />
                ))}
              </div>
            </div>
          )}

          {nav === 'review' && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">本周复盘</div>
                  <div className="panel-sub">写下情绪与纪律偏差</div>
                </div>
              </div>
              <TextArea
                label="复盘笔记"
                value={review}
                onChange={setReview}
                width="100%"
              />
              <div style={{height: 16}} />
              <div className="review-note">
                提示：兴奋时强制冷静 24 小时；进攻仓位最多 2 个；重大决策先问黎明或 AI。
              </div>
            </div>
          )}
        </div>

        <nav className="mobile-tabbar" aria-label="移动导航">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={`mobile-tab${nav === item.key ? ' active' : ''}`}
                onClick={() => setNav(item.key)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <Dialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          purpose="form"
          width={600}
          maxHeight="90dvh"
        >
          <DialogHeader
            title="记一笔交易"
            subtitle="新记录写入本机 localStorage"
            onOpenChange={setDialogOpen}
          />
          <VStack gap={4} padding={4} isScrollable>
            <TextInput
              label="日期"
              value={form.date}
              onChange={(value) => setForm((f) => ({...f, date: value}))}
              placeholder="YYYY-MM-DD"
              isRequired
              width="100%"
            />
            <TextInput
              label="标的"
              value={form.symbol}
              onChange={(value) => setForm((f) => ({...f, symbol: value}))}
              placeholder="例如 BTC / CRCL / DRAM-示例股"
              isRequired
              width="100%"
            />
            <RadioList
              label="方向"
              value={form.side}
              onChange={(value) => setForm((f) => ({...f, side: value as Side}))}
              orientation="horizontal"
            >
              <RadioListItem label="买" value="买" />
              <RadioListItem label="卖" value="卖" />
            </RadioList>
            <HStack gap={3} wrap="wrap">
              <StackItem size="fill">
                <NumberInput
                  label="价格"
                  value={form.price}
                  onChange={(value) => setForm((f) => ({...f, price: value}))}
                  isRequired
                  min={0}
                  step={0.01}
                  width="100%"
                />
              </StackItem>
              <StackItem size="fill">
                <NumberInput
                  label="数量"
                  value={form.qty}
                  onChange={(value) => setForm((f) => ({...f, qty: value}))}
                  isRequired
                  min={0}
                  step={0.01}
                  width="100%"
                />
              </StackItem>
            </HStack>
            <TextArea
              label="理由"
              value={form.reason}
              onChange={(value) => setForm((f) => ({...f, reason: value}))}
              placeholder="为什么买/卖？"
              width="100%"
            />
            <Selector
              label="情绪"
              value={form.mood}
              onChange={(value) => setForm((f) => ({...f, mood: value as Mood}))}
              options={['冷静', '兴奋', '焦虑']}
              width="100%"
            />
            <CheckboxList
              label="下单前检查"
              value={form.checks}
              onChange={(values) => setForm((f) => ({...f, checks: values}))}
              hasDividers
              width="100%"
            >
              {CHECK_OPTIONS.map((opt) => (
                <CheckboxListItem
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                />
              ))}
            </CheckboxList>
            <Switch
              label="是否符合规则"
              value={form.followsRules}
              onChange={(checked) =>
                setForm((f) => ({...f, followsRules: checked}))
              }
            />
            <div className="dialog-footer">
              <HStack gap={2} hAlign="end">
                <Button
                  label="取消"
                  variant="secondary"
                  onClick={() => setDialogOpen(false)}
                />
                <Button
                  label="保存交易"
                  variant="primary"
                  onClick={addTrade}
                  isDisabled={
                    !form.symbol.trim() || form.price == null || form.qty == null
                  }
                />
              </HStack>
            </div>
          </VStack>
        </Dialog>
      </AppShell>
    </Theme>
  );
}

function TradesTable({
  trades,
  compact,
}: {
  trades: Trade[];
  compact?: boolean;
}) {
  const compactColumns = [
    {key: 'date', header: '日期', width: pixel(96)},
    {
      key: 'symbol',
      header: '标的',
      width: pixel(132),
      renderCell: (row: Trade) => <TickerChip symbol={row.symbol} />,
    },
    {
      key: 'side',
      header: '方向',
      width: pixel(64),
      renderCell: (row: Trade) => (
        <Badge
          label={row.side}
          variant={row.side === '买' ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'pnl',
      header: '盈亏',
      width: pixel(84),
      renderCell: (row: Trade) =>
        row.side === '卖' ? (
          <span className={row.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'}>
            {formatMoney(row.pnl)}
          </span>
        ) : (
          <Text type="supporting">—</Text>
        ),
    },
    {
      key: 'mood',
      header: '情绪',
      width: pixel(80),
      renderCell: (row: Trade) => (
        <Badge
          label={row.mood}
          variant={
            row.mood === '冷静'
              ? 'teal'
              : row.mood === '兴奋'
                ? 'orange'
                : 'warning'
          }
        />
      ),
    },
  ];

  const fullColumns = [
    {key: 'date', header: '日期', width: pixel(108)},
    {
      key: 'symbol',
      header: '标的',
      width: pixel(148),
      renderCell: (row: Trade) => <TickerChip symbol={row.symbol} />,
    },
    {
      key: 'side',
      header: '方向',
      width: pixel(72),
      renderCell: (row: Trade) => (
        <Badge
          label={row.side}
          variant={row.side === '买' ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'price',
      header: '价格',
      width: pixel(100),
      renderCell: (row: Trade) => (
        <Text hasTabularNumbers>{row.price.toLocaleString('en-US')}</Text>
      ),
    },
    {
      key: 'qty',
      header: '数量',
      width: pixel(72),
      renderCell: (row: Trade) => (
        <Text hasTabularNumbers>{row.qty}</Text>
      ),
    },
    {
      key: 'pnl',
      header: '盈亏',
      width: pixel(88),
      renderCell: (row: Trade) =>
        row.side === '卖' ? (
          <span className={row.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'}>
            {formatMoney(row.pnl)}
          </span>
        ) : (
          <Text type="supporting">—</Text>
        ),
    },
    {
      key: 'mood',
      header: '情绪',
      width: pixel(88),
      renderCell: (row: Trade) => (
        <Badge
          label={row.mood}
          variant={
            row.mood === '冷静'
              ? 'teal'
              : row.mood === '兴奋'
                ? 'orange'
                : 'warning'
          }
        />
      ),
    },
    {
      key: 'followsRules',
      header: '规则',
      width: pixel(72),
      renderCell: (row: Trade) => (
        <Badge
          label={row.followsRules ? '是' : '否'}
          variant={row.followsRules ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'reason',
      header: '理由',
      renderCell: (row: Trade) => (
        <Text maxLines={1} type="supporting">
          {row.reason}
        </Text>
      ),
    },
  ];

  return (
    <div className={`table-scroll${compact ? ' compact' : ''}`}>
      <Table
        data={trades}
        idKey="id"
        density={compact ? 'compact' : 'balanced'}
        hasHover
        textOverflow="truncate"
        columns={compact ? compactColumns : fullColumns}
      />
    </div>
  );
}
