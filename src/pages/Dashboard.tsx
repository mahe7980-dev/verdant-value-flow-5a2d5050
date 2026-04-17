import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, TrendingDown } from "lucide-react";
import { getAssets, getTotalValue, getOverallDailyCost, AssetStatus, OWNERS, type Owner } from "@/lib/assets";
import { useSettings } from "@/lib/settings";
import AssetCard from "@/components/AssetCard";
import AssetListItem from "@/components/AssetListItem";
import AssetSticker from "@/components/AssetSticker";
import { motion, AnimatePresence } from "framer-motion";

type Filter = "all" | AssetStatus;
type OwnerFilter = "all" | Owner;

export default function Dashboard() {
  const assets = useMemo(() => getAssets(), []);
  const [filter, setFilter] = useState<Filter>("all");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const { formatPrice, formatDailyCost, durationSuffix, currencySymbol, settings } = useSettings();
  const viewMode = settings.viewMode;

  const total = getTotalValue(assets);
  const dailyCost = getOverallDailyCost(assets);

  const activeCount = assets.filter((a) => a.status === "active").length;
  const retiredCount = assets.filter((a) => a.status === "retired").length;
  const soldCount = assets.filter((a) => a.status === "sold").length;
  const totalCount = assets.length;

  const presentOwners = Array.from(new Set(assets.map(a => a.owner).filter(Boolean))) as Owner[];
  const ownerTabs: OwnerFilter[] = ["all", ...OWNERS.filter(o => presentOwners.includes(o))];
  const ownerLabel = (o: OwnerFilter) => (o === "all" ? "全部" : o);

  const filtered = assets.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (ownerFilter !== "all" && a.owner !== ownerFilter) return false;
    return true;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: totalCount },
    { key: "active", label: "服役中", count: activeCount },
    { key: "retired", label: "已退役", count: retiredCount },
    { key: "sold", label: "已卖出", count: soldCount },
  ];

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
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/10">
                <SlidersHorizontal size={16} strokeWidth={1.8} className="text-primary-foreground" />
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
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
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

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-muted-foreground text-sm">暂无资产</p>
          </div>
        )}
      </div>
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
