import { Trash2, Info, ChevronRight, DollarSign, Clock, Hash, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      className={`flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 ${destructive ? 'text-destructive' : 'text-foreground'}`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${iconBg}`}>
        {icon}
      </span>
      <span className="flex-1 text-left text-[15px] font-medium">{label}</span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      <ChevronRight size={16} className="text-muted-foreground/50" />
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 pt-6 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </p>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const handleReset = () => {
    if (confirm('确定要清除所有数据吗？')) {
      localStorage.removeItem('youshuu_assets');
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-background">
      <div className="px-6 pt-14">
        <h1 className="text-[28px] font-bold mb-2 text-foreground">设置</h1>
      </div>

      {/* 数值与单位 */}
      <SectionTitle>数值与单位</SectionTitle>
      <div className="mx-4 rounded-2xl bg-card card-shadow divide-y divide-border overflow-hidden">
        <SettingItem
          icon="💰"
          iconBg="bg-amber-100"
          label="货币单位"
          value="¥"
        />
        <SettingItem
          icon="⏱️"
          iconBg="bg-blue-100"
          label="服役时长单位"
          value="年"
        />
        <SettingItem
          icon="🔢"
          iconBg="bg-purple-100"
          label="小数点设置"
          value="保留 1 位"
        />
      </div>

      {/* 显示与外观 */}
      <SectionTitle>显示与外观</SectionTitle>
      <div className="mx-4 rounded-2xl bg-card card-shadow divide-y divide-border overflow-hidden">
        <SettingItem
          icon="🎨"
          iconBg="bg-pink-100"
          label="主题模式"
          value={
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card card-shadow"><Sun size={14} /></span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground"><Moon size={14} /></span>
            </div>
          }
        />
      </div>

      {/* 数据管理 */}
      <SectionTitle>数据管理</SectionTitle>
      <div className="mx-4 rounded-2xl bg-card card-shadow divide-y divide-border overflow-hidden">
        <SettingItem
          icon="📦"
          iconBg="bg-green-100"
          label="备份与恢复"
        />
        <SettingItem
          icon="🗑️"
          iconBg="bg-red-100"
          label="清除所有数据"
          onClick={handleReset}
          destructive
        />
      </div>

      {/* 关于 */}
      <SectionTitle>关于</SectionTitle>
      <div className="mx-4 rounded-2xl bg-card card-shadow divide-y divide-border overflow-hidden">
        <SettingItem
          icon="💡"
          iconBg="bg-yellow-100"
          label="关于有数"
          value="v1.0"
        />
      </div>

      <div className="h-8" />
    </div>
  );
}
