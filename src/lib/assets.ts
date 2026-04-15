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

export const STATUS_LABELS: Record<AssetStatus, string> = {
  active: '服役中',
  retired: '已退役',
  sold: '已卖出',
};
