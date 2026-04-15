import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { getAssets, getTotalValue, getOverallDailyCost, AssetStatus, STATUS_LABELS } from '@/lib/assets';
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

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '服役中' },
    { key: 'retired', label: '已退役' },
    { key: 'sold', label: '已卖出' },
  ];

  return (
    <div className="min-h-screen pb-28">
      {/* Green gradient header area */}
      <div className="gradient-green px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-foreground">有数</h1>
          <div className="flex items-center gap-1">
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-card/60">
              <Search size={18} strokeWidth={1.5} className="text-foreground" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-card/60">
              <ChevronDown size={18} strokeWidth={1.5} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-2">
        {/* Summary card */}
        <div className="rounded-3xl bg-card card-shadow p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-foreground">资产总览</span>
            <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{totalCount}/{totalCount}</span>
          </div>

          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">总资产</p>
              <p className="text-2xl font-bold text-foreground">¥{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">日均成本</p>
              <p className="text-2xl font-bold text-foreground">¥{dailyCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Status counts with bars */}
          <div className="border-t border-dashed border-border pt-3">
            <div className="grid grid-cols-3 gap-3">
              <StatusBar label="服役中" count={activeCount} total={totalCount} color="bg-primary" />
              <StatusBar label="已退役" count={retiredCount} total={totalCount} color="bg-muted-foreground/30" />
              <StatusBar label="已卖出" count={soldCount} total={totalCount} color="bg-muted-foreground/20" />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-5 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asset grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {filtered.map(a => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{count}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(pct, pct > 0 ? 10 : 0)}%` }} />
      </div>
    </div>
  );
}
