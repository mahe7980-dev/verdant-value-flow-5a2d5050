import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Target, TrendingDown, Sparkles, X, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  getBenchmark,
  getLifespanProgress,
  getSweetSpotDays,
  getTargetDailyCost,
  getDaysToTarget,
  hasReachedMilestone,
  generateInsightCopy,
} from '@/lib/category-benchmarks';
import { useSettings } from '@/lib/settings';
import type { Asset } from '@/lib/assets';
import { getDaysUsed, getDailyCost } from '@/lib/assets';

interface AIInsightsProps {
  asset: Asset;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

interface ExplainModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

function ExplainModal({ title, content, onClose }: ExplainModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-full bg-secondary/80"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
          <p className="text-[15px] font-semibold text-foreground mb-2">{title}</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AIInsights({ asset }: AIInsightsProps) {
  const { currencySymbol } = useSettings();
  const [explainModal, setExplainModal] = useState<{ title: string; content: string } | null>(null);

  const days = getDaysUsed(asset.purchaseDate);
  const dailyCost = getDailyCost(asset.price, asset.purchaseDate);
  const benchmark = getBenchmark(asset.category);

  const lifespanProgress = getLifespanProgress(days, benchmark);
  const sweetSpotDays = getSweetSpotDays(asset.price, benchmark);
  const sweetSpotYears = (sweetSpotDays / 365).toFixed(1);
  const targetDaily = getTargetDailyCost(asset.price, benchmark);
  const daysToTarget = getDaysToTarget(asset.price, benchmark);
  const reached = hasReachedMilestone(asset.price, days, benchmark);

  const insightCopy = generateInsightCopy(asset.name, asset.category, asset.price, days, currencySymbol);

  const lifespanLabel = `${benchmark.lifespanYears[0]}-${benchmark.lifespanYears[1]} 年`;
  const progressPhase = lifespanProgress < 30 ? '早期' : lifespanProgress < 70 ? '中期' : lifespanProgress < 90 ? '后期' : '末期';

  return (
    <motion.div
      className="space-y-3"
      {...fadeUp}
      transition={{ delay: 0.2, duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Sparkles size={15} className="text-primary" />
        <span className="text-[13px] font-semibold text-foreground">AI 洞察</span>
      </div>

      {/* Smart copy card */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-accent to-secondary/60 p-4"
        style={{
          boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
        }}
      >
        <p className="text-[13px] text-foreground/80 leading-relaxed">{insightCopy}</p>
      </motion.div>

      {/* Three metric cards */}
      <div className="space-y-2.5">
        {/* 1. Lifespan estimation */}
        <MetricCard
          icon={<Timer size={16} className="text-primary" />}
          iconBg="bg-accent"
          title="预估使用寿命"
          value={lifespanLabel}
          badge={progressPhase}
          badgeVariant={lifespanProgress < 70 ? 'green' : lifespanProgress < 90 ? 'amber' : 'red'}
          onInfoClick={() => setExplainModal({
            title: '预估使用寿命',
            content: `基于「${asset.category}」类目的行业数据，该类物品的平均使用寿命为 ${lifespanLabel}。\n\n当前已使用 ${days} 天（约 ${(days / 365).toFixed(1)} 年），处于生命周期的「${progressPhase}」阶段（${lifespanProgress.toFixed(0)}%）。\n\n进度条显示的是当前使用时间占预估寿命中值的比例。`,
          })}
        >
          <div className="mt-2.5 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0</span>
              <span>当前 {(days / 365).toFixed(1)}年</span>
              <span>{benchmark.lifespanYears[1]}年</span>
            </div>
            <Progress value={lifespanProgress} className="h-2 bg-secondary" />
          </div>
        </MetricCard>

        {/* 2. Value milestone */}
        <MetricCard
          icon={<Target size={16} className={reached ? 'text-primary' : 'text-muted-foreground'} />}
          iconBg={reached ? 'bg-accent' : 'bg-secondary'}
          title="价值回归点"
          value={reached
            ? `已达成 🏅`
            : `还需 ${Math.max(0, daysToTarget - days)} 天`
          }
          badge={`目标 ${currencySymbol}${targetDaily.toFixed(1)}/天`}
          badgeVariant={reached ? 'green' : 'default'}
          onInfoClick={() => setExplainModal({
            title: '价值回归点',
            content: `「${asset.category}」类目的参考日均租赁成本约为每千元 ${currencySymbol}${benchmark.avgDailyRentalPer1k.toFixed(1)}/天。\n\n你的${asset.name}购入价 ${currencySymbol}${asset.price}，对应目标日成本为 ${currencySymbol}${targetDaily.toFixed(1)}/天。\n\n当前日均成本 ${currencySymbol}${dailyCost.toFixed(1)}/天，${reached ? '已低于目标，非常划算！' : `还需约 ${Math.max(0, daysToTarget - days)} 天达到目标。`}\n\n计算公式：目标日成本 = 价格 ÷ 1000 × 类目日租金系数`,
          })}
        >
          <div className="mt-2.5 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>当前 {currencySymbol}{dailyCost.toFixed(1)}</span>
              <span>目标 {currencySymbol}{targetDaily.toFixed(1)}</span>
            </div>
            <Progress
              value={Math.min(100, (targetDaily / dailyCost) * 100)}
              className="h-2 bg-secondary"
            />
          </div>
        </MetricCard>

        {/* 3. Sweet spot */}
        <MetricCard
          icon={<TrendingDown size={16} className="text-primary" />}
          iconBg="bg-accent"
          title="最佳持有时长"
          value={`${sweetSpotYears} 年`}
          badge={days >= sweetSpotDays ? '已达最优区间 ✨' : `还需 ${Math.max(0, sweetSpotDays - days)} 天`}
          badgeVariant={days >= sweetSpotDays ? 'green' : 'default'}
          onInfoClick={() => setExplainModal({
            title: '最佳持有时长',
            content: `最佳持有时长是日均成本曲线趋于平稳的拐点。在此之前，每多用一天成本下降明显；在此之后，继续持有的边际收益递减。\n\n对于「${asset.category}」类目，基于平均 ${lifespanLabel} 的使用寿命，最佳持有约 ${sweetSpotYears} 年（${sweetSpotDays} 天）。\n\n${days >= sweetSpotDays ? '你已超过最佳持有期，日均成本已非常平稳，继续使用性价比极高！' : `目前已用 ${days} 天，还需约 ${sweetSpotDays - days} 天进入最优区间。`}\n\n计算方式：约为预估寿命中值的 65%，且不少于 180 天。`,
          })}
        />
      </div>

      {/* Explain modal */}
      <AnimatePresence>
        {explainModal && (
          <ExplainModal
            title={explainModal.title}
            content={explainModal.content}
            onClose={() => setExplainModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  badge: string;
  badgeVariant?: 'green' | 'amber' | 'red' | 'default';
  onInfoClick: () => void;
  children?: React.ReactNode;
}

const badgeColors = {
  green: 'bg-accent text-accent-foreground',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  default: 'bg-secondary text-muted-foreground',
};

function MetricCard({ icon, iconBg, title, value, badge, badgeVariant = 'default', onInfoClick, children }: MetricCardProps) {
  return (
    <div
      className="rounded-2xl bg-background p-4"
      style={{
        boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground">{title}</span>
            <button
              onClick={onInfoClick}
              className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-secondary/80 transition-colors"
            >
              <Info size={10} className="text-muted-foreground/60" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[16px] font-bold text-foreground leading-tight">{value}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeColors[badgeVariant]}`}>
              {badge}
            </span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
