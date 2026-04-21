/**
 * Category benchmarks for AI insight calculations.
 */

export interface CategoryBenchmark {
  lifespanYears: [number, number];
  residualRates: Record<number, number>;
  avgDailyRentalPer1k: number;
}

export const CATEGORY_BENCHMARKS: Record<string, CategoryBenchmark> = {
  '电子产品': {
    lifespanYears: [3, 5],
    residualRates: { 1: 0.65, 2: 0.45, 3: 0.30, 4: 0.18, 5: 0.10 },
    avgDailyRentalPer1k: 1.2,
  },
  '家电': {
    lifespanYears: [6, 10],
    residualRates: { 1: 0.80, 2: 0.70, 3: 0.60, 4: 0.50, 5: 0.40, 6: 0.30, 8: 0.15, 10: 0.05 },
    avgDailyRentalPer1k: 0.6,
  },
  '家具': {
    lifespanYears: [8, 15],
    residualRates: { 1: 0.85, 2: 0.75, 3: 0.65, 5: 0.50, 8: 0.30, 10: 0.20, 15: 0.08 },
    avgDailyRentalPer1k: 0.4,
  },
  '交通工具': {
    lifespanYears: [5, 10],
    residualRates: { 1: 0.75, 2: 0.60, 3: 0.50, 4: 0.42, 5: 0.35, 7: 0.22, 10: 0.10 },
    avgDailyRentalPer1k: 0.8,
  },
  '服饰': {
    lifespanYears: [1, 3],
    residualRates: { 1: 0.30, 2: 0.10, 3: 0.03 },
    avgDailyRentalPer1k: 2.5,
  },
  '包包': {
    lifespanYears: [3, 8],
    residualRates: { 1: 0.70, 2: 0.55, 3: 0.45, 5: 0.30, 8: 0.15 },
    avgDailyRentalPer1k: 1.0,
  },
  '运动': {
    lifespanYears: [2, 5],
    residualRates: { 1: 0.50, 2: 0.35, 3: 0.20, 5: 0.08 },
    avgDailyRentalPer1k: 1.5,
  },
  '其他': {
    lifespanYears: [3, 7],
    residualRates: { 1: 0.60, 2: 0.45, 3: 0.35, 5: 0.20, 7: 0.10 },
    avgDailyRentalPer1k: 1.0,
  },
};

export function getBenchmark(category: string): CategoryBenchmark {
  return CATEGORY_BENCHMARKS[category] || CATEGORY_BENCHMARKS['其他'];
}

export function getSweetSpotDays(price: number, benchmark: CategoryBenchmark): number {
  const avgLifespanDays = ((benchmark.lifespanYears[0] + benchmark.lifespanYears[1]) / 2) * 365;
  const sweetSpot = Math.round(avgLifespanDays * 0.65);
  return Math.max(180, sweetSpot);
}

export function getLifespanProgress(daysUsed: number, benchmark: CategoryBenchmark): number {
  const avgLifespanDays = ((benchmark.lifespanYears[0] + benchmark.lifespanYears[1]) / 2) * 365;
  return Math.min(100, (daysUsed / avgLifespanDays) * 100);
}

export function getTargetDailyCost(price: number, benchmark: CategoryBenchmark): number {
  return (price / 1000) * benchmark.avgDailyRentalPer1k;
}

export function getDaysToTarget(price: number, benchmark: CategoryBenchmark): number {
  const target = getTargetDailyCost(price, benchmark);
  if (target <= 0) return 9999;
  return Math.ceil(price / target);
}

export function hasReachedMilestone(price: number, daysUsed: number, benchmark: CategoryBenchmark): boolean {
  const targetDaily = getTargetDailyCost(price, benchmark);
  const currentDaily = price / daysUsed;
  return currentDaily <= targetDaily;
}

/** Determine the asset's scenario mode */
export type InsightMode = 'rookie' | 'veteran' | 'lowcost' | 'standard';

export function getInsightMode(price: number, daysUsed: number, benchmark: CategoryBenchmark): InsightMode {
  const dailyCost = price / daysUsed;
  // Low-cost: daily cost < 1 CNY regardless of age
  if (dailyCost < 1) return 'lowcost';
  // Rookie: < 90 days
  if (daysUsed < 90) return 'rookie';
  // Veteran: > 2 years
  if (daysUsed > 730) return 'veteran';
  return 'standard';
}

/** Generate contextual smart copy based on scenario mode */
export function generateSmartCopy(
  name: string,
  category: string,
  price: number,
  daysUsed: number,
  currencySymbol: string,
): { mode: InsightMode; pill: string; copy: string } {
  const benchmark = getBenchmark(category);
  const dailyCost = price / daysUsed;
  const targetDaily = getTargetDailyCost(price, benchmark);
  const sweetSpot = getSweetSpotDays(price, benchmark);
  const reached = hasReachedMilestone(price, daysUsed, benchmark);
  const mode = getInsightMode(price, daysUsed, benchmark);
  const avgLifespan = (benchmark.lifespanYears[0] + benchmark.lifespanYears[1]) / 2;

  switch (mode) {
    case 'rookie': {
      const daysToTarget = Math.max(0, getDaysToTarget(price, benchmark) - daysUsed);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysToTarget);
      const dateStr = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
      return {
        mode,
        pill: '新秀期',
        copy: `新成员还在"高溢价期"，坚持使用到 ${dateStr} 后，日均成本将降至 ${currencySymbol}${targetDaily.toFixed(1)}/天`,
      };
    }
    case 'veteran': {
      const years = (daysUsed / 365).toFixed(1);
      const lifespanMax = benchmark.lifespanYears[1];
      return {
        mode,
        pill: '极高性价比',
        copy: reached
          ? `已服役 ${years} 年，当前每一天都是"纯赚"，建议持有至 ${lifespanMax} 年寿命极限再退役`
          : `已服役 ${years} 年，日均 ${currencySymbol}${dailyCost.toFixed(1)} 正趋于极致性价比`,
      };
    }
    case 'lowcost': {
      return {
        mode,
        pill: '无感消耗',
        copy: `平均每天仅需 ${currencySymbol}${dailyCost.toFixed(2)}，几乎无感，不必过于关注成本波动`,
      };
    }
    default: {
      if (reached) {
        return {
          mode,
          pill: '已回本',
          copy: `已过价值回归点，日均 ${currencySymbol}${dailyCost.toFixed(1)} 低于类目基准，当前每一天都是"纯赚"`,
        };
      }
      const daysLeft = Math.max(0, getDaysToTarget(price, benchmark) - daysUsed);
      const sweetSpotLeft = Math.max(0, sweetSpot - daysUsed);
      if (sweetSpotLeft <= 0) {
        return {
          mode,
          pill: '最优区间',
          copy: `已进入最佳持有区间，日均成本 ${currencySymbol}${dailyCost.toFixed(1)} 趋于平稳，继续持有收益最大`,
        };
      }
      return {
        mode,
        pill: '成长中',
        copy: `再坚持约 ${daysLeft} 天，日均成本可降至类目基准 ${currencySymbol}${targetDaily.toFixed(1)}/天`,
      };
    }
  }
}

/** Get chart annotation data for the depreciation curve */
export interface ChartAnnotation {
  day: number;
  cost: number;
  label: string;
  type: 'target' | 'sweetspot' | 'current';
}

export function getChartAnnotations(
  price: number,
  daysUsed: number,
  category: string,
  currencySymbol: string,
): ChartAnnotation[] {
  const benchmark = getBenchmark(category);
  const targetDaily = getTargetDailyCost(price, benchmark);
  const daysToTarget = getDaysToTarget(price, benchmark);
  const sweetSpot = getSweetSpotDays(price, benchmark);
  const reached = hasReachedMilestone(price, daysUsed, benchmark);
  const annotations: ChartAnnotation[] = [];

  // Sweet spot annotation (only if not yet reached)
  if (daysUsed < sweetSpot) {
    annotations.push({
      day: sweetSpot,
      cost: +(price / sweetSpot).toFixed(1),
      label: `日均稳定区 ${currencySymbol}${(price / sweetSpot).toFixed(0)}/天`,
      type: 'sweetspot',
    });
  }

  // Target (value milestone) annotation
  if (!reached && daysToTarget > daysUsed) {
    annotations.push({
      day: daysToTarget,
      cost: +targetDaily.toFixed(1),
      label: `回本点 ${currencySymbol}${targetDaily.toFixed(0)}/天`,
      type: 'target',
    });
  }

  return annotations;
}
