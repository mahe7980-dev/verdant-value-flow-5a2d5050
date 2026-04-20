import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, TrendingDown, X } from "lucide-react";
import { getAssets, getTotalValue, getOverallDailyCost, AssetStatus, getOwners, type Owner } from "@/lib/assets";
import { useSettings } from "@/lib/settings";
import AssetCard from "@/components/AssetCard";
import AssetListItem from "@/components/AssetListItem";
import AssetSticker from "@/components/AssetSticker";
import { motion, AnimatePresence } from "framer-motion";

type Filter = "all" | AssetStatus;
type OwnerFilter = "all" | Owner;
type CategoryFilter = "all" | string;

export default function Dashboard() {
  const assets = useMemo(() => getAssets(), []);
  const [filter, setFilter] = useState<Filter>("all");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const { formatPrice, formatDailyCost, durationSuffix, currencySymbol, settings } = useSettings();
  const viewMode = settings.viewMode;

  const total = getTotalValue(assets);
  const dailyCost = getOverallDailyCost(assets);

  const activeCount = assets.filter((a) => a.status === "active").length;
  const retiredCount = assets.filter((a) => a.status === "retired").length;
  const soldCount = assets.filter((a) => a.status === "sold").length;
  const totalCount = assets.length;

  const presentOwners = Array.from(new Set(assets.map(a => a.owner).filter(Boolean))) as Owner[];
  const knownOwners = getOwners();
  const orderedOwners = [
    ...knownOwners.filter(o => presentOwners.includes(o)),
    ...presentOwners.filter(o => !knownOwners.includes(o)),
  ];

  // Categories actually used by current assets, preserving first-seen order.
  const presentCategories = Array.from(
    new Set(assets.map(a => a.category).filter(Boolean))
  ) as string[];

  const filtered = assets.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (ownerFilter !== "all" && a.owner !== ownerFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    return true;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: totalCount },
    { key: "active", label: "服役中", count: activeCount },
    { key: "retired", label: "已退役", count: retiredCount },
    { key: "sold", label: "已卖出", count: soldCount },
  ];

  const activeFilterCount =
    (ownerFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen pb-28 bg-background">
      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 h-[320px] gradient-green"
          style={{
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        />

        <div className="relative px-6 pt-14 pb-5">
          <div className="flex items-center justify-between mb-0.5">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-primary-foreground leading-tight">有数</h1>
              <p className="text-[13px] text-primary-foreground/70 mt-0.5">长期主义，理性消费</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/10">
                <Search size={16} strokeWidth={1.8} className="text-primary-foreground" />
              </button>
              <button
                onClick={() => setShowFilterSheet(true)}
                className="relative h-9 w-9 flex items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/10"
              >
                <SlidersHorizontal size={16} strokeWidth={1.8} className="text-primary-foreground" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="relative px-5">
          <motion.div
            className="rounded-[20px] bg-card p-5 overflow-hidden"
            style={{
              boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="mb-5">
              <p className="text-[11px] text-muted-foreground mb-1 tracking-wider uppercase font-medium">总资产价值</p>
              <p className="text-[32px] font-bold text-foreground leading-none tracking-tight">
                {formatPrice(total)}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-5 bg-accent/60 rounded-xl px-3.5 py-2.5">
              <div className="h-8 w-8 rounded-lg gradient-green flex items-center justify-center">
                <TrendingDown size={14} className="text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-tight">日均成本</p>
                <p className="text-[17px] font-bold text-foreground leading-tight">
                  {`${currencySymbol}${dailyCost.toFixed(settings.decimalPlaces)}`}
                  <span className="text-[12px] font-normal text-muted-foreground">/天</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden flex">
                {activeCount > 0 && (
                  <div className="h-full bg-primary transition-all rounded-l-full" style={{ width: `${(activeCount / totalCount) * 100}%` }} />
                )}
                {retiredCount > 0 && (
                  <div className="h-full bg-muted-foreground/30 transition-all" style={{ width: `${(retiredCount / totalCount) * 100}%` }} />
                )}
                {soldCount > 0 && (
                  <div className="h-full bg-muted-foreground/15 transition-all rounded-r-full" style={{ width: `${(soldCount / totalCount) * 100}%` }} />
                )}
              </div>
              <div className="flex items-center justify-between">
                <StatusLabel label="服役中" count={activeCount} color="bg-primary" />
                <StatusLabel label="已退役" count={retiredCount} color="bg-muted-foreground/30" />
                <StatusLabel label="已卖出" count={soldCount} color="bg-muted-foreground/15" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-5">
        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            {ownerFilter !== "all" && (
              <ActiveChip label={`归属：${ownerFilter}`} onClear={() => setOwnerFilter("all")} />
            )}
            {categoryFilter !== "all" && (
              <ActiveChip label={`类别：${categoryFilter}`} onClear={() => setCategoryFilter("all")} />
            )}
            <button
              onClick={() => { setOwnerFilter("all"); setCategoryFilter("all"); }}
              className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              清除
            </button>
          </div>
        )}

        {/* Status filter */}
        <div className={`${activeFilterCount > 0 ? 'mt-3' : 'mt-6'} flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide`}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                filter === f.key
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`ml-1 text-[11px] ${filter === f.key ? "text-background/60" : "text-muted-foreground/60"}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Asset grid / list / sticker */}
        {viewMode === 'list' ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <AssetListItem asset={a} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : viewMode === 'sticker' ? (
          <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-3">
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: i * 0.03, duration: 0.25, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <AssetSticker asset={a} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <AssetCard asset={a} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-muted-foreground text-sm">暂无资产</p>
          </div>
        )}
      </div>

      {/* Filter bottom sheet */}
      <AnimatePresence>
        {showFilterSheet && (
          <FilterSheet
            owners={orderedOwners}
            categories={presentCategories}
            ownerFilter={ownerFilter}
            categoryFilter={categoryFilter}
            onChangeOwner={setOwnerFilter}
            onChangeCategory={setCategoryFilter}
            onReset={() => { setOwnerFilter("all"); setCategoryFilter("all"); }}
            onClose={() => setShowFilterSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusLabel({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-semibold text-foreground">{count}</span>
    </div>
  );
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      onClick={onClear}
      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium ring-1 ring-primary/20"
    >
      {label}
      <X size={10} strokeWidth={2.5} />
    </button>
  );
}

function FilterSheet({
  owners,
  categories,
  ownerFilter,
  categoryFilter,
  onChangeOwner,
  onChangeCategory,
  onReset,
  onClose,
}: {
  owners: Owner[];
  categories: string[];
  ownerFilter: OwnerFilter;
  categoryFilter: CategoryFilter;
  onChangeOwner: (v: OwnerFilter) => void;
  onChangeCategory: (v: CategoryFilter) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-t-[28px] bg-card pt-3 pb-8"
        onClick={e => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="flex items-center justify-between px-5 mb-5">
          <button onClick={onReset} className="text-[13px] text-muted-foreground hover:text-foreground">重置</button>
          <span className="text-[15px] font-semibold text-foreground">筛选</span>
          <button onClick={onClose} className="text-[13px] font-semibold text-primary">完成</button>
        </div>

        <div className="px-5 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Owner section */}
          <FilterSection
            title="归属"
            options={["all", ...owners] as OwnerFilter[]}
            value={ownerFilter}
            onChange={onChangeOwner}
            renderLabel={(v) => (v === "all" ? "全部" : v)}
            emptyHint="暂无归属"
          />

          {/* Category section */}
          <FilterSection
            title="类别"
            options={["all", ...categories] as CategoryFilter[]}
            value={categoryFilter}
            onChange={onChangeCategory}
            renderLabel={(v) => (v === "all" ? "全部" : v)}
            emptyHint="暂无类别"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function FilterSection<T extends string>({
  title,
  options,
  value,
  onChange,
  renderLabel,
  emptyHint,
}: {
  title: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => string;
  emptyHint: string;
}) {
  const hasItems = options.length > 1;
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground/70 tracking-wider uppercase mb-2.5">
        {title}
      </p>
      {hasItems ? (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                value === o
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {renderLabel(o)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground/60 py-1">{emptyHint}</p>
      )}
    </div>
  );
}
