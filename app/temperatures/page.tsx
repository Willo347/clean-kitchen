"use client";

import { useAdminPin } from "../hooks/useAdminPin";

import { useEffect, useState, useCallback } from "react";

import {
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ClipboardX,
  FileDown,
  RefreshCw,
  X,
  CheckCircle,
  Info,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  Filter,
  Trash2,
  ShieldCheck,
  Lock,
  Unlock,
} from "lucide-react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { supabase } from "@/lib/supabase";

interface Equipment {
  id: number;
  name: string;
  zone: string;
  temp_min: number;
  temp_max: number;
}

interface TemperatureLog {
  id: number;
  equipment: string;
  temperature: number;
  created_at: string;
}

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function toDateStringUTC(dateStr: string): string {
  return new Date(dateStr).toISOString().split("T")[0];
}

function formatDateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getTempStatus(temperature: number, equipment: Equipment): "ok" | "warning" | "critical" {
  const range = equipment.temp_max - equipment.temp_min;
  const margin = range * 0.1;
  if (temperature < equipment.temp_min || temperature > equipment.temp_max) return "critical";
  if (temperature < equipment.temp_min + margin || temperature > equipment.temp_max - margin) return "warning";
  return "ok";
}

function getTempTrend(equipmentName: string, logs: TemperatureLog[]): "up" | "down" | "stable" | null {
  const equipLogs = logs
    .filter((l) => l.equipment?.toLowerCase().trim() === equipmentName.toLowerCase().trim())
    .slice(0, 3);
  if (equipLogs.length < 2) return null;
  const diff = equipLogs[0].temperature - equipLogs[1].temperature;
  if (Math.abs(diff) < 0.5) return "stable";
  return diff > 0 ? "up" : "down";
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-4 z-50 flex flex-col gap-3 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-200" : toast.type === "error" ? "bg-red-500/20 border-red-500/40 text-red-200" : "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"}`}>
          {toast.type === "success" && <CheckCircle size={16} className="shrink-0" />}
          {toast.type === "error" && <AlertTriangle size={16} className="shrink-0" />}
          {toast.type === "info" && <Info size={16} className="shrink-0" />}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="opacity-60 hover:opacity-100 transition shrink-0"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function EquipmentCard({ equipment, logs, onQuickAdd }: { equipment: Equipment; logs: TemperatureLog[]; onQuickAdd: (name: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  const latest = logs
    .filter((l) => l.equipment?.toLowerCase().trim() === equipment.name.toLowerCase().trim())
    .slice(0, 5);

  const latestLog = latest[0];
  const trend = getTempTrend(equipment.name, logs);
  const status = latestLog ? getTempStatus(latestLog.temperature, equipment) : null;
  const today = new Date().toISOString().split("T")[0];
  const hasTodayLog = latest.some((l) => toDateStringUTC(l.created_at) === today);

  return (
    <div className={`rounded-[24px] border backdrop-blur-xl overflow-hidden transition-all duration-300 ${
      status === "critical" ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-900/5"
      : status === "warning" ? "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-900/5"
      : status === "ok" ? "border-green-500/20 bg-gradient-to-br from-green-500/[0.07] to-green-900/5"
      : "border-white/[0.08] bg-white/[0.02]"
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1 block">{equipment.zone}</span>
            <h3 className="text-white font-black text-base leading-tight break-words">{equipment.name}</h3>
            <p className="text-white/30 text-xs mt-0.5">{equipment.temp_min}°C → {equipment.temp_max}°C</p>
          </div>
          <div className={`rounded-2xl px-3 py-2 text-center shrink-0 border ${
            status === "critical" ? "bg-red-500/15 border-red-500/30"
            : status === "warning" ? "bg-orange-500/15 border-orange-500/30"
            : status === "ok" ? "bg-green-500/15 border-green-500/30"
            : "bg-white/[0.04] border-white/10"
          }`}>
            <p className={`text-2xl font-black ${
              status === "critical" ? "text-red-300"
              : status === "warning" ? "text-orange-300"
              : status === "ok" ? "text-green-300"
              : "text-white/25"
            }`}>
              {latestLog ? `${latestLog.temperature}°` : "—"}
            </p>
            {trend && (
              <div className="flex justify-center mt-0.5">
                {trend === "up" && <TrendingUp size={10} className="text-red-400" />}
                {trend === "down" && <TrendingDown size={10} className="text-cyan-400" />}
                {trend === "stable" && <Minus size={10} className="text-white/25" />}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            {status === "critical" && <span className="text-red-400 text-xs font-bold flex items-center gap-1"><AlertTriangle size={10} /> HORS ZONE</span>}
            {status === "warning" && <span className="text-orange-400 text-xs font-bold flex items-center gap-1"><AlertTriangle size={10} /> LIMITE</span>}
            {status === "ok" && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={10} /> OK</span>}
            {!status && <span className="text-white/25 text-xs font-bold flex items-center gap-1"><Clock size={10} /> AUCUN RELEVÉ</span>}
            <span className={`text-xs ${hasTodayLog ? "text-green-500/60" : "text-orange-500/60"}`}>
              {hasTodayLog ? "• Aujourd'hui ✓" : "• Manquant"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onQuickAdd(equipment.name)} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1">
              <Plus size={10} /> Relever
            </button>
            {latest.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} className="text-white/25 hover:text-white/50 transition">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && latest.length > 0 && (
        <div className="px-5 pb-4 border-t border-white/[0.05]">
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mt-3 mb-2">Historique récent</p>
          <div className="space-y-1.5">
            {latest.map((log) => {
              const logStatus = getTempStatus(log.temperature, equipment);
              return (
                <div key={log.id} className="flex items-center justify-between">
                  <span className="text-white/35 text-xs">{formatDateFR(log.created_at)}</span>
                  <span className={`font-bold text-sm ${logStatus === "critical" ? "text-red-400" : logStatus === "warning" ? "text-orange-400" : "text-green-400"}`}>
                    {log.temperature}°C
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemperaturesPage() {
  const adminPin = useAdminPin();

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [logs, setLogs] = useState<TemperatureLog[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [temperature, setTemperature] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "critical">("all");
  const [logsLimit, setLogsLimit] = useState(20);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [quickAddEquipment, setQuickAddEquipment] = useState("");
  const [quickAddTemp, setQuickAddTemp] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = toastCounter + 1;
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [toastCounter]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    const { data: equipmentsData, error: equipError } = await supabase.from("equipments").select("*").order("id");
    if (equipError) { addToast(`Erreur équipements : ${equipError.message}`, "error"); return; }
    const { data: logsData, error: logsError } = await supabase.from("temperature_logs").select("*").order("created_at", { ascending: false });
    if (logsError) { addToast(`Erreur relevés : ${logsError.message}`, "error"); return; }
    setEquipments(equipmentsData || []);
    setLogs(logsData || []);
  }, [addToast]);

  useEffect(() => {
    fetchData();

    // ✅ Filtrer le channel Realtime par restaurant_id
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const channel = supabase
        .channel("temperature-page")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "temperature_logs",
          filter: `restaurant_id=eq.${user.id}`, // ✅ uniquement ce restaurant
        }, () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    });
  }, [fetchData]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    addToast("Données actualisées", "success");
  }

  function checkPin() {
    if (pin === adminPin) {
      setIsAdmin(true); setShowPinInput(false); setPin(""); setPinError(false);
      addToast("Mode admin activé", "success");
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  }

  async function deleteLog(id: number) {
    if (!confirm("Supprimer ce relevé ?")) return;
    await supabase.from("temperature_logs").delete().eq("id", id);
    await fetchData();
    addToast("Relevé supprimé", "success");
  }

  async function deleteAllLogs() {
    if (!confirm("Supprimer TOUS les relevés de température ? Cette action est irréversible.")) return;
    await supabase.from("temperature_logs").delete().neq("id", 0);
    await fetchData();
    addToast("Tous les relevés supprimés", "success");
  }

  // ✅ CORRIGÉ — restaurant_id ajouté
  async function addTemperature() {
    if (!selectedEquipment || !temperature) { addToast("Sélectionnez un équipement et entrez une température", "error"); return; }
    const tempNum = Number(temperature);
    if (isNaN(tempNum)) { addToast("Température invalide", "error"); return; }

    // ✅ Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { addToast("Session expirée, reconnectez-vous", "error"); return; }

    setIsAdding(true);
    const { error } = await supabase.from("temperature_logs").insert([{
      equipment: selectedEquipment,
      temperature: tempNum,
      restaurant_id: user.id, // ✅ FIX
    }]);
    setIsAdding(false);
    if (error) { addToast(`Erreur : ${error.message}`, "error"); return; }
    const eq = equipments.find((e) => e.name === selectedEquipment);
    if (eq && (tempNum < eq.temp_min || tempNum > eq.temp_max)) {
      addToast(`⚠️ Alerte — ${selectedEquipment} hors zone (${tempNum}°C)`, "error");
    } else {
      addToast(`Relevé ajouté : ${selectedEquipment} ${tempNum}°C`, "success");
    }
    setTemperature("");
    setSelectedEquipment("");
  }

  function handleQuickAdd(equipmentName: string) {
    setQuickAddEquipment(equipmentName);
    setQuickAddTemp("");
    setShowQuickAdd(true);
  }

  // ✅ CORRIGÉ — restaurant_id ajouté
  async function submitQuickAdd() {
    if (!quickAddEquipment || !quickAddTemp) { addToast("Entrez une température", "error"); return; }
    const tempNum = Number(quickAddTemp);
    if (isNaN(tempNum)) { addToast("Température invalide", "error"); return; }

    // ✅ Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { addToast("Session expirée, reconnectez-vous", "error"); return; }

    setIsAdding(true);
    const { error } = await supabase.from("temperature_logs").insert([{
      equipment: quickAddEquipment,
      temperature: tempNum,
      restaurant_id: user.id, // ✅ FIX
    }]);
    setIsAdding(false);
    if (error) { addToast(`Erreur : ${error.message}`, "error"); return; }
    const eq = equipments.find((e) => e.name === quickAddEquipment);
    if (eq && (tempNum < eq.temp_min || tempNum > eq.temp_max)) {
      addToast(`⚠️ Alerte — ${quickAddEquipment} hors zone (${tempNum}°C)`, "error");
    } else {
      addToast(`Relevé ajouté : ${quickAddEquipment} ${tempNum}°C`, "success");
    }
    setShowQuickAdd(false);
    setQuickAddTemp("");
    setQuickAddEquipment("");
  }

  async function exportPDF() {
    setIsExporting(true);
    const filteredLogs = logs.filter((log) => {
      const logDateUTC = toDateStringUTC(log.created_at);
      const isEquipmentSelected = selectedEquipments.length === 0 ? true : selectedEquipments.includes(log.equipment);
      const isAfterStart = startDate ? logDateUTC >= startDate : true;
      const isBeforeEnd = endDate ? logDateUTC <= endDate : true;
      return isEquipmentSelected && isAfterStart && isBeforeEnd;
    });

    if (filteredLogs.length === 0) { addToast("Aucun relevé trouvé avec ces filtres", "error"); setIsExporting(false); return; }

    const doc = new jsPDF();
    doc.setFillColor(10, 20, 40);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(100, 220, 240);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Rapport de températures", 14, 18);
    doc.setTextColor(180, 220, 240);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const dateRange = startDate && endDate ? `Du ${startDate} au ${endDate}` : startDate ? `Depuis le ${startDate}` : endDate ? `Jusqu'au ${endDate}` : "Toutes les dates";
    doc.text(`Période : ${dateRange}`, 14, 28);
    doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 34);

    const criticalCount = filteredLogs.filter((log) => {
      const eq = equipments.find((e) => e.name.toLowerCase().trim() === log.equipment?.toLowerCase().trim());
      if (!eq) return false;
      return log.temperature < eq.temp_min || log.temperature > eq.temp_max;
    }).length;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Résumé", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Total relevés : ${filteredLogs.length}`, 14, 60);
    doc.text(`Alertes : ${criticalCount}`, 14, 66);
    doc.text(`Équipements : ${selectedEquipments.length === 0 ? "Tous" : selectedEquipments.join(", ")}`, 14, 72);

    autoTable(doc, {
      startY: 80,
      head: [["Date", "Équipement", "Température", "Zone", "Statut"]],
      body: filteredLogs.map((log) => {
        const eq = equipments.find((e) => e.name.toLowerCase().trim() === log.equipment?.toLowerCase().trim());
        const isAlert = eq && (log.temperature < eq.temp_min || log.temperature > eq.temp_max);
        return [formatDateFR(log.created_at), log.equipment || "—", `${log.temperature}°C`, eq ? `${eq.temp_min}°C — ${eq.temp_max}°C` : "—", isAlert ? "⚠ ALERTE" : "✓ OK"];
      }),
      headStyles: { fillColor: [10, 40, 80], textColor: [100, 220, 240], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.cell.raw === "⚠ ALERTE") { data.cell.styles.textColor = [200, 50, 50]; data.cell.styles.fontStyle = "bold"; }
        if (data.column.index === 4 && data.cell.raw === "✓ OK") { data.cell.styles.textColor = [30, 150, 80]; }
      },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${pageCount} — Clean Kitchen`, 14, doc.internal.pageSize.height - 8);
    }

    doc.save(`Temperatures_${new Date().toISOString().slice(0, 10)}.pdf`);
    addToast(`PDF exporté : ${filteredLogs.length} relevés`, "success");
    setIsExporting(false);
  }

  const today = new Date().toISOString().split("T")[0];

  const missingLogsEquipments = equipments.filter((equipment) => {
    return !logs.some((log) => {
      const logDate = toDateStringUTC(log.created_at);
      return log.equipment?.toLowerCase().trim() === equipment.name.toLowerCase().trim() && logDate === today;
    });
  });

  const alertsCount = equipments.filter((equipment) => {
    const latest = logs.find((l) => l.equipment?.toLowerCase().trim() === equipment.name.toLowerCase().trim());
    if (!latest) return false;
    return latest.temperature < equipment.temp_min || latest.temperature > equipment.temp_max;
  }).length;

  const todayLogs = logs.filter((l) => toDateStringUTC(l.created_at) === today);

  const filteredTableLogs = logs.filter((log) => {
    const matchEquip = filterEquipment ? log.equipment?.toLowerCase().includes(filterEquipment.toLowerCase()) : true;
    const eq = equipments.find((e) => e.name.toLowerCase().trim() === log.equipment?.toLowerCase().trim());
    const matchStatus = filterStatus === "all" ? true
      : filterStatus === "critical" ? (eq ? log.temperature < eq.temp_min || log.temperature > eq.temp_max : false)
      : (eq ? log.temperature >= eq.temp_min && log.temperature <= eq.temp_max : false);
    return matchEquip && matchStatus;
  }).slice(0, logsLimit);

  const exportPreviewCount = logs.filter((log) => {
    const logDate = toDateStringUTC(log.created_at);
    const isEquip = selectedEquipments.length === 0 || selectedEquipments.includes(log.equipment);
    const isAfter = startDate ? logDate >= startDate : true;
    const isBefore = endDate ? logDate <= endDate : true;
    return isEquip && isAfter && isBefore;
  }).length;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {showQuickAdd && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShowQuickAdd(false)}>
          <div className="bg-[#030b1d] border border-white/10 rounded-[28px] p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-black text-lg">Relevé rapide</h3>
              <button onClick={() => setShowQuickAdd(false)} className="text-white/40 hover:text-white transition"><X size={18} /></button>
            </div>
            <p className="text-cyan-400 font-bold text-sm mb-4">{quickAddEquipment}</p>
            <input
              type="number" placeholder="Température °C" value={quickAddTemp}
              onChange={(e) => setQuickAddTemp(e.target.value)} autoFocus
              onKeyDown={(e) => e.key === "Enter" && submitQuickAdd()}
              className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white outline-none text-base mb-3"
            />
            <button onClick={submitQuickAdd} disabled={isAdding} className="w-full h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="text-white w-full overflow-x-hidden">
        <div className="w-full rounded-[32px] border border-white/5 bg-[#030b1d] p-4 md:p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold text-xs">TEMPERATURE CONTROL</p>
              </div>
              <h1 className="text-4xl md:text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Températures</h1>
              <p className="text-white/40 text-base mt-2">Relevés manuels</p>
            </div>

            <div className="flex items-center gap-2 mt-2 shrink-0">
              {isAdmin ? (
                <button onClick={() => setIsAdmin(false)} className="h-10 px-3 sm:px-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition flex items-center gap-2 text-sm font-bold">
                  <Unlock size={14} /> <span className="hidden sm:inline">Admin</span>
                </button>
              ) : showPinInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="password" maxLength={4} value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && checkPin()}
                    placeholder="PIN" autoFocus
                    className={`h-10 w-16 rounded-2xl border px-3 text-white text-sm outline-none text-center ${pinError ? "border-red-500/60 bg-red-500/10" : "border-white/10 bg-white/[0.05]"}`}
                  />
                  <button onClick={checkPin} className="h-10 px-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black">OK</button>
                  <button onClick={() => { setShowPinInput(false); setPin(""); }} className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 flex items-center justify-center transition"><X size={14} /></button>
                </div>
              ) : (
                <button onClick={() => setShowPinInput(true)} className="h-10 px-3 sm:px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white transition flex items-center gap-2 text-sm font-bold">
                  <Lock size={14} /> <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <button onClick={handleRefresh} disabled={isRefreshing} className="h-10 w-10 md:w-auto md:px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50">
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                <span className="hidden md:inline">Actualiser</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
            <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-cyan-300 text-sm font-semibold">Relevés enregistrés</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{logs.length}</h2>
                  <p className="text-cyan-400/50 text-xs mt-1">{todayLogs.length} aujourd'hui</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0">
                  <Thermometer size={20} className="text-cyan-300" />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 ${alertsCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-red-300 text-sm font-semibold">Alertes</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{alertsCount}</h2>
                  {alertsCount > 0 && <p className="text-red-400/70 text-xs mt-1 font-bold">Action requise</p>}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20 shrink-0">
                  <AlertTriangle size={20} className={`text-red-300 ${alertsCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-orange-900/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-orange-300 text-sm font-semibold">Relevés manquants</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{missingLogsEquipments.length}</h2>
                  <div className="mt-2 space-y-0.5 max-h-[60px] overflow-y-auto">
                    {missingLogsEquipments.length === 0 ? (
                      <p className="text-green-400 text-xs font-semibold">Tous à jour ✓</p>
                    ) : (
                      missingLogsEquipments.map((eq) => <div key={eq.id} className="text-orange-200 text-xs">• {eq.name}</div>)
                    )}
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20 shrink-0">
                  <ClipboardX size={20} className="text-orange-300" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-green-300 text-sm font-semibold">Statut</p>
                  <h2 className="text-[40px] font-black text-white leading-none mt-3">{alertsCount === 0 ? "ONLINE" : "ALERTE"}</h2>
                  <p className="text-green-400/50 text-xs mt-1">{equipments.length} équipements</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20 shrink-0">
                  <CheckCircle2 size={20} className="text-green-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0">
                <Plus size={16} className="text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Ajouter un relevé</h2>
                <p className="text-white/30 text-xs">Saisie manuelle</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              <select value={selectedEquipment} onChange={(e) => setSelectedEquipment(e.target.value)} className="h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white outline-none text-sm w-full">
                <option value="">Sélectionner un équipement</option>
                {equipments.map((equipment) => <option key={equipment.id} value={equipment.name}>{equipment.name}</option>)}
              </select>

              <input
                type="number" placeholder="Température °C" value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTemperature()}
                className="h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white outline-none text-sm w-full"
              />

              <button onClick={addTemperature} disabled={isAdding} className="h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2 w-full">
                {isAdding ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : <><Plus size={16} /> Ajouter le relevé</>}
              </button>
            </div>

            {selectedEquipment && (() => {
              const eq = equipments.find((e) => e.name === selectedEquipment);
              if (!eq) return null;
              const tempNum = Number(temperature);
              const isOutOfRange = temperature && !isNaN(tempNum) && (tempNum < eq.temp_min || tempNum > eq.temp_max);
              return (
                <div className="mt-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
                  <Info size={14} className="text-cyan-400 shrink-0" />
                  <p className="text-white/50 text-xs">
                    Zone de <span className="text-cyan-400 font-bold">{eq.name}</span> : <span className="text-white font-bold">{eq.temp_min}°C → {eq.temp_max}°C</span>
                    {temperature && !isNaN(tempNum) && (
                      <> — {isOutOfRange ? <span className="text-red-400 font-bold">⚠ Hors zone !</span> : <span className="text-green-400 font-bold">✓ OK</span>}</>
                    )}
                  </p>
                </div>
              );
            })()}
          </div>

          <div>
            <h2 className="text-xl font-black text-white mb-4">Équipements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {equipments.map((equipment) => (
                <EquipmentCard key={equipment.id} equipment={equipment} logs={logs} onQuickAdd={handleQuickAdd} />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shrink-0">
                  <Filter size={14} className="text-white/40" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Historique des relevés</h2>
                  <p className="text-white/30 text-xs">{filteredTableLogs.length} / {logs.length} relevés</p>
                </div>
              </div>
              {isAdmin && logs.length > 0 && (
                <button onClick={deleteAllLogs} className="h-9 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition text-xs font-bold flex items-center gap-2">
                  <Trash2 size={13} /> Tout supprimer
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <input
                type="text" placeholder="Filtrer par équipement..." value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
                className="h-10 rounded-xl bg-white/[0.05] border border-white/10 px-4 text-white outline-none text-xs w-full sm:w-auto sm:min-w-[180px]"
              />
              <div className="flex gap-2">
                {(["all", "ok", "critical"] as const).map((status) => (
                  <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                    filterStatus === status
                      ? status === "critical" ? "bg-red-500/25 border-red-500/50 text-red-300"
                        : status === "ok" ? "bg-green-500/25 border-green-500/50 text-green-300"
                        : "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-white/10 text-white/35 hover:text-white/60"
                  }`}>
                    {status === "all" ? "Tous" : status === "ok" ? "✓ OK" : "⚠ Alertes"}
                  </button>
                ))}
              </div>
            </div>

            {!isAdmin && (
              <div className="mb-4 flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <ShieldCheck size={14} className="text-white/30 shrink-0" />
                <p className="text-white/30 text-xs flex-1">Connectez-vous en mode admin pour supprimer des relevés.</p>
                <button onClick={() => setShowPinInput(true)} className="h-8 px-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white transition text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <Lock size={11} /> Admin
                </button>
              </div>
            )}

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[400px] px-4 md:px-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["Date", "Équipement", "Température", "Statut", ...(isAdmin ? [""] : [])].map((h) => (
                        <th key={h} className="text-left text-white/30 font-bold text-[10px] uppercase tracking-widest pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableLogs.map((log) => {
                      const eq = equipments.find((e) => e.name.toLowerCase().trim() === log.equipment?.toLowerCase().trim());
                      const isAlert = eq && (log.temperature < eq.temp_min || log.temperature > eq.temp_max);
                      return (
                        <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                          <td className="py-2.5 pr-4 text-white/40 text-xs whitespace-nowrap">{formatDateFR(log.created_at)}</td>
                          <td className="py-2.5 pr-4 text-white text-sm font-medium">{log.equipment || "—"}</td>
                          <td className="py-2.5 pr-4">
                            <span className={`font-black text-base ${isAlert ? "text-red-400" : "text-green-400"}`}>{log.temperature}°C</span>
                          </td>
                          <td className="py-2.5 pr-4">
                            {isAlert ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold whitespace-nowrap">
                                <AlertTriangle size={9} /> ALERTE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-bold whitespace-nowrap">
                                <CheckCircle2 size={9} /> OK
                              </span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="py-2.5">
                              <button onClick={() => deleteLog(log.id)} className="h-8 w-8 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition">
                                <Trash2 size={12} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredTableLogs.length === 0 && (
                  <div className="text-center py-10 text-white/25">
                    <Thermometer size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucun relevé trouvé</p>
                  </div>
                )}
              </div>
            </div>

            {logs.length > logsLimit && (
              <div className="mt-5 text-center">
                <button onClick={() => setLogsLimit((l) => l + 20)} className="px-5 py-2.5 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition text-sm font-bold flex items-center gap-2 mx-auto">
                  Charger 20 de plus <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] to-blue-900/5 p-4 md:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0">
                <FileDown size={16} className="text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Export PDF</h2>
                <p className="text-white/30 text-xs">{exportPreviewCount} relevés seront exportés</p>
              </div>
            </div>

            <div>
              <p className="text-white/40 text-xs mb-3">Équipements (vide = tous)</p>
              <div className="flex flex-wrap gap-2">
                {equipments.map((equipment) => {
                  const isSelected = selectedEquipments.includes(equipment.name);
                  return (
                    <button key={equipment.id} onClick={() => {
                      if (isSelected) setSelectedEquipments(selectedEquipments.filter((eq) => eq !== equipment.name));
                      else setSelectedEquipments([...selectedEquipments, equipment.name]);
                    }} className={`px-3 py-2 rounded-xl border transition font-bold text-xs ${isSelected ? "bg-cyan-400 text-black border-cyan-300" : "bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20"}`}>
                      {equipment.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              <div>
                <p className="text-white/30 text-xs mb-1.5">Date de début</p>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white outline-none text-sm" />
              </div>
              <div>
                <p className="text-white/30 text-xs mb-1.5">Date de fin</p>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white outline-none text-sm" />
              </div>
              <div className="flex flex-col justify-end">
                <button onClick={exportPDF} disabled={isExporting} className="h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2 w-full">
                  {isExporting ? <><Loader2 size={16} className="animate-spin" /> Génération...</> : <><FileDown size={16} /> Exporter PDF</>}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
