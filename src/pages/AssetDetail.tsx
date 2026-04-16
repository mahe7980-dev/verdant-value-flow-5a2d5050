import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAssets, getDaysUsed, getDailyCost, getDepreciationCurve, deleteAsset, getAssetEmoji } from '@/lib/assets';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assets = useMemo(() => getAssets(), []);
  const asset = assets.find(a => a.id === id);

  if (!asset) return <div className="p-8 text-center text-muted-foreground">资产不存在</div>;

  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const curve = getDepreciationCurve(asset.price, Math.max(days, 365));
  const emoji = getAssetEmoji(asset.name, asset.category);
  const sharedTransition = { type: 'spring' as const, stiffness: 360, damping: 34, mass: 0.9 };

  const handleDelete = () => {
    deleteAsset(asset.id);
    navigate('/');
  };

  const purchaseDateFormatted = new Date(asset.purchaseDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-card overflow-y-auto pb-28"
      layoutRoot
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <motion.div
        layoutId={`asset-bg-${asset.id}`}
        className="absolute inset-0 bg-card"
        transition={sharedTransition}
      />
      {/* Top bar */}
      <div className="relative px-5 pt-14 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary"
        >
          <X size={20} strokeWidth={1.5} className="text-foreground" />
        </button>
        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary">
          <Pencil size={18} strokeWidth={1.5} className="text-foreground" />
        </button>
      </div>

      <div className="relative mt-6 mb-8 px-5">
        <motion.div
          layoutId={`asset-content-${asset.id}`}
          className="flex flex-col items-center will-change-transform"
          transition={sharedTransition}
          style={{ originX: 0, originY: 0 }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
            <span className="text-4xl">{emoji}</span>
          </div>
          <div className="mt-4 text-center text-[28px] font-bold leading-tight text-foreground">
            {asset.name}
          </div>
          <div className="mt-2 text-[32px] font-bold leading-none text-foreground">
            ¥{daily.toFixed(1)}
            <span className="text-base font-normal text-muted-foreground">/天</span>
          </div>
        </motion.div>
        <motion.p
          className="mt-2 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.08, duration: 0.2 }}
        >
          总价：¥{asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 1 })}
          <span className="mx-2">|</span>
          已使用 {days}天
        </motion.p>
      </div>

      <div className="relative px-5 space-y-3">
        {/* Chart card */}
        <motion.div
          className="rounded-2xl bg-card card-shadow p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <p className="text-sm font-semibold text-foreground mb-4">日均成本</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={curve}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145,45%,52%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(145,45%,52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'hsl(0,0%,56%)' }}
                tickFormatter={v => {
                  const d = new Date(asset.purchaseDate);
                  d.setDate(d.getDate() + v);
                  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                }}
                stroke="hsl(0,0%,92%)"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(0,0%,56%)' }}
                tickFormatter={v => v.toLocaleString()}
                stroke="hsl(0,0%,92%)"
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
                stroke="hsl(145,45%,52%)"
                fill="url(#greenGrad)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: 'hsl(145,45%,52%)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Info card */}
        <motion.div
          className="rounded-2xl bg-card card-shadow divide-y divide-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
        >
          <InfoRow label="价格" value={`¥${asset.price.toLocaleString('zh-CN', { minimumFractionDigits: 1 })}`} />
          <InfoRow label="类别" value={asset.category} />
          <InfoRow label="购买日期" value={purchaseDateFormatted} />
        </motion.div>

        {/* Delete button */}
        <motion.button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-card card-shadow py-4 text-foreground font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 size={18} strokeWidth={1.5} />
          <span>删除</span>
        </motion.button>
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
