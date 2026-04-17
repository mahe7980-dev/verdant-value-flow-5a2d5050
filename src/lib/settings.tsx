import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'HKD';
export type DurationUnit = 'day' | 'week' | 'month' | 'year';
export type ThemeMode = 'light' | 'dark';
export type ViewMode = 'card' | 'list' | 'sticker';

export interface AppSettings {
  currency: CurrencyCode;
  durationUnit: DurationUnit;
  decimalPlaces: number; // 0-3
  theme: ThemeMode;
  viewMode: ViewMode;
}

const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; label: string }> = {
  CNY: { symbol: '¥', label: '人民币 ¥' },
  USD: { symbol: '$', label: '美元 $' },
  EUR: { symbol: '€', label: '欧元 €' },
  GBP: { symbol: '£', label: '英镑 £' },
  JPY: { symbol: '¥', label: '日元 ¥' },
  HKD: { symbol: 'HK$', label: '港币 HK$' },
};

const DURATION_MAP: Record<DurationUnit, { label: string; shortLabel: string; divisor: number }> = {
  day:   { label: '天', shortLabel: '天', divisor: 1 },
  week:  { label: '周', shortLabel: '周', divisor: 7 },
  month: { label: '月', shortLabel: '月', divisor: 30.44 },
  year:  { label: '年', shortLabel: '年', divisor: 365.25 },
};

export { CURRENCY_MAP, DURATION_MAP };

const SETTINGS_KEY = 'youshuu_settings';

const defaultSettings: AppSettings = {
  currency: 'CNY',
  durationUnit: 'day',
  decimalPlaces: 1,
  theme: 'light',
  viewMode: 'card',
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  formatPrice: (price: number) => string;
  formatDailyCost: (dailyCost: number) => string;
  formatDuration: (days: number) => string;
  durationSuffix: string;
  currencySymbol: string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const currencySymbol = CURRENCY_MAP[settings.currency].symbol;
  const dp = settings.decimalPlaces;
  const durInfo = DURATION_MAP[settings.durationUnit];

  const formatPrice = useCallback((price: number) => {
    return `${currencySymbol}${price.toLocaleString('zh-CN', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
  }, [currencySymbol, dp]);

  // Cost in cards is ALWAYS shown as daily — duration unit only affects "已使用 X 天/月/年" display.
  const formatDailyCost = useCallback((dailyCost: number) => {
    return `${currencySymbol}${dailyCost.toFixed(dp)}`;
  }, [currencySymbol, dp]);

  const formatDuration = useCallback((days: number) => {
    const val = days / durInfo.divisor;
    const formatted = durInfo.divisor === 1 ? Math.floor(val).toString() : val.toFixed(1);
    return `${formatted} ${durInfo.label}`;
  }, [durInfo]);

  // Cost suffix always per-day; only the duration text follows the unit setting.
  const durationSuffix = '/天';

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatPrice, formatDailyCost, formatDuration, durationSuffix, currencySymbol }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
