import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { addAsset, CATEGORIES } from '@/lib/assets';

export default function AddAsset() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(CATEGORIES[0]);

  const canSubmit = name.trim() && parseFloat(price) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addAsset({ name: name.trim(), price: parseFloat(price), purchaseDate: date, status: 'active', category });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-14 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-foreground mb-6 group">
          <ArrowLeft size={20} strokeWidth={1.5} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm font-medium">返回</span>
        </button>

        <h1 className="text-[22px] font-bold mb-8 text-foreground">添加资产</h1>

        <div className="flex flex-col gap-3">
          {/* Name */}
          <div className="rounded-2xl bg-card card-shadow p-4">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">名称</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：MacBook Pro"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Price */}
          <div className="rounded-2xl bg-card card-shadow p-4">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">价格 (¥)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Date */}
          <div className="rounded-2xl bg-card card-shadow p-4">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">购买日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>

          {/* Category */}
          <div className="rounded-2xl bg-card card-shadow p-4">
            <label className="text-xs text-muted-foreground mb-2.5 block font-medium">类别</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-2 text-xs font-medium border transition-all ${
                    category === c
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-6 w-full rounded-2xl bg-foreground text-background py-4 text-sm font-semibold disabled:opacity-30 transition-all active:scale-[0.98]"
          >
            添加资产
          </button>
        </div>
      </div>
    </div>
  );
}
