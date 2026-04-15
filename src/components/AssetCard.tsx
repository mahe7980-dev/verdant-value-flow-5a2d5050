import { useNavigate } from 'react-router-dom';
import { Asset, getDaysUsed, getDailyCost, STATUS_LABELS, getAssetEmoji } from '@/lib/assets';

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-500',
  retired: 'bg-muted-foreground',
  sold: 'bg-orange-400',
};

export default function AssetCard({ asset }: { asset: Asset }) {
  const navigate = useNavigate();
  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const emoji = getAssetEmoji(asset.name, asset.category);

  return (
    <button
      onClick={() => navigate(`/asset/${asset.id}`)}
      className="w-full rounded-2xl bg-card card-shadow p-4 text-left card-press flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
          <span className="text-2xl">{emoji}</span>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[asset.status] || 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-medium text-muted-foreground">{STATUS_LABELS[asset.status]}</span>
        </span>
      </div>

      <span className="font-semibold text-sm truncate text-foreground">{asset.name}</span>
      <span className="text-[11px] text-muted-foreground mt-0.5">
        ¥{asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} | 已使用 {days} 天
      </span>
      <span className="text-base font-bold text-foreground mt-2">¥{daily.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/天</span></span>
    </button>
  );
}
