"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import {
  Truck,
  Save,
  Package,
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
  Camera,
  Sparkles,
  ScanLine,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

type Category = {
  id: string;
  emoji: string;
  color: string;
  text: string;
};

const CATEGORIES: Category[] = [
  { id: "Viande",            emoji: "🥩", color: "border-red-500/30 bg-red-500/10",      text: "text-red-300" },
  { id: "Poisson",           emoji: "🐟", color: "border-blue-500/30 bg-blue-500/10",     text: "text-blue-300" },
  { id: "Fruits & Légumes",  emoji: "🥦", color: "border-green-500/30 bg-green-500/10",   text: "text-green-300" },
  { id: "Produits laitiers", emoji: "🧀", color: "border-yellow-500/30 bg-yellow-500/10", text: "text-yellow-300" },
  { id: "Épicerie",          emoji: "🛒", color: "border-cyan-500/30 bg-cyan-500/10",     text: "text-cyan-300" },
  { id: "Surgelés",          emoji: "❄️", color: "border-violet-500/30 bg-violet-500/10", text: "text-violet-300" },
];

function getCategoryInfo(categoryId: string): Category {
  return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[4];
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Delivery = {
  id: string;
  product: string;
  supplier: string;
  lot: string;
  quantity: number;
  dlc: string;
  category?: string;
  image_url?: string;
  created_at: string;
};

type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType; }

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

function formatDateFR(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function isExpiringSoon(dlc: string): boolean {
  if (!dlc) return false;
  const diff = (new Date(dlc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 3 && diff >= 0;
}

function isExpired(dlc: string): boolean {
  if (!dlc) return false;
  return new Date(dlc) < new Date();
}

// ─────────────────────────────────────────────
// TOAST
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
// CATEGORY PICKER MODAL
// ─────────────────────────────────────────────

function CategoryPickerModal({
  currentCategory,
  onSelect,
  onClose,
}: {
  currentCategory: string;
  onSelect: (cat: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#030b1d] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-white">Choisir une catégorie</h3>
            <p className="text-white/30 text-xs mt-0.5">Sélectionnez la catégorie du produit</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { onSelect(cat.id); onClose(); }}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                currentCategory === cat.id
                  ? `${cat.color} ring-2 ring-white/20`
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className={`text-sm font-bold leading-tight text-left ${currentCategory === cat.id ? cat.text : "text-white/60"}`}>
                {cat.id}
              </span>
              {currentCategory === cat.id && (
                <CheckCircle2 size={14} className="ml-auto shrink-0 text-white/60" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => { onSelect(""); onClose(); }}
          className="mt-3 w-full h-10 rounded-2xl border border-white/10 bg-white/[0.03] text-white/40 hover:text-white text-sm font-bold transition"
        >
          Sans catégorie
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// IMAGE MODAL
// ─────────────────────────────────────────────

function ImageModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/60 hover:text-white transition flex items-center gap-2 text-sm font-bold">
          <X size={16} /> Fermer
        </button>
        <img src={url} alt="Étiquette" className="w-full h-auto rounded-[24px] border border-white/10 shadow-2xl" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold transition">
          <Eye size={14} /> Ouvrir en plein écran
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DELIVERY ROW
// ─────────────────────────────────────────────

function DeliveryRow({ delivery, onDelete }: { delivery: Delivery; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const expired = isExpired(delivery.dlc);
  const expiringSoon = !expired && isExpiringSoon(delivery.dlc);
  const cat = delivery.category ? getCategoryInfo(delivery.category) : null;

  return (
    <>
      {showImage && delivery.image_url && (
        <ImageModal url={delivery.image_url} onClose={() => setShowImage(false)} />
      )}

      <div className={`rounded-[20px] border transition-all ${expired ? "border-red-500/30 bg-gradient-to-r from-red-500/[0.08] to-red-900/5" : expiringSoon ? "border-orange-500/25 bg-gradient-to-r from-orange-500/[0.07] to-orange-900/5" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.03]"}`}>
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">

            {delivery.image_url ? (
              <button onClick={() => setShowImage(true)} className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-white/10 hover:border-violet-500/40 transition">
                <img src={delivery.image_url} alt={delivery.product} className="w-full h-full object-cover" />
              </button>
            ) : cat ? (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${cat.color} text-xl`}>
                {cat.emoji}
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${expired ? "bg-red-500/20 border-red-500/30" : expiringSoon ? "bg-orange-500/20 border-orange-500/30" : "bg-cyan-500/15 border-cyan-500/20"}`}>
                <Truck size={16} className={expired ? "text-red-300" : expiringSoon ? "text-orange-300" : "text-cyan-300"} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-black text-sm">{delivery.product || "—"}</h3>
                {cat && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${cat.color} ${cat.text}`}>
                    {cat.emoji} {cat.id}
                  </span>
                )}
                {delivery.image_url && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-300 text-[10px] font-bold">
                    <ImageIcon size={7} /> Photo
                  </span>
                )}
                {expired && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold"><AlertTriangle size={8} /> EXPIRÉ</span>}
                {expiringSoon && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold"><Clock size={8} /> BIENTÔT</span>}
              </div>
              <div className="flex flex-wrap gap-3 mt-0.5">
                {delivery.supplier && <span className="text-white/35 text-xs">Fournisseur : <span className="text-white/55">{delivery.supplier}</span></span>}
                {delivery.lot && <span className="text-white/35 text-xs">Lot : <span className="text-white/55">{delivery.lot}</span></span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-white font-bold text-sm">Qté : {delivery.quantity || 0}</p>
              <p className="text-white/35 text-xs">DLC : {formatDateFR(delivery.dlc)}</p>
            </div>
            {delivery.image_url && (
              <button onClick={() => setShowImage(true)} className="h-8 w-8 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 flex items-center justify-center transition">
                <Eye size={13} />
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="text-white/25 hover:text-white/50 transition">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 space-y-3">
            {delivery.image_url && (
              <div className="rounded-2xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => setShowImage(true)}>
                <img src={delivery.image_url} alt={delivery.product} className="w-full max-h-48 object-contain bg-black/40" />
                <div className="p-2 flex items-center justify-between bg-white/[0.02]">
                  <span className="text-white/30 text-xs flex items-center gap-1"><ImageIcon size={10} /> Photo de l'étiquette</span>
                  <button onClick={() => setShowImage(true)} className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition flex items-center gap-1">
                    <Eye size={12} /> Agrandir
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Produit", value: delivery.product },
                { label: "Catégorie", value: delivery.category ? `${getCategoryInfo(delivery.category).emoji} ${delivery.category}` : "—" },
                { label: "Fournisseur", value: delivery.supplier },
                { label: "Lot", value: delivery.lot },
                { label: "DLC", value: formatDateFR(delivery.dlc) },
                { label: "Quantité", value: delivery.quantity },
                { label: "Reçu le", value: formatDateFR(delivery.created_at) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                  <p className="text-white/30 text-[10px] mb-1">{item.label}</p>
                  <p className="text-white text-sm font-bold">{item.value || "—"}</p>
                </div>
              ))}
            </div>
            <button onClick={() => onDelete(delivery.id)} className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition font-bold">
              <X size={12} /> Supprimer cette livraison
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function DeliveriesPage() {

  const [product, setProduct] = useState("");
  const [supplier, setSupplier] = useState("");
  const [lot, setLot] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dlc, setDlc] = useState("");
  const [category, setCategory] = useState("");

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [knownSuppliers, setKnownSuppliers] = useState<string[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [filterStatus, setFilterStatus] = useState<"all" | "expired" | "ok">("all");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = toastCounter + 1;
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [toastCounter]);

  const fetchDeliveries = useCallback(async () => {
    const { data } = await supabase
      .from("traceability_products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setDeliveries(data);
      const suppliers = [...new Set(
        data
          .map((d: Delivery) => d.supplier)
          .filter((s: string) => s && s.trim() !== "")
      )].sort() as string[];
      setKnownSuppliers(suppliers);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchDeliveries();
      setIsLoading(false);
    }
    init();
  }, [fetchDeliveries]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchDeliveries();
    setIsRefreshing(false);
    addToast("Données actualisées", "success");
  }

  // ── Upload photo ───────────────────────────

  async function uploadPhoto(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `livraison-${Date.now()}.${ext}`;
    setIsUploading(true);
    const { error } = await supabase.storage
      .from("traceability-images")
      .upload(fileName, file, { contentType: file.type });
    setIsUploading(false);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("traceability-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  // ── AI Scan ────────────────────────────────

  async function scanImage(file: File) {
    setIsScanning(true);
    setCapturedFile(file);
    setScanPreview(URL.createObjectURL(file));

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // ✅ Appel via route API (côté serveur) — plus de clé exposée côté client
      const response = await fetch("/api/scan-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType: file.type }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const parsed = await response.json();

      if (parsed.product) setProduct(parsed.product);
      if (parsed.supplier) setSupplier(parsed.supplier);
      if (parsed.lot) setLot(parsed.lot);
      if (parsed.quantity) setQuantity(String(parsed.quantity));
      if (parsed.dlc) setDlc(parsed.dlc);

      if (parsed.category && CATEGORIES.find((c) => c.id === parsed.category)) {
        setCategory(parsed.category);
      }

      addToast("✨ Étiquette analysée ! Vérifiez les champs.", "success");
      setActiveTab("manual");
      setTimeout(() => setShowCategoryPicker(true), 400);

    } catch {
      addToast("Erreur d'analyse — vérifiez la photo", "error");
    } finally {
      setIsScanning(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) scanImage(file);
    e.target.value = "";
  }

  // ── Save delivery ──────────────────────────

  async function handleSave() {
    if (!product.trim()) { addToast("Veuillez saisir un produit", "error"); return; }
    if (!supplier.trim()) { addToast("Veuillez saisir un fournisseur", "error"); return; }
    if (!quantity || isNaN(Number(quantity))) { addToast("Quantité invalide", "error"); return; }

    setIsSaving(true);
    let imageUrl = "";
    if (capturedFile) {
      try { imageUrl = await uploadPhoto(capturedFile); }
      catch { addToast("Erreur upload photo — livraison sauvegardée sans photo", "error"); }
    }

    const { error } = await supabase.from("traceability_products").insert({
      product: product.trim(),
      supplier: supplier.trim(),
      lot: lot.trim() || null,
      quantity: Number(quantity),
      dlc: dlc || null,
      category: category || null,
      image_url: imageUrl || null,
    });

    setIsSaving(false);
    if (error) { addToast(`Erreur : ${error.message}`, "error"); return; }
    addToast(`✅ Livraison enregistrée${category ? ` · ${getCategoryInfo(category).emoji} ${category}` : ""}`, "success");

    setProduct(""); setSupplier(""); setLot(""); setQuantity(""); setDlc(""); setCategory("");
    setScanPreview(null); setCapturedFile(null);
    await fetchDeliveries();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette livraison ?")) return;
    await supabase.from("traceability_products").delete().eq("id", id);
    await fetchDeliveries();
    addToast("Livraison supprimée", "success");
  }

  // ── Computed ───────────────────────────────

  const expiredCount = deliveries.filter((d) => isExpired(d.dlc)).length;
  const expiringSoonCount = deliveries.filter((d) => isExpiringSoon(d.dlc)).length;
  const todayCount = deliveries.filter((d) => {
    if (!d.created_at) return false;
    return new Date(d.created_at).toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
  }).length;
  const withPhotoCount = deliveries.filter((d) => d.image_url).length;

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterStatus === "expired") return isExpired(d.dlc);
    if (filterStatus === "ok") return !isExpired(d.dlc);
    return true;
  });

  const formComplete = product && supplier && quantity;
  const selectedCatInfo = category ? getCategoryInfo(category) : null;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />

      {showCategoryPicker && (
        <CategoryPickerModal
          currentCategory={category}
          onSelect={setCategory}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}

      <div className="min-h-screen bg-[#020817] text-white p-5">
        <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <p className="uppercase tracking-[0.32em] text-cyan-400 font-semibold text-xs">DELIVERY MANAGEMENT</p>
              </div>
              <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Livraisons</h1>
              <p className="text-white/40 text-base mt-2">Gestion intelligente des marchandises</p>
            </div>
            <button onClick={handleRefresh} disabled={isRefreshing} className="mt-2 h-10 px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition flex items-center gap-2 text-sm font-bold disabled:opacity-50">
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-cyan-300 text-xs font-semibold">Livraisons</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{deliveries.length}</h2>
                  <p className="text-cyan-400/50 text-xs mt-1">{todayCount} aujourd'hui</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                  <Truck size={18} className="text-cyan-300" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-violet-900/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-violet-300 text-xs font-semibold">Avec photo</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{withPhotoCount}</h2>
                  <p className="text-violet-400/50 text-xs mt-1">étiquettes scannées</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/20">
                  <ImageIcon size={18} className="text-violet-300" />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 ${expiredCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-red-300 text-xs font-semibold">DLC expirées</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{expiredCount}</h2>
                  {expiredCount > 0 && <p className="text-red-400/70 text-xs mt-1 font-bold">Action requise</p>}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20">
                  <AlertTriangle size={18} className={`text-red-300 ${expiredCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 ${expiringSoonCount > 0 ? "border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-orange-900/10" : "border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-900/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-orange-300 text-xs font-semibold">DLC dans 3 jours</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{expiringSoonCount}</h2>
                  {expiringSoonCount > 0 && <p className="text-orange-400/70 text-xs mt-1">À surveiller</p>}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20">
                  <Clock size={18} className={`text-orange-300 ${expiringSoonCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5 md:p-6">

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              <button onClick={() => setActiveTab("scan")} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition border ${activeTab === "scan" ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70"}`}>
                <Sparkles size={15} /> Scan IA
              </button>
              <button onClick={() => setActiveTab("manual")} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition border ${activeTab === "manual" ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70"}`}>
                <Plus size={15} /> {product || supplier ? "Vérifier les champs" : "Saisie manuelle"}
              </button>
            </div>

            {/* SCAN TAB */}
            {activeTab === "scan" && (
              <div className="rounded-[20px] border border-violet-500/20 bg-violet-500/[0.05] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/20">
                    <Sparkles size={18} className="text-violet-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Scan IA — Reconnaissance automatique</h3>
                    <p className="text-white/30 text-xs">Photo → formulaire rempli + choix de catégorie</p>
                  </div>
                </div>

                {scanPreview && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10">
                    <img src={scanPreview} alt="Scan" className="w-full max-h-52 object-contain bg-black/40" />
                    {isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                        <ScanLine size={36} className="text-violet-400 animate-pulse mb-2" />
                        <p className="text-white font-black text-sm">Analyse en cours...</p>
                        <p className="text-white/50 text-xs mt-1">L'IA lit l'étiquette 🤖</p>
                      </div>
                    )}
                    {!isScanning && (
                      <button onClick={() => { setScanPreview(null); setCapturedFile(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => cameraInputRef.current?.click()} disabled={isScanning} className="h-14 rounded-2xl border border-violet-500/30 bg-violet-500/15 hover:bg-violet-500/25 disabled:opacity-50 transition text-violet-300 font-black text-sm flex items-center justify-center gap-3">
                    {isScanning ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                    {isScanning ? "Analyse en cours..." : "📷 Prendre une photo"}
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 transition text-white/60 hover:text-white font-bold text-sm flex items-center justify-center gap-3">
                    <FileText size={20} /> Choisir un fichier
                  </button>
                </div>

                {(product || supplier) && !isScanning && (
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-300 text-xs font-bold mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} /> Champs détectés automatiquement
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {[
                        { label: "Produit", value: product },
                        { label: "Fournisseur", value: supplier },
                        { label: "Lot", value: lot },
                        { label: "DLC", value: dlc },
                      ].filter((f) => f.value).map((f) => (
                        <div key={f.label} className="text-xs">
                          <span className="text-white/40">{f.label} : </span>
                          <span className="text-white font-bold">{f.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setShowCategoryPicker(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${selectedCatInfo ? `${selectedCatInfo.color} ${selectedCatInfo.text}` : "border-white/20 bg-white/[0.05] text-white/50 hover:text-white"}`}>
                        {selectedCatInfo ? `${selectedCatInfo.emoji} ${selectedCatInfo.id}` : "🏷️ Choisir une catégorie"}
                      </button>
                      <button onClick={() => setActiveTab("manual")} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition">
                        Vérifier et enregistrer →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MANUAL TAB */}
            {activeTab === "manual" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                    <Plus size={16} className="text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {capturedFile ? "Vérifier et enregistrer" : "Enregistrer une livraison"}
                    </h3>
                    <p className="text-white/30 text-xs">
                      {capturedFile ? "✅ Photo jointe — vérifiez les champs" : "Saisie de réception marchandise"}
                    </p>
                  </div>
                </div>

                {scanPreview && capturedFile && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                    <img src={scanPreview} alt="Photo" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-violet-300 text-xs font-bold">Photo jointe</p>
                      <p className="text-white/30 text-xs truncate">{capturedFile.name}</p>
                    </div>
                    <button onClick={() => { setScanPreview(null); setCapturedFile(null); }} className="text-white/30 hover:text-white transition shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Catégorie</label>
                  <button
                    onClick={() => setShowCategoryPicker(true)}
                    className={`w-full h-11 rounded-2xl border px-4 flex items-center gap-3 transition ${selectedCatInfo ? `${selectedCatInfo.color}` : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"}`}
                  >
                    {selectedCatInfo ? (
                      <>
                        <span className="text-lg">{selectedCatInfo.emoji}</span>
                        <span className={`text-sm font-bold ${selectedCatInfo.text}`}>{selectedCatInfo.id}</span>
                        <span className="ml-auto text-white/30 text-xs">Changer →</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">🏷️</span>
                        <span className="text-white/40 text-sm">Choisir une catégorie...</span>
                        <span className="ml-auto text-white/30 text-xs">→</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">Produit *</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                      <Package size={15} className="text-white/30 shrink-0" />
                      <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Nom du produit" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-white/40 text-xs mb-1.5 block">Fournisseur *</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 relative">
                      <Building2 size={15} className="text-white/30 shrink-0" />
                      <input
                        value={supplier}
                        onChange={(e) => { setSupplier(e.target.value); setShowSupplierDropdown(true); }}
                        onFocus={() => setShowSupplierDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 150)}
                        placeholder="Nom du fournisseur"
                        className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25"
                      />
                      {supplier && (
                        <button onClick={() => setSupplier("")} className="text-white/30 hover:text-white transition shrink-0">
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {showSupplierDropdown && knownSuppliers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-2xl border border-white/10 bg-[#030b1d] shadow-2xl overflow-hidden">
                        <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 pt-2 pb-1">
                          Fournisseurs récents
                        </p>
                        {knownSuppliers
                          .filter((s) => s.toLowerCase().includes(supplier.toLowerCase()))
                          .slice(0, 6)
                          .map((s) => (
                            <button
                              key={s}
                              onMouseDown={() => { setSupplier(s); setShowSupplierDropdown(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05] transition text-left"
                            >
                              <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                <Building2 size={12} className="text-cyan-300" />
                              </div>
                              <span className="text-white text-sm font-medium">{s}</span>
                              {s.toLowerCase() === supplier.toLowerCase() && (
                                <CheckCircle2 size={13} className="ml-auto text-cyan-400 shrink-0" />
                              )}
                            </button>
                          ))}
                        {supplier && !knownSuppliers.find((s) => s.toLowerCase() === supplier.toLowerCase()) && (
                          <div className="px-3 py-2 border-t border-white/[0.06]">
                            <p className="text-white/40 text-xs flex items-center gap-1.5">
                              <Plus size={11} />
                              Nouveau fournisseur : <span className="text-white font-bold">{supplier}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">Numéro de lot</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                      <Hash size={15} className="text-white/30 shrink-0" />
                      <input value={lot} onChange={(e) => setLot(e.target.value)} placeholder="Numéro de lot" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">Quantité *</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                      <Truck size={15} className="text-white/30 shrink-0" />
                      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantité reçue" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                    </div>
                  </div>
                  <div className="xl:col-span-2">
                    <label className="text-white/40 text-xs mb-1.5 block">Date DLC</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                      <Clock size={15} className="text-white/30 shrink-0" />
                      <input type="date" value={dlc} onChange={(e) => setDlc(e.target.value)} className="bg-transparent outline-none w-full text-sm text-white" />
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="flex items-center gap-2 text-violet-300 text-xs">
                    <Loader2 size={14} className="animate-spin" /> Upload de la photo en cours...
                  </div>
                )}

                <button onClick={handleSave} disabled={isSaving || isUploading || !formComplete} className="w-full h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
                  {isSaving || isUploading ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer{capturedFile ? " avec photo" : ""}{selectedCatInfo ? ` · ${selectedCatInfo.emoji} ${selectedCatInfo.id}` : ""}</>}
                </button>
              </div>
            )}
          </div>

          {/* DELIVERIES LIST */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <FileText size={15} className="text-white/40" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Historique des livraisons</h2>
                  <p className="text-white/30 text-xs">{filteredDeliveries.length} / {deliveries.length} · {withPhotoCount} avec photo 📷</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(["all", "ok", "expired"] as const).map((status) => (
                  <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${filterStatus === status ? status === "expired" ? "bg-red-500/25 border-red-500/50 text-red-300" : status === "ok" ? "bg-green-500/25 border-green-500/50 text-green-300" : "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/10 text-white/35 hover:text-white/60"}`}>
                    {status === "all" ? "Toutes" : status === "ok" ? "✓ Valides" : "⚠ Expirées"}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-cyan-400" /></div>
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
