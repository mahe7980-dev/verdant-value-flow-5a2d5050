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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5">
      {/* iOS 26 liquid glass tab bar */}
      <div
        className="flex items-center gap-1 px-1.5 py-1.5 rounded-[26px]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.3) 100%)',
          backdropFilter: 'saturate(200%) blur(40px)',
          WebkitBackdropFilter: 'saturate(200%) blur(40px)',
          boxShadow: `
            0 0 0 0.5px rgba(255,255,255,0.5),
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -0.5px 0 rgba(0,0,0,0.04),
            0 4px 16px rgba(0,0,0,0.08),
            0 12px 40px rgba(0,0,0,0.06)
          `,
        }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex items-center justify-center gap-1.5 transition-all"
              style={{
                padding: isActive ? '8px 18px' : '8px 14px',
                borderRadius: '20px',
                ...(isActive
                  ? {
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.45) 100%)',
                      boxShadow: `
                        0 0 0 0.5px rgba(255,255,255,0.6),
                        inset 0 1px 0 rgba(255,255,255,0.8),
                        0 2px 8px rgba(0,0,0,0.06)
                      `,
                    }
                  : {}),
              }}
            >
              <tab.icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={`transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground/60'
                }`}
              />
              {isActive && (
                <span className="text-[13px] font-semibold text-foreground leading-none">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add button */}
      <button
        onClick={() => navigate('/add')}
        className="flex h-[48px] w-[48px] items-center justify-center rounded-full transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.8) 100%)',
          backdropFilter: 'saturate(200%) blur(40px)',
          WebkitBackdropFilter: 'saturate(200%) blur(40px)',
          boxShadow: `
            0 0 0 0.5px rgba(255,255,255,0.12),
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 4px 16px rgba(0,0,0,0.12),
            0 8px 32px rgba(0,0,0,0.08)
          `,
        }}
      >
        <Plus size={20} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}
