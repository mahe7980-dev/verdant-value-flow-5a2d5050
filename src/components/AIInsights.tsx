import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { generateSmartCopy } from '@/lib/category-benchmarks';
import { useSettings } from '@/lib/settings';
import type { Asset } from '@/lib/assets';
import { getDaysUsed, getDailyCost } from '@/lib/assets';

interface AIInsightsProps {
  asset: Asset;
}

const pillColors: Record<string, string> = {
  '新秀期': 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  '极高性价比': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  '无感消耗': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  '已回本': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  '最优区间': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  '成长中': 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function AIInsights({ asset }: AIInsightsProps) {
  const { currencySymbol, dailyIncome } = useSettings();
  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const { pill, copy } = generateSmartCopy(asset.name, asset.category, asset.price, days, currencySymbol);

  // Income-based consumption ratio copy
  let incomeCopy = '';
  if (dailyIncome > 0) {
    const ratio = (daily / dailyIncome) * 100;
    if (ratio < 5) {
      incomeCopy = `仅占日收入的 ${ratio.toFixed(1)}%，几乎无财务负担。`;
    } else if (ratio < 15) {
      incomeCopy = `约占日收入的 ${ratio.toFixed(1)}%，处于良性平衡状态。`;
    } else if (ratio < 25) {
      incomeCopy = `已占日收入的 ${ratio.toFixed(1)}%，建议审视现有利用率。`;
    } else {
      incomeCopy = `已达日收入的 ${ratio.toFixed(1)}%，建议保持理性消费。`;
    }
  }

  return (
    <motion.div
      className="flex items-start gap-2.5 px-1 py-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
    >
      <Sparkles size={13} className="text-primary mt-0.5 shrink-0" />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillColors[pill] || 'bg-secondary text-muted-foreground'}`}>
          {pill}
        </span>
        <span className="text-[12px] text-muted-foreground leading-relaxed">{copy}</span>
        {incomeCopy && (
          <span className="text-[12px] text-muted-foreground leading-relaxed">· {incomeCopy}</span>
        )}
      </div>
    </motion.div>
  );
}
