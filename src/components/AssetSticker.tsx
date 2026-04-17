import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Asset, getDailyCost, getAssetEmoji } from '@/lib/assets';
import { useSettings } from '@/lib/settings';

export default function AssetSticker({ asset }: { asset: Asset }) {
  const navigate = useNavigate();
  const { formatDailyCost, durationSuffix } = useSettings();
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const emoji = asset.emoji || getAssetEmoji(asset.name, asset.category);

  return (
    <motion.button
      onClick={() => navigate(`/asset/${asset.id}`)}
      className="w-full flex flex-col items-center pt-2 pb-3"
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        layoutId={`asset-emoji-${asset.id}`}
        className="flex h-[72px] w-[72px] items-center justify-center text-[52px] mb-2 select-none"
        style={{
          filter: asset.status !== 'active' ? 'grayscale(0.6) opacity(0.7)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.12))',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {emoji}
      </motion.div>
      <motion.span
        layoutId={`asset-name-${asset.id}`}
        className="text-[12px] font-medium text-foreground/90 truncate max-w-full px-1 leading-tight"
      >
        {asset.name}
      </motion.span>
      <span className="mt-1 text-[11px] font-semibold text-muted-foreground">
        {formatDailyCost(daily)}
        <span className="font-normal opacity-70">{durationSuffix}</span>
      </span>
    </motion.button>
  );
}
