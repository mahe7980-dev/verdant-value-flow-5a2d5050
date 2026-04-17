import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Asset, getDaysUsed, getDailyCost, STATUS_LABELS, getAssetEmoji } from '@/lib/assets';
import { useSettings } from '@/lib/settings';

const STATUS_DOT: Record<string, string> = {
  active: 'bg-primary',
  retired: 'bg-muted-foreground',
  sold: 'bg-destructive/60',
};

export default function AssetListItem({ asset }: { asset: Asset }) {
  const navigate = useNavigate();
  const { formatPrice, formatDailyCost, formatDuration, durationSuffix } = useSettings();
  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const emoji = asset.emoji || getAssetEmoji(asset.name, asset.category);

  return (
    <motion.button
      layoutId={`asset-bg-${asset.id}`}
      onClick={() => navigate(`/asset/${asset.id}`)}
      className="w-full rounded-[18px] bg-card p-4 text-left flex items-center gap-3.5"
      style={{
        boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.05)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <motion.div
        layoutId={`asset-emoji-${asset.id}`}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-accent"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <span className="text-[26px]">{emoji}</span>
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <motion.span
            layoutId={`asset-name-${asset.id}`}
            className="font-semibold text-[14px] leading-tight truncate text-foreground"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {asset.name}
          </motion.span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-4 truncate">
          {formatPrice(asset.price)} · {formatDuration(days)}
        </p>
        <motion.div
          layoutId={`asset-daily-${asset.id}`}
          className="mt-1.5"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <span className="text-[18px] font-bold text-foreground leading-none">
            {formatDailyCost(daily)}
          </span>
          <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{durationSuffix}</span>
        </motion.div>
      </div>

      <span className="self-start flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-[3px]">
        <span className={`h-[5px] w-[5px] rounded-full ${STATUS_DOT[asset.status] || 'bg-muted-foreground'}`} />
        <span className="text-[10px] font-medium text-muted-foreground">{STATUS_LABELS[asset.status]}</span>
      </span>
    </motion.button>
  );
}
