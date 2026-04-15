import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getAssets, getTotalValue, getOverallDailyCost, AssetStatus } from '@/lib/assets';
import AssetCard from '@/components/AssetCard';

type Filter = 'all' | AssetStatus;

export default function Dashboard() {
  const assets = useMemo(() => getAssets(), []);
  const [filter, setFilter] = useState<Filter>('all');

  const total = getTotalValue(assets);
  const dailyCost = getOverallDailyCost(assets);

  const activeCount = assets.filter(a => a.status === 'active').length;
  const retiredCount = assets.filter(a => a.status === 'retired').length;
  const soldCount = assets.filter(a => a.status === 'sold').length;
  const totalCount = assets.length;

  const filtered = filter === 'all' ? assets : assets.filter(a => a.status === filter);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: totalCount },
    { key: 'active', label: '服役中', count: activeCount },
    { key: 'retired', label: '已退役', count: retiredCount },
    { key: 'sold', label: '已卖出', count: soldCount },
  ];

  return (
    <div className="min-h-screen pb-28 bg-background">
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">有数</h1>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-background transition-shadow hover:card-shadow-hover">
              <Search size={18} strokeWidth={1.5} className="text-foreground" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-background transition-shadow hover:card-shadow-hover">
              <SlidersHorizontal size={18} strokeWidth={1.5} className="text-foreground" />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">管理你的每一件物品</p>
      </div>

      <div className="px-5 mt-4">
        {/* Summary card */}
        <div className="rounded-2xl bg-card card-shadow p-5">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 tracking-wide">总资产</p>
              <p className="text-[26px] font-bold text-foreground leading-none">
                ¥{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1.5 tracking-wide">日均成本</p>
              <p className="text-[26px] font-bold text-foreground leading-none">¥{dailyCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Status summary */}
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-3 gap-4">
              <StatusPill label="服役中" count={activeCount} total={totalCount} color="bg-primary" />
              <StatusPill label="已退役" count={retiredCount} total={totalCount} color="bg-muted-foreground/40" />
              <StatusPill label="已卖出" count={soldCount} total={totalCount} color="bg-muted-foreground/25" />
            </div>
          </div>
        </div>

        {/* Filter pills - Airbnb horizontal scroll style */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                filter === f.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground/30'
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`ml-1.5 text-xs ${filter === f.key ? 'text-background/70' : 'text-muted-foreground'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Asset grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {filtered.map(a => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">暂无资产</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{count}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }} />
      </div>
    </div>
  );
}
