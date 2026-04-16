import { Home, PieChart, Settings, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/analytics', icon: PieChart, label: '分析' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === '/add') return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
      <div
        className="flex items-center rounded-full border border-white/20 shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            </button>
          );
        })}
      </div>
      <button
        onClick={() => navigate('/add')}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        <Plus size={22} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}
