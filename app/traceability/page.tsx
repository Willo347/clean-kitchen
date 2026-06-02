"use client";

import { useEffect, useState, useCallback } from "react";

import {
  Calendar,
  FileText,
  Package,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  X,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileDown,
  Image as ImageIcon,
  Eye,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Product = {
  id: string;
  product: string;
  batch: string;
  expiry: string;
  supplier: string;
  quantity: number;
  image_url?: string;
  created_at: string;
};

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

function formatDateFR(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function getDLCStatus(expiry: string): "ok" | "soon" | "expired" | "none" {
  if (!expiry) return "none";
  const diffDays = Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "soon";
  return "ok";
}

function getDLCLabel(expiry: string): string {
  if (!expiry) return "—";
  const diffDays = Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "PÉRIMÉ";
  if (diffDays === 0) return "Expire aujourd'hui";
  if (diffDays <= 3) return `Dans ${diffDays} jour(s)`;
  return "OK";
}

// ─────────────────────────────────────────────
// IMAGE MODAL
// ─────────────────────────────────────────────

function ImageModal({ url, product, onClose }: { url: string; product: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold text-sm">{product}</p>
          <button onClick={onClose} className="text-white/60 hover:text-white transition flex items-center gap-2 text-sm font-bold">
            <X size={16} /> Fermer
          </button>
        </div>
        <img src={url} alt={product} className="w-full h-auto rounded-[24px] border border-white/10 shadow-2xl" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold transition">
          <Eye size={14} /> Ouvrir en plein écran
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCT ROW
// ─────────────────────────────────────────────

function ProductRow({ item }: { item: Product }) {
  const [expanded, setExpanded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const status = getDLCStatus(item.expiry);

  return (
    <>
      {showImage && item.image_url && (
        <ImageModal url={item.image_url} product={item.product} onClose={() => setShowImage(false)} />
      )}

      <div className={`rounded-[20px] border transition-all ${
        status === "expired" ? "border-red-500/30 bg-gradient-to-r from-red-500/[0.08] to-red-900/5"
        : status === "soon" ? "border-orange-500/25 bg-gradient-to-r from-orange-500/[0.07] to-orange-900/5"
        : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.03]"
      }`}>
        <div className="flex items-center justify-between gap-4 p-4">

          {/* Photo miniature ou icône */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {item.image_url ? (
              <button onClick={() => setShowImage(true)} className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-white/10 hover:border-violet-500/40 transition">
                <img src={item.image_url} alt={item.product} className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                status === "expired" ? "bg-red-500/20 border-red-500/30"
                : status === "soon" ? "bg-orange-500/20 border-orange-500/30"
                : "bg-cyan-500/15 border-cyan-500/20"
              }`}>
                <Package size={16} className={
                  status === "expired" ? "text-red-300"
                  : status === "soon" ? "text-orange-300"
                  : "text-cyan-300"
                } />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-black text-sm">{item.product || "—"}</h3>
                {item.image_url && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-300 text-[10px] font-bold">
                    <ImageIcon size={7} /> Photo
                  </span>
                )}
                {status === "expired" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold">
                    <AlertTriangle size={8} /> PÉRIMÉ
                  </span>
                )}
                {status === "soon" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold">
                    <Clock size={8} /> BIENTÔT
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-0.5">
                <span className="text-white/35 text-xs">Lot : <span className="text-white/55">{item.batch || "—"}</span></span>
                <span className="text-white/35 text-xs">Fournisseur : <span className="text-white/55">{item.supplier || "—"}</span></span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <p className={`text-xs font-bold ${
                status === "expired" ? "text-red-400"
                : status === "soon" ? "text-orange-400"
                : "text-green-400"
              }`}>
                {getDLCLabel(item.expiry)}
              </p>
              <p className="text-white/30 text-xs mt-0.5">DLC : {formatDateFR(item.expiry)}</p>
            </div>
            {item.image_url && (
              <button onClick={() => setShowImage(true)} className="h-8 w-8 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 flex items-center justify-center transition">
                <Eye size={13} />
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="text-white/25 hover:text-white/50 transition">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 space-y-3">

            {/* Photo */}
            {item.image_url && (
              <div className="rounded-2xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => setShowImage(true)}>
                <img src={item.image_url} alt={item.product} className="w-full max-h-40 object-contain bg-black/40" />
                <div className="px-3 py-2 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-white/30 text-xs flex items-center gap-1"><ImageIcon size={10} /> Photo étiquette</span>
                  <span className="text-violet-400 text-xs font-bold flex items-center gap-1"><Eye size={10} /> Agrandir</span>
                </div>
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Produit", value: item.product },
                { label: "Lot", value: item.batch },
                { label: "Fournisseur", value: item.supplier },
                { label: "DLC", value: formatDateFR(item.expiry) },
                { label: "Quantité", value: item.quantity },
                { label: "Enregistré le", value: formatDateFR(item.created_at) },
              ].map((field) => (
                <div key={field.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                  <p className="text-white/30 text-[10px] mb-1">{field.label}</p>
                  <p className="text-white text-sm font-bold">{field.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function TraceabilityPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "soon" | "expired">("all");

  const fetchProducts = useCallback(async () => {
    let query = supabase
      .from("traceability_products")
      .select("*")
      .order("created_at", { ascending: false });
    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate + "T23:59:59");
    const { data } = await query;
    if (data) setProducts(data);
  }, [startDate, endDate]);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchProducts();
      setIsLoading(false);
    }
    init();
  }, [fetchProducts]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
  }

  const filteredProducts = products.filter((item) => {
    const matchSearch = !search
      || (item.product || "").toLowerCase().includes(search.toLowerCase())
      || (item.supplier || "").toLowerCase().includes(search.toLowerCase());
    const status = getDLCStatus(item.expiry);
    const matchStatus = filterStatus === "all" ? true : status === filterStatus;
    return matchSearch && matchStatus;
  });

  const expiredCount = products.filter((p) => getDLCStatus(p.expiry) === "expired").length;
  const soonCount = products.filter((p) => getDLCStatus(p.expiry) === "soon").length;
  const okCount = products.filter((p) => getDLCStatus(p.expiry) === "ok").length;
  const withPhotoCount = products.filter((p) => p.image_url).length;

  // ── PDF Export ─────────────────────────────

  async function exportPDF() {
    setIsExporting(true);
    const doc = new jsPDF();

    doc.setFillColor(10, 20, 40);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(100, 220, 240);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Rapport Traçabilité HACCP", 14, 18);
    doc.setTextColor(180, 220, 240);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Période : ${startDate || "Début"} → ${endDate || "Aujourd'hui"}`, 14, 28);
    doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 34);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Résumé", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Total produits : ${filteredProducts.length}`, 14, 58);
    doc.text(`Avec photo : ${filteredProducts.filter((p) => p.image_url).length}`, 14, 64);
    doc.text(`Périmés : ${expiredCount}  |  Bientôt périmés : ${soonCount}`, 14, 70);

    autoTable(doc, {
      startY: 78,
      head: [["Produit", "Lot", "DLC", "Fournisseur", "Qté", "Photo", "Statut"]],
      body: filteredProducts.map((item) => {
        const status = getDLCStatus(item.expiry);
        return [
          item.product || "—",
          item.batch || "—",
          formatDateFR(item.expiry),
          item.supplier || "—",
          item.quantity || 0,
          item.image_url ? "✓ Oui" : "Non",
          status === "expired" ? "PÉRIMÉ" : status === "soon" ? "Bientôt périmé" : "OK",
        ];
      }),
      headStyles: { fillColor: [10, 40, 80], textColor: [100, 220, 240], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.cell.raw === "✓ Oui") {
          data.cell.styles.textColor = [100, 50, 200];
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 6) {
          if (data.cell.raw === "PÉRIMÉ") { data.cell.styles.textColor = [200, 50, 50]; data.cell.styles.fontStyle = "bold"; }
          if (data.cell.raw === "Bientôt périmé") { data.cell.styles.textColor = [200, 120, 30]; }
          if (data.cell.raw === "OK") { data.cell.styles.textColor = [30, 150, 80]; }
        }
      },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${pageCount} — Clean Kitchen HACCP`, 14, doc.internal.pageSize.height - 8);
    }

    doc.save(`Tracabilite_HACCP_${new Date().toISOString().slice(0, 10)}.pdf`);
    setIsExporting(false);
  }

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
              <p className="uppercase tracking-[0.32em] text-cyan-400 font-semibold text-xs">TRACEABILITY SYSTEM</p>
            </div>
            <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Traçabilité HACCP</h1>
            <p className="text-white/40 text-base mt-2">Suivi produits et conformité sanitaire</p>
          </div>
          <button onClick={handleRefresh} disabled={isRefreshing} className="mt-2 h-10 px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition flex items-center gap-2 text-sm font-bold disabled:opacity-50">
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* ── KPI CARDS ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-cyan-300 text-xs font-semibold">Produits tracés</p>
                <h2 className="text-[42px] font-black text-white leading-none mt-2">{products.length}</h2>
                <p className="text-cyan-400/50 text-xs mt-1">{withPhotoCount} avec photo 📷</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                <Package size={18} className="text-cyan-300" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-green-300 text-xs font-semibold">Conformes</p>
                <h2 className="text-[42px] font-black text-white leading-none mt-2">{okCount}</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20">
                <CheckCircle2 size={18} className="text-green-300" />
              </div>
            </div>
          </div>

          <div className={`rounded-[24px] border p-5 ${soonCount > 0 ? "border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-orange-900/10" : "border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-900/5"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-orange-300 text-xs font-semibold">Bientôt périmés</p>
                <h2 className="text-[42px] font-black text-white leading-none mt-2">{soonCount}</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20">
                <Clock size={18} className={`text-orange-300 ${soonCount > 0 ? "animate-pulse" : ""}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-[24px] border p-5 ${expiredCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-red-300 text-xs font-semibold">Périmés</p>
                <h2 className="text-[42px] font-black text-white leading-none mt-2">{expiredCount}</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20">
                <AlertTriangle size={18} className={`text-red-300 ${expiredCount > 0 ? "animate-pulse" : ""}`} />
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTERS + EXPORT ───────────────────── */}
        <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5">
          <div className="flex flex-col xl:flex-row gap-3 xl:items-end xl:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex-1">
                <label className="text-white/30 text-xs mb-1.5 block">Date début</label>
                <div className="flex items-center gap-2 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                  <Calendar size={14} className="text-white/30 shrink-0" />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent outline-none w-full text-sm text-white" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-white/30 text-xs mb-1.5 block">Date fin</label>
                <div className="flex items-center gap-2 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                  <Calendar size={14} className="text-white/30 shrink-0" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent outline-none w-full text-sm text-white" />
                </div>
              </div>
            </div>
            <button onClick={exportPDF} disabled={isExporting} className="h-11 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2 shrink-0">
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              Export PDF
            </button>
          </div>
        </div>

        {/* ── PRODUCT LIST ───────────────────────── */}
        <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <ShieldCheck size={16} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Historique traçabilité</h2>
                <p className="text-white/30 text-xs">{filteredProducts.length} / {products.length} produits · {withPhotoCount} avec photo</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 h-10 rounded-xl bg-white/[0.05] border border-white/10 px-3 min-w-[160px]">
                <Search size={13} className="text-white/30 shrink-0" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="bg-transparent outline-none w-full text-xs text-white placeholder:text-white/25" />
                {search && <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition"><X size={12} /></button>}
              </div>
              {(["all", "ok", "soon", "expired"] as const).map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${filterStatus === status ? status === "expired" ? "bg-red-500/25 border-red-500/50 text-red-300" : status === "soon" ? "bg-orange-500/25 border-orange-500/50 text-orange-300" : status === "ok" ? "bg-green-500/25 border-green-500/50 text-green-300" : "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/10 text-white/35 hover:text-white/60"}`}>
                  {status === "all" ? "Tous" : status === "ok" ? "✓ OK" : status === "soon" ? "⏱ Bientôt" : "⚠ Périmés"}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-cyan-400" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-white/25">
              <Package size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun produit trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((item) => (
                <ProductRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
