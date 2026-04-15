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
    <div className="min-h-screen px-5 pt-12 pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground mb-6">
        <ArrowLeft size={18} strokeWidth={1.5} />
        <span className="text-sm">返回</span>
      </button>

      <h1 className="text-xl font-bold mb-6">添加资产</h1>

      <div className="flex flex-col gap-4">
        {/* Name */}
        <div className="rounded-2xl bg-card card-shadow p-4">
          <label className="text-xs text-muted-foreground mb-1 block">名称</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：MacBook Pro"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Price */}
        <div className="rounded-2xl bg-card card-shadow p-4">
          <label className="text-xs text-muted-foreground mb-1 block">价格 (¥)</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Date */}
        <div className="rounded-2xl bg-card card-shadow p-4">
          <label className="text-xs text-muted-foreground mb-1 block">购买日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {/* Category */}
        <div className="rounded-2xl bg-card card-shadow p-4">
          <label className="text-xs text-muted-foreground mb-2 block">类别</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === c
                    ? 'gradient-green text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
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
          className="mt-4 w-full rounded-2xl gradient-green py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
        >
          添加
        </button>
      </div>
    </div>
  );
}
