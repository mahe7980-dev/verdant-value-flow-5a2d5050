import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const emoji = asset.emoji || getAssetEmoji(asset.name, asset.category);

  return (
    <motion.button
      layoutId={`asset-bg-${asset.id}`}
      onClick={() => navigate(`/asset/${asset.id}`)}
      className="w-full rounded-2xl bg-card card-shadow p-4 text-left card-press flex flex-col"
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    >
      <div className="flex items-start justify-between mb-3">
        <motion.div
          layoutId={`asset-emoji-${asset.id}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <span className="text-xl">{emoji}</span>
        </motion.div>
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[asset.status] || 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-medium text-muted-foreground">{STATUS_LABELS[asset.status]}</span>
        </span>
      </div>

      <motion.span
        layoutId={`asset-name-${asset.id}`}
        className="font-semibold text-[13px] leading-tight truncate text-foreground"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {asset.name}
      </motion.span>
      <span className="text-[11px] text-muted-foreground mt-1 h-4 min-h-[16px] leading-4 truncate">
        ¥{asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} · {days} 天
      </span>
      <motion.span
        layoutId={`asset-daily-${asset.id}`}
        className="text-lg font-bold text-foreground mt-2.5 leading-none"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        ¥{daily.toFixed(2)}
        <span className="text-[11px] font-normal text-muted-foreground">/天</span>
      </motion.span>
    </motion.button>
  );
}
