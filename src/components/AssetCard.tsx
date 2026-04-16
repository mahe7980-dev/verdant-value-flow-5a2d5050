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
      className="w-full rounded-[18px] bg-card p-4 text-left flex flex-col"
      style={{
        boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.05)',
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-start justify-between mb-3">
        <motion.div
          layoutId={`asset-emoji-${asset.id}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-accent"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <span className="text-xl">{emoji}</span>
        </motion.div>
        <span className="flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-[3px]">
          <span className={`h-[5px] w-[5px] rounded-full ${STATUS_DOT[asset.status] || 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-medium text-muted-foreground">{STATUS_LABELS[asset.status]}</span>
        </span>
      </div>

      <motion.span
        layoutId={`asset-name-${asset.id}`}
        className="font-semibold text-[13px] leading-tight truncate text-foreground block"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {asset.name}
      </motion.span>
      <span className="text-[11px] text-muted-foreground mt-1 leading-4 truncate block">
        ¥{asset.price.toLocaleString('zh-CN')} · {days}天
      </span>
      <motion.div
        layoutId={`asset-daily-${asset.id}`}
        className="mt-3 pt-3 border-t border-border/60"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <span className="text-lg font-bold text-foreground leading-none">
          ¥{daily.toFixed(2)}
        </span>
        <span className="text-[10px] font-normal text-muted-foreground ml-0.5">/天</span>
      </motion.div>
    </motion.button>
  );
}
