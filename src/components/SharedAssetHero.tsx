import { motion } from 'framer-motion';
import { Asset, getAssetEmoji, getDailyCost } from '@/lib/assets';

type SharedAssetHeroProps = {
  asset: Asset;
  variant: 'card' | 'detail';
};

const heroTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 32,
  mass: 0.95,
};

export default function SharedAssetHero({ asset, variant }: SharedAssetHeroProps) {
  const isDetail = variant === 'detail';
  const emoji = getAssetEmoji(asset.name, asset.category);
  const daily = getDailyCost(asset.price, asset.purchaseDate);

  return (
    <div className={`flex min-w-0 flex-1 flex-col items-start ${isDetail ? 'w-full' : ''}`}>
      <motion.div
        layout="position"
        transition={heroTransition}
        className={isDetail ? 'flex h-16 w-16 items-center justify-center rounded-2xl bg-accent' : 'flex h-11 w-11 items-center justify-center rounded-xl bg-accent'}
      >
        <span className={isDetail ? 'text-3xl' : 'text-xl'}>{emoji}</span>
      </motion.div>

      <motion.div
        layout="position"
        transition={heroTransition}
        className={isDetail ? 'mt-5 w-full text-[28px] font-bold leading-tight text-foreground' : 'mt-3 w-full truncate text-[13px] font-semibold leading-tight text-foreground'}
      >
        {asset.name}
      </motion.div>

      <motion.div
        layout="position"
        transition={heroTransition}
        className={isDetail ? 'mt-3 text-[32px] font-bold leading-none text-foreground' : 'mt-2.5 text-lg font-bold leading-none text-foreground'}
      >
        ¥{daily.toFixed(1)}
        <span className={isDetail ? 'text-base font-normal text-muted-foreground' : 'text-[11px] font-normal text-muted-foreground'}>
          /天
        </span>
      </motion.div>
    </div>
  );
}
