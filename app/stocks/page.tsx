"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import {
  Search,
  Plus,
  Minus,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  X,
  Loader2,
  RefreshCw,
  Camera,
  Sparkles,
  ScanLine,
  FileText,
  Image as ImageIcon,
  Eye,
  Trash2,
  Hash,
  Building2,
  Package,
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
  badge: string;
};

const CATEGORIES: Category[] = [
  { id: "Viande",            emoji: "🥩", color: "border-red-500/30 bg-red-500/10",      text: "text-red-300",    badge: "bg-red-500/15 border-red-500/25 text-red-300" },
  { id: "Poisson",           emoji: "🐟", color: "border-blue-500/30 bg-blue-500/10",     text: "text-blue-300",   badge: "bg-blue-500/15 border-blue-500/25 text-blue-300" },
  { id: "Fruits & Légumes",  emoji: "🥦", color: "border-green-500/30 bg-green-500/10",   text: "text-green-300",  badge: "bg-green-500/15 border-green-500/25 text-green-300" },
  { id: "Produits laitiers", emoji: "🧀", color: "border-yellow-500/30 bg-yellow-500/10", text: "text-yellow-300", badge: "bg-yellow-500/15 border-yellow-500/25 text-yellow-300" },
  { id: "Épicerie",          emoji: "🛒", color: "border-cyan-500/30 bg-cyan-500/10",     text: "text-cyan-300",   badge: "bg-cyan-500/15 border-cyan-500/25 text-cyan-300" },
  { id: "Surgelés",          emoji: "❄️", color: "border-violet-500/30 bg-violet-500/10", text: "text-violet-300", badge: "bg-violet-500/15 border-violet-500/25 text-violet-300" },
];

const CAT_AUTRE: Category = {
  id: "Autre", emoji: "📦",
  color: "border-white/10 bg-white/[0.02]",
  text: "text-white/60",
  badge: "bg-white/10 border-white/20 text-white/60",
};

function getCategoryInfo(categoryId: string): Category {
  return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[4];
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Product = {
  id: string;
  product: string;
  supplier?: string;
  batch?: string;
  quantity: number;
  image_url?: string;
  expiry?: string;
  category?: string;
  created_at?: string;
};

type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType; }

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
        <img src={url} alt="Photo produit" className="w-full h-auto rounded-[24px] border border-white/10 shadow-2xl" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORY SECTION
// ─────────────────────────────────────────────

function CategorySection({
  category,
  products,
  updatingId,
  onUpdateQty,
  onDelete,
  onShowImage,
}: {
  category: Category;
  products: Product[];
  updatingId: string | null;
  onUpdateQty: (id: string, qty: number, action: "plus" | "minus") => void;
  onDelete: (id: string) => void;
  onShowImage: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const lowCount = products.filter((p) => (p.quantity || 0) <= 2).length;

  if (products.length === 0) return null;

  return (
    <div className={`rounded-[24px] border ${category.color} overflow-hidden`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.emoji}</span>
          <div className="text-left">
            <h3 className={`font-black text-base ${category.text}`}>{category.id}</h3>
            <p className="text-white/30 text-xs">{products.length} produit(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lowCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold">
              <AlertTriangle size={10} /> {lowCount} faible
            </span>
          )}
          <span className={`text-white/30 text-xs transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>▼</span>
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/[0.06]">
          {products.map((item) => {
            const isLow = (item.quantity || 0) <= 2;
            const isUpdating = updatingId === item.id;

            return (
              <div key={item.id} className={`rounded-[18px] border p-3 transition-all mt-2 ${isLow ? "border-red-500/25 bg-red-500/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.image_url ? (
                      <button onClick={() => onShowImage(item.id)} className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-white/10 hover:border-violet-500/40 transition">
                        <img src={item.image_url} alt={item.product} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-white/[0.05] border border-white/10 text-xl">
                        {category.emoji}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-black text-sm">{item.product || "—"}</h4>
                        {item.image_url && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-300 text-[10px] font-bold">
                            <ImageIcon size={7} /> Photo
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold">
                            <AlertTriangle size={8} /> FAIBLE
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-0.5">
                        {item.supplier && <span className="text-white/30 text-xs">Fournisseur : <span className="text-white/50">{item.supplier}</span></span>}
                        {item.batch && <span className="text-white/30 text-xs">Lot : <span className="text-white/50">{item.batch}</span></span>}
                        {item.expiry && <span className="text-white/30 text-xs">DLC : <span className="text-white/50">{new Date(item.expiry).toLocaleDateString("fr-FR")}</span></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.image_url && (
                      <button onClick={() => onShowImage(item.id)} className="h-8 w-8 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 flex items-center justify-center transition">
                        <Eye size={12} />
                      </button>
                    )}
                    <button onClick={() => onUpdateQty(item.id, item.quantity || 0, "minus")} disabled={isUpdating || (item.quantity || 0) === 0} className="w-8 h-8 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 flex items-center justify-center transition disabled:opacity-30 active:scale-95">
                      <Minus size={12} className="text-red-300" />
                    </button>
                    <div className={`w-12 h-8 rounded-xl flex items-center justify-center font-black text-sm border ${isLow ? "bg-red-500/15 border-red-500/25 text-red-300" : "bg-white/[0.05] border-white/10 text-white"}`}>
                      {isUpdating ? <Loader2 size={12} className="animate-spin" /> : (item.quantity || 0)}
                    </div>
                    <button onClick={() => onUpdateQty(item.id, item.quantity || 0, "plus")} disabled={isUpdating} className="w-8 h-8 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 flex items-center justify-center transition disabled:opacity-30 active:scale-95">
                      <Plus size={12} className="text-green-300" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="h-8 w-8 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function StocksPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [newProduct, setNewProduct] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newExpiry, setNewExpiry] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Épicerie");
  const [isSaving, setIsSaving] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [showImageFor, setShowImageFor] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = toastCounter + 1;
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [toastCounter]);

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

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
    addToast("Données actualisées", "success");
  }

  async function updateQuantity(id: string, currentQty: number, action: "plus" | "minus") {
    const newQty = action === "plus" ? currentQty + 1 : Math.max(0, currentQty - 1);
    setUpdatingId(id);
    await supabase.from("traceability_products").update({ quantity: newQty }).eq("id", id);
    await fetchProducts();
    setUpdatingId(null);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("traceability_products").delete().eq("id", id);
    await fetchProducts();
    addToast("Produit supprimé", "success");
  }

  async function uploadPhoto(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `stock-${Date.now()}.${ext}`;
    setIsUploading(true);
    const { error } = await supabase.storage.from("traceability-images").upload(fileName, file, { contentType: file.type });
    setIsUploading(false);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("traceability-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

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
              { type: "image", source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png" | "image/webp", data: base64 } },
              {
                type: "text",
                text: `Analyse cette étiquette produit alimentaire. Réponds UNIQUEMENT en JSON :
{
  "product": "nom du produit",
  "supplier": "fournisseur ou marque",
  "batch": "numéro de lot",
  "quantity": 1,
  "expiry": "date YYYY-MM-DD (DLC, DDM, USE BY)",
  "category": "une seule valeur parmi : Viande, Poisson, Fruits & Légumes, Produits laitiers, Épicerie, Surgelés"
}
Choisis la catégorie la plus appropriée. Si non visible mets "". Réponds UNIQUEMENT avec le JSON.`,
              },
            ],
          }],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(data.content[0].text.replace(/```json|```/g, "").trim());

      if (parsed.product) setNewProduct(parsed.product);
      if (parsed.supplier) setNewSupplier(parsed.supplier);
      if (parsed.batch) setNewBatch(parsed.batch);
      if (parsed.quantity) setNewQuantity(String(parsed.quantity));
      if (parsed.expiry) setNewExpiry(parsed.expiry);
      if (parsed.category && CATEGORIES.find((c) => c.id === parsed.category)) {
        setNewCategory(parsed.category);
      }

      addToast("✨ Produit reconnu automatiquement !", "success");
      setActiveTab("manual");

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

  async function handleSave() {
    if (!newProduct.trim()) { addToast("Veuillez saisir un nom de produit", "error"); return; }
    setIsSaving(true);

    let imageUrl = "";
    if (capturedFile) {
      try { imageUrl = await uploadPhoto(capturedFile); }
      catch { addToast("Erreur upload photo", "error"); }
    }

    const { error } = await supabase.from("traceability_products").insert({
      product: newProduct.trim(),
      supplier: newSupplier.trim() || null,
      batch: newBatch.trim() || null,
      quantity: Number(newQuantity) || 1,
      expiry: newExpiry || null,
      category: newCategory,
      image_url: imageUrl || null,
    });

    setIsSaving(false);
    if (error) { addToast(`Erreur : ${error.message}`, "error"); return; }
    addToast(`✅ ${newProduct} ajouté (${newCategory})`, "success");

    setNewProduct(""); setNewSupplier(""); setNewBatch("");
    setNewQuantity("1"); setNewExpiry(""); setNewCategory("Épicerie");
    setScanPreview(null); setCapturedFile(null);
    setShowAddForm(false);
    await fetchProducts();
  }

  function resetForm() {
    setNewProduct(""); setNewSupplier(""); setNewBatch("");
    setNewQuantity("1"); setNewExpiry(""); setNewCategory("Épicerie");
    setScanPreview(null); setCapturedFile(null);
    setActiveTab("scan"); setShowAddForm(false);
  }

  const filteredProducts = products.filter((item) => {
    const matchSearch = !search ||
      (item.product || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.supplier || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || (item.category || "Épicerie") === filterCategory;
    return matchSearch && matchCategory;
  });

  const lowStockCount = products.filter((p) => (p.quantity || 0) <= 2).length;
  const totalItems = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const withPhotoCount = products.filter((p) => p.image_url).length;
  const imageModalProduct = products.find((p) => p.id === showImageFor);

  const productsByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    products: filteredProducts.filter((p) => (p.category || "Épicerie") === cat.id),
  }));

  const uncategorized = filteredProducts.filter(
    (p) => p.category && !CATEGORIES.find((c) => c.id === p.category)
  );

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {showImageFor && imageModalProduct?.image_url && (
        <ImageModal url={imageModalProduct.image_url} onClose={() => setShowImageFor(null)} />
      )}

      <div className="min-h-screen bg-[#020817] text-white p-5">
        <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <p className="uppercase tracking-[0.32em] text-cyan-400 font-semibold text-xs">STOCK MANAGEMENT</p>
              </div>
              <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Gestion Stock</h1>
              <p className="text-white/40 text-base mt-2">Contrôle rapide des marchandises</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => setShowAddForm(!showAddForm)} className="h-10 px-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2">
                <Plus size={15} /> Ajouter
              </button>
              <button onClick={handleRefresh} disabled={isRefreshing} className="h-10 px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white transition flex items-center gap-2 text-sm font-bold disabled:opacity-50">
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-cyan-300 text-xs font-semibold">Produits</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{products.length}</h2>
                  <p className="text-cyan-400/50 text-xs mt-1">{totalItems} unités</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                  <Boxes size={18} className="text-cyan-300" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-violet-900/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-violet-300 text-xs font-semibold">Avec photo</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{withPhotoCount}</h2>
                  <p className="text-violet-400/50 text-xs mt-1">scannés IA</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/20">
                  <ImageIcon size={18} className="text-violet-300" />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 ${lowStockCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-red-300 text-xs font-semibold">Stock faible</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{lowStockCount}</h2>
                  {lowStockCount > 0 && <p className="text-red-400/70 text-xs mt-1 font-bold">Réapprovisionner</p>}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20">
                  <TrendingDown size={18} className={`text-red-300 ${lowStockCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-green-300 text-xs font-semibold">Stock OK</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{products.length - lowStockCount}</h2>
                  <p className="text-green-400/50 text-xs mt-1">niveaux corrects</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20">
                  <CheckCircle2 size={18} className="text-green-300" />
                </div>
              </div>
            </div>
          </div>

          {/* ADD FORM */}
          {showAddForm && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Ajouter un produit</h2>
                <button onClick={resetForm} className="text-white/30 hover:text-white transition"><X size={18} /></button>
              </div>

              <div className="flex gap-2 mb-5">
                <button onClick={() => setActiveTab("scan")} className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition border ${activeTab === "scan" ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70"}`}>
                  <Sparkles size={14} /> Scan IA
                </button>
                <button onClick={() => setActiveTab("manual")} className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition border ${activeTab === "manual" ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70"}`}>
                  <Plus size={14} /> Manuel
                </button>
              </div>

              {/* SCAN TAB */}
              {activeTab === "scan" && (
                <div className="rounded-[20px] border border-violet-500/20 bg-violet-500/[0.05] p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-violet-300" />
                    <div>
                      <p className="text-white font-black text-sm">Scan IA — Reconnaissance automatique</p>
                      <p className="text-white/30 text-xs">L'IA détecte le produit et sa catégorie !</p>
                    </div>
                  </div>

                  {scanPreview && (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10">
                      <img src={scanPreview} alt="Scan" className="w-full max-h-48 object-contain bg-black/40" />
                      {isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                          <ScanLine size={32} className="text-violet-400 animate-pulse mb-2" />
                          <p className="text-white font-black text-sm">Analyse en cours...</p>
                          <p className="text-white/50 text-xs mt-1">Détection produit + catégorie 🤖</p>
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
                      {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                      {isScanning ? "Analyse..." : "📷 Prendre une photo"}
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 transition text-white/60 hover:text-white font-bold text-sm flex items-center justify-center gap-3">
                      <FileText size={18} /> Choisir un fichier
                    </button>
                  </div>

                  {(newProduct || newSupplier) && !isScanning && (
                    <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <p className="text-green-300 text-xs font-bold mb-2">✨ Champs détectés :</p>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { label: "Produit", value: newProduct },
                          { label: "Catégorie", value: newCategory ? `${getCategoryInfo(newCategory).emoji} ${newCategory}` : "" },
                          { label: "Fournisseur", value: newSupplier },
                          { label: "DLC", value: newExpiry },
                        ].filter((f) => f.value).map((f) => (
                          <p key={f.label} className="text-xs"><span className="text-white/40">{f.label} : </span><span className="text-white font-bold">{f.value}</span></p>
                        ))}
                      </div>
                      <button onClick={() => setActiveTab("manual")} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition">Vérifier les champs →</button>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL TAB */}
              {activeTab === "manual" && (
                <div className="space-y-4">
                  {scanPreview && capturedFile && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                      <img src={scanPreview} alt="Photo" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <p className="text-violet-300 text-xs font-bold flex-1">Photo jointe</p>
                      <button onClick={() => { setScanPreview(null); setCapturedFile(null); }} className="text-white/30 hover:text-white transition"><X size={14} /></button>
                    </div>
                  )}

                  {/* Category picker */}
                  <div>
                    <label className="text-white/30 text-xs mb-2 block">Catégorie *</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setNewCategory(cat.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition ${newCategory === cat.id ? `${cat.color}` : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                        >
                          <span className="text-xl">{cat.emoji}</span>
                          <span className={`text-[10px] font-bold text-center leading-tight ${newCategory === cat.id ? cat.text : "text-white/40"}`}>{cat.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Produit *</label>
                      <div className="flex items-center gap-3 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                        <span className="text-lg">{getCategoryInfo(newCategory).emoji}</span>
                        <input value={newProduct} onChange={(e) => setNewProduct(e.target.value)} placeholder="Nom du produit" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Fournisseur</label>
                      <div className="flex items-center gap-3 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                        <Building2 size={14} className="text-white/30 shrink-0" />
                        <input value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} placeholder="Fournisseur" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Numéro de lot</label>
                      <div className="flex items-center gap-3 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4">
                        <Hash size={14} className="text-white/30 shrink-0" />
                        <input value={newBatch} onChange={(e) => setNewBatch(e.target.value)} placeholder="N° de lot" className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Quantité *</label>
                      <input type="number" min="0" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                    <div className="xl:col-span-2">
                      <label className="text-white/30 text-xs mb-1 block">Date DLC</label>
                      <input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                  </div>

                  <button onClick={handleSave} disabled={isSaving || isUploading || !newProduct} className="w-full h-11 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
                    {isSaving || isUploading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    {isSaving || isUploading ? "Enregistrement..." : `Ajouter au stock${capturedFile ? " avec photo" : ""}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SEARCH + FILTERS */}
          <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 h-11">
              <Search size={15} className="text-white/30 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/25" />
              {search && <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition"><X size={14} /></button>}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterCategory("all")} className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${filterCategory === "all" ? "bg-white/10 border-white/20 text-white" : "border-white/10 text-white/35 hover:text-white/60"}`}>
                Toutes
              </button>
              {CATEGORIES.map((cat) => {
                const count = products.filter((p) => (p.category || "Épicerie") === cat.id).length;
                if (count === 0) return null;
                return (
                  <button key={cat.id} onClick={() => setFilterCategory(cat.id)} className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${filterCategory === cat.id ? cat.badge : "border-white/10 text-white/35 hover:text-white/60"}`}>
                    <span>{cat.emoji}</span> {cat.id} <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRODUCTS BY CATEGORY */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
              <Package size={36} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/30 text-sm mb-4">Aucun produit trouvé</p>
              <button onClick={() => setShowAddForm(true)} className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2 mx-auto">
                <Plus size={14} /> Ajouter un produit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {productsByCategory.map(({ category, products: catProducts }) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  products={catProducts}
                  updatingId={updatingId}
                  onUpdateQty={updateQuantity}
                  onDelete={deleteProduct}
                  onShowImage={(id) => setShowImageFor(id)}
                />
              ))}
              {uncategorized.length > 0 && (
                <CategorySection
                  category={CAT_AUTRE}
                  products={uncategorized}
                  updatingId={updatingId}
                  onUpdateQty={updateQuantity}
                  onDelete={deleteProduct}
                  onShowImage={(id) => setShowImageFor(id)}
                />
              )}
            </div>
          )}

          {!isLoading && filteredProducts.length > 0 && (
            <div className="flex items-center justify-between text-white/25 text-xs pt-2 border-t border-white/[0.04]">
              <span>{filteredProducts.length} produit(s) · {withPhotoCount} avec photo 📷</span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 text-red-400/60">
                  <AlertTriangle size={10} /> {lowStockCount} à réapprovisionner
                </span>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
