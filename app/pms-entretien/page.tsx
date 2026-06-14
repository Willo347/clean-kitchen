"use client";

import { useAdminPin } from "@/hooks/useAdminPin";
import { useEffect, useMemo, useState, useCallback } from "react";

import {
  ShieldCheck, CheckCircle2, Clock3, CalendarDays, Plus, X,
  Trash2, Lock, Unlock, ChevronRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Task = {
  id: string; title: string; frequency: string; status: string;
  day_of_week?: string | null; validated_by?: string | null; validated_at?: string | null;
};

const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function PMSEntretienPage() {
  const adminPin = useAdminPin();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("Quotidien");
  const [selectedDay, setSelectedDay] = useState("Lundi");
  const [showTodayPanel, setShowTodayPanel] = useState(true);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [employeeName, setEmployeeName] = useState("");

  useEffect(() => {
    const dayIndex = new Date().getDay();
    const mapped = [6, 0, 1, 2, 3, 4, 5][dayIndex];
    setSelectedDay(DAYS[mapped]);
  }, []);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase.from("pms_tasks").select("*").order("created_at", { ascending: false });
    if (data) setTasks(data);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function addTask() {
    if (!title.trim()) return;
    const payload: Record<string, unknown> = { title: title.trim(), frequency, status: "pending" };
    if (frequency === "Hebdomadaire") payload.day_of_week = selectedDay;
    const { error } = await supabase.from("pms_tasks").insert([payload]);
    if (!error) { setTitle(""); fetchTasks(); }
  }

  async function validateTask() {
    if (!selectedTask || !employeeName.trim()) return;
    await supabase.from("pms_tasks").update({ status: "validated", validated_by: employeeName.trim(), validated_at: new Date().toISOString() }).eq("id", selectedTask.id);
    setShowValidationModal(false); setSelectedTask(null); setEmployeeName("");
    fetchTasks();
  }

  async function deleteTask(taskId: string) {
    if (!authorized) return;
    if (!confirm("Supprimer cette tâche ?")) return;
    await supabase.from("pms_tasks").delete().eq("id", taskId);
    fetchTasks();
  }

  function checkPin() {
    if (pin === adminPin) {
      setAuthorized(true); setPinError(false); setPin("");
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.frequency === "Quotidien") return true;
      if (task.frequency === "Hebdomadaire" && task.day_of_week === selectedDay) return true;
      return false;
    });
  }, [tasks, selectedDay]);

  const validatedTasks = filteredTasks.filter((t) => t.status === "validated");
  const pendingTasks = filteredTasks.filter((t) => t.status !== "validated");

  const now = new Date();
  const dayNames = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const todayLabel = `${dayNames[now.getDay()]} ${now.getDate()} ${MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5">
      <div className="mx-auto max-w-[1450px] rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-4 sm:p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-4 sm:space-y-5">

        {/* HEADER */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 items-start">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-[0.32em] text-xs font-semibold mb-3">
              <ShieldCheck size={14} /> PMS ENTRETIEN
            </div>
            <h1 className="text-[36px] sm:text-[52px] font-black leading-[0.95] tracking-[-0.04em]">PMS Entretien</h1>
            <p className="text-white/40 text-base mt-2">Gestion des tâches cuisine</p>
          </div>
          <button onClick={() => setShowTodayPanel(!showTodayPanel)} className="rounded-[24px] border border-pink-500/20 bg-gradient-to-br from-pink-500/15 to-purple-900/10 p-5 text-left hover:border-pink-500/40 hover:scale-[1.01] transition-all">
            <p className="text-pink-300 uppercase tracking-[0.28em] text-[10px] font-black mb-3">AUJOURD'HUI</p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-black leading-tight capitalize text-white">{todayLabel}</h2>
                <p className="text-white/50 text-sm mt-1">{pendingTasks.length} tâche(s) restante(s)</p>
              </div>
              <div className="flex items-center gap-2">
                {pendingTasks.length > 0 && <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />}
                <ChevronRight size={18} className="text-white/30" />
              </div>
            </div>
          </button>
        </div>

        {/* DAY SELECTOR */}
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${selectedDay === day ? "bg-cyan-400 text-black shadow-[0_4px_16px_rgba(6,182,212,0.3)]" : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/[0.06]"}`}>
              {day}
            </button>
          ))}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => setShowTodayPanel(true)} className="group rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-5 text-left hover:border-cyan-500/40 hover:scale-[1.01] transition-all">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-cyan-300 text-sm font-semibold">Tâches du jour</p><h2 className="text-[48px] font-black leading-none mt-3 text-white">{filteredTasks.length}</h2></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20"><CalendarDays className="w-5 h-5 text-cyan-300" /></div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-cyan-300 group-hover:gap-2 transition-all">Voir les tâches <ChevronRight size={12} /></div>
          </button>

          <button onClick={() => setShowTodayPanel(true)} className="group rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-5 text-left hover:border-green-500/40 hover:scale-[1.01] transition-all">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-green-300 text-sm font-semibold">Validées</p><h2 className="text-[48px] font-black leading-none mt-3 text-white">{validatedTasks.length}</h2></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20"><CheckCircle2 className="w-5 h-5 text-green-300" /></div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-green-300 group-hover:gap-2 transition-all">Voir le détail <ChevronRight size={12} /></div>
          </button>

          <button onClick={() => setShowTodayPanel(true)} className={`group rounded-[24px] border p-5 text-left hover:scale-[1.01] transition-all ${pendingTasks.length > 0 ? "border-orange-500/40 bg-gradient-to-br from-orange-500/20 to-orange-900/10" : "border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-900/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-orange-300 text-sm font-semibold">À faire</p><h2 className="text-[48px] font-black leading-none mt-3 text-white">{pendingTasks.length}</h2></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20"><Clock3 className={`w-5 h-5 text-orange-300 ${pendingTasks.length > 0 ? "animate-pulse" : ""}`} /></div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-orange-300 group-hover:gap-2 transition-all">Voir les tâches <ChevronRight size={12} /></div>
          </button>
        </div>

        {/* TASKS PANEL */}
        {showTodayPanel && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-white">Tâches du jour</h2>
                <p className="text-white/40 text-sm mt-0.5">{selectedDay}</p>
              </div>
              <button onClick={() => setShowTodayPanel(false)} className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"><X size={16} /></button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-white/30"><CalendarDays size={32} className="mx-auto mb-3 opacity-40" /><p className="text-sm">Aucune tâche pour ce jour</p></div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div key={task.id} className={`rounded-[20px] border p-4 transition-all ${task.status === "validated" ? "border-green-500/20 bg-green-500/[0.05]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-black break-words ${task.status === "validated" ? "text-white/50 line-through" : "text-white"}`}>{task.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-white/40 text-xs font-medium border border-white/[0.06]">{task.frequency}</span>
                          {task.day_of_week && <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-white/40 text-xs font-medium border border-white/[0.06]">{task.day_of_week}</span>}
                          {task.status === "validated" && task.validated_by && <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">✓ {task.validated_by}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.status === "validated" ? (
                          <span className="px-4 py-2 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 font-black text-xs">VALIDÉE</span>
                        ) : (
                          <button onClick={() => { setSelectedTask(task); setShowValidationModal(true); }} className="px-4 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 font-black text-xs transition">À FAIRE</button>
                        )}
                        {authorized && (
                          <button onClick={() => deleteTask(task.id)} className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD TASK */}
        <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center"><Plus className="text-cyan-300 w-4 h-4" /></div>
              <div><h2 className="text-lg font-black text-white">Ajouter une tâche PMS</h2><p className="text-white/40 text-xs mt-0.5">Accès administrateur sécurisé</p></div>
            </div>
            {!authorized ? (
              <div className="flex gap-3 flex-wrap">
                <input type="password" placeholder="Code PIN" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkPin()} className={`h-11 w-32 rounded-2xl bg-white/[0.05] border px-4 text-sm outline-none text-white transition ${pinError ? "border-red-500/60 bg-red-500/10" : "border-white/10"}`} />
                <button onClick={checkPin} className="h-11 px-5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2">
                  <Lock size={14} />{pinError ? "PIN incorrect" : "Déverrouiller"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold"><Unlock size={12} /> Admin connecté</span>
                <button onClick={() => setShowAddPanel(!showAddPanel)} className="h-11 px-5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black">{showAddPanel ? "Fermer" : "Nouvelle tâche"}</button>
              </div>
            )}
          </div>

          {showAddPanel && authorized && (
            <div className="border-t border-white/[0.06] mt-5 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Nom de la tâche" className="h-12 sm:col-span-2 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white outline-none" />
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white outline-none">
                  <option>Quotidien</option>
                  <option>Hebdomadaire</option>
                  <option>Mensuel</option>
                </select>
                {frequency === "Hebdomadaire" && (
                  <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white outline-none">
                    {DAYS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                )}
                <button onClick={addTask} disabled={!title.trim()} className="h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 transition text-black text-sm font-black flex items-center justify-center gap-2">
                  <Plus size={16} /> Ajouter
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* VALIDATION MODAL */}
      {showValidationModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowValidationModal(false)}>
          <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#071226] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="text-xl font-black text-white">Validation</h2><p className="text-white/40 text-sm mt-0.5 line-clamp-1">{selectedTask.title}</p></div>
              <button onClick={() => setShowValidationModal(false)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && validateTask()} placeholder="Nom de l'employé" autoFocus className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white outline-none" />
              <button onClick={validateTask} disabled={!employeeName.trim()} className="w-full h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 transition text-black font-black text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Valider la tâche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
