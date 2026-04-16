import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Globe, Calendar, LayoutGrid, Tag } from 'lucide-react';
import { addAsset, CATEGORIES, CATEGORY_EMOJI } from '@/lib/assets';

const EMOJI_LIST = [
  // 数码
  '📱', '💻', '🖥️', '⌨️', '🖱️', '🎧', '📷', '📹', '🎮', '🕹️', '📺', '🔊', '⌚', '🔌', '💾', '🖨️', '📡', '🔋', '💡', '📻',
  // 电器
  '🧊', '🍳', '☕', '🧹', '🪥', '🧺', '🪣', '🚿', '🛁', '🌡️',
  // 家具
  '🪑', '🛋️', '🛏️', '🪵', '🪞', '🪟', '🚪', '🧸',
  // 交通
  '🚗', '🚲', '🛵', '🏍️', '🚌', '✈️', '🛴', '⛵',
  // 服饰
  '👔', '👗', '👟', '👒', '🎒', '👜', '🧥', '👓', '💍', '👠',
  // 运动
  '⚽', '🏀', '🎾', '🏓', '⛳', '🎿', '🏄', '🚣', '🏋️', '🧘',
  // 其他
  '📦', '🎁', '🎵', '🎨', '📚', '🏠', '🔑', '🧰', '💊', '🪴',
];

const EMOJI_CATEGORIES: Record<string, string[]> = {
  '全部': EMOJI_LIST,
  '数码': ['📱', '💻', '🖥️', '⌨️', '🖱️', '🎧', '📷', '📹', '🎮', '🕹️', '📺', '🔊', '⌚', '🔌', '💾', '🖨️', '📡', '🔋', '💡', '📻'],
  '电器': ['🧊', '🍳', '☕', '🧹', '🪥', '🧺', '🪣', '🚿', '🛁', '🌡️'],
  '家具': ['🪑', '🛋️', '🛏️', '🪵', '🪞', '🪟', '🚪', '🧸'],
  '交通': ['🚗', '🚲', '🛵', '🏍️', '🚌', '✈️', '🛴', '⛵'],
  '包包': ['🎒', '👜', '💼', '🧳'],
  '服饰': ['👔', '👗', '👟', '👒', '🧥', '👓', '💍', '👠'],
  '运动': ['⚽', '🏀', '🎾', '🏓', '⛳', '🎿', '🏄', '🚣', '🏋️', '🧘'],
};

function EmojiPicker({ selected, onSelect, onClose }: { selected: string; onSelect: (e: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState('全部');
  const cats = Object.keys(EMOJI_CATEGORIES);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl bg-card pt-4 pb-8 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 mb-3">
          <button onClick={onClose} className="text-sm text-muted-foreground">取消</button>
          <div className="flex gap-1 rounded-full bg-muted p-0.5">
            <span className="rounded-full bg-card px-4 py-1.5 text-xs font-medium card-shadow">Emoji</span>
          </div>
          <button onClick={onClose} className="text-sm font-medium text-foreground">确定</button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                tab === c ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="grid grid-cols-6 gap-2 px-5 max-h-[50vh] overflow-y-auto">
          {(EMOJI_CATEGORIES[tab] || EMOJI_LIST).map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => { onSelect(emoji); onClose(); }}
              className={`flex h-14 w-full items-center justify-center rounded-2xl text-2xl transition-all ${
                selected === emoji ? 'bg-accent ring-2 ring-primary' : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AddAsset() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const canSubmit = name.trim() && parseFloat(price) > 0;

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    addAsset({
      name: name.trim(),
      emoji,
      price: parseFloat(price),
      purchaseDate: date,
      status: 'active',
      category,
      notes: notes.trim() || undefined,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card card-shadow"
        >
          <X size={18} strokeWidth={2} />
        </button>
        <h2 className="text-base font-semibold text-foreground">添加资产</h2>
        <div className="w-10" />
      </div>

      {/* Emoji + Name */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="relative mb-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-4xl">
            {emoji}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card card-shadow text-xs">
            ✏️
          </span>
        </button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="请输入物品名称"
          className="text-center text-base text-muted-foreground placeholder:text-muted-foreground/50 bg-transparent outline-none w-60"
        />
      </div>

      {/* Form sections */}
      <div className="px-4 space-y-3 pb-32">
        {/* Price */}
        <div className="rounded-2xl bg-card card-shadow overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Globe size={18} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-foreground">价格</span>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="请输入物品价格"
              className="flex-1 text-right text-[15px] text-muted-foreground placeholder:text-muted-foreground/40 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Date + Category */}
        <div className="rounded-2xl bg-card card-shadow divide-y divide-border overflow-hidden">
          <label className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
            <Calendar size={18} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="flex-1 text-[15px] font-medium text-foreground">购买日期</span>
            <span className="text-[15px] text-muted-foreground">{formatDate(date)}</span>
            <ChevronRight size={16} className="text-muted-foreground/50" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="absolute opacity-0 w-0 h-0"
            />
          </label>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <LayoutGrid size={18} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-foreground">类别</span>
            <div className="flex-1 flex justify-end">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="text-[15px] text-muted-foreground bg-transparent outline-none appearance-none text-right pr-1 cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/50" />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl bg-card card-shadow overflow-hidden">
          <div className="px-4 py-3.5">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="输入备注"
              rows={3}
              className="w-full text-[15px] text-foreground placeholder:text-muted-foreground/40 bg-transparent outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full bg-foreground text-background px-16 py-4 text-[15px] font-semibold disabled:opacity-30 transition-all active:scale-95 card-shadow"
        >
          保存
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          selected={emoji}
          onSelect={setEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
