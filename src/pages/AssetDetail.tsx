import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAssets, getDaysUsed, getDailyCost, getDepreciationCurve, STATUS_LABELS } from '@/lib/assets';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assets = useMemo(() => getAssets(), []);
  const asset = assets.find(a => a.id === id);

  if (!asset) return <div className="p-8 text-center text-muted-foreground">资产不存在</div>;

  const days = getDaysUsed(asset.purchaseDate);
  const daily = getDailyCost(asset.price, asset.purchaseDate);
  const curve = getDepreciationCurve(asset.price, Math.max(days, 365));

  return (
    <div className="min-h-screen pb-28 px-5 pt-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground mb-4">
        <ArrowLeft size={18} strokeWidth={1.5} />
        <span className="text-sm">返回</span>
      </button>

      {/* Daily cost hero */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">日均成本</p>
        <p className="text-4xl font-bold text-primary mt-1">¥{daily.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">已使用 {days} 天</p>
      </div>

      {/* Chart */}
      <div className="rounded-3xl bg-card card-shadow p-4 mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={curve}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145,45%,52%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(145,45%,52%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={v => `${v}天`} stroke="hsl(220,10%,70%)" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `¥${v}`} stroke="hsl(220,10%,70%)" width={50} />
            <Tooltip formatter={(v: number) => [`¥${v.toFixed(2)}`, '日均成本']} labelFormatter={l => `第${l}天`} />
            <Area type="monotone" dataKey="cost" stroke="hsl(145,45%,52%)" fill="url(#greenGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info list */}
      <div className="rounded-3xl bg-card card-shadow divide-y divide-border">
        <InfoRow icon={DollarSign} label="价格" value={`¥${asset.price.toLocaleString()}`} />
        <InfoRow icon={Tag} label="类别" value={asset.category} />
        <InfoRow icon={Calendar} label="购买日期" value={asset.purchaseDate} />
        <InfoRow icon={Tag} label="状态" value={STATUS_LABELS[asset.status]} />
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
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
