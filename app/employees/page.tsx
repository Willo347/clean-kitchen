"use client";

import { useEffect, useState, useCallback } from "react";

import {
  Users,
  ShieldCheck,
  Clock3,
  UserPlus,
  Trash2,
  BadgeCheck,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  CheckCircle2,
  Calendar,
  Timer,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  role: string;
  status: string;
  pin_code: string;
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
  hours_worked: number;
  note?: string;
}

type ActiveTab = "employees" | "planning" | "hours";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// TOAST COMPONENT
// ─────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
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

// ─────────────────────────────────────────────
// EMPLOYEE MODAL
// ─────────────────────────────────────────────

function EmployeeModal({
  employee,
  onClose,
  onSave,
  isSaving,
}: {
  employee: Partial<Employee> | null;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Employee>>(
    employee || { firstname: "", lastname: "", role: "", pin_code: "", status: "ACTIF" }
  );
  const isEdit = !!employee?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#030b1d] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">{isEdit ? "Modifier l'employé" : "Nouvel employé"}</h2>
            <p className="text-white/30 text-xs mt-0.5">{isEdit ? `${form.firstname} ${form.lastname}` : "Remplissez les informations"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Prénom *</label>
              <input value={form.firstname || ""} onChange={(e) => setForm({ ...form, firstname: e.target.value })} placeholder="Prénom" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Nom *</label>
              <input value={form.lastname || ""} onChange={(e) => setForm({ ...form, lastname: e.target.value })} placeholder="Nom" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Poste *</label>
            <input value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Chef de partie" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Code PIN (4 chiffres)</label>
              <input type="password" maxLength={4} value={form.pin_code || ""} onChange={(e) => setForm({ ...form, pin_code: e.target.value })} placeholder="••••" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Statut</label>
              <select value={form.status || "ACTIF"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none">
                <option value="ACTIF">ACTIF</option>
                <option value="INACTIF">INACTIF</option>
                <option value="CONGE">EN CONGÉ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-11 rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 hover:text-white text-sm font-bold transition">Annuler</button>
          <button onClick={() => onSave(form)} disabled={isSaving || !form.firstname || !form.lastname || !form.role} className="flex-1 h-11 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PLANNING TAB
// ─────────────────────────────────────────────

function PlanningTab({ employees }: { employees: Employee[] }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState<Partial<Shift>>({ start_time: "09:00", end_time: "17:00" });
  const [isSaving, setIsSaving] = useState(false);

  const weekDates = getWeekDates(weekOffset);
  const weekLabel = `${formatDateShort(weekDates[0])} — ${formatDateShort(weekDates[6])} ${weekDates[0].getFullYear()}`;

  const fetchShifts = useCallback(async () => {
    const startISO = toISO(weekDates[0]);
    const endISO = toISO(weekDates[6]);
    const { data } = await supabase
      .from("employee_shifts")
      .select("*")
      .gte("date", startISO)
      .lte("date", endISO);
    if (data) setShifts(data);
  }, [weekOffset]);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  function getShiftsForDay(employeeId: number, date: Date): Shift[] {
    return shifts.filter((s) => s.employee_id === employeeId && s.date === toISO(date));
  }

  async function saveShift() {
    if (!newShift.employee_id || !newShift.date || !newShift.start_time || !newShift.end_time) return;
    setIsSaving(true);
    await supabase.from("employee_shifts").insert({
      employee_id: newShift.employee_id,
      date: newShift.date,
      start_time: newShift.start_time,
      end_time: newShift.end_time,
      note: newShift.note || "",
    });
    await fetchShifts();
    setIsSaving(false);
    setShowAddShift(false);
    setNewShift({ start_time: "09:00", end_time: "17:00" });
  }

  async function deleteShift(id: number) {
    await supabase.from("employee_shifts").delete().eq("id", id);
    fetchShifts();
  }

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
            <Calendar size={16} className="text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Planning semaine</h2>
            <p className="text-white/30 text-xs">{weekLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition text-white/60 hover:text-white text-xs font-bold">
            Auj.
          </button>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition text-white/60 hover:text-white">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setShowAddShift(true)} className="h-9 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-xs font-black flex items-center gap-1.5">
            <Plus size={13} /> Ajouter
          </button>
        </div>
      </div>

      {/* Add shift modal */}
      {showAddShift && (
        <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/[0.05] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Nouveau créneau</h3>
            <button onClick={() => setShowAddShift(false)} className="text-white/30 hover:text-white transition"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div>
              <label className="text-white/30 text-xs mb-1 block">Employé</label>
              <select value={newShift.employee_id || ""} onChange={(e) => setNewShift({ ...newShift, employee_id: Number(e.target.value) })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none">
                <option value="">Choisir...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.firstname} {emp.lastname}</option>
                ))}
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
          <div>
            <label className="text-white/30 text-xs mb-1 block">Note (optionnel)</label>
            <input value={newShift.note || ""} onChange={(e) => setNewShift({ ...newShift, note: e.target.value })} placeholder="Ex: Service midi" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
          </div>
          <button onClick={saveShift} disabled={isSaving} className="h-10 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center gap-2">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer
          </button>
        </div>
      )}

      {/* Planning grid */}
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
            {employees.filter((e) => e.status === "ACTIF").map((emp, idx) => (
              <tr key={emp.id} className={`border-b border-white/[0.04] ${idx % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Users size={12} className="text-cyan-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold truncate">{emp.firstname}</p>
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
                            <button onClick={() => deleteShift(shift.id!)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-300">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {employees.filter((e) => e.status === "ACTIF").length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-white/25 text-sm">Aucun employé actif</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOURS TAB
// ─────────────────────────────────────────────

function HoursTab({ employees }: { employees: Employee[] }) {
  const [hourLogs, setHourLogs] = useState<HourLog[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | "">("");
  const [date, setDate] = useState(toISO(new Date()));
  const [hoursWorked, setHoursWorked] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState<number | "all">("all");

  const fetchHourLogs = useCallback(async () => {
    const { data } = await supabase
      .from("employee_hours")
      .select("*")
      .order("date", { ascending: false });
    if (data) setHourLogs(data);
  }, []);

  useEffect(() => { fetchHourLogs(); }, [fetchHourLogs]);

  async function saveHours() {
    if (!selectedEmployee || !date || !hoursWorked) return;
    setIsSaving(true);
    await supabase.from("employee_hours").insert({
      employee_id: selectedEmployee,
      date,
      hours_worked: Number(hoursWorked),
      note: note.trim(),
    });
    await fetchHourLogs();
    setIsSaving(false);
    setHoursWorked("");
    setNote("");
  }

  async function deleteLog(id: number) {
    await supabase.from("employee_hours").delete().eq("id", id);
    fetchHourLogs();
  }

  // Filtered logs
  const filteredLogs = hourLogs.filter((log) =>
    filterEmployee === "all" ? true : log.employee_id === filterEmployee
  );

  // Total hours per employee this week
  const weekDates = getWeekDates(0);
  const weekStart = toISO(weekDates[0]);
  const weekEnd = toISO(weekDates[6]);

  const weeklyHours = employees.map((emp) => {
    const total = hourLogs
      .filter((l) => l.employee_id === emp.id && l.date >= weekStart && l.date <= weekEnd)
      .reduce((acc, l) => acc + (l.hours_worked || 0), 0);
    return { emp, total };
  }).filter((e) => e.total > 0);

  return (
    <div className="space-y-4">

      {/* Weekly summary */}
      {weeklyHours.length > 0 && (
        <div className="rounded-[24px] border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.07] to-violet-900/5 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/20">
              <Timer size={16} className="text-violet-300" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Heures cette semaine</h3>
              <p className="text-white/30 text-xs">{formatDateShort(weekDates[0])} — {formatDateShort(weekDates[6])}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weeklyHours.map(({ emp, total }) => (
              <div key={emp.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                <p className="text-white/40 text-xs mb-1">{emp.firstname} {emp.lastname}</p>
                <p className="text-white font-black text-xl">{total}h</p>
                <p className="text-white/30 text-[10px]">{emp.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add hours form */}
      <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
            <Plus size={16} className="text-cyan-300" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Saisir des heures</h3>
            <p className="text-white/30 text-xs">Enregistrement du temps de travail</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
          <div>
            <label className="text-white/30 text-xs mb-1 block">Employé *</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(Number(e.target.value))} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none">
              <option value="">Choisir...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.firstname} {emp.lastname}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white/30 text-xs mb-1 block">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-white/30 text-xs mb-1 block">Heures travaillées *</label>
            <input type="number" step="0.5" min="0" max="24" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} placeholder="Ex: 8" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-white/30 text-xs mb-1 block">Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: Service midi" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-3 text-white text-sm outline-none" />
          </div>
        </div>

        <button onClick={saveHours} disabled={isSaving || !selectedEmployee || !hoursWorked} className="mt-3 h-10 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center gap-2">
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Enregistrer les heures
        </button>
      </div>

      {/* Hours history */}
      <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h3 className="text-base font-black text-white">Historique des heures</h3>
          <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value === "all" ? "all" : Number(e.target.value))} className="h-9 rounded-xl bg-white/[0.05] border border-white/10 px-3 text-white text-xs outline-none">
            <option value="all">Tous les employés</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.firstname} {emp.lastname}</option>
            ))}
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-white/25">
            <Clock3 size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune heure enregistrée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const emp = employees.find((e) => e.id === log.employee_id);
              return (
                <div key={log.id} className="flex items-center justify-between gap-4 rounded-[18px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] p-3 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Clock3 size={14} className="text-violet-300" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{emp ? `${emp.firstname} ${emp.lastname}` : "—"}</p>
                      <p className="text-white/35 text-xs">{log.date} {log.note && `· ${log.note}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-violet-300 font-black text-lg">{log.hours_worked}h</span>
                    <button onClick={() => deleteLog(log.id!)} className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function EmployeesPage() {

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("employees");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = toastCounter + 1;
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [toastCounter]);

  const fetchEmployees = useCallback(async () => {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    setEmployees(data || []);
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchEmployees();
      setIsLoading(false);
    }
    init();
  }, [fetchEmployees]);

  async function handleSave(form: Partial<Employee>) {
    if (!form.firstname || !form.lastname || !form.role) return;
    setIsSaving(true);
    if (form.id) {
      await supabase.from("employees").update({ firstname: form.firstname, lastname: form.lastname, role: form.role, pin_code: form.pin_code, status: form.status }).eq("id", form.id);
      addToast(`${form.firstname} ${form.lastname} modifié`, "success");
    } else {
      await supabase.from("employees").insert({ firstname: form.firstname, lastname: form.lastname, role: form.role, pin_code: form.pin_code || "", status: form.status || "ACTIF" });
      addToast(`${form.firstname} ${form.lastname} ajouté`, "success");
    }
    await fetchEmployees();
    setIsSaving(false);
    setShowModal(false);
    setEditingEmployee(null);
  }

  async function deleteEmployee(id: number) {
    if (!confirm("Supprimer cet employé ?")) return;
    await supabase.from("employees").delete().eq("id", id);
    await fetchEmployees();
    addToast("Employé supprimé", "success");
  }

  const activeCount = employees.filter((e) => e.status === "ACTIF").length;
  const onLeaveCount = employees.filter((e) => e.status === "CONGE").length;

  const tabs = [
    { id: "employees" as ActiveTab, label: "Équipe", icon: Users },
    { id: "planning" as ActiveTab, label: "Planning", icon: Calendar },
    { id: "hours" as ActiveTab, label: "Heures", icon: Clock3 },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => { setShowModal(false); setEditingEmployee(null); }}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      <div className="min-h-screen bg-[#020817] text-white p-5">
        <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

          {/* ── HEADER ─────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <p className="uppercase tracking-[0.32em] text-cyan-400 font-semibold text-xs">EMPLOYEE MANAGEMENT</p>
              </div>
              <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Employés</h1>
              <p className="text-white/40 text-base mt-2">Gestion du personnel HACCP</p>
            </div>
            {activeTab === "employees" && (
              <button
                onClick={() => { setEditingEmployee(null); setShowModal(true); }}
                className="mt-2 h-10 px-5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            )}
          </div>

          {/* ── KPI CARDS ──────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-cyan-300 text-sm font-semibold">Total employés</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{employees.length}</h2>
                  <p className="text-cyan-400/50 text-xs mt-1">dans l'équipe</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                  <Users size={20} className="text-cyan-300" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-green-300 text-sm font-semibold">Actifs</p>
                  <h2 className="text-[48px] font-black text-white leading-none mt-3">{activeCount}</h2>
                  <p className="text-green-400/50 text-xs mt-1">en service</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20">
                  <BadgeCheck size={20} className="text-green-300" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-blue-900/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-blue-300 text-sm font-semibold">HACCP Staff</p>
                  <h2 className="text-[36px] font-black text-white leading-none mt-3">ONLINE</h2>
                  {onLeaveCount > 0 && <p className="text-orange-400/70 text-xs mt-1">{onLeaveCount} en congé</p>}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/20">
                  <ShieldCheck size={20} className="text-blue-300" />
                </div>
              </div>
            </div>
          </div>

          {/* ── TABS ───────────────────────────────── */}
          <div className="flex gap-2 border-b border-white/[0.06] pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-bold transition border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/[0.07]"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── EMPLOYEES TAB ──────────────────────── */}
          {activeTab === "employees" && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-cyan-400" />
                </div>
              ) : employees.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
                  <Users size={36} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/30 text-sm mb-4">Aucun employé enregistré</p>
                  <button onClick={() => { setEditingEmployee(null); setShowModal(true); }} className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2 mx-auto">
                    <UserPlus size={14} /> Ajouter le premier employé
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className={`rounded-[24px] border p-5 transition-all ${employee.status === "ACTIF" ? "border-green-500/20 bg-gradient-to-br from-green-500/[0.06] to-green-900/5" : employee.status === "CONGE" ? "border-orange-500/20 bg-gradient-to-br from-orange-500/[0.06] to-orange-900/5" : "border-white/[0.08] bg-white/[0.02]"}`}>
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                            <Users size={18} className="text-cyan-300" />
                          </div>
                          <div>
                            <h3 className="text-white font-black text-base">{employee.firstname} {employee.lastname}</h3>
                            <p className="text-white/40 text-xs">{employee.role}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${employee.status === "ACTIF" ? "bg-green-500/15 border-green-500/30 text-green-300" : employee.status === "CONGE" ? "bg-orange-500/15 border-orange-500/30 text-orange-300" : "bg-white/[0.05] border-white/10 text-white/30"}`}>
                          {employee.status}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={12} className="text-cyan-400 shrink-0" />
                          <span className="text-white/40 text-xs">PIN : <span className="text-cyan-400 font-bold">Configuré</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 size={12} className="text-white/25 shrink-0" />
                          <span className="text-white/40 text-xs">Ajouté le {new Date(employee.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingEmployee(employee); setShowModal(true); }} className="flex-1 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white transition text-xs font-bold flex items-center justify-center gap-1.5">
                          <Pencil size={12} /> Modifier
                        </button>
                        <button onClick={() => deleteEmployee(employee.id)} className="h-9 w-9 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add card */}
                  <button onClick={() => { setEditingEmployee(null); setShowModal(true); }} className="rounded-[24px] border-2 border-dashed border-white/10 bg-transparent hover:bg-white/[0.02] hover:border-white/20 p-5 transition-all flex flex-col items-center justify-center gap-3 min-h-[180px] text-white/25 hover:text-white/50">
                    <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    <p className="text-sm font-bold">Ajouter un employé</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PLANNING TAB ───────────────────────── */}
          {activeTab === "planning" && <PlanningTab employees={employees} />}

          {/* ── HOURS TAB ──────────────────────────── */}
          {activeTab === "hours" && <HoursTab employees={employees} />}

        </div>
      </div>
    </>
  );
}
