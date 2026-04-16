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
        className="relative flex items-center gap-0.5 px-1 py-1 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
          backdropFilter: 'saturate(180%) blur(60px)',
          WebkitBackdropFilter: 'saturate(180%) blur(60px)',
          boxShadow: `
            inset 0 0.5px 0 0 rgba(255,255,255,0.45),
            inset 0 -0.5px 0 0 rgba(0,0,0,0.05),
            0 0 0 0.33px rgba(255,255,255,0.25),
            0 0.5px 2px rgba(0,0,0,0.04),
            0 4px 16px rgba(0,0,0,0.06),
            0 12px 48px rgba(0,0,0,0.04)
          `,
        }}
      >
        {/* Top specular edge — simulates light refracting through glass */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.5) 50%, transparent 90%)',
          }}
        />

        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex items-center justify-center gap-1.5 transition-all duration-300 ease-out"
              style={{
                padding: isActive ? '10px 20px' : '10px 16px',
                borderRadius: '100px',
                ...(isActive
                  ? {
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.18) 100%)',
                      boxShadow: `
                        inset 0 0.5px 0 rgba(255,255,255,0.55),
                        0 0 0 0.33px rgba(255,255,255,0.2),
                        0 1px 4px rgba(0,0,0,0.04)
                      `,
                    }
                  : {}),
              }}
            >
              <tab.icon
                size={19}
                strokeWidth={isActive ? 2 : 1.5}
                className={`transition-all duration-300 ${
                  isActive ? 'text-foreground' : 'text-foreground/40'
                }`}
              />
              {isActive && (
                <span className="text-[13px] font-semibold text-foreground leading-none animate-in fade-in slide-in-from-left-1 duration-200">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floating add button — dark glass */}
      <button
        onClick={() => navigate('/add')}
        className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full overflow-hidden transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(180deg, rgba(30,30,30,0.7) 0%, rgba(10,10,10,0.85) 100%)',
          backdropFilter: 'saturate(180%) blur(60px)',
          WebkitBackdropFilter: 'saturate(180%) blur(60px)',
          boxShadow: `
            inset 0 0.5px 0 rgba(255,255,255,0.12),
            inset 0 -0.5px 0 rgba(0,0,0,0.2),
            0 0 0 0.33px rgba(255,255,255,0.08),
            0 4px 16px rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.06)
          `,
        }}
      >
        {/* Inner specular highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.15) 50%, transparent 80%)',
          }}
        />
        <Plus size={20} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}
