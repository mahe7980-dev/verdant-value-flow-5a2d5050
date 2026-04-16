import { Asset, getAssetEmoji, getDailyCost } from '@/lib/assets';

type SharedAssetHeroProps = {
  asset: Asset;
  variant: 'card' | 'display';
};

export default function SharedAssetHero({ asset, variant }: SharedAssetHeroProps) {
  const emoji = getAssetEmoji(asset.name, asset.category);
  const daily = getDailyCost(asset.price, asset.purchaseDate);

  if (variant === 'display') {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
          <span className="text-4xl">{emoji}</span>
        </div>
        <div className="mt-4 text-[28px] font-bold leading-tight text-foreground">{asset.name}</div>
        <div className="mt-2 text-[32px] font-bold leading-none text-foreground">
          ¥{daily.toFixed(1)}
          <span className="text-base font-normal text-muted-foreground">/天</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-start">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
        <span className="text-xl">{emoji}</span>
      </div>
      <div className="mt-3 w-full truncate text-[13px] font-semibold leading-tight text-foreground">{asset.name}</div>
      <div className="mt-2.5 text-lg font-bold leading-none text-foreground">
        ¥{daily.toFixed(1)}
        <span className="text-[11px] font-normal text-muted-foreground">/天</span>
      </div>
    </div>
  );
}
