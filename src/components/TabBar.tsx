import { Home, PieChart, Settings, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/analytics', icon: PieChart, label: '分析' },
  { path: '/settings', icon: Settings, label: '设置' },
];

const SPRING = { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.9 };
const ICON_SIZE = 54;

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [forceExpanded, setForceExpanded] = useState(false);

  useEffect(() => {
    const update = () => setSheetOpen(document.body.dataset.sheetOpen === 'true');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-sheet-open'] });
    return () => observer.disconnect();
  }, []);

  // Reset scroll-driven collapse on every route change so each page starts expanded.
  useEffect(() => {
    setScrolled(false);
    setForceExpanded(false);
  }, [pathname]);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Only collapse on the home page; other pages always keep the full TabBar visible.
      if (pathname !== '/') {
        setScrolled(false);
        return;
      }
      setScrolled(y > window.innerHeight * 0.6);
      if (Math.abs(y - lastY) > 2) setForceExpanded(false);
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (pathname === '/add' || pathname.startsWith('/edit/') || pathname.startsWith('/asset/') || sheetOpen) return null;

  const collapsed = scrolled && !forceExpanded;

  const handleHome = () => {
    if (collapsed) {
      // Collapsed: only expand TabBar, no scroll, no navigation.
      setForceExpanded(true);
      return;
    }
    // Expanded on home: no-op (no scroll, no navigate).
    if (pathname !== '/') navigate('/');
  };

  // Shared glass styles
  const lightGlass = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.32) 100%)',
    backdropFilter: 'saturate(180%) blur(60px)',
    WebkitBackdropFilter: 'saturate(180%) blur(60px)',
    boxShadow: `
      inset 0 0.5px 0 0 rgba(255,255,255,0.65),
      inset 0 -0.5px 0 0 rgba(0,0,0,0.05),
      0 0 0 0.33px rgba(0,0,0,0.06),
      0 4px 16px rgba(0,0,0,0.08),
      0 12px 40px rgba(0,0,0,0.05)
    `,
  } as const;

  const darkGlass = {
    background: 'linear-gradient(180deg, rgba(30,30,30,0.7) 0%, rgba(10,10,10,0.85) 100%)',
    backdropFilter: 'saturate(180%) blur(60px)',
    WebkitBackdropFilter: 'saturate(180%) blur(60px)',
    boxShadow: `
      inset 0 0.5px 0 rgba(255,255,255,0.14),
      inset 0 -0.5px 0 rgba(0,0,0,0.2),
      0 0 0 0.33px rgba(255,255,255,0.08),
      0 4px 16px rgba(0,0,0,0.12),
      0 8px 32px rgba(0,0,0,0.06)
    `,
  } as const;

  const SpecularEdge = (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[1px] rounded-full"
      style={{
        background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.65) 50%, transparent 90%)',
      }}
    />
  );

  return (
    <>
      {/* SVG goo filter for liquid merge effect */}
      <svg className="absolute -z-10 h-0 w-0" aria-hidden>
        <defs>
          <filter id="liquid-goo" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <LayoutGroup id="tabbar">
        <motion.div
          className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
          style={{ bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)' }}
        >
          {/* Goo container — children inside merge liquidly */}
          <div
            className="relative flex items-center pointer-events-auto"
            style={{
              filter: 'url(#liquid-goo)',
              // give the filter room so blurred edges aren't clipped
              padding: '12px 16px',
              margin: '-12px -16px',
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {!collapsed ? (
                <motion.div
                  key="pill"
                  layoutId="glass-pill"
                  className="relative flex items-center px-1 mr-2 overflow-hidden"
                  style={{
                    height: ICON_SIZE,
                    borderRadius: ICON_SIZE / 2,
                    ...lightGlass,
                  }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={SPRING}
                >
                  {SpecularEdge}
                  {tabs.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                      <motion.button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        whileTap={{ scale: 0.92 }}
                        className="relative flex items-center justify-center gap-1.5"
                        style={{
                          height: ICON_SIZE - 10,
                          padding: isActive ? '0 18px' : '0 14px',
                          borderRadius: 999,
                          ...(isActive
                            ? {
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.45) 100%)',
                                boxShadow: `
                                  inset 0 0.5px 0 rgba(255,255,255,0.75),
                                  0 0 0 0.33px rgba(0,0,0,0.05),
                                  0 1px 3px rgba(0,0,0,0.06)
                                `,
                              }
                            : {}),
                        }}
                      >
                        <tab.icon
                          size={20}
                          strokeWidth={isActive ? 2 : 1.6}
                          className={`transition-all duration-300 ${
                            isActive ? 'text-foreground' : 'text-foreground/45'
                          }`}
                        />
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[14px] font-semibold text-foreground leading-none whitespace-nowrap overflow-hidden"
                          >
                            {tab.label}
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.button
                  key="home-corner"
                  layoutId="glass-pill"
                  onClick={handleHome}
                  aria-label="首页"
                  whileTap={{ scale: 0.9 }}
                  className="relative flex items-center justify-center overflow-hidden mr-[200px]"
                  style={{
                    height: ICON_SIZE,
                    width: ICON_SIZE,
                    borderRadius: ICON_SIZE / 2,
                    ...lightGlass,
                    opacity: 0.9,
                  }}
                  transition={SPRING}
                >
                  {SpecularEdge}
                  <Home size={22} strokeWidth={2} className="text-foreground" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Add button — dark when expanded, weakened white-glass when collapsed */}
            <motion.button
              layout
              onClick={() => navigate('/add')}
              aria-label="新增"
              whileTap={{ scale: 0.9 }}
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                height: ICON_SIZE,
                width: ICON_SIZE,
                borderRadius: ICON_SIZE / 2,
                ...(collapsed ? lightGlass : darkGlass),
                opacity: collapsed ? 0.9 : 1,
              }}
              transition={SPRING}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
                style={{
                  background: collapsed
                    ? 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.65) 50%, transparent 90%)'
                    : 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%)',
                }}
              />
              <Plus
                size={22}
                strokeWidth={2.5}
                className={collapsed ? 'text-foreground' : 'text-white'}
              />
            </motion.button>
          </div>
        </motion.div>
      </LayoutGroup>
    </>
  );
}
