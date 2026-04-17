import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, ChevronRight, Calendar, LayoutGrid, DollarSign, FileText, User, Plus } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import {
  addAsset,
  updateAsset,
  getAssetById,
  getAllCategories,
  addCustomCategory,
  getOwners,
  addOwner,
  EMOJI_TO_CATEGORY,
  CATEGORY_EMOJI,
  type Owner,
  type AssetStatus,
} from '@/lib/assets';

const EMOJI_CATEGORIES: Record<string, string[]> = {
  '数码': ['📱', '💻', '🖥️', '⌨️', '🖱️', '🎧', '📷', '📹', '🎮', '🕹️', '📺', '🔊', '⌚', '🔌', '💾', '🖨️', '📡', '🔋', '💡', '📻', '☎️', '📟', '📠', '💿', '📀'],
  '家电': ['🧊', '🍳', '☕', '🧹', '🪥', '🧺', '🪣', '🚿', '🛁', '🌡️', '🔥', '💨', '🧴', '🪒'],
  '家具': ['🪑', '🛋️', '🛏️', '🪵', '🪞', '🪟', '🚪', '🧸', '🖼️', '🕰️'],
  '交通': ['🚗', '🚙', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚐', '🛻', '🚚', '🚲', '🛵', '🏍️', '🛴', '✈️', '⛵', '🚤', '🛥️', '🛳️', '🚁'],
  '包包': ['🎒', '👜', '💼', '🧳', '👝', '👛'],
  '服饰': ['👔', '👕', '👖', '🧥', '🥾', '👗', '👚', '👟', '👞', '👠', '👒', '🎩', '🧢', '👓', '🕶️', '💍', '🧣', '🧤', '🧦'],
  '运动': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '⛳', '🥊', '🥋', '🎿', '🛷', '🏂', '🏄', '🚣', '🏋️', '🚴', '🤸', '🧘', '🏹'],
  '其他': ['📦', '🎁', '🎵', '🎨', '📚', '🏠', '🔑', '🧰', '💊', '🪴', '🎻', '🎸', '🥁', '🎹', '🎺', '✏️', '📒', '📓', '📕', '🖌️'],
};

const ALL_EMOJI = Object.values(EMOJI_CATEGORIES).flat();

function EmojiPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (e: string, category?: string) => void;
  onClose: () => void;
}) {
  const cats = ['全部', ...Object.keys(EMOJI_CATEGORIES)];
  const [tab, setTab] = useState('全部');

  const list = tab === '全部' ? ALL_EMOJI : (EMOJI_CATEGORIES[tab] || []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-[28px] bg-card pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="flex items-center justify-between px-5 mb-4">
          <button onClick={onClose} className="text-[14px] text-muted-foreground">取消</button>
          <span className="text-[15px] font-semibold text-foreground">选择图标</span>
          <button onClick={onClose} className="text-[14px] font-semibold text-primary">确定</button>
        </div>

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

        <div className="grid grid-cols-6 gap-1.5 px-5 max-h-[45vh] overflow-y-auto">
          {list.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => {
                onSelect(emoji, EMOJI_TO_CATEGORY[emoji]);
                onClose();
              }}
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

// ---------- Generic bottom-sheet picker for category & owner ----------
function ChoiceSheet({
  title,
  options,
  selected,
  onSelect,
  onAdd,
  addLabel,
  onClose,
}: {
  title: string;
  options: string[];
  selected?: string;
  onSelect: (v: string) => void;
  onAdd?: (name: string) => void;
  addLabel?: string;
  onClose: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const submitNew = () => {
    const t = draft.trim();
    if (t && onAdd) {
      onAdd(t);
      onSelect(t);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-[28px] bg-card pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="flex items-center justify-between px-5 mb-4">
          <button onClick={onClose} className="text-[14px] text-muted-foreground">取消</button>
          <span className="text-[15px] font-semibold text-foreground">{title}</span>
          <div className="w-10" />
        </div>

        <div className="px-5 max-h-[55vh] overflow-y-auto">
          {options.length === 0 && !adding && (
            <p className="text-center text-[13px] text-muted-foreground py-6">暂无选项，点击下方新增</p>
          )}

          <div className="space-y-1.5">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onSelect(opt); onClose(); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] transition-all ${
                  selected === opt
                    ? 'bg-accent text-foreground font-medium'
                    : 'bg-secondary/40 text-foreground hover:bg-secondary'
                }`}
              >
                <span>{opt}</span>
                {selected === opt && <span className="text-primary text-[13px]">✓</span>}
              </button>
            ))}
          </div>

          {onAdd && (
            <div className="mt-3">
              {adding ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/40">
                  <input
                    autoFocus
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitNew()}
                    placeholder={addLabel || '名称'}
                    className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50"
                  />
                  <button
                    onClick={submitNew}
                    disabled={!draft.trim()}
                    className="text-[13px] font-semibold text-primary disabled:opacity-30"
                  >
                    添加
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-dashed border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
                >
                  <Plus size={14} strokeWidth={2} />
                  {addLabel || '新增'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AddAsset() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEditMode = Boolean(editId);
  const { currencySymbol } = useSettings();

  // Load existing asset for edit mode
  const existing = isEditMode ? getAssetById(editId!) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '📦');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [date, setDate] = useState(existing?.purchaseDate ?? new Date().toISOString().slice(0, 10));
  const [status] = useState<AssetStatus>(existing?.status ?? 'active');
  const [categories, setCategories] = useState<string[]>(() => getAllCategories());
  const [category, setCategory] = useState(existing?.category ?? categories[0] ?? '其他');
  const [owners, setOwners] = useState<Owner[]>(() => getOwners());
  const [owner, setOwner] = useState<Owner | undefined>(existing?.owner);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showOwnerPicker, setShowOwnerPicker] = useState(false);

  // Edit mode: redirect home if asset not found
  useEffect(() => {
    if (isEditMode && !existing) navigate('/', { replace: true });
  }, [isEditMode, existing, navigate]);

  const canSubmit = name.trim() && parseFloat(price) > 0;

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      name: name.trim(),
      emoji,
      price: parseFloat(price),
      purchaseDate: date,
      status,
      category,
      owner: owner || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEditMode && editId) {
      updateAsset(editId, payload);
      navigate(`/asset/${editId}`);
    } else {
      addAsset(payload);
      navigate('/');
    }
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
        <h2 className="text-[15px] font-semibold text-foreground">{isEditMode ? '编辑资产' : '添加资产'}</h2>
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
            <DollarSign size={16} className="text-foreground/70" strokeWidth={1.75} />
            <span className="text-[14px] font-medium text-foreground">价格（{currencySymbol}）</span>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={e => {
                const v = e.target.value.replace(/[^\d.]/g, '');
                // allow only one dot
                const parts = v.split('.');
                const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : v;
                setPrice(cleaned);
              }}
              placeholder="0.00"
              className="flex-1 text-right text-[14px] text-foreground font-medium placeholder:text-muted-foreground/30 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Date + Category + Owner */}
        <div
          className="rounded-[18px] bg-card divide-y divide-border/60 overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)' }}
        >
          <label className="relative flex items-center gap-3 px-4 py-3.5 cursor-pointer">
            <Calendar size={16} className="text-foreground/70" strokeWidth={1.75} />
            <span className="flex-1 text-[14px] font-medium text-foreground">购买日期</span>
            <span className="text-[13px] text-muted-foreground">{formatDate(date)}</span>
            <ChevronRight size={14} className="text-muted-foreground/40" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="absolute opacity-0 inset-0 cursor-pointer"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowCatPicker(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary/40 transition-colors"
          >
            <LayoutGrid size={16} className="text-foreground/70" strokeWidth={1.75} />
            <span className="flex-1 text-[14px] font-medium text-foreground">类别</span>
            <span className="text-[13px] text-muted-foreground">{category}</span>
            <ChevronRight size={14} className="text-muted-foreground/40" />
          </button>

          <button
            type="button"
            onClick={() => setShowOwnerPicker(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary/40 transition-colors"
          >
            <User size={16} className="text-foreground/70" strokeWidth={1.75} />
            <span className="flex-1 text-[14px] font-medium text-foreground">归属人</span>
            <span className="text-[13px] text-muted-foreground">
              {owner || <span className="text-muted-foreground/50">未设置</span>}
            </span>
            <ChevronRight size={14} className="text-muted-foreground/40" />
          </button>
        </div>

        {/* Notes */}
        <div
          className="rounded-[18px] bg-card overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-start gap-3 px-4 py-3.5">
            <FileText size={16} className="text-foreground/70 mt-1" strokeWidth={1.75} />
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="添加备注..."
              rows={3}
              className="flex-1 text-[14px] text-foreground placeholder:text-muted-foreground/35 bg-transparent outline-none resize-none mt-0.5"
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

      {/* Emoji Picker — picking auto-selects matching category */}
      {showEmojiPicker && (
        <EmojiPicker
          selected={emoji}
          onSelect={(e, autoCat) => {
            setEmoji(e);
            if (autoCat && categories.includes(autoCat)) {
              setCategory(autoCat);
            }
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Category picker */}
      {showCatPicker && (
        <ChoiceSheet
          title="选择类别"
          options={categories}
          selected={category}
          onSelect={setCategory}
          onAdd={(name) => {
            addCustomCategory(name);
            const next = getAllCategories();
            setCategories(next);
            // If user hasn't picked a custom emoji, suggest the default for this new category.
            if (emoji === '📦' && CATEGORY_EMOJI[name]) {
              setEmoji(CATEGORY_EMOJI[name]);
            }
          }}
          addLabel="新增类别"
          onClose={() => setShowCatPicker(false)}
        />
      )}

      {/* Owner picker */}
      {showOwnerPicker && (
        <ChoiceSheet
          title="选择归属人"
          options={owners}
          selected={owner}
          onSelect={setOwner}
          onAdd={(name) => {
            addOwner(name);
            setOwners(getOwners());
          }}
          addLabel="新增归属人"
          onClose={() => setShowOwnerPicker(false)}
        />
      )}
    </div>
  );
}
