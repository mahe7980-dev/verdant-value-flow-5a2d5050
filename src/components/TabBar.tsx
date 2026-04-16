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
      {/* iOS 26 style liquid glass tab bar */}
      <div
        className="flex items-center rounded-[22px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 100%)',
          backdropFilter: 'saturate(200%) blur(30px)',
          WebkitBackdropFilter: 'saturate(200%) blur(30px)',
          boxShadow: `
            0 0 0 0.5px rgba(255,255,255,0.45),
            inset 0 0.5px 0 rgba(255,255,255,0.6),
            inset 0 -0.5px 0 rgba(0,0,0,0.05),
            0 2px 8px rgba(0,0,0,0.06),
            0 8px 32px rgba(0,0,0,0.1)
          `,
        }}
      >
        {/* Inner specular highlight layer */}
        <div
          className="flex items-center relative"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
            borderRadius: '22px',
          }}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center w-[52px] h-[52px] transition-all"
              >
                {isActive && (
                  <div
                    className="absolute inset-[6px] rounded-[14px]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
                      boxShadow: `
                        inset 0 0.5px 0 rgba(255,255,255,0.7),
                        0 1px 3px rgba(0,0,0,0.08)
                      `,
                    }}
                  />
                )}
                <tab.icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground/70'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Add button with matching glass effect */}
      <button
        onClick={() => navigate('/add')}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.55) 100%)',
          backdropFilter: 'saturate(200%) blur(30px)',
          WebkitBackdropFilter: 'saturate(200%) blur(30px)',
          boxShadow: `
            0 0 0 0.5px rgba(255,255,255,0.15),
            inset 0 0.5px 0 rgba(255,255,255,0.2),
            0 2px 8px rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.15)
          `,
        }}
      >
        <Plus size={22} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}
