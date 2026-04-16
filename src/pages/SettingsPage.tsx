import { Trash2, ChevronRight, Sun, Moon } from 'lucide-react';
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

const cardStyle = {
  boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
};

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
      <div className="px-6 pt-14 pb-2">
        <h1 className="text-[28px] font-bold text-foreground leading-tight">设置</h1>
      </div>

      {/* 数值与单位 */}
      <SectionTitle>数值与单位</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        <SettingItem icon="💰" iconBg="bg-amber-50" label="货币单位" value="¥" />
        <SettingItem icon="⏱️" iconBg="bg-blue-50" label="服役时长单位" value="年" />
        <SettingItem icon="🔢" iconBg="bg-purple-50" label="小数点设置" value="保留 1 位" />
      </div>

      {/* 显示与外观 */}
      <SectionTitle>显示与外观</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        <SettingItem
          icon="🎨"
          iconBg="bg-pink-50"
          label="主题模式"
          value={
            <div className="flex items-center gap-0.5 rounded-full bg-secondary p-0.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm"><Sun size={12} /></span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground"><Moon size={12} /></span>
            </div>
          }
        />
      </div>

      {/* 数据管理 */}
      <SectionTitle>数据管理</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        <SettingItem icon="📦" iconBg="bg-accent" label="备份与恢复" />
        <SettingItem
          icon="🗑️"
          iconBg="bg-red-50"
          label="清除所有数据"
          onClick={handleReset}
          destructive
        />
      </div>

      {/* 关于 */}
      <SectionTitle>关于</SectionTitle>
      <div className="mx-4 rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden" style={cardStyle}>
        <SettingItem icon="💡" iconBg="bg-yellow-50" label="关于有数" value="v1.0" />
      </div>
    </div>
  );
}
