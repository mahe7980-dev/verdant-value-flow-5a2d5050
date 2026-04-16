import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAssets, getDailyCost } from '@/lib/assets';
import { motion } from 'framer-motion';

const COLORS = ['hsl(145,45%,52%)', 'hsl(200,55%,50%)', 'hsl(35,75%,50%)', 'hsl(280,40%,50%)', 'hsl(10,60%,50%)', 'hsl(180,40%,45%)'];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function Analytics() {
  const assets = useMemo(() => getAssets(), []);

  const totalValue = useMemo(() => assets.reduce((s, a) => s + a.price, 0), [assets]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach(a => { map[a.category] = (map[a.category] || 0) + a.price; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  const topCostly = useMemo(() =>
    [...assets]
      .sort((a, b) => getDailyCost(b.price, b.purchaseDate) - getDailyCost(a.price, a.purchaseDate))
      .slice(0, 5)
      .map(a => ({ name: a.name.length > 6 ? a.name.slice(0, 6) + '…' : a.name, cost: +getDailyCost(a.price, a.purchaseDate).toFixed(2) })),
    [assets]
  );

  const cardStyle = {
    boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
  };

  return (
    <div className="min-h-screen pb-28 bg-background">
      <div className="px-6 pt-14 pb-2">
        <h1 className="text-[28px] font-bold text-foreground leading-tight">分析</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">资产分布与消费洞察</p>
      </div>

      <div className="px-5 space-y-3 mt-4">
        {/* Pie chart */}
        <motion.div
          className="rounded-[18px] bg-card p-5"
          style={cardStyle}
          {...fadeUp}
          transition={{ delay: 0.05, duration: 0.35 }}
        >
          <h3 className="text-[13px] font-semibold mb-4 text-foreground">类别分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={44}
                paddingAngle={3}
                strokeWidth={0}
              >
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 text-[13px] text-foreground">{d.name}</span>
                <span className="text-[13px] font-medium text-foreground">¥{d.value.toLocaleString()}</span>
                <span className="text-[11px] text-muted-foreground w-10 text-right">
                  {totalValue > 0 ? `${((d.value / totalValue) * 100).toFixed(0)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar chart */}
        <motion.div
          className="rounded-[18px] bg-card p-5"
          style={cardStyle}
          {...fadeUp}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <h3 className="text-[13px] font-semibold mb-4 text-foreground">日均成本 Top 5</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCostly} layout="vertical" barSize={20}>
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }}
                tickFormatter={v => `¥${v}`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(0,0%,40%)' }}
                width={65}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`¥${v}`, '日均成本']}
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="cost" fill="hsl(145,45%,52%)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
