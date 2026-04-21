import { useState, useEffect } from 'react';
import { ChevronRight, Sun, Moon, Check, Eye, EyeOff } from 'lucide-react';
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
  const [draft, setDraft] = useState<T>(selected);

  const handleSave = () => {
    onSelect(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-[28px] bg-card pt-3 pb-6 animate-in slide-in-from-bottom duration-300 shadow-[0_-8px_40px_rgba(0,0,0,0.12)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
        </div>

        <h3 className="px-6 text-[17px] font-bold text-foreground mb-3">{title}</h3>

        {/* Tap-to-select list */}
        <div className="px-3 max-h-[60vh] overflow-y-auto">
          {options.map(opt => {
            const active = draft === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setDraft(opt.value)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-colors text-left ${
                  active ? 'bg-secondary' : 'active:bg-muted/40'
                }`}
              >
                <span className={`text-[15px] ${active ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                  {opt.label}
                </span>
                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action bar */}
        <div className="px-5 pt-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-[52px] rounded-full bg-secondary text-foreground text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            关闭
          </button>
          <button
            onClick={handleSave}
            className="flex-[1.2] h-[52px] rounded-full bg-foreground text-background text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            保存
          </button>
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

const viewModeOptions: { value: ViewMode; label: string }[] = [
  { value: 'card', label: '🗂️ 卡片' },
  { value: 'list', label: '📋 列表' },
  { value: 'sticker', label: '✨ 贴纸' },
];

const viewModeLabel: Record<ViewMode, string> = {
  card: '卡片',
  list: '列表',
  sticker: '贴纸',
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();

  const [picker, setPicker] = useState<'currency' | 'duration' | 'decimal' | 'viewMode' | null>(null);
  const [showIncome, setShowIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const { currencySymbol } = useSettings();

  // Hide global TabBar while a picker sheet is open
  useEffect(() => {
    if (picker) {
      document.body.dataset.sheetOpen = 'true';
    } else {
      delete document.body.dataset.sheetOpen;
    }
    return () => {
      delete document.body.dataset.sheetOpen;
    };
  }, [picker]);

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
        <SettingItem
          icon="🗂️"
          iconBg="bg-emerald-50 dark:bg-emerald-950/30"
          label="显示模式"
          value={viewModeLabel[settings.viewMode]}
          onClick={() => setPicker('viewMode')}
        />

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
      {picker === 'viewMode' && (
        <PickerSheet
          title="显示模式"
          options={viewModeOptions}
          selected={settings.viewMode}
          onSelect={v => updateSettings({ viewMode: v })}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
