import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Calendar, LayoutGrid, DollarSign, FileText, User } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { addAsset, CATEGORIES, CATEGORY_EMOJI, OWNERS, type Owner } from '@/lib/assets';

const EMOJI_LIST = [
  '📱', '💻', '🖥️', '⌨️', '🖱️', '🎧', '📷', '📹', '🎮', '🕹️', '📺', '🔊', '⌚', '🔌', '💾', '🖨️', '📡', '🔋', '💡', '📻',
  '🧊', '🍳', '☕', '🧹', '🪥', '🧺', '🪣', '🚿', '🛁', '🌡️',
  '🪑', '🛋️', '🛏️', '🪵', '🪞', '🪟', '🚪', '🧸',
  '🚗', '🚲', '🛵', '🏍️', '🚌', '✈️', '🛴', '⛵',
  '👔', '👗', '👟', '👒', '🎒', '👜', '🧥', '👓', '💍', '👠',
  '⚽', '🏀', '🎾', '🏓', '⛳', '🎿', '🏄', '🚣', '🏋️', '🧘',
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-[28px] bg-card pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 mb-4">
          <button onClick={onClose} className="text-[14px] text-muted-foreground">取消</button>
          <span className="text-[15px] font-semibold text-foreground">选择图标</span>
          <button onClick={onClose} className="text-[14px] font-semibold text-primary">确定</button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 px-5 mb-4 overflow-x-auto no-scrollbar">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                tab === c ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="grid grid-cols-6 gap-1.5 px-5 max-h-[45vh] overflow-y-auto">
          {(EMOJI_CATEGORIES[tab] || EMOJI_LIST).map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => { onSelect(emoji); onClose(); }}
              className={`flex h-[52px] w-full items-center justify-center rounded-2xl text-2xl transition-all ${
                selected === emoji ? 'bg-accent ring-2 ring-primary scale-105' : 'bg-secondary/50 hover:bg-secondary active:scale-95'
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
  const { currencySymbol } = useSettings();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [owner, setOwner] = useState<Owner>('我的');
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
      owner,
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
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        <h2 className="text-[15px] font-semibold text-foreground">添加资产</h2>
        <div className="w-9" />
      </div>

      {/* Emoji + Name */}
      <div className="flex flex-col items-center pt-6 pb-5">
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="relative mb-4 group"
        >
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-accent text-[38px] transition-transform group-active:scale-95">
            {emoji}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card text-[11px] shadow-sm border border-border">
            ✏️
          </span>
        </button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="输入物品名称"
          className="text-center text-[16px] font-medium text-foreground placeholder:text-muted-foreground/40 bg-transparent outline-none w-60"
        />
      </div>

      {/* Form sections */}
      <div className="px-4 space-y-3 pb-32">
        {/* Price */}
        <div
          className="rounded-[18px] bg-card overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign size={15} className="text-amber-500" strokeWidth={2} />
            </span>
            <span className="text-[14px] font-medium text-foreground">价格（{currencySymbol}）</span>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-right text-[14px] text-foreground font-medium placeholder:text-muted-foreground/30 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Date + Category */}
        <div
          className="rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)' }}
        >
          <label className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Calendar size={15} className="text-blue-500" strokeWidth={2} />
            </span>
            <span className="flex-1 text-[14px] font-medium text-foreground">购买日期</span>
            <span className="text-[13px] text-muted-foreground">{formatDate(date)}</span>
            <ChevronRight size={14} className="text-muted-foreground/40" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="absolute opacity-0 w-0 h-0"
            />
          </label>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <LayoutGrid size={15} className="text-purple-500" strokeWidth={2} />
            </span>
            <span className="text-[14px] font-medium text-foreground">类别</span>
            <div className="flex-1 flex justify-end">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="text-[13px] text-muted-foreground bg-transparent outline-none appearance-none text-right pr-1 cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <ChevronRight size={14} className="text-muted-foreground/40" />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
              <User size={15} className="text-pink-500" strokeWidth={2} />
            </span>
            <span className="text-[14px] font-medium text-foreground">持有人</span>
            <div className="flex-1 flex justify-end">
              <select
                value={owner}
                onChange={e => setOwner(e.target.value as Owner)}
                className="text-[13px] text-muted-foreground bg-transparent outline-none appearance-none text-right pr-1 cursor-pointer"
              >
                {OWNERS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <ChevronRight size={14} className="text-muted-foreground/40" />
          </div>
        </div>

        {/* Notes */}
        <div
          className="rounded-[18px] bg-card overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-start gap-3 px-4 py-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent mt-0.5">
              <FileText size={15} className="text-primary" strokeWidth={2} />
            </span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="添加备注..."
              rows={3}
              className="flex-1 text-[14px] text-foreground placeholder:text-muted-foreground/35 bg-transparent outline-none resize-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full gradient-green text-primary-foreground px-16 py-3.5 text-[15px] font-semibold disabled:opacity-30 transition-all active:scale-95"
          style={{
            boxShadow: canSubmit ? '0 4px 16px rgba(76, 175, 80, 0.3)' : 'none',
          }}
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
