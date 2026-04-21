import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ReferenceLine, Label,
} from 'recharts';
import { getAssets, getDailyCost, getDaysUsed, type Asset } from '@/lib/assets';
import { useSettings } from '@/lib/settings';
import { getBenchmark } from '@/lib/category-benchmarks';
import { motion } from 'framer-motion';

const COLORS = ['hsl(145,45%,52%)', 'hsl(200,55%,50%)', 'hsl(35,75%,50%)', 'hsl(280,40%,50%)', 'hsl(10,60%,50%)', 'hsl(180,40%,45%)'];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const cardStyle = {
  boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
};

/* ---------- helpers ---------- */

function classifyAsset(a: Asset) {
  const days = getDaysUsed(a.purchaseDate);
  const daily = getDailyCost(a.price, a.purchaseDate);
  const benchmark = getBenchmark(a.category);
  const targetDaily = (a.price / 1000) * benchmark.avgDailyRentalPer1k;
  // high value = daily cost ≤ target → "神物"; high price + high daily → "吃灰"
  if (daily <= targetDaily && a.price >= 3000) return 'god';
  if (daily > targetDaily * 2 && a.price >= 3000 && days < 365) return 'dust';
  return 'normal';
}

function getMonthlySpending(assets: Asset[]) {
  const now = new Date();
  const months: { month: string; total: number; categories: Record<string, number> }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}月`;
    const catMap: Record<string, number> = {};
    assets.forEach(a => {
      const pd = new Date(a.purchaseDate);
      if (pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth()) {
        catMap[a.category] = (catMap[a.category] || 0) + a.price;
      }
    });
    months.push({ month: label, total: Object.values(catMap).reduce((s, v) => s + v, 0), categories: catMap });
  }
  return months;
}

export default function Analytics() {
  const assets = useMemo(() => getAssets(), []);
  const { currencySymbol, dailyIncome } = useSettings();
  const activeAssets = useMemo(() => assets.filter(a => a.status === 'active'), [assets]);

  const totalValue = useMemo(() => assets.reduce((s, a) => s + a.price, 0), [assets]);

  /* --- existing: category pie --- */
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach(a => { map[a.category] = (map[a.category] || 0) + a.price; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [assets]);

  /* --- existing: top5 bar --- */
  const topCostly = useMemo(() =>
    [...assets]
      .sort((a, b) => getDailyCost(b.price, b.purchaseDate) - getDailyCost(a.price, a.purchaseDate))
      .slice(0, 5)
      .map(a => ({ name: a.name.length > 6 ? a.name.slice(0, 6) + '…' : a.name, cost: +getDailyCost(a.price, a.purchaseDate).toFixed(2) })),
    [assets]
  );

  /* --- 1. Efficiency Matrix scatter --- */
  const scatterData = useMemo(() =>
    activeAssets.map(a => {
      const days = getDaysUsed(a.purchaseDate);
      const cls = classifyAsset(a);
      return { name: a.name, price: a.price, days, cls, emoji: a.emoji };
    }),
    [activeAssets]
  );

  /* --- 2. Monthly spending --- */
  const monthlyData = useMemo(() => getMonthlySpending(assets), [assets]);
  const allCats = useMemo(() => {
    const s = new Set<string>();
    monthlyData.forEach(m => Object.keys(m.categories).forEach(c => s.add(c)));
    return Array.from(s);
  }, [monthlyData]);
  const peakMonth = useMemo(() => monthlyData.reduce((best, m) => m.total > best.total ? m : best, monthlyData[0]), [monthlyData]);

  /* --- 3. Opportunity cost --- */
  const opportunityCost = useMemo(() => {
    // Total spent on all assets
    const totalSpent = assets.reduce((s, a) => s + a.price, 0);
    // If invested at 4% annual compound for average holding period
    const avgDays = assets.length > 0 ? assets.reduce((s, a) => s + getDaysUsed(a.purchaseDate), 0) / assets.length : 365;
    const years = avgDays / 365;
    const futureValue = totalSpent * Math.pow(1.04, years);
    return { totalSpent, gain: Math.round(futureValue - totalSpent), years: +years.toFixed(1) };
  }, [assets]);

  /* --- 4. Health radar --- */
  const radarData = useMemo(() => {
    if (activeAssets.length === 0) return [];
    // Durability: avg days used (normalize to 100, 1000 days = 100)
    const avgDays = activeAssets.reduce((s, a) => s + getDaysUsed(a.purchaseDate), 0) / activeAssets.length;
    const durability = Math.min(100, (avgDays / 1000) * 100);

    // Cost efficiency: how many assets beat their category benchmark
    const efficient = activeAssets.filter(a => {
      const bm = getBenchmark(a.category);
      return getDailyCost(a.price, a.purchaseDate) <= (a.price / 1000) * bm.avgDailyRentalPer1k;
    }).length;
    const costEff = (efficient / activeAssets.length) * 100;

    // Utilization: active / total
    const utilization = (activeAssets.length / Math.max(1, assets.length)) * 100;

    // Resale: sold count / (sold + retired) — higher is better
    const sold = assets.filter(a => a.status === 'sold').length;
    const retired = assets.filter(a => a.status === 'retired').length;
    const resale = sold + retired > 0 ? (sold / (sold + retired)) * 100 : 50;

    // Rationality: inverse of income ratio (lower cost/income = higher score)
    let rationality = 80;
    if (dailyIncome > 0) {
      const totalDaily = activeAssets.reduce((s, a) => s + getDailyCost(a.price, a.purchaseDate), 0);
      const ratio = (totalDaily / dailyIncome) * 100;
      rationality = Math.max(0, Math.min(100, 100 - ratio * 3));
    }

    return [
      { dim: '耐用性', value: Math.round(durability) },
      { dim: '性价比', value: Math.round(costEff) },
      { dim: '利用率', value: Math.round(utilization) },
      { dim: '回收率', value: Math.round(resale) },
      { dim: '理性度', value: Math.round(rationality) },
    ];
  }, [assets, activeAssets, dailyIncome]);

  /* --- 5. Predictive insights --- */
  const prediction = useMemo(() => {
    const currentDaily = activeAssets.reduce((s, a) => s + getDailyCost(a.price, a.purchaseDate), 0);
    // 12 months later, each asset has 365 more days
    const futureDaily = activeAssets.reduce((s, a) => {
      const futureDays = getDaysUsed(a.purchaseDate) + 365;
      return s + a.price / futureDays;
    }, 0);
    const reduction = currentDaily > 0 ? ((currentDaily - futureDaily) / currentDaily * 100) : 0;
    return { currentDaily, futureDaily, reduction };
  }, [activeAssets]);

  /* ---- stacked bar data transform ---- */
  const stackedData = useMemo(() =>
    monthlyData.map(m => ({ month: m.month, ...m.categories })),
    [monthlyData]
  );

  return (
    <div className="min-h-screen pb-28 bg-background">
      <div className="px-6 pt-14 pb-2">
        <h1 className="text-[28px] font-bold text-foreground leading-tight">分析</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">资产分布与消费洞察</p>
      </div>

      <div className="px-5 space-y-3 mt-4">
        {/* 1. Pie chart — category */}
        <motion.div className="rounded-[18px] bg-card p-5" style={cardStyle} {...fadeUp} transition={{ delay: 0.05, duration: 0.35 }}>
          <h3 className="text-[13px] font-semibold mb-4 text-foreground">类别分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={44} paddingAngle={3} strokeWidth={0}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${currencySymbol}${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 text-[13px] text-foreground">{d.name}</span>
                <span className="text-[13px] font-medium text-foreground">{currencySymbol}{d.value.toLocaleString()}</span>
                <span className="text-[11px] text-muted-foreground w-10 text-right">
                  {totalValue > 0 ? `${((d.value / totalValue) * 100).toFixed(0)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 2. Bar chart — top 5 */}
        <motion.div className="rounded-[18px] bg-card p-5" style={cardStyle} {...fadeUp} transition={{ delay: 0.1, duration: 0.35 }}>
          <h3 className="text-[13px] font-semibold mb-4 text-foreground">日均成本 Top 5</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCostly} layout="vertical" barSize={20}>
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }} tickFormatter={v => `${currencySymbol}${v}`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(0,0%,40%)' }} width={65} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${currencySymbol}${v}`, '日均成本']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="cost" fill="hsl(145,45%,52%)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 3. Efficiency Matrix — scatter */}
        <motion.div className="rounded-[18px] bg-card p-5" style={cardStyle} {...fadeUp} transition={{ delay: 0.15, duration: 0.35 }}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[13px] font-semibold text-foreground">消费效率象限</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" /> 高价值神物
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'hsl(10,60%,50%)' }} /> 吃灰警告
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'hsl(0,0%,75%)' }} /> 普通
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <XAxis type="number" dataKey="price" name="价格" tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }} tickFormatter={v => `${currencySymbol}${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="days" name="使用天数" tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }} axisLine={false} tickLine={false} />
              <ZAxis range={[60, 60]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const tag = d.cls === 'god' ? '✨ 高价值神物' : d.cls === 'dust' ? '⚠️ 吃灰警告' : '';
                  return (
                    <div className="rounded-xl bg-card border border-border/50 px-3 py-2 text-[12px] shadow-lg">
                      <p className="font-medium text-foreground">{d.emoji} {d.name}</p>
                      <p className="text-muted-foreground">{currencySymbol}{d.price.toLocaleString()} · {d.days}天</p>
                      {tag && <p className="mt-0.5 text-[11px]">{tag}</p>}
                    </div>
                  );
                }}
              />
              {/* Split by classification for colors */}
              <Scatter data={scatterData.filter(d => d.cls === 'normal')} fill="hsl(0,0%,75%)" />
              <Scatter data={scatterData.filter(d => d.cls === 'god')} fill="hsl(145,45%,52%)" />
              <Scatter data={scatterData.filter(d => d.cls === 'dust')} fill="hsl(10,60%,50%)" />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 4. Spending History — stacked bar */}
        <motion.div className="rounded-[18px] bg-card p-5" style={cardStyle} {...fadeUp} transition={{ delay: 0.2, duration: 0.35 }}>
          <h3 className="text-[13px] font-semibold mb-1 text-foreground">支出时间线</h3>
          {peakMonth && peakMonth.total > 0 && (
            <p className="text-[11px] text-muted-foreground mb-4">
              📌 {peakMonth.month}支出最高：{currencySymbol}{peakMonth.total.toLocaleString()}
            </p>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stackedData} barSize={16}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number, name: string) => [`${currencySymbol}${v.toLocaleString()}`, name]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }} />
              {allCats.map((cat, i) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === allCats.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 5. Opportunity Cost */}
        <motion.div className="rounded-[18px] bg-card p-5" style={cardStyle} {...fadeUp} transition={{ delay: 0.25, duration: 0.35 }}>
          <h3 className="text-[13px] font-semibold mb-3 text-foreground">💭 如果不买</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">总购入金额</span>
              <span className="font-medium text-foreground">{currencySymbol}{opportunityCost.totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">平均持有</span>
              <span className="font-medium text-foreground">{opportunityCost.years} 年</span>
            </div>
            <div className="h-px bg-border/60 my-1" />
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              如果这笔钱用于定投理财（按 4% 年化），你本可以多拥有{' '}
              <span className="font-semibold text-foreground">{currencySymbol}{opportunityCost.gain.toLocaleString()}</span>
              {' '}的收益。当然，物品带来的体验同样是一种"回报" 🧘
            </p>
          </div>
        </motion.div>

        {/* 6. Health Radar */}
        {radarData.length > 0 && (
          <motion.div className="rounded-[18px] bg-card p-5" style={cardStyle} {...fadeUp} transition={{ delay: 0.3, duration: 0.35 }}>
            <h3 className="text-[13px] font-semibold mb-4 text-foreground">资产健康度</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                <PolarGrid stroke="hsl(0,0%,88%)" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: 'hsl(0,0%,40%)' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="hsl(145,45%,52%)" fill="hsl(145,45%,52%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {radarData.map(d => (
                <div key={d.dim} className="text-center">
                  <p className="text-[15px] font-semibold text-foreground">{d.value}</p>
                  <p className="text-[10px] text-muted-foreground">{d.dim}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 7. Predictive Insights */}
        <motion.div className="rounded-[18px] bg-card p-5" style={cardStyle} {...fadeUp} transition={{ delay: 0.35, duration: 0.35 }}>
          <h3 className="text-[13px] font-semibold mb-3 text-foreground">🔮 未来 12 个月预测</h3>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">当前日均成本</p>
                <p className="text-[20px] font-bold text-foreground">{currencySymbol}{prediction.currentDaily.toFixed(1)}</p>
              </div>
              <div className="text-[20px] text-muted-foreground">→</div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">预计 12 个月后</p>
                <p className="text-[20px] font-bold text-primary">{currencySymbol}{prediction.futureDaily.toFixed(1)}</p>
              </div>
            </div>
            {/* mini progress */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: '100%' }}
                animate={{ width: `${100 - prediction.reduction}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              如果未来一年不添置新物品，日均成本将自然下降约{' '}
              <span className="font-semibold text-foreground">{prediction.reduction.toFixed(1)}%</span>
              ，时间是最好的"折旧加速器"。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
