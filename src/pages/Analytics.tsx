import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAssets, getDailyCost } from '@/lib/assets';

const COLORS = ['hsl(145,45%,52%)', 'hsl(200,60%,55%)', 'hsl(35,80%,55%)', 'hsl(280,45%,55%)', 'hsl(10,65%,55%)', 'hsl(180,45%,50%)'];

export default function Analytics() {
  const assets = useMemo(() => getAssets(), []);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach(a => { map[a.category] = (map[a.category] || 0) + a.price; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const topCostly = useMemo(() =>
    [...assets]
      .sort((a, b) => getDailyCost(b.price, b.purchaseDate) - getDailyCost(a.price, a.purchaseDate))
      .slice(0, 5)
      .map(a => ({ name: a.name.slice(0, 8), cost: +getDailyCost(a.price, a.purchaseDate).toFixed(2) })),
    [assets]
  );

  return (
    <div className="min-h-screen pb-28 px-5 pt-12">
      <h1 className="text-xl font-bold mb-6">资产分析</h1>

      <div className="rounded-3xl bg-card card-shadow p-5 mb-4">
        <h3 className="text-sm font-semibold mb-3">类别分布</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
              {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {categoryData.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-card card-shadow p-5">
        <h3 className="text-sm font-semibold mb-3">日均成本 Top 5</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topCostly} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `¥${v}`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
            <Tooltip formatter={(v: number) => [`¥${v}`, '日均成本']} />
            <Bar dataKey="cost" fill="hsl(145,45%,52%)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
