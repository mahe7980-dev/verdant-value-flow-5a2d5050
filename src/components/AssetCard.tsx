import { useNavigate } from 'react-router-dom';
import { Asset, getDaysUsed, getDailyCost, STATUS_LABELS, getAssetEmoji } from '@/lib/assets';

const STATUS_DOT: Record<string, string> = {
  active: 'bg-primary',
  retired: 'bg-muted-foreground',
  sold: 'bg-destructive/60',
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
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
          <span className="text-xl">{emoji}</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[asset.status] || 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-medium text-muted-foreground">{STATUS_LABELS[asset.status]}</span>
        </span>
      </div>

      <span className="font-semibold text-[13px] leading-tight truncate text-foreground">{asset.name}</span>
      <span className="text-[11px] text-muted-foreground mt-1 h-4 leading-4 truncate">
        ¥{asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} · {days} 天
      </span>
      <span className="text-lg font-bold text-foreground mt-2.5 leading-none">
        ¥{daily.toFixed(2)}
        <span className="text-[11px] font-normal text-muted-foreground">/天</span>
      </span>
    </button>
  );
}
