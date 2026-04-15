import { Home, BarChart3, Settings, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/analytics', icon: BarChart3, label: '分析' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === '/add') return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-full bg-card card-shadow px-3 py-2 border border-border/50">
        {tabs.map((tab, i) => {
          const isActive = pathname === tab.path;
          return (
            <div key={tab.path} className="flex items-center">
              {i === 1 && (
                <button
                  onClick={() => navigate('/add')}
                  className="mx-2 -mt-4 flex h-12 w-12 items-center justify-center rounded-full gradient-green shadow-lg"
                >
                  <Plus size={24} className="text-primary-foreground" strokeWidth={2.5} />
                </button>
              )}
              <button
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-2xl transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <tab.icon size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
