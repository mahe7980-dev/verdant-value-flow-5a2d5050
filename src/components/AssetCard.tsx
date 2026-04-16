import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Asset, getDaysUsed, STATUS_LABELS } from '@/lib/assets';
import SharedAssetHero from '@/components/SharedAssetHero';

const STATUS_DOT: Record<string, string> = {
  active: 'bg-primary',
  retired: 'bg-muted-foreground',
  sold: 'bg-destructive/60',
};

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 32,
  mass: 0.95,
};

export default function AssetCard({ asset }: { asset: Asset }) {
  const navigate = useNavigate();
  const location = useLocation();
  const days = getDaysUsed(asset.purchaseDate);

  return (
    <motion.button
      layoutId={`asset-card-${asset.id}`}
      onClick={() => navigate(`/asset/${asset.id}`, { state: { backgroundLocation: location } })}
      className="flex w-full flex-col rounded-2xl bg-card p-4 text-left card-shadow card-press"
      transition={sharedTransition}
      style={{ borderRadius: 16 }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <SharedAssetHero asset={asset} variant="card" />
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
