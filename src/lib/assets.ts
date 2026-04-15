export type AssetStatus = 'active' | 'retired' | 'sold';

export interface Asset {
  id: string;
  name: string;
  price: number;
  purchaseDate: string; // ISO date
  status: AssetStatus;
  category: string;
}

const STORAGE_KEY = 'youshuu_assets';

const DEMO_ASSETS: Asset[] = [
  { id: '1', name: 'MacBook Pro 14"', price: 14999, purchaseDate: '2023-06-15', status: 'active', category: '电子产品' },
  { id: '2', name: 'AirPods Pro 2', price: 1899, purchaseDate: '2024-01-10', status: 'active', category: '电子产品' },
  { id: '3', name: 'Herman Miller 座椅', price: 8990, purchaseDate: '2022-11-01', status: 'active', category: '家具' },
  { id: '4', name: 'iPhone 15 Pro', price: 9999, purchaseDate: '2023-09-22', status: 'active', category: '电子产品' },
  { id: '5', name: 'Sony WH-1000XM5', price: 2499, purchaseDate: '2024-03-05', status: 'retired', category: '电子产品' },
];

export function getAssets(): Asset[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveAssets(DEMO_ASSETS);
    return DEMO_ASSETS;
  }
  return JSON.parse(raw);
}

export function saveAssets(assets: Asset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export function addAsset(asset: Omit<Asset, 'id'>) {
  const assets = getAssets();
  const newAsset: Asset = { ...asset, id: crypto.randomUUID() };
  assets.push(newAsset);
  saveAssets(assets);
  return newAsset;
}

export function deleteAsset(id: string) {
  const assets = getAssets().filter(a => a.id !== id);
  saveAssets(assets);
}

export function getDaysUsed(purchaseDate: string): number {
  const diff = Date.now() - new Date(purchaseDate).getTime();
  return Math.max(1, Math.floor(diff / 86400000));
}

export function getDailyCost(price: number, purchaseDate: string): number {
  return price / getDaysUsed(purchaseDate);
}

export function getTotalValue(assets: Asset[]): number {
  return assets.reduce((s, a) => s + a.price, 0);
}

export function getOverallDailyCost(assets: Asset[]): number {
  return assets.reduce((s, a) => s + getDailyCost(a.price, a.purchaseDate), 0);
}

export function getDepreciationCurve(price: number, maxDays: number) {
  const points: { day: number; cost: number }[] = [];
  const step = Math.max(1, Math.floor(maxDays / 60));
  for (let d = 1; d <= maxDays; d += step) {
    points.push({ day: d, cost: +(price / d).toFixed(2) });
  }
  // ensure last point
  if (points[points.length - 1]?.day !== maxDays) {
    points.push({ day: maxDays, cost: +(price / maxDays).toFixed(2) });
  }
  return points;
}

export const CATEGORIES = ['电子产品', '家具', '交通工具', '服饰', '运动', '其他'];

export const CATEGORY_EMOJI: Record<string, string> = {
  '电子产品': '📱',
  '家具': '🪑',
  '交通工具': '🚗',
  '服饰': '👔',
  '运动': '⚽',
  '其他': '📦',
};

// More specific emoji based on asset name keywords
const PRODUCT_EMOJI_RULES: [RegExp, string][] = [
  [/macbook|笔记本|laptop/i, '💻'],
  [/iphone|手机|phone|pixel/i, '📱'],
  [/ipad|平板|tablet/i, '📱'],
  [/airpods|耳机|headphone|wh-1000|buds/i, '🎧'],
  [/watch|手表/i, '⌚'],
  [/键盘|keyboard/i, '⌨️'],
  [/鼠标|mouse/i, '🖱️'],
  [/显示器|monitor|display/i, '🖥️'],
  [/相机|camera|sony a|canon|nikon/i, '📷'],
  [/switch|ps5|xbox|游戏/i, '🎮'],
  [/电视|tv/i, '📺'],
  [/音箱|speaker|homepod/i, '🔊'],
  [/充电|charger|电源/i, '🔌'],
  [/背包|包/i, '🎒'],
  [/自行车|单车|bike/i, '🚲'],
  [/椅|座椅|chair/i, '🪑'],
  [/桌|desk/i, '🪵'],
  [/鞋|shoe|sneaker/i, '👟'],
];

export function getAssetEmoji(name: string, category: string): string {
  for (const [pattern, emoji] of PRODUCT_EMOJI_RULES) {
    if (pattern.test(name)) return emoji;
  }
  return CATEGORY_EMOJI[category] || '📦';
}

export const STATUS_LABELS: Record<AssetStatus, string> = {
  active: '服役中',
  retired: '已退役',
  sold: '已卖出',
};
