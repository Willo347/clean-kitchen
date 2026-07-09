"use client";

import { useAdminPin } from "../hooks/useAdminPin";
import { useEffect, useState, useCallback } from "react";
import {
  Users, ShieldCheck, Clock3, UserPlus, Trash2, BadgeCheck, X, Loader2,
  ChevronLeft, ChevronRight, Plus, Pencil, CheckCircle2, Calendar, Save,
  FileDown, LogOut, KeyRound, Eye, Send, CheckCheck, RotateCcw, AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: number;
  full_name: string;
  role: string;
  email?: string;
  phone?: string;
  pin_code: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface Shift {
  id?: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  note?: string;
}

interface HourLog {
  id?: number;
  employee_id: number;
  date: string;
  arrival: string;
  departure: string;
  total_hours: number;
  note?: string;
  status?: string;
  submitted_at?: string;
  validated_at?: string;
  validated_by?: string;
  reopened_at?: string;
  reopen_reason?: string;
}

interface RestaurantSettings {
  restaurant_name: string;
  city: string;
}

type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType; }

const DAYS_FR = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function getWeekDates(weekOffset: number): Date[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateShort(date: Date): string {
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()].slice(0, 3)}`;
}

function formatDateFR(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function calcHours(arrival: string, departure: string): number {
  if (!arrival || !departure) return 0;
  const cleanTime = (t: string) => t.replace(/\s*(AM|PM)/i, "").trim();
  const arrParts = cleanTime(arrival).split(":").map(Number);
  const depParts = cleanTime(departure).split(":").map(Number);
  if (arrParts.length < 2 || depParts.length < 2) return 0;
  const [ah, am] = arrParts;
  const [dh, dm] = depParts;
  if (isNaN(ah) || isNaN(am) || isNaN(dh) || isNaN(dm)) return 0;
  const total = (dh * 60 + dm) - (ah * 60 + am);
  return Math.max(0, Math.round((total / 60) * 100) / 100);
}

function formatHours(h: number): string {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  if (mins === 0) return `${hours}h`;
  return `${hours}h${String(mins).padStart(2, "0")}`;
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "submitted": return { label: "En attente", color: "bg-orange-500/15 border-orange-500/25 text-orange-300" };
    case "validated": return { label: "Validé", color: "bg-green-500/15 border-green-500/25 text-green-300" };
    default: return { label: "Brouillon", color: "bg-white/[0.05] border-white/10 text-white/40" };
  }
}

function getStatusPDF(status?: string): string {
  switch (status) {
    case "submitted": return "En attente";
    case "validated": return "Validé";
    default: return "Brouillon";
  }
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[70] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-200" : "bg-red-500/20 border-red-500/40 text-red-200"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <X size={16} className="shrink-0" />}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="opacity-60 hover:opacity-100 transition"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function PinModal({ title, subtitle, onSuccess, onClose, validatePin, errorMessage = "PIN incorrect" }: {
  title: string; subtitle?: string; onSuccess: () => void; onClose: () => void;
  validatePin: (pin: string) => boolean; errorMessage?: string;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      setTimeout(() => {
        if (validatePin(newPin)) { onSuccess(); }
        else { setError(true); setTimeout(() => { setPin(""); setError(false); }, 700); }
      }, 100);
    }
  }

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-[28px] border border-white/10 bg-[#030b1d] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
            <KeyRound size={22} className="text-cyan-300" />
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition"><X size={18} /></button>
        </div>
        <h3 className="text-xl font-black text-white mb-1">{title}</h3>
        {subtitle && <p className="text-white/40 text-sm mb-6">{subtitle}</p>}
        <div className="flex gap-3 justify-center my-6">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? (error ? "bg-red-400 border-red-400" : "bg-cyan-400 border-cyan-400") : "bg-transparent border-white/20"}`} />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm font-bold text-center mb-3">{errorMessage}</p>}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((digit, i) => (
            <button key={i}
              onClick={() => digit === "⌫" ? setPin((p) => p.slice(0, -1)) : digit !== "" ? handleDigit(digit) : undefined}
              disabled={digit === ""}
              className={`h-14 rounded-2xl font-black text-xl transition-all active:scale-95 ${digit === "" ? "opacity-0 cursor-default" : digit === "⌫" ? "bg-white/[0.05] border border-white/10 text-white/60 hover:bg-white/10" : "bg-white/[0.07] border border-white/10 text-white hover:bg-white/15"}`}
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReopenModal({ onConfirm, onClose }: { onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#030b1d] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20">
            <RotateCcw size={18} className="text-orange-300" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Rouvrir le pointage</h3>
            <p className="text-white/30 text-xs">Un motif obligatoire sera enregistré</p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif de réouverture (ex: erreur de saisie, oubli...)"
          rows={3}
          className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-white text-sm outline-none resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 hover:text-white text-sm font-bold transition">Annuler</button>
          <button onClick={() => reason.trim() && onConfirm(reason.trim())} disabled={!reason.trim()} className="flex-1 h-11 rounded-2xl bg-orange-400 hover:bg-orange-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
            <RotateCcw size={14} /> Rouvrir
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeModal({ employee, onClose, onSave, isSaving }: {
  employee: Partial<Employee> | null; onClose: () => void;
  onSave: (data: Partial<Employee>) => void; isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Employee>>(employee || { full_name: "", role: "", pin_code: "", is_active: true });
  const isEdit = !!employee?.id;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#030b1d] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">{isEdit ? "Modifier l'employé" : "Nouvel employé"}</h2>
            <p className="text-white/30 text-xs mt-0.5">{isEdit ? form.full_name : "Remplissez les informations"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Nom complet *</label>
            <input value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Prénom Nom" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Poste *</label>
            <input value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Chef de partie" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Email</label>
            <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Code PIN (4 chiffres) *</label>
              <input type="password" maxLength={4} value={form.pin_code || ""} onChange={(e) => setForm({ ...form, pin_code: e.target.value.replace(/\D/g, "") })} placeholder="••••" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Statut</label>
              <select value={form.is_active ? "true" : "false"} onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none">
                <option value="true">ACTIF</option>
                <option value="false">INACTIF</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <input type="checkbox" id="is_admin" checked={form.is_admin || false} onChange={(e) => setForm({ ...form, is_admin: e.target.checked })} className="w-4 h-4 rounded accent-cyan-400" />
            <label htmlFor="is_admin" className="text-white/60 text-sm cursor-pointer flex-1">Administrateur <span className="text-white/30 text-xs">(accès complet avec son PIN)</span></label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-11 rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 hover:text-white text-sm font-bold transition">Annuler</button>
          <button onClick={() => onSave(form)} disabled={isSaving || !form.full_name || !form.role || !form.pin_code} className="flex-1 h-11 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HoursPanel({ employee, isAdmin, onClose, addToast, restaurantSettings }: {
  employee: Employee; isAdmin: boolean; onClose: () => void;
  addToast: (msg: string, type: ToastType) => void;
  restaurantSettings: RestaurantSettings | null;
}) {
  const [hourLogs, setHourLogs] = useState<HourLog[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [activeView, setActiveView] = useState<"week" | "month">("week");
  const [date, setDate] = useState(toISO(new Date()));
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reopenLog, setReopenLog] = useState<HourLog | null>(null);

  const weekDates = getWeekDates(weekOffset);
  const weekStart = toISO(weekDates[0]);
  const weekEnd = toISO(weekDates[6]);
  const weekLabel = `${formatDateShort(weekDates[0])} — ${formatDateShort(weekDates[6])} ${weekDates[0].getFullYear()}`;

  const monthDate = new Date();
  monthDate.setMonth(monthDate.getMonth() + monthOffset);
  const monthYear = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const monthStart = `${monthYear}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const monthEnd = `${monthYear}-${String(monthIndex + 1).padStart(2, "0")}-${new Date(monthYear, monthIndex + 1, 0).getDate()}`;
  const monthLabel = `${MONTHS_FR[monthIndex]} ${monthYear}`;
  const totalHoursPreview = calcHours(arrival, departure);

  const fetchHourLogs = useCallback(async () => {
    const { data } = await supabase.from("employee_hours").select("*").eq("employee_id", employee.id).order("date", { ascending: false });
    if (data) setHourLogs(data);
  }, [employee.id]);

  useEffect(() => { fetchHourLogs(); }, [fetchHourLogs]);

  const weekLogs = hourLogs.filter((l) => l.date >= weekStart && l.date <= weekEnd);
  const weekTotal = weekLogs.reduce((acc, l) => acc + (l.total_hours || 0), 0);
  const weekDays = new Set(weekLogs.map((l) => l.date)).size;

  const monthLogs = hourLogs.filter((l) => l.date >= monthStart && l.date <= monthEnd);
  const monthTotal = monthLogs.reduce((acc, l) => acc + (l.total_hours || 0), 0);
  const monthDays = new Set(monthLogs.map((l) => l.date)).size;

  function getWeeksInMonth(year: number, month: number) {
    const weeks: { label: string; start: string; end: string }[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let current = new Date(firstDay);
    const dow = current.getDay();
    current.setDate(current.getDate() - (dow === 0 ? 6 : dow - 1));
    while (current <= lastDay) {
      const wStart = new Date(current);
      const wEnd = new Date(current);
      wEnd.setDate(wEnd.getDate() + 6);
      const clampStart = wStart < firstDay ? firstDay : wStart;
      const clampEnd = wEnd > lastDay ? lastDay : wEnd;
      weeks.push({ label: `${formatDateShort(clampStart)} — ${formatDateShort(clampEnd)}`, start: toISO(clampStart), end: toISO(clampEnd) });
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  }
  const weeksInMonth = getWeeksInMonth(monthYear, monthIndex);

  async function saveHours() {
    if (!date || !arrival || !departure) return;
    const computedTotal = calcHours(arrival, departure);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { addToast("Session expirée", "error"); return; }
    setIsSaving(true);
    const { error } = await supabase.from("employee_hours").insert({
      employee_id: employee.id,
      date, arrival, departure,
      total_hours: computedTotal,
      note: note.trim(),
      restaurant_id: user.id,
      status: "draft",
    });
    if (error) { addToast("Erreur lors de l'enregistrement", "error"); }
    else { addToast(`Pointage enregistré : ${formatHours(computedTotal)}`, "success"); }
    await fetchHourLogs();
    setIsSaving(false);
    setArrival(""); setDeparture(""); setNote("");
  }

  async function submitLog(log: HourLog) {
    await supabase.from("employee_hours").update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
    }).eq("id", log.id!);
    await fetchHourLogs();
    addToast("Pointage soumis pour validation", "success");
  }

  async function validateLog(log: HourLog) {
    await supabase.from("employee_hours").update({
      status: "validated",
      validated_at: new Date().toISOString(),
      validated_by: "admin",
    }).eq("id", log.id!);
    await fetchHourLogs();
    addToast("Pointage validé ✅", "success");
  }

  async function reopenLog_fn(log: HourLog, reason: string) {
    await supabase.from("employee_hours").update({
      status: "draft",
      reopened_at: new Date().toISOString(),
      reopen_reason: reason,
    }).eq("id", log.id!);
    await fetchHourLogs();
    setReopenLog(null);
    addToast("Pointage rouvert", "success");
  }

  async function deleteLog(id: number) {
    await supabase.from("employee_hours").delete().eq("id", id);
    fetchHourLogs();
    addToast("Pointage supprimé", "success");
  }

  function exportPDF() {
    setIsExporting(true);
    const restaurantName = restaurantSettings?.restaurant_name || "Clean Kitchen";
    const restaurantCity = restaurantSettings?.city || "";
    const doc = new jsPDF();
    doc.setFillColor(10, 20, 40);
    doc.rect(0, 0, 210, 45, "F");
    doc.setTextColor(100, 220, 240);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Fiche horaire — ${employee.full_name}`, 14, 16);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(restaurantName + (restaurantCity ? ` — ${restaurantCity}` : ""), 14, 27);
    doc.setTextColor(180, 220, 240);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Poste : ${employee.role}  |  Semaine : ${weekLabel}`, 14, 35);
    doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 41);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Récapitulatif semaine", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Total heures : ${formatHours(weekTotal)}  |  Jours travaillés : ${weekDays}`, 14, 63);
    autoTable(doc, {
      startY: 71,
      head: [["Date", "Arrivée", "Départ", "Total", "Statut", "Note"]],
      body: weekLogs.map((log) => [
        formatDateFR(log.date), log.arrival || "—", log.departure || "—",
        formatHours(log.total_hours || 0), getStatusPDF(log.status), log.note || "—",
      ]),
      headStyles: { fillColor: [10, 40, 80], textColor: [100, 220, 240], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      didParseCell: (data) => {
        if (data.column.index === 4) {
          if (data.cell.raw === "Validé") { data.cell.styles.textColor = [30, 150, 80]; data.cell.styles.fontStyle = "bold"; }
          if (data.cell.raw === "En attente") { data.cell.styles.textColor = [200, 120, 30]; }
          if (data.cell.raw === "Brouillon") { data.cell.styles.textColor = [150, 150, 150]; }
        }
      },
    });
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${pageCount} — ${restaurantName}`, 14, doc.internal.pageSize.height - 8);
    }
    doc.save(`Heures_${employee.full_name.replace(/ /g, "_")}_semaine_${weekStart}.pdf`);
    setIsExporting(false);
  }

  function exportMonthPDF() {
    setIsExporting(true);
    const restaurantName = restaurantSettings?.restaurant_name || "Clean Kitchen";
    const restaurantCity = restaurantSettings?.city || "";
    const doc = new jsPDF();
    doc.setFillColor(10, 20, 40);
    doc.rect(0, 0, 210, 45, "F");
    doc.setTextColor(100, 220, 240);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Fiche mensuelle — ${employee.full_name}`, 14, 16);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(restaurantName + (restaurantCity ? ` — ${restaurantCity}` : ""), 14, 27);
    doc.setTextColor(180, 220, 240);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Poste : ${employee.role}  |  Mois : ${monthLabel}`, 14, 35);
    doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 41);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Récapitulatif mensuel", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Total heures : ${formatHours(monthTotal)}  |  Jours travaillés : ${monthDays}  |  Base : 151h`, 14, 63);
    doc.text(`Taux : ${Math.round((monthTotal / 151) * 100)}%`, 14, 69);
    autoTable(doc, {
      startY: 77,
      head: [["Date", "Arrivée", "Départ", "Total", "Statut", "Note"]],
      body: monthLogs.map((log) => [
        formatDateFR(log.date), log.arrival || "—", log.departure || "—",
        formatHours(log.total_hours || 0), getStatusPDF(log.status), log.note || "—",
      ]),
      headStyles: { fillColor: [10, 40, 80], textColor: [100, 220, 240], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      didParseCell: (data) => {
        if (data.column.index === 4) {
          if (data.cell.raw === "Validé") { data.cell.styles.textColor = [30, 150, 80]; data.cell.styles.fontStyle = "bold"; }
          if (data.cell.raw === "En attente") { data.cell.styles.textColor = [200, 120, 30]; }
          if (data.cell.raw === "Brouillon") { data.cell.styles.textColor = [150, 150, 150]; }
        }
      },
    });
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${pageCount} — ${restaurantName}`, 14, doc.internal.pageSize.height - 8);
    }
    doc.save(`Heures_${employee.full_name.replace(/ /g, "_")}_${monthLabel.replace(" ", "_")}.pdf`);
    setIsExporting(false);
  }

  return (
    <div className="fixed inset-0 z-[50] bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 pt-6 pb-10">
        <div className="w-full max-w-3xl rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#030b1d] p-4 sm:p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>

          {reopenLog && (
            <ReopenModal
              onConfirm={(reason) => reopenLog_fn(reopenLog, reason)}
              onClose={() => setReopenLog(null)}
            />
          )}

          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Users size={20} className="text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">{employee.full_name}</h2>
                <p className="text-white/40 text-xs">{employee.role} {isAdmin && <span className="text-orange-400">· Vue Admin</span>}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition shrink-0"><X size={18} /></button>
          </div>

          <div className="flex gap-2 mb-4">
            {[{ id: "week" as const, label: "Semaine" }, { id: "month" as const, label: "Mois" }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveView(tab.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${activeView === tab.id ? "bg-cyan-400 text-black border-cyan-300" : "bg-white/[0.04] border-white/10 text-white/50 hover:text-white"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeView === "week" && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setWeekOffset((w) => w - 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white"><ChevronLeft size={16} /></button>
                  <span className="text-white/50 text-sm font-bold px-1">{weekLabel}</span>
                  <button onClick={() => setWeekOffset((w) => w + 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white"><ChevronRight size={16} /></button>
                  <button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 text-xs font-bold transition">Cette sem.</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-violet-300 font-black text-2xl">{formatHours(weekTotal)}</p>
                    <p className="text-white/25 text-[10px]">{weekDays} jour(s) · {Math.round((weekTotal / 35) * 100)}% de 35h</p>
                  </div>
                  <button onClick={exportPDF} disabled={isExporting || weekLogs.length === 0} className="h-9 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black text-xs font-black flex items-center gap-1.5">
                    {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />} PDF
                  </button>
                </div>
              </div>

              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${Math.min(100, (weekTotal / 35) * 100)}%` }} />
              </div>

              {weekLogs.length > 0 && (
                <div className="grid grid-cols-7 gap-1">
                  {weekDates.map((d, i) => {
                    const dayLog = weekLogs.find((l) => l.date === toISO(d));
                    const isToday = toISO(d) === toISO(new Date());
                    return (
                      <div key={i} className={`rounded-xl p-1.5 sm:p-2 text-center border ${isToday ? "border-cyan-500/30 bg-cyan-500/10" : "border-white/[0.06] bg-white/[0.02]"}`}>
                        <p className={`text-[9px] sm:text-[10px] font-bold uppercase ${isToday ? "text-cyan-400" : "text-white/30"}`}>{DAYS_FR[i].slice(0, 3)}</p>
                        <p className={`text-[9px] sm:text-[10px] ${isToday ? "text-cyan-300" : "text-white/25"}`}>{d.getDate()}</p>
                        <p className={`text-xs sm:text-sm font-black mt-1 ${dayLog ? "text-violet-300" : "text-white/15"}`}>
                          {dayLog ? formatHours(dayLog.total_hours || 0) : "—"}
                        </p>
                        {dayLog && (
                          <div className={`mt-1 w-1.5 h-1.5 rounded-full mx-auto ${dayLog.status === "validated" ? "bg-green-400" : dayLog.status === "submitted" ? "bg-orange-400" : "bg-white/20"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeView === "month" && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMonthOffset((m) => m - 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white"><ChevronLeft size={16} /></button>
                  <span className="text-white/50 text-sm font-bold px-2">{monthLabel}</span>
                  <button onClick={() => setMonthOffset((m) => m + 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white"><ChevronRight size={16} /></button>
                  <button onClick={() => setMonthOffset(0)} className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 text-xs font-bold transition">Ce mois</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-cyan-300 font-black text-2xl">{formatHours(monthTotal)}</p>
                    <p className="text-white/25 text-[10px]">{monthDays} jour(s) travaillé(s)</p>
                  </div>
                  <button onClick={exportMonthPDF} disabled={isExporting || monthLogs.length === 0} className="h-9 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black text-xs font-black flex items-center gap-1.5">
                    {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />} PDF
                  </button>
                </div>
              </div>

              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.min(100, (monthTotal / 151) * 100)}%` }} />
              </div>
              <p className="text-white/20 text-[10px]">{Math.round((monthTotal / 151) * 100)}% de 151h (base mensuelle)</p>

              <div className="space-y-2">
                {weeksInMonth.map((week, i) => {
                  const wLogs = hourLogs.filter((l) => l.date >= week.start && l.date <= week.end);
                  const wTotal = wLogs.reduce((acc, l) => acc + (l.total_hours || 0), 0);
                  const wDays = new Set(wLogs.map((l) => l.date)).size;
                  return (
                    <div key={i} className="rounded-[18px] border border-white/[0.07] bg-white/[0.02] p-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white/50 text-xs font-bold">Semaine {i + 1}</p>
                        <p className="text-white/30 text-[10px]">{week.label}</p>
                        <p className="text-white/25 text-[10px]">{wDays} jour(s)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                          <div className="h-full rounded-full bg-violet-400" style={{ width: `${Math.min(100, (wTotal / 35) * 100)}%` }} />
                        </div>
                        <p className={`font-black text-lg ${wTotal > 0 ? "text-violet-300" : "text-white/15"}`}>
                          {wTotal > 0 ? formatHours(wTotal) : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FORMULAIRE AJOUT */}
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 mb-4 space-y-3">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Ajouter un pointage</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-white/30 text-xs mb-1 block">Date *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
              </div>
              <div>
                <label className="text-white/30 text-xs mb-1 block">Arrivée *</label>
                <div className="flex gap-1">
                  <select value={arrival.split(":")[0] || ""} onChange={(e) => { const h = e.target.value; const m = arrival.split(":")[1] || "00"; setArrival(h ? `${h}:${m}` : ""); }} className="flex-1 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-2 text-white text-sm outline-none">
                    <option value="">HH</option>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select value={arrival.split(":")[1] || ""} onChange={(e) => { const h = arrival.split(":")[0] || "08"; setArrival(`${h}:${e.target.value}`); }} className="flex-1 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-2 text-white text-sm outline-none">
                    <option value="">MM</option>
                    {["00","15","30","45"].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/30 text-xs mb-1 block">Départ *</label>
                <div className="flex gap-1">
                  <select value={departure.split(":")[0] || ""} onChange={(e) => { const h = e.target.value; const m = departure.split(":")[1] || "00"; setDeparture(h ? `${h}:${m}` : ""); }} className="flex-1 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-2 text-white text-sm outline-none">
                    <option value="">HH</option>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select value={departure.split(":")[1] || ""} onChange={(e) => { const h = departure.split(":")[0] || "17"; setDeparture(`${h}:${e.target.value}`); }} className="flex-1 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-2 text-white text-sm outline-none">
                    <option value="">MM</option>
                    {["00","15","30","45"].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/30 text-xs mb-1 block">Total calculé</label>
                <div className={`w-full h-11 rounded-2xl border px-3 flex items-center font-black text-lg ${totalHoursPreview > 0 ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-white/[0.03] text-white/20"}`}>
                  {totalHoursPreview > 0 ? formatHours(totalHoursPreview) : "—"}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optionnel)" className="flex-1 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
              <button onClick={saveHours} disabled={isSaving || !arrival.includes(":") || !departure.includes(":")} className="h-11 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center gap-2">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer
              </button>
            </div>
          </div>

          {/* TABLEAU DES POINTAGES */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[600px] px-4 sm:px-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Date","Arrivée","Départ","Total","Statut","Note","Actions"].map((h) => (
                      <th key={h} className="text-left text-white/25 font-bold text-[10px] uppercase tracking-widest pb-3 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hourLogs.map((log) => {
                    const statusInfo = getStatusLabel(log.status);
                    const isLocked = log.status === "submitted" || log.status === "validated";
                    return (
                      <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                        <td className="py-2.5 pr-3 text-white/50 text-xs">{formatDateFR(log.date)}</td>
                        <td className="py-2.5 pr-3"><span className="inline-flex items-center px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-bold">↑ {log.arrival || "—"}</span></td>
                        <td className="py-2.5 pr-3"><span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold">↓ {log.departure || "—"}</span></td>
                        <td className="py-2.5 pr-3"><span className="text-violet-300 font-black text-base">{formatHours(log.total_hours || 0)}</span></td>
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${statusInfo.color}`}>
                            {log.status === "validated" && <CheckCheck size={9} />}
                            {log.status === "submitted" && <AlertCircle size={9} />}
                            {statusInfo.label}
                          </span>
                          {log.reopen_reason && (
                            <p className="text-orange-300/60 text-[9px] mt-0.5">Modifié : {log.reopen_reason}</p>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-white/35 text-xs">{log.note || "—"}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            {/* Employé : soumettre si brouillon */}
                            {!isAdmin && log.status === "draft" && (
                              <button onClick={() => submitLog(log)} className="h-7 px-2 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/25 text-orange-300 text-[10px] font-bold flex items-center gap-1 transition" title="Soumettre">
                                <Send size={10} /> Soumettre
                              </button>
                            )}
                            {/* Admin : valider si soumis */}
                            {isAdmin && log.status === "submitted" && (
                              <button onClick={() => validateLog(log)} className="h-7 px-2 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/25 text-green-300 text-[10px] font-bold flex items-center gap-1 transition" title="Valider">
                                <CheckCheck size={10} /> Valider
                              </button>
                            )}
                            {/* Admin : rouvrir si soumis ou validé */}
                            {isAdmin && isLocked && (
                              <button onClick={() => setReopenLog(log)} className="h-7 px-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300 text-[10px] font-bold flex items-center gap-1 transition" title="Rouvrir">
                                <RotateCcw size={10} /> Rouvrir
                              </button>
                            )}
                            {/* Admin : supprimer si brouillon */}
                            {isAdmin && log.status === "draft" && (
                              <button onClick={() => deleteLog(log.id!)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"><Trash2 size={11} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {hourLogs.length === 0 && (
                <div className="text-center py-10 text-white/25"><Clock3 size={28} className="mx-auto mb-2 opacity-40" /><p className="text-sm">Aucun pointage enregistré</p></div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const adminPin = useAdminPin();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pendingByEmployee, setPendingByEmployee] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<"team" | "planning">("team");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState<Partial<Shift>>({ start_time: "09:00", end_time: "17:00" });
  const [showHoursFor, setShowHoursFor] = useState<Employee | null>(null);
  const [showPinFor, setShowPinFor] = useState<Employee | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = toastCounter + 1;
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [toastCounter]);

  const weekDates = getWeekDates(weekOffset);
  const weekStart = toISO(weekDates[0]);
  const weekEnd = toISO(weekDates[6]);
  const weekLabel = `${formatDateShort(weekDates[0])} — ${formatDateShort(weekDates[6])} ${weekDates[0].getFullYear()}`;

  const fetchEmployees = useCallback(async () => {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    setEmployees(data || []);
  }, []);

  const fetchShifts = useCallback(async () => {
    const { data } = await supabase.from("employee_shifts").select("*").gte("date", weekStart).lte("date", weekEnd);
    if (data) setShifts(data);
  }, [weekOffset]);

  const fetchPending = useCallback(async () => {
    const { data } = await supabase.from("employee_hours").select("employee_id").eq("status", "submitted");
    if (data) {
      const counts: Record<number, number> = {};
      data.forEach((row: { employee_id: number }) => {
        counts[row.employee_id] = (counts[row.employee_id] || 0) + 1;
      });
      setPendingByEmployee(counts);
    }
  }, []);

  const fetchRestaurantSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("settings").select("restaurant_name, city").eq("restaurant_id", user.id).single();
    if (data) setRestaurantSettings(data);
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([fetchEmployees(), fetchShifts(), fetchRestaurantSettings(), fetchPending()]);
      setIsLoading(false);
    }
    init();
  }, [fetchEmployees, fetchShifts, fetchRestaurantSettings, fetchPending]);

  async function handleSave(form: Partial<Employee>) {
    if (!form.full_name || !form.role || !form.pin_code) return;
    setIsSaving(true);
    if (form.id) {
      await supabase.from("employees").update({
        full_name: form.full_name, role: form.role, pin_code: form.pin_code,
        is_active: form.is_active, is_admin: form.is_admin ?? false, email: form.email || null,
      }).eq("id", form.id);
      addToast(`${form.full_name} modifié`, "success");
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsSaving(false); return; }
      await supabase.from("employees").insert({
        full_name: form.full_name, role: form.role, pin_code: form.pin_code,
        is_active: form.is_active ?? true, is_admin: form.is_admin ?? false,
        email: form.email || null, restaurant_id: user.id,
      });
      addToast(`${form.full_name} ajouté`, "success");
    }
    await fetchEmployees();
    setIsSaving(false);
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  }

  async function deleteEmployee(id: number) {
    if (!confirm("Supprimer cet employé ?")) return;
    await supabase.from("employees").delete().eq("id", id);
    await fetchEmployees();
    addToast("Employé supprimé", "success");
  }

  async function saveShift() {
    if (!newShift.employee_id || !newShift.date || !newShift.start_time || !newShift.end_time) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("employee_shifts").insert({
      employee_id: newShift.employee_id, date: newShift.date,
      start_time: newShift.start_time, end_time: newShift.end_time,
      note: newShift.note || "", restaurant_id: user.id,
    });
    await fetchShifts();
    setShowAddShift(false);
    setNewShift({ start_time: "09:00", end_time: "17:00" });
    addToast("Créneau ajouté", "success");
  }

  async function deleteShift(id: number) {
    await supabase.from("employee_shifts").delete().eq("id", id);
    fetchShifts();
  }

  function getShiftsForDay(employeeId: number, date: Date) {
    return shifts.filter((s) => s.employee_id === employeeId && s.date === toISO(date));
  }

  const totalPending = Object.values(pendingByEmployee).reduce((a, b) => a + b, 0);
  const activeEmployees = employees.filter((e) => e.is_active === true);

  const tabs = [
    { id: "team" as const, label: "Équipe", icon: Users },
    { id: "planning" as const, label: "Planning semaine", icon: Calendar },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {showPinFor && (
        <PinModal
          title={showPinFor.full_name}
          subtitle="Entrez votre code PIN pour accéder à vos heures"
          validatePin={(pin) => showPinFor.pin_code === pin || pin === adminPin}
          onSuccess={() => { setShowHoursFor(showPinFor); setShowPinFor(null); }}
          onClose={() => setShowPinFor(null)}
        />
      )}

      {showAdminPin && (
        <PinModal
          title="Accès administrateur"
          subtitle="Entrez le code PIN admin"
          validatePin={(pin) => pin === adminPin || employees.some((e) => e.is_admin && e.pin_code === pin)}
          onSuccess={() => { setIsAdmin(true); setShowAdminPin(false); addToast("Mode admin activé", "success"); }}
          onClose={() => setShowAdminPin(false)}
        />
      )}

      {showHoursFor && (
        <HoursPanel
          employee={showHoursFor}
          isAdmin={isAdmin}
          onClose={() => { setShowHoursFor(null); fetchPending(); }}
          addToast={addToast}
          restaurantSettings={restaurantSettings}
        />
      )}

      {showEmployeeModal && (
        <EmployeeModal employee={editingEmployee} onClose={() => { setShowEmployeeModal(false); setEditingEmployee(null); }} onSave={handleSave} isSaving={isSaving} />
      )}

      <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5 overflow-x-hidden">
        <div className="mx-auto max-w-[1450px] rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-4 sm:p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-4 sm:space-y-5">

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold text-xs truncate">EMPLOYEE MANAGEMENT</p>
              </div>
              <h1 className="text-[32px] sm:text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Employés</h1>
              <p className="text-white/40 text-sm sm:text-base mt-2">
                Gestion du personnel{restaurantSettings ? ` — ${restaurantSettings.restaurant_name}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1 shrink-0">
              {isAdmin && totalPending > 0 && (
                <div className="flex items-center gap-2 px-3 h-10 rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-bold">
                  <AlertCircle size={14} />
                  <span>{totalPending} en attente</span>
                </div>
              )}
              {isAdmin ? (
                <>
                  <button onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true); }} className="h-10 px-3 sm:px-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2">
                    <UserPlus size={15} /> <span className="hidden sm:inline">Ajouter</span>
                  </button>
                  <button onClick={() => { setIsAdmin(false); addToast("Mode admin désactivé", "success"); }} className="h-10 px-3 sm:px-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition flex items-center gap-2 text-sm font-bold">
                    <LogOut size={14} /> <span className="hidden sm:inline">Admin</span>
                  </button>
                </>
              ) : (
                <button onClick={() => setShowAdminPin(true)} className="h-10 px-3 sm:px-4 rounded-2xl border border-orange-500/20 bg-orange-500/[0.07] hover:bg-orange-500/15 text-orange-300 transition flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck size={15} /> <span className="hidden sm:inline">Mode admin</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-cyan-300 text-sm font-semibold">Total employés</p>
                  <h2 className="text-[40px] sm:text-[48px] font-black text-white leading-none mt-2 sm:mt-3">{employees.length}</h2>
                  <p className="text-cyan-400/50 text-xs mt-1">dans l'équipe</p>
                </div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0"><Users size={18} className="text-cyan-300" /></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-green-300 text-sm font-semibold">Actifs</p>
                  <h2 className="text-[40px] sm:text-[48px] font-black text-white leading-none mt-2 sm:mt-3">{activeEmployees.length}</h2>
                  <p className="text-green-400/50 text-xs mt-1">en service</p>
                </div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20 shrink-0"><BadgeCheck size={18} className="text-green-300" /></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-blue-900/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-blue-300 text-sm font-semibold">Statut</p>
                  <h2 className="text-[32px] sm:text-[36px] font-black text-white leading-none mt-2 sm:mt-3">ONLINE</h2>
                  <p className="text-blue-400/50 text-xs mt-1">{isAdmin ? "Mode admin actif" : "Accès public"}</p>
                </div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/20 shrink-0"><ShieldCheck size={18} className="text-blue-300" /></div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-b border-white/[0.06] overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-t-2xl text-sm font-bold transition border-b-2 -mb-px whitespace-nowrap ${activeTab === tab.id ? "border-cyan-400 text-cyan-400 bg-cyan-500/[0.07]" : "border-transparent text-white/40 hover:text-white/70"}`}>
                <tab.icon size={15} /> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "team" && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-cyan-400" /></div>
              ) : employees.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
                  <Users size={36} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/30 text-sm mb-2">Aucun employé enregistré</p>
                  <p className="text-white/20 text-xs mb-4">Activez le mode admin pour ajouter des employés</p>
                  {!isAdmin && <button onClick={() => setShowAdminPin(true)} className="px-5 py-2.5 rounded-2xl border border-orange-500/20 bg-orange-500/[0.07] text-orange-300 text-sm font-bold flex items-center gap-2 mx-auto"><ShieldCheck size={14} /> Mode admin</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {employees.map((employee) => {
                    const pending = pendingByEmployee[employee.id] || 0;
                    return (
                      <div key={employee.id} className={`rounded-[24px] border p-4 sm:p-5 transition-all relative ${employee.is_active ? "border-green-500/20 bg-gradient-to-br from-green-500/[0.06] to-green-900/5" : "border-white/[0.08] bg-white/[0.02]"}`}>
                        {/* Pastille rouge admin */}
                        {isAdmin && pending > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 border-2 border-[#030b1d] flex items-center justify-center">
                            <span className="text-white text-[10px] font-black">{pending}</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                              <Users size={18} className="text-cyan-300" />
                            </div>
                            <div>
                              <h3 className="text-white font-black text-base">{employee.full_name}</h3>
                              <p className="text-white/40 text-xs">{employee.role}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${employee.is_active ? "bg-green-500/15 border-green-500/30 text-green-300" : "bg-white/[0.05] border-white/10 text-white/30"}`}>
                              {employee.is_active ? "ACTIF" : "INACTIF"}
                            </span>
                            {employee.is_admin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-bold">ADMIN</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={12} className="text-cyan-400 shrink-0" />
                            <span className="text-white/40 text-xs">PIN : <span className="text-cyan-400 font-bold">••••</span></span>
                          </div>
                          {employee.email && <div className="flex items-center gap-2"><span className="text-white/40 text-xs truncate">{employee.email}</span></div>}
                          {isAdmin && pending > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle size={12} className="text-orange-400 shrink-0" />
                              <span className="text-orange-300 text-xs font-bold">{pending} pointage(s) en attente</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => isAdmin ? setShowHoursFor(employee) : setShowPinFor(employee)} className="flex-1 h-9 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition text-xs font-bold flex items-center justify-center gap-1.5">
                            <Eye size={12} /> {isAdmin ? "Voir les heures" : "Mes heures"}
                          </button>
                          {isAdmin && (
                            <>
                              <button onClick={() => { setEditingEmployee(employee); setShowEmployeeModal(true); }} className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white transition flex items-center justify-center">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => deleteEmployee(employee.id)} className="h-9 w-9 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition">
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isAdmin && (
                    <button onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true); }} className="rounded-[24px] border-2 border-dashed border-white/10 bg-transparent hover:bg-white/[0.02] hover:border-white/20 p-5 transition-all flex flex-col items-center justify-center gap-3 min-h-[180px] text-white/25 hover:text-white/50">
                      <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center"><Plus size={20} /></div>
                      <p className="text-sm font-bold">Ajouter un employé</p>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "planning" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-white/40 text-sm font-bold">{weekLabel}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeekOffset((w) => w - 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white"><ChevronLeft size={16} /></button>
                  <button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 hover:text-white text-xs font-bold transition">Auj.</button>
                  <button onClick={() => setWeekOffset((w) => w + 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white"><ChevronRight size={16} /></button>
                  {isAdmin && (
                    <button onClick={() => setShowAddShift(true)} className="h-9 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-xs font-black flex items-center gap-1.5"><Plus size={13} /> Créneau</button>
                  )}
                </div>
              </div>

              {showAddShift && isAdmin && (
                <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/[0.05] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-white">Nouveau créneau</h3>
                    <button onClick={() => setShowAddShift(false)} className="text-white/30 hover:text-white transition"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Employé</label>
                      <select value={newShift.employee_id || ""} onChange={(e) => setNewShift({ ...newShift, employee_id: Number(e.target.value) })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none">
                        <option value="">Choisir...</option>
                        {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Date</label>
                      <input type="date" value={newShift.date || ""} onChange={(e) => setNewShift({ ...newShift, date: e.target.value })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Début</label>
                      <input type="time" value={newShift.start_time || ""} onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-white/30 text-xs mb-1 block">Fin</label>
                      <input type="time" value={newShift.end_time || ""} onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input value={newShift.note || ""} onChange={(e) => setNewShift({ ...newShift, note: e.target.value })} placeholder="Note (optionnel)" className="flex-1 h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
                    <button onClick={saveShift} className="h-11 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black font-black text-sm flex items-center gap-2"><Save size={14} /> Ajouter</button>
                  </div>
                </div>
              )}

              <div className="rounded-[24px] border border-white/10 bg-white/[0.02] overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-white/30 font-bold text-[10px] uppercase tracking-widest p-4 w-36">Employé</th>
                      {weekDates.map((date, i) => {
                        const isToday = toISO(date) === toISO(new Date());
                        return (
                          <th key={i} className={`text-center p-3 ${isToday ? "bg-cyan-500/10" : ""}`}>
                            <p className="text-white/30 text-[10px] font-bold uppercase">{DAYS_FR[i].slice(0, 3)}</p>
                            <p className={`text-sm font-black mt-0.5 ${isToday ? "text-cyan-400" : "text-white/60"}`}>{date.getDate()}</p>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {activeEmployees.map((emp, idx) => (
                      <tr key={emp.id} className={`border-b border-white/[0.04] ${idx % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0"><Users size={12} className="text-cyan-300" /></div>
                            <div className="min-w-0">
                              <p className="text-white text-xs font-bold truncate">{emp.full_name}</p>
                              <p className="text-white/30 text-[10px] truncate">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        {weekDates.map((date, i) => {
                          const dayShifts = getShiftsForDay(emp.id, date);
                          const isToday = toISO(date) === toISO(new Date());
                          return (
                            <td key={i} className={`p-2 align-top ${isToday ? "bg-cyan-500/[0.05]" : ""}`}>
                              <div className="space-y-1 min-h-[40px]">
                                {dayShifts.map((shift) => (
                                  <div key={shift.id} className="group relative rounded-xl bg-cyan-500/20 border border-cyan-500/30 px-2 py-1.5">
                                    <p className="text-cyan-300 text-[10px] font-bold">{shift.start_time} - {shift.end_time}</p>
                                    {shift.note && <p className="text-white/40 text-[9px]">{shift.note}</p>}
                                    {isAdmin && (
                                      <button onClick={() => deleteShift(shift.id!)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-red-400"><X size={10} /></button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {activeEmployees.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-white/25 text-sm">Aucun employé actif</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}