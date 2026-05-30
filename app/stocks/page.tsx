"use client";

import { useEffect, useState, useCallback } from "react";

import {
  Package,
  Search,
  Plus,
  Minus,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ChevronRight,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Product = {
  id: string;
  product: string;
  supplier?: string;
  batch?: string;
  quantity: number;
  created_at?: string;
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function StocksPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "low">("all");

  // ── Fetch ──────────────────────────────────

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from("traceability_products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchProducts();
      setIsLoading(false);
    }
    init();
  }, [fetchProducts]);

  // ── Refresh ────────────────────────────────

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
  }

  // ── Update quantity ────────────────────────

  async function updateQuantity(id: string, currentQty: number, action: "plus" | "minus") {
    const newQty = action === "plus" ? currentQty + 1 : Math.max(0, currentQty - 1);
    setUpdatingId(id);
    await supabase
      .from("traceability_products")
      .update({ quantity: newQty })
      .eq("id", id);
    await fetchProducts();
    setUpdatingId(null);
  }

  // ── Filtered products ──────────────────────

  const filteredProducts = products
    .filter((item) => {
      const name = item.product || "Produit inconnu";
      const matchSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ? true
        : filterStatus === "low" ? (item.quantity || 0) <= 2
        : (item.quantity || 0) > 2;
      return matchSearch && matchStatus;
    });

  const lowStockCount = products.filter((p) => (p.quantity || 0) <= 2).length;
  const totalItems = products.reduce((acc, p) => acc + (p.quantity || 0), 0);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#020817] text-white p-5">
      <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

        {/* ── HEADER ─────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <p className="uppercase tracking-[0.32em] text-cyan-400 font-semibold text-xs">
                STOCK MANAGEMENT
              </p>
            </div>
            <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">
              Gestion Stock
            </h1>
            <p className="text-white/40 text-base mt-2">
              Contrôle rapide des marchandises
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-2 h-10 px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition flex items-center gap-2 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* ── KPI CARDS ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Total produits */}
          <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-cyan-300 text-sm font-semibold">Produits en stock</p>
                <h2 className="text-[48px] font-black text-white leading-none mt-3">
                  {products.length}
                </h2>
                <p className="text-cyan-400/50 text-xs mt-1">{totalItems} unités au total</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                <Boxes size={20} className="text-cyan-300" />
              </div>
            </div>
          </div>

          {/* Stock faible */}
          <div className={`rounded-[24px] border p-5 ${lowStockCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-red-300 text-sm font-semibold">Stock faible</p>
                <h2 className="text-[48px] font-black text-white leading-none mt-3">
                  {lowStockCount}
                </h2>
                {lowStockCount > 0 && <p className="text-red-400/70 text-xs mt-1 font-bold">Réapprovisionner</p>}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20">
                <TrendingDown size={20} className={`text-red-300 ${lowStockCount > 0 ? "animate-pulse" : ""}`} />
              </div>
            </div>
          </div>

          {/* OK */}
          <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-green-300 text-sm font-semibold">Stock OK</p>
                <h2 className="text-[48px] font-black text-white leading-none mt-3">
                  {products.length - lowStockCount}
                </h2>
                <p className="text-green-400/50 text-xs mt-1">niveaux corrects</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20">
                <CheckCircle2 size={20} className="text-green-300" />
              </div>
            </div>
          </div>
        </div>

        {/* ── SEARCH + FILTERS ───────────────────── */}
        <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-4">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="flex items-center gap-3 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 h-11">
              <Search size={15} className="text-white/30 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {(["all", "ok", "low"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition h-11 ${
                    filterStatus === status
                      ? status === "low" ? "bg-red-500/25 border-red-500/50 text-red-300"
                        : status === "ok" ? "bg-green-500/25 border-green-500/50 text-green-300"
                        : "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-white/10 text-white/35 hover:text-white/60"
                  }`}
                >
                  {status === "all" ? "Tous" : status === "ok" ? "✓ OK" : "⚠ Faible"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRODUCT LIST ───────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
            <Package size={36} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/30 text-sm">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((item) => {
              const isLow = (item.quantity || 0) <= 2;
              const isUpdating = updatingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`
                    rounded-[20px] border p-4 transition-all
                    ${isLow
                      ? "border-red-500/25 bg-gradient-to-r from-red-500/[0.08] to-red-900/5"
                      : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.03]"}
                  `}
                >
                  <div className="flex items-center justify-between gap-4">

                    {/* Product info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`
                        w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                        ${isLow ? "bg-red-500/20 border border-red-500/30" : "bg-cyan-500/15 border border-cyan-500/20"}
                      `}>
                        <Package size={16} className={isLow ? "text-red-300" : "text-cyan-300"} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-black text-base break-words">
                            {item.product || "Produit inconnu"}
                          </h3>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold shrink-0">
                              <AlertTriangle size={8} /> FAIBLE
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {item.supplier && (
                            <span className="text-white/35 text-xs">
                              Fournisseur : <span className="text-white/55">{item.supplier}</span>
                            </span>
                          )}
                          {item.batch && (
                            <span className="text-white/35 text-xs">
                              Lot : <span className="text-white/55">{item.batch}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 shrink-0">

                      {/* Minus */}
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity || 0, "minus")}
                        disabled={isUpdating || (item.quantity || 0) === 0}
                        className="w-10 h-10 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 flex items-center justify-center transition disabled:opacity-30 active:scale-95"
                      >
                        <Minus size={14} className="text-red-300" />
                      </button>

                      {/* Quantity display */}
                      <div className={`
                        w-16 h-10 rounded-xl flex items-center justify-center font-black text-lg border
                        ${isLow
                          ? "bg-red-500/15 border-red-500/25 text-red-300"
                          : "bg-cyan-500/15 border-cyan-500/20 text-cyan-300"}
                      `}>
                        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : (item.quantity || 0)}
                      </div>

                      {/* Plus */}
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity || 0, "plus")}
                        disabled={isUpdating}
                        className="w-10 h-10 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 flex items-center justify-center transition disabled:opacity-30 active:scale-95"
                      >
                        <Plus size={14} className="text-green-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FOOTER INFO ─────────────────────────── */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="flex items-center justify-between text-white/25 text-xs pt-2 border-t border-white/[0.04]">
            <span>{filteredProducts.length} produit(s) affiché(s)</span>
            {lowStockCount > 0 && (
              <span className="flex items-center gap-1 text-red-400/60">
                <AlertTriangle size={10} />
                {lowStockCount} produit(s) à réapprovisionner
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
