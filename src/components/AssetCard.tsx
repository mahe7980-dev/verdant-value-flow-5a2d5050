import { Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Asset, getDaysUsed, getDailyCost } from '@/lib/assets';

export default function AssetCard({ asset }: { asset: Asset }) {
  const navigate = useNavigate();
  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  // Progress: after 365 days = 100%
  const progress = Math.min(1, days / 365);

  return (
    <button
      onClick={() => navigate(`/asset/${asset.id}`)}
      className="w-full rounded-2xl bg-card card-shadow p-4 text-left card-press"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Package size={20} className="text-accent-foreground" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm truncate">{asset.name}</span>
            <span className="text-xs text-muted-foreground">{days}天</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">日均</span>
            <span className="text-sm font-bold text-primary">¥{daily.toFixed(2)}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-accent overflow-hidden">
            <div
              className="h-full rounded-full gradient-green transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
