type Point = {date: string; value: number};

export function Sparkline({
  values,
  width = 96,
  height = 32,
  stroke = 'var(--color-accent)',
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  const lastUp = values[values.length - 1] >= values[0];
  const color = lastUp ? 'var(--color-text-success, #22c55e)' : 'var(--color-text-error, #ef4444)';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke || color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

export function AreaChart({
  data,
  height = 220,
}: {
  data: Point[];
  height?: number;
}) {
  const pad = {t: 12, r: 16, b: 32, l: 48};
  const width = 640;
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const values = data.map((d) => d.value);
  const min = Math.min(0, ...values);
  const max = Math.max(...values) * 1.08 || 1;
  const range = max - min || 1;
  const xAt = (i: number) => pad.l + (i / (data.length - 1)) * innerW;
  const yAt = (v: number) => pad.t + innerH - ((v - min) / range) * innerH;
  const line = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.value)}`)
    .join(' ');
  const area = `${line} L ${xAt(data.length - 1)} ${yAt(0)} L ${xAt(0)} ${yAt(0)} Z`;
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => min + range * t);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className="area-chart"
      role="img"
      aria-label="累计盈亏走势示例图"
    >
      <defs>
        <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridYs.map((v, i) => (
        <g key={i}>
          <line
            x1={pad.l}
            x2={width - pad.r}
            y1={yAt(v)}
            y2={yAt(v)}
            className="chart-grid"
          />
          <text x={pad.l - 8} y={yAt(v) + 4} className="chart-axis" textAnchor="end">
            {Math.round(v)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#pnlFill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <text
          key={d.date}
          x={xAt(i)}
          y={height - 8}
          className="chart-axis"
          textAnchor="middle"
        >
          {d.date}
        </text>
      ))}
      <circle
        cx={xAt(data.length - 1)}
        cy={yAt(data[data.length - 1].value)}
        r="4.5"
        fill="var(--color-accent)"
        stroke="var(--color-background-card, #fff)"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DonutChart({
  slices,
  size = 180,
}: {
  slices: {symbol: string; weight: number; color: string}[];
  size?: number;
}) {
  const r = 62;
  const stroke = 22;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const total = slices.reduce((s, x) => s + x.weight, 0) || 1;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox="0 0 180 180" aria-hidden>
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="var(--color-border, #334155)"
          strokeWidth={stroke}
          opacity="0.35"
        />
        {slices.map((s) => {
          const len = (s.weight / total) * c;
          const el = (
            <circle
              key={s.symbol}
              cx="90"
              cy="90"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 90 90)"
            />
          );
          offset += len;
          return el;
        })}
        <text x="90" y="86" textAnchor="middle" className="donut-center-label">
          示例仓位
        </text>
        <text x="90" y="108" textAnchor="middle" className="donut-center-value">
          100%
        </text>
      </svg>
      <ul className="donut-legend">
        {slices.map((s) => (
          <li key={s.symbol}>
            <span className="swatch" style={{background: s.color}} />
            <span className="sym">{s.symbol}</span>
            <span className="pct">{s.weight}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressRing({
  value,
  label,
  size = 72,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const len = (pct / 100) * c;
  const tone =
    pct >= 80 ? 'var(--color-text-success, #22c55e)' : pct >= 50 ? 'var(--color-accent)' : 'var(--color-text-warning, #f59e0b)';
  return (
    <div className="progress-ring">
      <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth="6" opacity="0.4" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeDasharray={`${len} ${c - len}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" className="ring-value">
          {pct}%
        </text>
      </svg>
      <div className="ring-label">{label}</div>
    </div>
  );
}
