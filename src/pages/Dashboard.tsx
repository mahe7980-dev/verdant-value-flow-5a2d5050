import { useMemo } from 'react';
import { getAssets, getTotalValue, getOverallDailyCost } from '@/lib/assets';
import AssetCard from '@/components/AssetCard';

export default function Dashboard() {
  const assets = useMemo(() => getAssets(), []);
  const total = getTotalValue(assets);
  const dailyCost = getOverallDailyCost(assets);

  return (
    <div className="min-h-screen pb-28 px-5 pt-12">
      {/* Header */}
      <div className="rounded-3xl gradient-green p-6 text-primary-foreground">
        <p className="text-sm opacity-80 font-medium">总资产金额</p>
        <p className="text-3xl font-bold mt-1">¥{total.toLocaleString()}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="rounded-full bg-primary-foreground/20 px-3 py-1">
            <span className="text-xs font-medium">整体日均 ¥{dailyCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="mt-6">
        <h2 className="text-base font-semibold mb-3">我的资产</h2>
        <div className="flex flex-col gap-3">
          {assets.map(a => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
