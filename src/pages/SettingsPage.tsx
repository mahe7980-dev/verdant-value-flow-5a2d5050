import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen pb-28 px-5 pt-12">
      <h1 className="text-xl font-bold mb-6">设置</h1>

      <div className="rounded-3xl bg-card card-shadow divide-y divide-border">
        <div className="px-5 py-4">
          <p className="text-sm font-medium">关于有数</p>
          <p className="text-xs text-muted-foreground mt-1">一款极简资产折旧管理工具，帮你看清每件物品的真实成本。</p>
        </div>
        <button onClick={handleReset} className="flex w-full items-center gap-3 px-5 py-4 text-destructive">
          <Trash2 size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">清除所有数据</span>
        </button>
      </div>
    </div>
  );
}
