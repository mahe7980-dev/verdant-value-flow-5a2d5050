import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Asset, getDaysUsed, getDailyCost, STATUS_LABELS, getAssetEmoji } from '@/lib/assets';

const STATUS_DOT: Record<string, string> = {
  active: 'bg-primary',
  retired: 'bg-muted-foreground',
  sold: 'bg-destructive/60',
};

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export default function AssetCard({ asset }: { asset: Asset }) {
  const navigate = useNavigate();
  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const emoji = getAssetEmoji(asset.name, asset.category);

  return (
    <motion.button
      layoutId={`asset-card-${asset.id}`}
      onClick={() => navigate(`/asset/${asset.id}`)}
      className="w-full rounded-2xl bg-card card-shadow p-4 text-left card-press flex flex-col"
      transition={sharedTransition}
      style={{ borderRadius: 16 }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
            <span className="text-xl">{emoji}</span>
          </div>
          <div className="mt-3 truncate text-[13px] font-semibold leading-tight text-foreground">
            {asset.name}
          </div>
          <div className="mt-2.5 text-lg font-bold leading-none text-foreground">
            ¥{daily.toFixed(1)}
            <span className="text-[11px] font-normal text-muted-foreground">/天</span>
          </div>
        </div>
        <span className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[asset.status] || 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-medium text-muted-foreground">{STATUS_LABELS[asset.status]}</span>
        </span>
      </div>

      <span className="mt-1 h-4 min-h-[16px] truncate text-[11px] leading-4 text-muted-foreground">
        ¥{asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} · {days} 天
      </span>
    </motion.button>
  );
}
