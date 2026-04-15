import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAssets, getDaysUsed, getDailyCost, getDepreciationCurve, STATUS_LABELS, getAssetEmoji } from '@/lib/assets';

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

  return (
    <div className="min-h-screen pb-28 bg-background">
      <div className="px-6 pt-14">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-foreground mb-6 group">
          <ArrowLeft size={20} strokeWidth={1.5} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm font-medium">返回</span>
        </button>

        {/* Hero */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <span className="text-3xl">{emoji}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{asset.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{asset.category} · {STATUS_LABELS[asset.status]}</p>
          </div>
        </div>

        {/* Daily cost highlight */}
        <div className="rounded-2xl bg-card card-shadow p-5 mb-4">
          <p className="text-xs text-muted-foreground mb-1 tracking-wide">日均成本</p>
          <div className="flex items-baseline justify-between">
            <p className="text-[32px] font-bold text-primary leading-none">¥{daily.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">已使用 {days} 天</p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl bg-card card-shadow p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-3 px-1">折旧曲线</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={curve}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145,45%,52%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(145,45%,52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(0,0%,56%)' }} tickFormatter={v => `${v}天`} stroke="hsl(0,0%,92%)" />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,56%)' }} tickFormatter={v => `¥${v}`} stroke="hsl(0,0%,92%)" width={50} />
              <Tooltip formatter={(v: number) => [`¥${v.toFixed(2)}`, '日均成本']} labelFormatter={l => `第${l}天`} />
              <Area type="monotone" dataKey="cost" stroke="hsl(145,45%,52%)" fill="url(#greenGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Info list */}
        <div className="rounded-2xl bg-card card-shadow divide-y divide-border">
          <InfoRow icon={DollarSign} label="价格" value={`¥${asset.price.toLocaleString()}`} />
          <InfoRow icon={Tag} label="类别" value={asset.category} />
          <InfoRow icon={Calendar} label="购买日期" value={asset.purchaseDate} />
          <InfoRow icon={Tag} label="状态" value={STATUS_LABELS[asset.status]} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-muted-foreground" strokeWidth={1.5} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
