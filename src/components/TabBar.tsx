import { Home, PieChart, Settings, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/analytics', icon: PieChart, label: '分析' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Watch body[data-sheet-open] so we hide the TabBar when any bottom sheet is open
  useEffect(() => {
    const update = () => setSheetOpen(document.body.dataset.sheetOpen === 'true');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-sheet-open'] });
    return () => observer.disconnect();
  }, []);

  // Track page scroll — collapse to corner buttons when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (pathname === '/add' || sheetOpen) return null;

  const ICON_SIZE = 44; // 44pt corner buttons
  const isActiveHome = pathname === '/';

  // Collapsed state — only Home (bottom-left) and Add (bottom-right), weakened
  if (scrolled) {
    return (
      <>
        <button
          onClick={() => navigate('/')}
          aria-label="首页"
          className="fixed z-50 flex items-center justify-center rounded-full overflow-hidden transition-all active:scale-95"
          style={{
            left: 20,
            bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)',
            height: ICON_SIZE,
            width: ICON_SIZE,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.35) 100%)',
            backdropFilter: 'saturate(180%) blur(40px)',
            WebkitBackdropFilter: 'saturate(180%) blur(40px)',
            opacity: 0.85,
            boxShadow: `
              inset 0 0.5px 0 rgba(255,255,255,0.6),
              0 0 0 0.33px rgba(0,0,0,0.06),
              0 4px 14px rgba(0,0,0,0.08)
            `,
          }}
        >
          <Home size={20} strokeWidth={2} className="text-foreground" />
        </button>

        <button
          onClick={() => navigate('/add')}
          aria-label="新增"
          className="fixed z-50 flex items-center justify-center rounded-full overflow-hidden transition-all active:scale-95"
          style={{
            right: 20,
            bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)',
            height: ICON_SIZE,
            width: ICON_SIZE,
            background: 'linear-gradient(180deg, rgba(30,30,30,0.55) 0%, rgba(10,10,10,0.7) 100%)',
            backdropFilter: 'saturate(180%) blur(40px)',
            WebkitBackdropFilter: 'saturate(180%) blur(40px)',
            opacity: 0.85,
            boxShadow: `
              inset 0 0.5px 0 rgba(255,255,255,0.12),
              0 0 0 0.33px rgba(255,255,255,0.06),
              0 4px 14px rgba(0,0,0,0.1)
            `,
          }}
        >
          <Plus size={20} className="text-white" strokeWidth={2.5} />
        </button>
      </>
    );
  }

  // Expanded state — full pill tab bar, 44pt high, arc design
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2"
      style={{ bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)' }}
    >
      <div
        className="relative flex items-center px-1 overflow-hidden"
        style={{
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.35) 100%)',
          backdropFilter: 'saturate(180%) blur(60px)',
          WebkitBackdropFilter: 'saturate(180%) blur(60px)',
          boxShadow: `
            inset 0 0.5px 0 0 rgba(255,255,255,0.6),
            inset 0 -0.5px 0 0 rgba(0,0,0,0.05),
            0 0 0 0.33px rgba(0,0,0,0.06),
            0 4px 16px rgba(0,0,0,0.08),
            0 12px 40px rgba(0,0,0,0.05)
          `,
        }}
      >
        {/* Specular top edge */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.6) 50%, transparent 90%)',
          }}
        />

        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex items-center justify-center gap-1.5 transition-all duration-300 ease-out h-9"
              style={{
                padding: isActive ? '0 16px' : '0 12px',
                borderRadius: 999,
                ...(isActive
                  ? {
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
                      boxShadow: `
                        inset 0 0.5px 0 rgba(255,255,255,0.7),
                        0 0 0 0.33px rgba(0,0,0,0.05),
                        0 1px 3px rgba(0,0,0,0.05)
                      `,
                    }
                  : {}),
              }}
            >
              <tab.icon
                size={18}
                strokeWidth={isActive ? 2 : 1.6}
                className={`transition-all duration-300 ${
                  isActive ? 'text-foreground' : 'text-foreground/45'
                }`}
              />
              {isActive && (
                <span className="text-[13px] font-semibold text-foreground leading-none whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-200">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floating add button — dark glass, matches 44pt height */}
      <button
        onClick={() => navigate('/add')}
        className="relative flex items-center justify-center rounded-full overflow-hidden transition-transform active:scale-95"
        style={{
          height: ICON_SIZE,
          width: ICON_SIZE,
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
