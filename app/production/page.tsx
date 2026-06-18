"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  X,
  Loader2,
  RefreshCw,
  Printer,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Factory,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type ProductionLog = {
  id: string;
  restaurant_id: string;
  product_name: string;
  quantity: string;
  dlc: string;
  produced_at: string;
  created_at: string;
};

type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType; }

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatWeekLabel(date: Date): string {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return `${start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`;
}

function isDlcExpired(dlc: string): boolean {
  return new Date(dlc) < new Date(new Date().toDateString());
}

function isDlcSoon(dlc: string): boolean {
  const d = new Date(dlc);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  return d >= new Date(new Date().toDateString()) && d <= tomorrow;
}

function groupByDay(logs: ProductionLog[]): Map<string, ProductionLog[]> {
  const map = new Map<string, ProductionLog[]>();
  for (const log of logs) {
    const day = new Date(log.produced_at).toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long",
    });
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(log);
  }
  return map;
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${t.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-200" : "bg-red-500/20 border-red-500/40 text-red-200"}`}>
          {t.type === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertTriangle size={16} className="shrink-0" />}
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100 transition"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// PRINT LABEL
// ─────────────────────────────────────────────

function printLabel(log: ProductionLog) {
  const win = window.open("", "_blank", "width=400,height=320");
  if (!win) return;

  const dlcFormatted = formatDate(log.dlc);
  const producedFormatted = formatDateTime(log.produced_at);

  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Étiquette — ${log.product_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; color: #000; }
    .label {
      width: 340px; border: 2px solid #000; border-radius: 10px;
      overflow: hidden; margin: 10px auto;
    }
    .header {
      background: #000; color: #fff; padding: 10px 14px;
      font-size: 18px; font-weight: 900; text-align: center;
      letter-spacing: 0.04em; text-transform: uppercase;
    }
    .body { padding: 12px 14px; }
    .row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; }
    .label-text { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .value { font-size: 14px; font-weight: 900; color: #000; text-align: right; }
    .footer { background: #f5f5f5; text-align: center; padding: 6px; font-size: 10px; color: #999; border-top: 1px solid #ddd; }
    @media print {
      body { margin: 0; }
      .label { margin: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="header">${log.product_name}</div>
    <div class="body">
      <div class="row">
        <span class="label-text">Produit le</span>
        <span class="value">${producedFormatted}</span>
      </div>
      <div class="row">
        <span class="label-text">DLC</span>
        <span class="value">${dlcFormatted}</span>
      </div>
      <div class="row">
        <span class="label-text">Quantité</span>
        <span class="value">${log.quantity}</span>
      </div>
    </div>
    <div class="footer">cleankitchen.fr</div>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`);
  win.document.close();
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function ProductionPage() {
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Formulaire
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dlc, setDlc] = useState("");

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ── Semaine affichée ──
  const currentWeekStart = startOfWeek(new Date());
  const displayWeekBase = new Date(currentWeekStart);
  displayWeekBase.setDate(displayWeekBase.getDate() + weekOffset * 7);
  const weekStart = startOfWeek(displayWeekBase);
  const weekEnd = endOfWeek(displayWeekBase);
  const isCurrentWeek = weekOffset === 0;

  // ── Fetch ──
  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from("production_logs")
      .select("*")
      .gte("produced_at", weekStart.toISOString())
      .lte("produced_at", weekEnd.toISOString())
      .order("produced_at", { ascending: false });
    if (data) setLogs(data);
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchLogs();
      setIsLoading(false);
    }
    init();
  }, [fetchLogs]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
    addToast("Données actualisées", "success");
  }

  // ── Enregistrer ──
  async function handleSave(andPrint: boolean) {
    if (!productName.trim()) { addToast("Veuillez saisir un nom de produit", "error"); return; }
    if (!quantity.trim())    { addToast("Veuillez saisir une quantité", "error"); return; }
    if (!dlc)                { addToast("Veuillez saisir une DLC", "error"); return; }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addToast("Session expirée, reconnectez-vous", "error");
      setIsSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("production_logs")
      .insert({
        restaurant_id: user.id,
        product_name: productName.trim(),
        quantity: quantity.trim(),
        dlc,
        produced_at: new Date().toISOString(),
      })
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      addToast(`Erreur : ${error.message}`, "error");
      return;
    }

    addToast(`✅ ${productName} enregistré`, "success");
    setProductName(""); setQuantity(""); setDlc("");
    setShowForm(false);

    // Si on est sur la semaine courante, on raffraîchit
    if (isCurrentWeek && weekOffset === 0) {
      await fetchLogs();
    } else {
      setWeekOffset(0); // revenir à la semaine courante pour voir l'entrée
    }

    if (andPrint && data) {
      setTimeout(() => printLabel(data), 300);
    }
  }

  // ── Supprimer ──
  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette production ?")) return;
    setDeletingId(id);
    await supabase.from("production_logs").delete().eq("id", id);
    await fetchLogs();
    setDeletingId(null);
    addToast("Production supprimée", "success");
  }

  // ── Stats semaine ──
  const totalProductions = logs.length;
  const expiredCount = logs.filter((l) => isDlcExpired(l.dlc)).length;
  const soonCount = logs.filter((l) => isDlcSoon(l.dlc)).length;

  const grouped = groupByDay(logs);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5 overflow-x-hidden">
        <div className="mx-auto max-w-[1450px] rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-4 sm:p-5 shadow-[0_0_80px_rgba(120,80,255,0.08)] space-y-4 sm:space-y-5">

          {/* ── HEADER ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
                <p className="uppercase tracking-[0.2em] text-violet-400 font-semibold text-xs truncate">PRODUCTION</p>
              </div>
              <h1 className="text-[32px] sm:text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Productions</h1>
              <p className="text-white/40 text-sm sm:text-base mt-2">Traçabilité des productions maison</p>
            </div>
            <div className="flex items-center gap-2 mt-1 shrink-0">
              <button
                onClick={() => setShowForm(!showForm)}
                className="h-10 px-3 sm:px-4 rounded-2xl bg-violet-500 hover:bg-violet-400 transition text-white text-sm font-black flex items-center gap-2"
              >
                <Plus size={15} /> <span className="hidden sm:inline">Nouvelle production</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white transition flex items-center justify-center disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-violet-900/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-violet-300 text-xs font-semibold">Cette semaine</p>
                  <h2 className="text-[32px] sm:text-[42px] font-black text-white leading-none mt-2">{totalProductions}</h2>
                  <p className="text-violet-400/50 text-xs mt-1">productions</p>
                </div>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/20 shrink-0">
                  <Factory size={16} className="text-violet-300" />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-4 sm:p-5 ${soonCount > 0 ? "border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-amber-900/10" : "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-900/5"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-amber-300 text-xs font-semibold">DLC proches</p>
                  <h2 className="text-[32px] sm:text-[42px] font-black text-white leading-none mt-2">{soonCount}</h2>
                  <p className="text-amber-400/50 text-xs mt-1">dans 48h</p>
                </div>
                <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border shrink-0 ${soonCount > 0 ? "border-amber-400/40 bg-amber-400/30" : "border-amber-400/20 bg-amber-500/20"}`}>
                  <CalendarDays size={16} className={`text-amber-300 ${soonCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-4 sm:p-5 ${expiredCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-red-300 text-xs font-semibold">DLC dépassées</p>
                  <h2 className="text-[32px] sm:text-[42px] font-black text-white leading-none mt-2">{expiredCount}</h2>
                  <p className="text-red-400/50 text-xs mt-1">à retirer</p>
                </div>
                <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border shrink-0 ${expiredCount > 0 ? "border-red-400/40 bg-red-400/30" : "border-red-400/20 bg-red-500/20"}`}>
                  <AlertTriangle size={16} className={`text-red-300 ${expiredCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>
          </div>

          {/* ── FORMULAIRE NOUVELLE PRODUCTION ── */}
          {showForm && (
            <div className="rounded-[24px] sm:rounded-[28px] border border-violet-500/20 bg-violet-500/[0.03] p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <ClipboardList size={18} className="text-violet-400" />
                  Nouvelle production
                </h2>
                <button onClick={() => { setShowForm(false); setProductName(""); setQuantity(""); setDlc(""); }} className="text-white/30 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {/* Nom du produit */}
                <div className="sm:col-span-1">
                  <label className="text-white/30 text-xs mb-1 block">Nom du produit *</label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Tiramisu maison"
                    className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none placeholder:text-white/25 focus:border-violet-500/50 transition"
                  />
                </div>

                {/* Quantité */}
                <div>
                  <label className="text-white/30 text-xs mb-1 block">Quantité *</label>
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ex: 20 pièces"
                    className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none placeholder:text-white/25 focus:border-violet-500/50 transition"
                  />
                </div>

                {/* DLC */}
                <div>
                  <label className="text-white/30 text-xs mb-1 block">DLC *</label>
                  <input
                    type="date"
                    value={dlc}
                    onChange={(e) => setDlc(e.target.value)}
                    className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none focus:border-violet-500/50 transition"
                  />
                </div>
              </div>

              {/* Date auto */}
              <div className="flex items-center gap-2 mb-4 px-1">
                <CheckCircle2 size={13} className="text-violet-400 shrink-0" />
                <p className="text-white/30 text-xs">Date et heure de production enregistrées automatiquement</p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-2xl bg-white/10 hover:bg-white/15 disabled:opacity-50 transition text-white font-black text-sm flex items-center justify-center gap-2 border border-white/10"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Enregistrer
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-2xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 transition text-white font-black text-sm flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
                  Enregistrer & imprimer
                </button>
              </div>
            </div>
          )}

          {/* ── NAVIGATION SEMAINE ── */}
          <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 text-white/50 hover:text-white transition flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="text-center">
              <p className="text-white font-black text-sm sm:text-base">{formatWeekLabel(displayWeekBase)}</p>
              {isCurrentWeek && (
                <p className="text-violet-400 text-xs font-semibold mt-0.5">Semaine en cours</p>
              )}
            </div>

            <button
              onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentWeek}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 text-white/50 hover:text-white transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* ── LISTE DES PRODUCTIONS ── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-violet-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
              <Factory size={36} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/30 text-sm mb-4">Aucune production cette semaine</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 rounded-2xl bg-violet-500 hover:bg-violet-400 transition text-white text-sm font-black flex items-center gap-2 mx-auto"
              >
                <Plus size={14} /> Enregistrer une production
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(grouped.entries()).map(([day, dayLogs]) => (
                <div key={day} className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  {/* En-tête jour */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                    <p className="text-white font-black text-sm capitalize">{day}</p>
                    <span className="text-white/30 text-xs">{dayLogs.length} production(s)</span>
                  </div>

                  {/* Lignes */}
                  <div className="divide-y divide-white/[0.04]">
                    {dayLogs.map((log) => {
                      const expired = isDlcExpired(log.dlc);
                      const soon = isDlcSoon(log.dlc);
                      const isDeleting = deletingId === log.id;

                      return (
                        <div
                          key={log.id}
                          className={`flex items-center justify-between gap-3 px-4 py-3 transition ${expired ? "bg-red-500/[0.05]" : soon ? "bg-amber-500/[0.04]" : "hover:bg-white/[0.02]"}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-black text-sm">{log.product_name}</p>
                              {expired && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold">
                                  <AlertTriangle size={8} /> DLC dépassée
                                </span>
                              )}
                              {!expired && soon && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[10px] font-bold">
                                  <AlertTriangle size={8} /> DLC proche
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <span className="text-white/30 text-xs">Qté : <span className="text-white/60 font-bold">{log.quantity}</span></span>
                              <span className={`text-xs font-bold ${expired ? "text-red-400" : soon ? "text-amber-400" : "text-white/30"}`}>
                                DLC : <span className={expired ? "text-red-300" : soon ? "text-amber-300" : "text-white/60"}>{formatDate(log.dlc)}</span>
                              </span>
                              <span className="text-white/20 text-xs">{formatDateTime(log.produced_at)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => printLabel(log)}
                              className="h-8 w-8 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 flex items-center justify-center transition"
                              title="Imprimer l'étiquette"
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              disabled={isDeleting}
                              className="h-8 w-8 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition disabled:opacity-50"
                              title="Supprimer"
                            >
                              {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FOOTER ── */}
          {!isLoading && logs.length > 0 && (
            <div className="flex items-center justify-between text-white/25 text-xs pt-2 border-t border-white/[0.04] flex-wrap gap-2">
              <span>{totalProductions} production(s) cette semaine</span>
              {expiredCount > 0 && (
                <span className="flex items-center gap-1 text-red-400/60">
                  <AlertTriangle size={10} /> {expiredCount} DLC dépassée(s)
                </span>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
