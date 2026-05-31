"use client";

import { useEffect, useState, useCallback } from "react";

import {
  Truck,
  Save,
  Package,
  Calendar,
  Building2,
  Hash,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Delivery = {
  id: string;
  product: string;
  supplier: string;
  batch: string;
  quantity: number;
  expiry: string;
  created_at: string;
};

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

function formatDateFR(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function isExpiringSoon(expiryStr: string): boolean {
  if (!expiryStr) return false;
  const expiry = new Date(expiryStr);
  const now = new Date();
  const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 3 && diff >= 0;
}

function isExpired(expiryStr: string): boolean {
  if (!expiryStr) return false;
  return new Date(expiryStr) < new Date();
}

// ─────────────────────────────────────────────
// TOAST COMPONENT
// ─────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-200" : "bg-red-500/20 border-red-500/40 text-red-200"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertTriangle size={16} className="shrink-0" />}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="opacity-60 hover:opacity-100 transition"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// DELIVERY ROW COMPONENT
// ─────────────────────────────────────────────

function DeliveryRow({ delivery, onDelete }: { delivery: Delivery; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const expired = isExpired(delivery.expiry);
  const expiringSoon = !expired && isExpiringSoon(delivery.expiry);

  return (
    <div className={`rounded-[20px] border transition-all ${expired ? "border-red-500/30 bg-gradient-to-r from-red-500/[0.08] to-red-900/5" : expiringSoon ? "border-orange-500/25 bg-gradient-to-r from-orange-500/[0.07] to-orange-900/5" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.03]"}`}>
      <div className="flex items-center justify-between gap-4 p-4">
        {/* Icon + info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${expired ? "bg-red-500/20 border border-red-500/30" : expiringSoon ? "bg-orange-500/20 border border-orange-500/30" : "bg-cyan-500/15 border border-cyan-500/20"}`}>
            <Truck size={16} className={expired ? "text-red-300" : expiringSoon ? "text-orange-300" : "text-cyan-300"} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-black text-sm break-words">{delivery.product || "—"}</h3>
              {expired && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold"><AlertTriangle size={8} /> EXPIRÉ</span>}
              {expiringSoon && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold"><Clock size={8} /> BIENTÔT</span>}
            </div>
            <p className="text-white/35 text-xs mt-0.5">{delivery.supplier || "—"} · Lot : {delivery.batch || "—"}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-white font-bold text-sm">Qté : {delivery.quantity || 0}</p>
            <p className="text-white/35 text-xs">DLC : {formatDateFR(delivery.expiry)}</p>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-white/25 hover:text-white/50 transition">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.05] pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[
              { label: "Produit", value: delivery.product },
              { label: "Fournisseur", value: delivery.supplier },
              { label: "Lot", value: delivery.batch },
              { label: "Quantité", value: delivery.quantity },
              { label: "DLC", value: formatDateFR(delivery.expiry) },
              { label: "Reçu le", value: formatDateFR(delivery.created_at) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                <p className="text-white/30 text-[10px] mb-1">{item.label}</p>
                <p className="text-white text-sm font-bold">{item.value || "—"}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onDelete(delivery.id)}
            className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition font-bold"
          >
            <X size={12} /> Supprimer cette livraison
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function DeliveriesPage() {

  // ── Form state ─────────────────────────────
  const [product, setProduct] = useState("");
  const [supplier, setSupplier] = useState("");
  const [batch, setBatch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");

  // ── Data state ─────────────────────────────
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── UI state ───────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [filterStatus, setFilterStatus] = useState<"all" | "expired" | "ok">("all");

  // ── Toasts ─────────────────────────────────
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = toastCounter + 1;
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [toastCounter]);

  // ── Fetch deliveries ───────────────────────
  const fetchDeliveries = useCallback(async () => {
    const { data, error } = await supabase
      .from("traceability_products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDeliveries(data);
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchDeliveries();
      setIsLoading(false);
    }
    init();
  }, [fetchDeliveries]);

  // ── Refresh ────────────────────────────────
  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchDeliveries();
    setIsRefreshing(false);
    addToast("Données actualisées", "success");
  }

  // ── Save delivery ──────────────────────────
  async function handleSave() {
    if (!product.trim()) { addToast("Veuillez saisir un produit", "error"); return; }
    if (!supplier.trim()) { addToast("Veuillez saisir un fournisseur", "error"); return; }
    if (!quantity || isNaN(Number(quantity))) { addToast("Quantité invalide", "error"); return; }

    setIsSaving(true);

    const { error } = await supabase
      .from("traceability_products")
      .insert({
        product: product.trim(),
        supplier: supplier.trim(),
        batch: batch.trim(),
        quantity: Number(quantity),
        expiry: expiry || null,
      });

    setIsSaving(false);

    if (error) {
      addToast(`Erreur : ${error.message}`, "error");
      return;
    }

    addToast(`Livraison enregistrée : ${product}`, "success");
    setProduct("");
    setSupplier("");
    setBatch("");
    setQuantity("");
    setExpiry("");
    await fetchDeliveries();
  }

  // ── Delete ─────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette livraison ?")) return;
    await supabase.from("traceability_products").delete().eq("id", id);
    await fetchDeliveries();
    addToast("Livraison supprimée", "success");
  }

  // ── Computed ───────────────────────────────
  const expiredCount = deliveries.filter((d) => isExpired(d.expiry)).length;
  const expiringSoonCount = deliveries.filter((d) => isExpiringSoon(d.expiry)).length;
  const todayCount = deliveries.filter((d) => {
    if (!d.created_at) return false;
    return new Date(d.created_at).toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
  }).length;

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterStatus === "expired") return isExpired(d.expiry);
    if (filterStatus === "ok") return !isExpired(d.expiry);
    return true;
  });

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="min-h-screen bg-[#020817] text-white p-5">
        <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

          {/* ── HEADER ─────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <p className="uppercase tracking-[0.32em] text-cyan-400 font-semibold text-xs">
                  DELIVERY MANAGEMENT
                </p>
              </div>
              <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">
                Livraisons
              </h1>
              <p className="text-white/40 text-base mt-2">
                Gestion intelligente des marchandises
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

            {/* Total */}
            <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-cyan-300 text-sm font-semibold">Livraisons enregistrées</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{deliveries.length}</h2>
                  <p className="text-cyan-400/50 text-xs mt-1">{todayCount} aujourd'hui</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                  <Truck size={20} className="text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Expirés */}
            <div className={`rounded-[24px] border p-5 ${expiredCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-red-300 text-sm font-semibold">DLC expirées</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{expiredCount}</h2>
                  {expiredCount > 0 && <p className="text-red-400/70 text-xs mt-1 font-bold">Action requise</p>}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20">
                  <AlertTriangle size={20} className={`text-red-300 ${expiredCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>

            {/* Bientôt */}
            <div className={`rounded-[24px] border p-5 ${expiringSoonCount > 0 ? "border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-orange-900/10" : "border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-900/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-orange-300 text-sm font-semibold">DLC dans 3 jours</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{expiringSoonCount}</h2>
                  {expiringSoonCount > 0 && <p className="text-orange-400/70 text-xs mt-1 font-bold">À surveiller</p>}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20">
                  <Clock size={20} className={`text-orange-300 ${expiringSoonCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>
          </div>

          {/* ── FORM ───────────────────────────────── */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                <Plus size={16} className="text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Enregistrer une livraison</h2>
                <p className="text-white/30 text-xs">Saisie de réception marchandise</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">

              {/* Product */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Produit *</label>
                <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                  <Package size={15} className="text-white/30 shrink-0" />
                  <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Nom du produit" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Fournisseur *</label>
                <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                  <Building2 size={15} className="text-white/30 shrink-0" />
                  <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Nom du fournisseur" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                </div>
              </div>

              {/* Batch */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Numéro de lot</label>
                <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                  <Hash size={15} className="text-white/30 shrink-0" />
                  <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Numéro de lot" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Quantité *</label>
                <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                  <Truck size={15} className="text-white/30 shrink-0" />
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantité reçue" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                </div>
              </div>

              {/* Expiry - full width */}
              <div className="xl:col-span-2">
                <label className="text-white/40 text-xs mb-1.5 block">Date DLC</label>
                <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                  <Calendar size={15} className="text-white/30 shrink-0" />
                  <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-transparent outline-none w-full text-sm text-white" />
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-4 w-full h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2"
            >
              {isSaving ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer la livraison</>}
            </button>
          </div>

          {/* ── DELIVERIES LIST ─────────────────────── */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <FileText size={15} className="text-white/40" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Historique des livraisons</h2>
                  <p className="text-white/30 text-xs">{filteredDeliveries.length} / {deliveries.length} livraisons</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                {(["all", "ok", "expired"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                      filterStatus === status
                        ? status === "expired" ? "bg-red-500/25 border-red-500/50 text-red-300"
                          : status === "ok" ? "bg-green-500/25 border-green-500/50 text-green-300"
                          : "bg-white/10 border-white/20 text-white"
                        : "bg-transparent border-white/10 text-white/35 hover:text-white/60"
                    }`}
                  >
                    {status === "all" ? "Toutes" : status === "ok" ? "✓ Valides" : "⚠ Expirées"}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-cyan-400" />
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="text-center py-12 text-white/25">
                <Truck size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Aucune livraison trouvée</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDeliveries.map((delivery) => (
                  <DeliveryRow key={delivery.id} delivery={delivery} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
