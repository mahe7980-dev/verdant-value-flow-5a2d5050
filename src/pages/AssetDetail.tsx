import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { X, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  STATUS_LABELS,
  deleteAsset,
  getAssets,
  getDaysUsed,
  getDepreciationCurve,
} from '@/lib/assets';
import SharedAssetHero from '@/components/SharedAssetHero';

const STATUS_DOT: Record<string, string> = {
  active: 'bg-primary',
  retired: 'bg-muted-foreground',
  sold: 'bg-destructive/60',
};

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 32,
  mass: 0.95,
};

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isClosing, setIsClosing] = useState(false);
  const assets = useMemo(() => getAssets(), []);
  const asset = assets.find(a => a.id === id);

  if (!asset) return <div className="p-8 text-center text-muted-foreground">资产不存在</div>;

  const days = getDaysUsed(asset.purchaseDate);
  const curve = getDepreciationCurve(asset.price, Math.max(days, 365));
  const purchaseDateFormatted = new Date(asset.purchaseDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const hasBackground = Boolean((location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation);

  const handleClose = () => {
    if (isClosing) return;

    setIsClosing(true);
    window.setTimeout(() => {
      if (hasBackground) {
        navigate(-1);
        return;
      }

      navigate('/');
    }, 120);
  };

  const handleDelete = () => {
    deleteAsset(asset.id);
    navigate('/');
  };

  return (
    <motion.div
      className={hasBackground ? 'fixed inset-0 z-50' : 'min-h-screen bg-background'}
      initial={hasBackground ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={hasBackground ? { opacity: 0 } : undefined}
      transition={{ duration: 0.18 }}
    >
      {hasBackground ? (
        <motion.button
          type="button"
          aria-label="关闭详情"
          className="absolute inset-0 bg-foreground/10 backdrop-blur-[2px]"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        />
      ) : null}

      <div className={hasBackground ? 'relative z-10 h-full overflow-y-auto px-3 pt-3 pb-6' : 'pb-28'}>
        <div className={hasBackground ? 'mx-auto w-full max-w-[430px]' : 'px-5 pt-10'}>
          <motion.div
            className="mb-3 flex items-center justify-between px-2"
            initial={false}
            animate={isClosing ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
            transition={isClosing ? { duration: 0.1 } : { duration: 0.24, delay: 0.08 }}
          >
            <button
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
            >
              <X size={20} strokeWidth={1.5} className="text-foreground" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Pencil size={18} strokeWidth={1.5} className="text-foreground" />
            </button>
          </motion.div>

          <motion.div
            layoutId={`asset-card-${asset.id}`}
            className="overflow-hidden rounded-[32px] bg-card card-shadow"
            transition={sharedTransition}
            style={{ borderRadius: 32 }}
          >
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <SharedAssetHero asset={asset} variant="card" />
                <span className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[asset.status] || 'bg-muted-foreground'}`} />
                  <span className="text-[10px] font-medium text-muted-foreground">{STATUS_LABELS[asset.status]}</span>
                </span>
              </div>

              <span className="mt-1 block h-4 min-h-[16px] truncate text-[11px] leading-4 text-muted-foreground">
                ¥{asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} · {days} 天
              </span>

              <motion.div
                className="overflow-hidden"
                initial={false}
                animate={
                  isClosing
                    ? { opacity: 0, height: 0, marginTop: 0 }
                    : { opacity: 1, height: 'auto', marginTop: 20 }
                }
                transition={
                  isClosing
                    ? { duration: 0.12, ease: 'easeInOut' }
                    : { duration: 0.24, delay: 0.1, ease: 'easeOut' }
                }
              >
                <div className="border-t border-border pt-6">
                  <SharedAssetHero asset={asset} variant="display" />
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    总价：¥{asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 1 })}
                    <span className="mx-2">|</span>
                    已使用 {days}天
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="mt-3 space-y-3"
            initial={false}
            animate={isClosing ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={isClosing ? { duration: 0.12 } : { duration: 0.28, delay: 0.16 }}
          >
            <div className="rounded-2xl bg-card p-5 card-shadow">
              <p className="mb-4 text-sm font-semibold text-foreground">日均成本</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={curve}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(145 45% 52%)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(145 45% 52%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'hsl(0 0% 56%)' }}
                    tickFormatter={v => {
                      const d = new Date(asset.purchaseDate);
                      d.setDate(d.getDate() + v);
                      return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                    }}
                    stroke="hsl(0 0% 92%)"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(0 0% 56%)' }}
                    tickFormatter={v => v.toLocaleString()}
                    stroke="hsl(0 0% 92%)"
                    width={50}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [`¥${v.toFixed(1)}`, '日均成本']}
                    labelFormatter={l => `第${l}天`}
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(145 45% 52%)"
                    fill="url(#greenGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: 'hsl(145 45% 52%)', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="divide-y divide-border rounded-2xl bg-card card-shadow">
              <InfoRow label="价格" value={`¥${asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 1 })}`} />
              <InfoRow label="类别" value={asset.category} />
              <InfoRow label="购买日期" value={purchaseDateFormatted} />
            </div>

            <button
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-4 font-medium text-foreground card-shadow"
            >
              <Trash2 size={18} strokeWidth={1.5} />
              <span>删除</span>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
