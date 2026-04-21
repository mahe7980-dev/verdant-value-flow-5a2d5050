/**
 * Category benchmarks for AI insight calculations.
 * lifespanYears: [min, max] expected useful life in years
 * residualRates: { year: rate } — estimated residual value as % of purchase price
 * avgDailyRental: rough average daily rental cost benchmark (CNY per 1000 CNY of price)
 */

export interface CategoryBenchmark {
  lifespanYears: [number, number];
  /** Residual value curve: key = year, value = fraction of original price retained */
  residualRates: Record<number, number>;
  /** Average daily rental rate per 1000 CNY of original price */
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

/** Get the "sweet spot" — the day when daily cost curve flattens most (marginal decrease < threshold) */
export function getSweetSpotDays(price: number, benchmark: CategoryBenchmark): number {
  const avgLifespanDays = ((benchmark.lifespanYears[0] + benchmark.lifespanYears[1]) / 2) * 365;
  // Sweet spot: where daily cost drop per additional day becomes < 0.5% of current daily cost
  // d/dd (price/d) = -price/d² → marginal gain = price/d² 
  // When price/d² < 0.005 * (price/d) → 1/d < 0.005 → d > 200
  // More practically: ~60-70% of avg lifespan is the sweet spot
  const sweetSpot = Math.round(avgLifespanDays * 0.65);
  return Math.max(180, sweetSpot); // at least 6 months
}

/** Calculate lifespan progress as a percentage */
export function getLifespanProgress(daysUsed: number, benchmark: CategoryBenchmark): number {
  const avgLifespanDays = ((benchmark.lifespanYears[0] + benchmark.lifespanYears[1]) / 2) * 365;
  return Math.min(100, (daysUsed / avgLifespanDays) * 100);
}

/** Target daily cost based on category rental benchmark */
export function getTargetDailyCost(price: number, benchmark: CategoryBenchmark): number {
  return (price / 1000) * benchmark.avgDailyRentalPer1k;
}

/** Days needed to reach target daily cost */
export function getDaysToTarget(price: number, benchmark: CategoryBenchmark): number {
  const target = getTargetDailyCost(price, benchmark);
  if (target <= 0) return 9999;
  return Math.ceil(price / target);
}

/** Has the asset reached the value milestone? */
export function hasReachedMilestone(price: number, daysUsed: number, benchmark: CategoryBenchmark): boolean {
  const targetDaily = getTargetDailyCost(price, benchmark);
  const currentDaily = price / daysUsed;
  return currentDaily <= targetDaily;
}

/** Generate smart AI copy */
export function generateInsightCopy(
  name: string,
  category: string,
  price: number,
  daysUsed: number,
  currencySymbol: string,
): string {
  const benchmark = getBenchmark(category);
  const dailyCost = price / daysUsed;
  const targetDaily = getTargetDailyCost(price, benchmark);
  const sweetSpot = getSweetSpotDays(price, benchmark);
  const reached = hasReachedMilestone(price, daysUsed, benchmark);
  const progress = getLifespanProgress(daysUsed, benchmark);

  if (reached) {
    return `🎉 你的${name}已使用 ${daysUsed} 天，日均成本 ${currencySymbol}${dailyCost.toFixed(1)} 已低于类目基准 ${currencySymbol}${targetDaily.toFixed(1)}，非常划算！继续持有让它更超值。`;
  }

  if (progress > 80) {
    return `⚡ ${name}已进入使用后期（${progress.toFixed(0)}% 寿命），日均 ${currencySymbol}${dailyCost.toFixed(1)}。如有换新计划可以开始关注了。`;
  }

  if (daysUsed > sweetSpot * 0.8) {
    return `✨ ${name}即将进入最佳持有区间，日均成本 ${currencySymbol}${dailyCost.toFixed(1)} 正趋于平稳，继续持有到 ${Math.ceil(sweetSpot / 365 * 10) / 10} 年最划算。`;
  }

  const daysLeft = Math.max(0, Math.ceil(price / targetDaily) - daysUsed);
  return `📊 ${name}已使用 ${daysUsed} 天，日均 ${currencySymbol}${dailyCost.toFixed(1)}。再持有约 ${daysLeft} 天可达到类目基准成本 ${currencySymbol}${targetDaily.toFixed(1)}/天。`;
}
