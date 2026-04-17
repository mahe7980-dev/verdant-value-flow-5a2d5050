import { useState } from 'react';
import { ChevronRight, Sun, Moon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings, CURRENCY_MAP, DURATION_MAP, type CurrencyCode, type DurationUnit, type ViewMode } from '@/lib/settings';

interface SettingItemProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

function SettingItem({ icon, iconBg, label, value, onClick, destructive }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/30 ${destructive ? 'text-destructive' : 'text-foreground'}`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${iconBg}`}>
        {icon}
      </span>
      <span className="flex-1 text-left text-[14px] font-medium">{label}</span>
      {value && <span className="text-[13px] text-muted-foreground">{value}</span>}
      <ChevronRight size={14} className="text-muted-foreground/40" />
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 pt-7 pb-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
      {children}
    </p>
  );
}

// Reusable bottom sheet picker
function PickerSheet<T extends string>({
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  title: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-[28px] bg-card pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="flex items-center justify-between px-5 mb-4">
          <div className="w-12" />
          <span className="text-[15px] font-semibold text-foreground">{title}</span>
          <button onClick={onClose} className="text-[14px] font-semibold text-primary w-12 text-right">完成</button>
        </div>
        <div className="px-4 space-y-1">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSelect(opt.value); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${
                selected === opt.value ? 'bg-accent' : 'active:bg-muted/30'
              }`}
            >
              <span className="flex-1 text-left text-[15px] font-medium text-foreground">{opt.label}</span>
              {selected === opt.value && <Check size={18} className="text-primary" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
};

const currencyOptions: { value: CurrencyCode; label: string }[] = [
  { value: 'CNY', label: '🇨🇳 人民币 ¥' },
  { value: 'USD', label: '🇺🇸 美元 $' },
  { value: 'EUR', label: '🇪🇺 欧元 €' },
  { value: 'GBP', label: '🇬🇧 英镑 £' },
  { value: 'JPY', label: '🇯🇵 日元 ¥' },
  { value: 'HKD', label: '🇭🇰 港币 HK$' },
];

const durationOptions: { value: DurationUnit; label: string }[] = [
  { value: 'day', label: '天' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];

const decimalOptions: { value: string; label: string }[] = [
  { value: '0', label: '不保留小数' },
  { value: '1', label: '保留 1 位' },
  { value: '2', label: '保留 2 位' },
  { value: '3', label: '保留 3 位' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();

  const [picker, setPicker] = useState<'currency' | 'duration' | 'decimal' | null>(null);

  const handleReset = () => {
    if (confirm('确定要清除所有数据吗？')) {
      localStorage.removeItem('youshuu_assets');
      navigate('/');
      window.location.reload();
    }
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <div className="min-h-screen pb-28 bg-background">
      <div className="px-6 pt-14 pb-2">
        <h1 className="text-[28px] font-bold text-foreground leading-tight">设置</h1>
      </div>

      {/* 数值与单位 */}
      <SectionTitle>数值与单位</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        <SettingItem
          icon="💰"
          iconBg="bg-amber-50 dark:bg-amber-950/30"
          label="货币单位"
          value={CURRENCY_MAP[settings.currency].symbol}
          onClick={() => setPicker('currency')}
        />
        <SettingItem
          icon="⏱️"
          iconBg="bg-blue-50 dark:bg-blue-950/30"
          label="服役时长单位"
          value={DURATION_MAP[settings.durationUnit].label}
          onClick={() => setPicker('duration')}
        />
        <SettingItem
          icon="🔢"
          iconBg="bg-purple-50 dark:bg-purple-950/30"
          label="小数点设置"
          value={`保留 ${settings.decimalPlaces} 位`}
          onClick={() => setPicker('decimal')}
        />
      </div>

      {/* 显示与外观 */}
      <SectionTitle>显示与外观</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        {/* 视图模式分段选择器 */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base bg-emerald-50 dark:bg-emerald-950/30">
              🗂️
            </span>
            <span className="flex-1 text-left text-[14px] font-medium text-foreground">显示模式</span>
          </div>
          <div className="flex items-center gap-1 rounded-2xl bg-secondary p-1">
            {([
              { value: 'card', label: '卡片', icon: <LayoutGrid size={13} strokeWidth={2.2} /> },
              { value: 'list', label: '列表', icon: <List size={13} strokeWidth={2.2} /> },
              { value: 'sticker', label: '贴纸', icon: <Sparkles size={13} strokeWidth={2.2} /> },
            ] as { value: ViewMode; label: string; icon: React.ReactNode }[]).map(opt => (
              <button
                key={opt.value}
                onClick={() => updateSettings({ viewMode: opt.value })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12.5px] font-medium transition-all ${
                  settings.viewMode === opt.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/30"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base bg-pink-50 dark:bg-pink-950/30">
            🎨
          </span>
          <span className="flex-1 text-left text-[14px] font-medium text-foreground">主题模式</span>
          <div className="flex items-center gap-0.5 rounded-full bg-secondary p-0.5">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
              settings.theme === 'light' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
            }`}>
              <Sun size={14} />
            </span>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
              settings.theme === 'dark' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
            }`}>
              <Moon size={14} />
            </span>
          </div>
        </button>
      </div>

      {/* 数据管理 */}
      <SectionTitle>数据管理</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        <SettingItem icon="📦" iconBg="bg-accent" label="备份与恢复" />
        <SettingItem
          icon="🗑️"
          iconBg="bg-red-50 dark:bg-red-950/30"
          label="清除所有数据"
          onClick={handleReset}
          destructive
        />
      </div>

      {/* 关于 */}
      <SectionTitle>关于</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        <SettingItem icon="💡" iconBg="bg-yellow-50 dark:bg-yellow-950/30" label="关于有数" value="v1.0" />
      </div>

      {/* Pickers */}
      {picker === 'currency' && (
        <PickerSheet
          title="货币单位"
          options={currencyOptions}
          selected={settings.currency}
          onSelect={v => updateSettings({ currency: v })}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'duration' && (
        <PickerSheet
          title="服役时长单位"
          options={durationOptions}
          selected={settings.durationUnit}
          onSelect={v => updateSettings({ durationUnit: v })}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'decimal' && (
        <PickerSheet
          title="小数点设置"
          options={decimalOptions}
          selected={String(settings.decimalPlaces)}
          onSelect={v => updateSettings({ decimalPlaces: Number(v) })}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
