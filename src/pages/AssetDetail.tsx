import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Pencil, Trash2, Calendar, Tag, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAssets, getDaysUsed, getDailyCost, getDepreciationCurve, deleteAsset, getAssetEmoji } from '@/lib/assets';
import { useSettings } from '@/lib/settings';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice, formatDailyCost, formatDuration, durationSuffix, currencySymbol } = useSettings();
  const assets = useMemo(() => getAssets(), []);
  const asset = assets.find(a => a.id === id);

  if (!asset) return <div className="p-8 text-center text-muted-foreground">资产不存在</div>;

  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const curve = getDepreciationCurve(asset.price, Math.max(days, 365));
  const emoji = asset.emoji || getAssetEmoji(asset.name, asset.category);

  const handleDelete = () => {
    if (confirm('确定要删除这个资产吗？')) {
      deleteAsset(asset.id);
      navigate('/');
    }
  };

  const purchaseDateFormatted = new Date(asset.purchaseDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      layoutId={`asset-bg-${asset.id}`}
      className="min-h-screen pb-28 bg-card"
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    >
      <div className="px-5 pt-14 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary/80"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-foreground" />
        </button>
        <button
          onClick={() => navigate(`/edit/${asset.id}`)}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary/80 active:scale-95 transition-transform"
          aria-label="编辑"
        >
          <Pencil size={15} strokeWidth={2} className="text-foreground" />
        </button>
      </div>

      <div className="flex flex-col items-center mt-8 mb-8 px-5">
        <motion.div
          layoutId={`asset-emoji-${asset.id}`}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-accent mb-4"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <span className="text-[36px]">{emoji}</span>
        </motion.div>
        <motion.h1
          layoutId={`asset-name-${asset.id}`}
          className="text-xl font-bold text-foreground text-center leading-tight"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {asset.name}
        </motion.h1>
        <motion.div
          layoutId={`asset-daily-${asset.id}`}
          className="mt-3"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <span className="text-[36px] font-bold text-foreground leading-none tracking-tight">
            {formatDailyCost(daily)}
          </span>
          <span className="text-sm font-normal text-muted-foreground ml-1">{durationSuffix}</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-3 mt-3"
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <span className="text-[13px] text-muted-foreground">{formatPrice(asset.price)}</span>
          <span className="h-3 w-px bg-border" />
          <span className="text-[13px] text-muted-foreground">已使用 {formatDuration(days)}</span>
        </motion.div>
      </div>

      <div className="px-5 space-y-3">
        <motion.div
          className="rounded-[18px] bg-background p-5"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
          }}
          {...fadeUp}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <p className="text-[13px] font-semibold text-foreground mb-4">成本趋势</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={curve}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145,45%,52%)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="hsl(145,45%,52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }}
                tickFormatter={v => {
                  const d = new Date(asset.purchaseDate);
                  d.setDate(d.getDate() + v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                stroke="transparent"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(0,0%,56%)' }}
                tickFormatter={v => `${currencySymbol}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                stroke="transparent"
                width={45}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${currencySymbol}${(v as number).toFixed(1)}`, '日均成本']}
                labelFormatter={l => `第${l}天`}
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  fontSize: 12,
                  padding: '8px 12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="hsl(145,45%,52%)"
                fill="url(#greenGrad)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(145,45%,52%)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="rounded-[18px] bg-background divide-y divide-border/60 overflow-hidden"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)',
          }}
          {...fadeUp}
          transition={{ delay: 0.25, duration: 0.35 }}
        >
          <InfoRow
            icon={<DollarSign size={15} className="text-primary" />}
            iconBg="bg-accent"
            label="购入价格"
            value={formatPrice(asset.price)}
          />
          <InfoRow
            icon={<Tag size={15} className="text-primary" />}
            iconBg="bg-accent"
            label="类别"
            value={asset.category}
          />
          <InfoRow
            icon={<Calendar size={15} className="text-primary" />}
            iconBg="bg-accent"
            label="购买日期"
            value={purchaseDateFormatted}
          />
        </motion.div>

        <motion.button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 rounded-[18px] bg-destructive/8 py-3.5 text-destructive text-[14px] font-medium transition-colors hover:bg-destructive/12"
          {...fadeUp}
          transition={{ delay: 0.35, duration: 0.35 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 size={16} strokeWidth={1.8} />
          <span>删除资产</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </span>
      <span className="flex-1 text-[14px] text-muted-foreground">{label}</span>
      <span className="text-[14px] font-medium text-foreground">{value}</span>
    </div>
  );
}
