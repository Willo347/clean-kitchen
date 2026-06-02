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
// TYPES
// ─────────────────────────────────────────────

type Delivery = {
  id: string;
  product: string;
  supplier: string;
  batch: string;
  quantity: number;
  expiry: string;
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

function isExpiringSoon(expiryStr: string): boolean {
  if (!expiryStr) return false;
  const diff = (new Date(expiryStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 3 && diff >= 0;
}

function isExpired(expiryStr: string): boolean {
  if (!expiryStr) return false;
  return new Date(expiryStr) < new Date();
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
// IMAGE MODAL
// ─────────────────────────────────────────────

function ImageModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/60 hover:text-white transition flex items-center gap-2 text-sm font-bold">
          <X size={16} /> Fermer
        </button>
        <img src={url} alt="Photo étiquette" className="w-full h-auto rounded-[24px] border border-white/10 shadow-2xl" />
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
  const expired = isExpired(delivery.expiry);
  const expiringSoon = !expired && isExpiringSoon(delivery.expiry);

  return (
    <>
      {showImage && delivery.image_url && (
        <ImageModal url={delivery.image_url} onClose={() => setShowImage(false)} />
      )}

      <div className={`rounded-[20px] border transition-all ${expired ? "border-red-500/30 bg-gradient-to-r from-red-500/[0.08] to-red-900/5" : expiringSoon ? "border-orange-500/25 bg-gradient-to-r from-orange-500/[0.07] to-orange-900/5" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.03]"}`}>
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">

            {/* Miniature photo ou icône */}
            {delivery.image_url ? (
              <button onClick={() => setShowImage(true)} className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-white/10 hover:border-cyan-500/40 transition">
                <img src={delivery.image_url} alt="Étiquette" className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${expired ? "bg-red-500/20 border-red-500/30" : expiringSoon ? "bg-orange-500/20 border-orange-500/30" : "bg-cyan-500/15 border-cyan-500/20"}`}>
                <Truck size={16} className={expired ? "text-red-300" : expiringSoon ? "text-orange-300" : "text-cyan-300"} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-black text-sm">{delivery.product || "—"}</h3>
                {delivery.image_url && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-[10px] font-bold">
                    <ImageIcon size={8} /> Photo
                  </span>
                )}
                {expired && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold"><AlertTriangle size={8} /> EXPIRÉ</span>}
                {expiringSoon && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold"><Clock size={8} /> BIENTÔT</span>}
              </div>
              <div className="flex flex-wrap gap-3 mt-0.5">
                {delivery.supplier && <span className="text-white/35 text-xs">Fournisseur : <span className="text-white/55">{delivery.supplier}</span></span>}
                {delivery.batch && <span className="text-white/35 text-xs">Lot : <span className="text-white/55">{delivery.batch}</span></span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-white font-bold text-sm">Qté : {delivery.quantity || 0}</p>
              <p className="text-white/35 text-xs">DLC : {formatDateFR(delivery.expiry)}</p>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="text-white/25 hover:text-white/50 transition">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 space-y-3">

            {/* Photo section */}
            {delivery.image_url && (
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={delivery.image_url}
                  alt="Photo étiquette"
                  className="w-full max-h-48 object-contain bg-black/40 cursor-pointer"
                  onClick={() => setShowImage(true)}
                />
                <div className="p-2 flex items-center justify-between bg-white/[0.02]">
                  <span className="text-white/30 text-xs flex items-center gap-1"><ImageIcon size={10} /> Photo de l'étiquette</span>
                  <button onClick={() => setShowImage(true)} className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition flex items-center gap-1">
                    <Eye size={12} /> Agrandir
                  </button>
                </div>
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Produit", value: delivery.product },
                { label: "Fournisseur", value: delivery.supplier },
                { label: "Lot", value: delivery.batch },
                { label: "DLC", value: formatDateFR(delivery.expiry) },
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
  const [batch, setBatch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");

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
    if (data) setDeliveries(data);
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

  // ── Upload photo to Supabase Storage ───────

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

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png" | "image/webp", data: base64 },
              },
              {
                type: "text",
                text: `Analyse cette étiquette produit alimentaire et extrait les informations en JSON uniquement :
{
  "product": "nom du produit",
  "supplier": "fournisseur ou marque",
  "batch": "numéro de lot (LOT, N° LOT, BATCH, L:)",
  "quantity": 1,
  "expiry": "date YYYY-MM-DD (DLC, DDM, USE BY, EXP, À CONSOMMER AVANT)"
}
Si non visible, mets "" ou 0. Réponds UNIQUEMENT avec le JSON.`,
              },
            ],
          }],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(data.content[0].text.replace(/```json|```/g, "").trim());

      if (parsed.product) setProduct(parsed.product);
      if (parsed.supplier) setSupplier(parsed.supplier);
      if (parsed.batch) setBatch(parsed.batch);
      if (parsed.quantity) setQuantity(String(parsed.quantity));
      if (parsed.expiry) setExpiry(parsed.expiry);

      addToast("✨ Étiquette analysée ! Vérifiez les champs.", "success");
      setActiveTab("manual");

    } catch (error) {
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

    // Upload photo if exists
    let imageUrl = "";
    if (capturedFile) {
      try {
        imageUrl = await uploadPhoto(capturedFile);
      } catch (err) {
        addToast("Erreur upload photo — livraison sauvegardée sans photo", "error");
      }
    }

    const { error } = await supabase.from("traceability_products").insert({
      product: product.trim(),
      supplier: supplier.trim(),
      batch: batch.trim(),
      quantity: Number(quantity),
      expiry: expiry || null,
      image_url: imageUrl || null,
    });

    setIsSaving(false);

    if (error) { addToast(`Erreur : ${error.message}`, "error"); return; }
    addToast(`✅ Livraison enregistrée${imageUrl ? " avec photo" : ""}`, "success");

    setProduct(""); setSupplier(""); setBatch(""); setQuantity(""); setExpiry("");
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

  const expiredCount = deliveries.filter((d) => isExpired(d.expiry)).length;
  const expiringSoonCount = deliveries.filter((d) => isExpiringSoon(d.expiry)).length;
  const todayCount = deliveries.filter((d) => {
    if (!d.created_at) return false;
    return new Date(d.created_at).toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
  }).length;
  const withPhotoCount = deliveries.filter((d) => d.image_url).length;

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
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />

      <div className="min-h-screen bg-[#020817] text-white p-5">
        <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

          {/* ── HEADER ─────────────────────────────── */}
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

          {/* ── KPI CARDS ──────────────────────────── */}
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

          {/* ── FORM SECTION ───────────────────────── */}
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
                    <p className="text-white/30 text-xs">Photo de l'étiquette → formulaire rempli + photo sauvegardée</p>
                  </div>
                </div>

                {/* Preview */}
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
                      <div className="absolute top-2 right-2">
                        <button onClick={() => { setScanPreview(null); setCapturedFile(null); }} className="w-7 h-7 rounded-xl bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => cameraInputRef.current?.click()} disabled={isScanning} className="h-14 rounded-2xl border border-violet-500/30 bg-violet-500/15 hover:bg-violet-500/25 disabled:opacity-50 transition text-violet-300 font-black text-sm flex items-center justify-center gap-3">
                    {isScanning ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                    {isScanning ? "Analyse en cours..." : "📷 Prendre une photo"}
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 transition text-white/60 hover:text-white font-bold text-sm flex items-center justify-center gap-3">
                    <FileText size={20} /> Choisir un fichier
                  </button>
                </div>

                {/* AI results preview */}
                {(product || supplier || batch || expiry) && !isScanning && (
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-300 text-xs font-bold mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} /> Champs détectés automatiquement
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Produit", value: product },
                        { label: "Fournisseur", value: supplier },
                        { label: "Lot", value: batch },
                        { label: "DLC", value: expiry },
                        { label: "Quantité", value: quantity },
                      ].filter((f) => f.value).map((f) => (
                        <div key={f.label} className="text-xs">
                          <span className="text-white/40">{f.label} : </span>
                          <span className="text-white font-bold">{f.value}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab("manual")} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition">
                      Vérifier et enregistrer →
                    </button>
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
                      {capturedFile ? "✅ Photo jointe — vérifiez les champs avant de sauvegarder" : "Saisie de réception marchandise"}
                    </p>
                  </div>
                </div>

                {/* Photo thumbnail in manual mode */}
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">Produit *</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                      <Package size={15} className="text-white/30 shrink-0" />
                      <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Nom du produit" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">Fournisseur *</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                      <Building2 size={15} className="text-white/30 shrink-0" />
                      <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Nom du fournisseur" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">Numéro de lot</label>
                    <div className="flex items-center gap-3 h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                      <Hash size={15} className="text-white/30 shrink-0" />
                      <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Numéro de lot" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
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
                      <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-transparent outline-none w-full text-sm text-white" />
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="flex items-center gap-2 text-violet-300 text-xs">
                    <Loader2 size={14} className="animate-spin" /> Upload de la photo en cours...
                  </div>
                )}

                <button onClick={handleSave} disabled={isSaving || isUploading || !product || !supplier} className="w-full h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
                  {isSaving || isUploading ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer{capturedFile ? " avec photo" : ""}</>}
                </button>
              </div>
            )}
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
