"use client";

import { useEffect, useState, useCallback } from "react";

import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Plus,
  X,
  Loader2,
  FileDown,
  Camera,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  Bell,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Priority = "Critique" | "Urgent" | "Normal";
type Status = "En attente" | "En cours" | "Résolu";

interface MaintenanceReport {
  id: number;
  equipment_name: string;
  description: string;
  priority: Priority;
  status: Status;
  reported_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface Certificate {
  id: number;
  name: string;
  equipment: string;
  file_url: string;
  maintenance_date: string;
  next_date: string;
  created_at: string;
}

type ToastType = "success" | "error" | "info";
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

function formatDateTimeFR(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isExpired(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const diff = (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

function getPriorityColor(priority: Priority) {
  switch (priority) {
    case "Critique": return "border-red-500/40 bg-red-500/10 text-red-300";
    case "Urgent": return "border-orange-500/40 bg-orange-500/10 text-orange-300";
    case "Normal": return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }
}

function getStatusColor(status: Status) {
  switch (status) {
    case "En attente": return "border-orange-500/30 bg-orange-500/10 text-orange-300";
    case "En cours": return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    case "Résolu": return "border-green-500/30 bg-green-500/10 text-green-300";
  }
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-200" : toast.type === "error" ? "bg-red-500/20 border-red-500/40 text-red-200" : "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : toast.type === "error" ? <AlertTriangle size={16} className="shrink-0" /> : <Bell size={16} className="shrink-0" />}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="opacity-60 hover:opacity-100 transition"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// REPORT CARD
// ─────────────────────────────────────────────

function ReportCard({
  report, isAdmin, onStatusChange, onDelete,
}: {
  report: MaintenanceReport;
  isAdmin: boolean;
  onStatusChange: (id: number, status: Status) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-[20px] border transition-all ${
      report.priority === "Critique" ? "border-red-500/30 bg-gradient-to-r from-red-500/[0.08] to-red-900/5" :
      report.priority === "Urgent" ? "border-orange-500/25 bg-gradient-to-r from-orange-500/[0.07] to-orange-900/5" :
      "border-white/[0.07] bg-white/[0.02]"
    }`}>
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
            report.priority === "Critique" ? "bg-red-500/20 border-red-500/30" :
            report.priority === "Urgent" ? "bg-orange-500/20 border-orange-500/30" :
            "bg-blue-500/15 border-blue-500/20"
          }`}>
            <Wrench size={16} className={
              report.priority === "Critique" ? "text-red-300" :
              report.priority === "Urgent" ? "text-orange-300" : "text-blue-300"
            } />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-black text-sm">{report.equipment_name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(report.priority)}`}>
                {report.priority === "Critique" && <AlertTriangle size={8} className="mr-1" />}
                {report.priority}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5 truncate">{report.description}</p>
            <p className="text-white/25 text-[10px] mt-0.5">Déclaré par {report.reported_by || "—"} · {formatDateTimeFR(report.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(report.status)}`}>
            {report.status}
          </span>
          <button onClick={() => setExpanded(!expanded)} className="text-white/25 hover:text-white/50 transition">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 space-y-3">
          <p className="text-white/50 text-sm">{report.description}</p>

          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white/30 text-xs font-bold">Changer statut :</p>
              {(["En attente", "En cours", "Résolu"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(report.id, s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    report.status === s
                      ? getStatusColor(s)
                      : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70"
                  }`}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => onDelete(report.id)}
                className="ml-auto h-8 w-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function MaintenancePage() {

  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"pannes" | "certificats">("pannes");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Report form
  const [showReportForm, setShowReportForm] = useState(false);
  const [equipmentName, setEquipmentName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [reportedBy, setReportedBy] = useState("");
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Certificate form
  const [showCertForm, setShowCertForm] = useState(false);
  const [certName, setCertName] = useState("");
  const [certEquipment, setCertEquipment] = useState("");
  const [certMaintenanceDate, setCertMaintenanceDate] = useState("");
  const [certNextDate, setCertNextDate] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isSavingCert, setIsSavingCert] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>("all");

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = toastCounter + 1;
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, [toastCounter]);

  // ── Fetch ──────────────────────────────────

  const fetchData = useCallback(async () => {
    const [reportsRes, certsRes] = await Promise.all([
      supabase.from("maintenance_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("maintenance_certificates").select("*").order("next_date", { ascending: true }),
    ]);
    if (reportsRes.data) setReports(reportsRes.data);
    if (certsRes.data) setCertificates(certsRes.data);
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    }
    init();

    // Realtime pour les nouvelles pannes
    const channel = supabase
      .channel("maintenance")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "maintenance_reports" }, (payload) => {
        const newReport = payload.new as MaintenanceReport;
        addToast(`🔧 Nouvelle panne : ${newReport.equipment_name} (${newReport.priority})`, newReport.priority === "Critique" ? "error" : "info");
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    addToast("Données actualisées", "success");
  }

  // ── Admin PIN ──────────────────────────────

  function checkAdminPin() {
    if (adminPin === "2405") {
      setIsAdmin(true);
      setShowAdminInput(false);
      setAdminPin("");
      setPinError(false);
      addToast("Mode admin activé", "success");
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  }

  // ── Save report ────────────────────────────

  async function saveReport() {
    if (!equipmentName || !description || !reportedBy) {
      addToast("Remplissez tous les champs obligatoires", "error"); return;
    }
    setIsSavingReport(true);
    const { error } = await supabase.from("maintenance_reports").insert({
      equipment_name: equipmentName,
      description,
      priority,
      status: "En attente",
      reported_by: reportedBy,
    });
    setIsSavingReport(false);
    if (error) { addToast(`Erreur : ${error.message}`, "error"); return; }
    addToast(`Panne déclarée : ${equipmentName}`, "success");
    setEquipmentName(""); setDescription(""); setPriority("Normal"); setReportedBy("");
    setShowReportForm(false);
    await fetchData();
  }

  // ── Update report status ───────────────────

  async function updateStatus(id: number, status: Status) {
    await supabase.from("maintenance_reports").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    addToast(`Statut mis à jour : ${status}`, "success");
    await fetchData();
  }

  async function deleteReport(id: number) {
    if (!confirm("Supprimer cette panne ?")) return;
    await supabase.from("maintenance_reports").delete().eq("id", id);
    addToast("Panne supprimée", "success");
    await fetchData();
  }

  // ── Save certificate ───────────────────────

  async function saveCertificate() {
    if (!certName || !certEquipment) {
      addToast("Remplissez les champs obligatoires", "error"); return;
    }
    setIsSavingCert(true);
    let fileUrl = "";

    if (certFile) {
      const ext = certFile.name.split(".").pop();
      const fileName = `${Date.now()}-${certEquipment.replace(/\s/g, "_")}.${ext}`;
      setUploadProgress(30);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, certFile, { contentType: certFile.type });
      setUploadProgress(80);
      if (uploadError) {
        addToast(`Erreur upload : ${uploadError.message}`, "error");
        setIsSavingCert(false); setUploadProgress(0); return;
      }
      const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
      setUploadProgress(100);
    }

    const { error } = await supabase.from("maintenance_certificates").insert({
      name: certName,
      equipment: certEquipment,
      file_url: fileUrl,
      maintenance_date: certMaintenanceDate || null,
      next_date: certNextDate || null,
    });

    setIsSavingCert(false);
    setUploadProgress(0);

    if (error) { addToast(`Erreur : ${error.message}`, "error"); return; }
    addToast(`Certificat ajouté : ${certName}`, "success");
    setCertName(""); setCertEquipment(""); setCertMaintenanceDate(""); setCertNextDate(""); setCertFile(null);
    setShowCertForm(false);
    await fetchData();
  }

  async function deleteCertificate(id: number) {
    if (!confirm("Supprimer ce certificat ?")) return;
    await supabase.from("maintenance_certificates").delete().eq("id", id);
    addToast("Certificat supprimé", "success");
    await fetchData();
  }

  // ── Computed ───────────────────────────────

  const pendingCount = reports.filter((r) => r.status === "En attente").length;
  const criticalCount = reports.filter((r) => r.priority === "Critique" && r.status !== "Résolu").length;
  const resolvedCount = reports.filter((r) => r.status === "Résolu").length;
  const expiredCerts = certificates.filter((c) => isExpired(c.next_date)).length;
  const expiringSoonCerts = certificates.filter((c) => !isExpired(c.next_date) && isExpiringSoon(c.next_date)).length;

  const filteredReports = reports.filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchPriority = filterPriority === "all" || r.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const tabs = [
    { id: "pannes" as const, label: "Pannes & Alertes", icon: Wrench },
    { id: "certificats" as const, label: "Certificats", icon: ShieldCheck },
  ];

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
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <p className="uppercase tracking-[0.32em] text-orange-400 font-semibold text-xs">MAINTENANCE & PANNES</p>
              </div>
              <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Maintenance</h1>
              <p className="text-white/40 text-base mt-2">Suivi des pannes et certificats d'entretien</p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button onClick={handleRefresh} disabled={isRefreshing} className="h-10 px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition flex items-center gap-2 text-sm font-bold disabled:opacity-50">
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
              {isAdmin ? (
                <button onClick={() => setIsAdmin(false)} className="h-10 px-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck size={14} /> Admin
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {showAdminInput ? (
                    <>
                      <input
                        type="password" maxLength={4} value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => e.key === "Enter" && checkAdminPin()}
                        placeholder="PIN"
                        className={`h-10 w-20 rounded-2xl border px-3 text-white text-sm outline-none text-center ${pinError ? "border-red-500/60 bg-red-500/10" : "border-white/10 bg-white/[0.05]"}`}
                      />
                      <button onClick={checkAdminPin} className="h-10 px-4 rounded-2xl bg-orange-400 hover:bg-orange-300 transition text-black text-sm font-black">OK</button>
                      <button onClick={() => { setShowAdminInput(false); setAdminPin(""); }} className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 flex items-center justify-center transition"><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => setShowAdminInput(true)} className="h-10 px-4 rounded-2xl border border-orange-500/20 bg-orange-500/[0.07] hover:bg-orange-500/15 text-orange-300 transition flex items-center gap-2 text-sm font-bold">
                      <ShieldCheck size={15} /> Mode admin
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── ALERTE CRITIQUE ────────────────────── */}
          {criticalCount > 0 && (
            <div className="rounded-[20px] border border-red-500/50 bg-red-500/15 p-4 flex items-center gap-4">
              <AlertTriangle size={24} className="text-red-400 animate-pulse shrink-0" />
              <div>
                <p className="text-red-300 font-black text-base">🚨 {criticalCount} panne(s) CRITIQUE(S) non résolue(s) !</p>
                <p className="text-red-400/70 text-xs mt-0.5">Action immédiate requise — vérifiez le tableau des pannes</p>
              </div>
            </div>
          )}

          {/* ── KPI CARDS ──────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-[24px] border p-5 ${pendingCount > 0 ? "border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-orange-900/10" : "border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-900/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-orange-300 text-xs font-semibold">En attente</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{pendingCount}</h2>
                  <p className="text-orange-400/50 text-xs mt-1">pannes déclarées</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20">
                  <Clock3 size={18} className={`text-orange-300 ${pendingCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 ${criticalCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-red-300 text-xs font-semibold">Critiques</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{criticalCount}</h2>
                  <p className="text-red-400/50 text-xs mt-1">non résolues</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20">
                  <AlertTriangle size={18} className={`text-red-300 ${criticalCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-green-300 text-xs font-semibold">Résolues</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{resolvedCount}</h2>
                  <p className="text-green-400/50 text-xs mt-1">au total</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20">
                  <CheckCircle2 size={18} className="text-green-300" />
                </div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 ${expiredCerts > 0 ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-900/5" : expiringSoonCerts > 0 ? "border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-900/5" : "border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-semibold ${expiredCerts > 0 ? "text-red-300" : expiringSoonCerts > 0 ? "text-orange-300" : "text-cyan-300"}`}>Certificats</p>
                  <h2 className="text-[42px] font-black text-white leading-none mt-2">{certificates.length}</h2>
                  {expiredCerts > 0 && <p className="text-red-400/70 text-xs mt-1 font-bold">{expiredCerts} expiré(s)</p>}
                  {expiringSoonCerts > 0 && !expiredCerts && <p className="text-orange-400/70 text-xs mt-1">{expiringSoonCerts} à renouveler</p>}
                  {!expiredCerts && !expiringSoonCerts && <p className="text-cyan-400/50 text-xs mt-1">tous à jour</p>}
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${expiredCerts > 0 ? "border-red-400/20 bg-red-500/20" : "border-cyan-400/20 bg-cyan-500/20"}`}>
                  <ShieldCheck size={18} className={expiredCerts > 0 ? "text-red-300" : "text-cyan-300"} />
                </div>
              </div>
            </div>
          </div>

          {/* ── TABS ───────────────────────────────── */}
          <div className="flex gap-2 border-b border-white/[0.06]">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-bold transition border-b-2 -mb-px ${activeTab === tab.id ? "border-orange-400 text-orange-400 bg-orange-500/[0.07]" : "border-transparent text-white/40 hover:text-white/70"}`}>
                <tab.icon size={15} /> {tab.label}
                {tab.id === "pannes" && pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── PANNES TAB ─────────────────────────── */}
          {activeTab === "pannes" && (
            <div className="space-y-4">

              {/* Declare panne button */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  {(["all", "En attente", "En cours", "Résolu"] as const).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${filterStatus === s ? "bg-white/10 border-white/20 text-white" : "border-white/10 text-white/35 hover:text-white/60"}`}>
                      {s === "all" ? "Toutes" : s}
                    </button>
                  ))}
                  {(["all", "Critique", "Urgent", "Normal"] as const).map((p) => (
                    <button key={p} onClick={() => setFilterPriority(p)} className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${filterPriority === p
                      ? p === "Critique" ? "bg-red-500/20 border-red-500/40 text-red-300"
                        : p === "Urgent" ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                        : p === "Normal" ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-white/10 border-white/20 text-white"
                      : "border-white/10 text-white/35 hover:text-white/60"}`}>
                      {p === "all" ? "Toutes priorités" : p}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowReportForm(!showReportForm)} className="h-10 px-5 rounded-2xl bg-orange-400 hover:bg-orange-300 transition text-black text-sm font-black flex items-center gap-2">
                  <Plus size={16} /> Déclarer une panne
                </button>
              </div>

              {/* Report form */}
              {showReportForm && (
                <div className="rounded-[24px] border border-orange-500/20 bg-orange-500/[0.05] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-white">Déclarer une panne</h3>
                    <button onClick={() => setShowReportForm(false)} className="text-white/30 hover:text-white transition"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Équipement *</label>
                      <input value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} placeholder="Ex: Friteuse, Hotte, Frigo..." className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Déclaré par *</label>
                      <input value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} placeholder="Votre nom" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Priorité *</label>
                      <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none">
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Critique">Critique</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/30 text-xs mb-1 block">Description du problème *</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez la panne en détail..." rows={3} className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-white text-sm outline-none resize-none" />
                  </div>
                  <button onClick={saveReport} disabled={isSavingReport} className="h-11 px-6 rounded-2xl bg-orange-400 hover:bg-orange-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center gap-2">
                    {isSavingReport ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
                    Envoyer l'alerte
                  </button>
                </div>
              )}

              {/* Reports list */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-orange-400" /></div>
              ) : filteredReports.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
                  <Wrench size={36} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/30 text-sm">Aucune panne déclarée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      isAdmin={isAdmin}
                      onStatusChange={updateStatus}
                      onDelete={deleteReport}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CERTIFICATS TAB ────────────────────── */}
          {activeTab === "certificats" && (
            <div className="space-y-4">

              <div className="flex items-center justify-between gap-4">
                <p className="text-white/40 text-sm">{certificates.length} certificat(s) enregistré(s)</p>
                <button onClick={() => setShowCertForm(!showCertForm)} className="h-10 px-5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2">
                  <Plus size={16} /> Ajouter un certificat
                </button>
              </div>

              {/* Certificate form */}
              {showCertForm && (
                <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/[0.05] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-white">Nouveau certificat</h3>
                    <button onClick={() => setShowCertForm(false)} className="text-white/30 hover:text-white transition"><X size={16} /></button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Nom du certificat *</label>
                      <input value={certName} onChange={(e) => setCertName(e.target.value)} placeholder="Ex: Entretien hotte 2024" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Équipement *</label>
                      <input value={certEquipment} onChange={(e) => setCertEquipment(e.target.value)} placeholder="Ex: Hotte, Frigo 1, Congélateur..." className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Date d'entretien</label>
                      <input type="date" value={certMaintenanceDate} onChange={(e) => setCertMaintenanceDate(e.target.value)} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Prochain entretien</label>
                      <input type="date" value={certNextDate} onChange={(e) => setCertNextDate(e.target.value)} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
                    </div>
                  </div>

                  {/* Upload options */}
                  <div>
                    <label className="text-white/30 text-xs mb-2 block">Document (optionnel)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {/* Photo directe (caméra) */}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { setCertFile(file); addToast(`Photo sélectionnée : ${file.name}`, "success"); }
                          }}
                        />
                        <div className="h-14 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition flex items-center justify-center gap-3 text-cyan-300 font-bold text-sm">
                          <Camera size={18} /> Prendre une photo
                        </div>
                      </label>

                      {/* Fichier (PDF/image) */}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { setCertFile(file); addToast(`Fichier sélectionné : ${file.name}`, "success"); }
                          }}
                        />
                        <div className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition flex items-center justify-center gap-3 text-white/60 hover:text-white font-bold text-sm">
                          <Upload size={18} /> Choisir un fichier
                        </div>
                      </label>
                    </div>

                    {certFile && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                        <p className="text-green-300 text-xs font-medium truncate">{certFile.name}</p>
                        <button onClick={() => setCertFile(null)} className="ml-auto text-white/30 hover:text-white transition shrink-0"><X size={12} /></button>
                      </div>
                    )}

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>

                  <button onClick={saveCertificate} disabled={isSavingCert} className="h-11 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center gap-2">
                    {isSavingCert ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Enregistrer le certificat
                  </button>
                </div>
              )}

              {/* Certificates list */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-cyan-400" /></div>
              ) : certificates.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
                  <ShieldCheck size={36} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/30 text-sm">Aucun certificat enregistré</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {certificates.map((cert) => {
                    const expired = isExpired(cert.next_date);
                    const soon = !expired && isExpiringSoon(cert.next_date);
                    return (
                      <div key={cert.id} className={`rounded-[24px] border p-5 transition-all ${expired ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-900/5" : soon ? "border-orange-500/25 bg-gradient-to-br from-orange-500/[0.08] to-orange-900/5" : "border-green-500/20 bg-gradient-to-br from-green-500/[0.06] to-green-900/5"}`}>

                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${expired ? "bg-red-500/20 border-red-500/30" : soon ? "bg-orange-500/20 border-orange-500/30" : "bg-green-500/15 border-green-500/20"}`}>
                            <ShieldCheck size={18} className={expired ? "text-red-300" : soon ? "text-orange-300" : "text-green-300"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-black text-sm break-words">{cert.name}</h3>
                            <p className="text-white/40 text-xs">{cert.equipment}</p>
                          </div>
                          {expired && <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold">EXPIRÉ</span>}
                          {soon && !expired && <span className="shrink-0 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold">BIENTÔT</span>}
                          {!expired && !soon && <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-300 text-[10px] font-bold">✓ OK</span>}
                        </div>

                        {/* Dates */}
                        <div className="space-y-1.5 mb-4">
                          {cert.maintenance_date && (
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <Calendar size={11} className="shrink-0" />
                              Entretien : <span className="text-white/60">{formatDateFR(cert.maintenance_date)}</span>
                            </div>
                          )}
                          {cert.next_date && (
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <Clock3 size={11} className="shrink-0" />
                              Prochain : <span className={`font-bold ${expired ? "text-red-400" : soon ? "text-orange-400" : "text-green-400"}`}>{formatDateFR(cert.next_date)}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {cert.file_url && (
                            <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 h-9 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition text-xs font-bold flex items-center justify-center gap-1.5">
                              <Eye size={12} /> Voir le doc
                            </a>
                          )}
                          {cert.file_url && (
                            <a href={cert.file_url} download className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white flex items-center justify-center transition">
                              <FileDown size={13} />
                            </a>
                          )}
                          {isAdmin && (
                            <button onClick={() => deleteCertificate(cert.id)} className="h-9 w-9 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
