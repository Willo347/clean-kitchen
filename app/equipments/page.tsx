"use client";

import { useAdminPin } from "@/hooks/useAdminPin";
import { useEffect, useState, useCallback } from "react";

import {
  Pencil, Trash2, Plus, Snowflake, Wifi, AlertTriangle, CheckCircle2,
  X, Loader2, Thermometer, MapPin, Settings2, ShieldCheck, Lock, Unlock,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Equipment = {
  id: number; name: string; zone: string; type: string;
  temp_min: number; temp_max: number;
};

function EquipmentModal({ equipment, onClose, onSave, isSaving }: {
  equipment: Partial<Equipment> | null; onClose: () => void;
  onSave: (data: Partial<Equipment>) => void; isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Equipment>>(
    equipment || { name: "", zone: "", type: "", temp_min: 0, temp_max: 4 }
  );
  const isEdit = !!equipment?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#030b1d] p-5 sm:p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">{isEdit ? "Modifier l'équipement" : "Nouvel équipement"}</h2>
            <p className="text-white/30 text-xs mt-0.5">{isEdit ? form.name : "Remplissez les informations"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Nom</label>
            <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Chambre froide 1" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Zone</label>
            <input value={form.zone || ""} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Ex: Cuisine froide" className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Type</label>
            <select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none">
              <option value="">Sélectionner un type</option>
              <option value="Chambre froide">Chambre froide</option>
              <option value="Congélateur">Congélateur</option>
              <option value="Réfrigérateur">Réfrigérateur</option>
              <option value="Vitrine réfrigérée">Vitrine réfrigérée</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Temp. min (°C)</label>
              <input type="number" value={form.temp_min ?? 0} onChange={(e) => setForm({ ...form, temp_min: Number(e.target.value) })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Temp. max (°C)</label>
              <input type="number" value={form.temp_max ?? 4} onChange={(e) => setForm({ ...form, temp_max: Number(e.target.value) })} className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-white text-sm outline-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5 sm:mt-6">
          <button onClick={onClose} className="flex-1 h-11 rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 hover:text-white text-sm font-bold transition">Annuler</button>
          <button onClick={() => onSave(form)} disabled={isSaving || !form.name || !form.zone} className="flex-1 h-11 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition text-black font-black text-sm flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentsPage() {
  const adminPin = useAdminPin();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [temperatures, setTemperatures] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Partial<Equipment> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const loadEquipments = useCallback(async () => {
    const { data, error } = await supabase.from("equipments").select("*").order("id", { ascending: true });
    if (!error && data) setEquipments(data);
  }, []);

  const loadTemperatures = useCallback(async () => {
    const { data, error } = await supabase.from("temperature_logs").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      const latestTemps: Record<string, number> = {};
      data.forEach((log: any) => {
        const key = log.equipment?.toLowerCase().trim();
        if (key && latestTemps[key] === undefined) latestTemps[key] = log.temperature;
      });
      setTemperatures(latestTemps);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([loadEquipments(), loadTemperatures()]);
      setIsLoading(false);
    }
    init();
  }, [loadEquipments, loadTemperatures]);

  function checkPin() {
    if (pin === adminPin) {
      setIsAdmin(true); setShowPinInput(false); setPin(""); setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  }

  async function handleSave(form: Partial<Equipment>) {
    if (!form.name || !form.zone) return;
    setIsSaving(true);
    if (form.id) {
      await supabase.from("equipments").update({ name: form.name, zone: form.zone, type: form.type, temp_min: form.temp_min, temp_max: form.temp_max }).eq("id", form.id);
    } else {
      await supabase.from("equipments").insert({ name: form.name, zone: form.zone, type: form.type || "Autre", temp_min: form.temp_min ?? 0, temp_max: form.temp_max ?? 4 });
    }
    await loadEquipments();
    setIsSaving(false); setShowModal(false); setEditingEquipment(null);
  }

  async function deleteEquipment(id: number) {
    if (!confirm("Supprimer cet équipement ?")) return;
    await supabase.from("equipments").delete().eq("id", id);
    loadEquipments();
  }

  const alertsCount = equipments.filter((eq) => {
    const temp = temperatures[eq.name?.toLowerCase().trim()];
    if (temp === undefined) return false;
    return temp < eq.temp_min || temp > eq.temp_max;
  }).length;

  const onlineCount = equipments.filter((eq) => temperatures[eq.name?.toLowerCase().trim()] !== undefined).length;

  return (
    <>
      {showModal && isAdmin && (
        <EquipmentModal equipment={editingEquipment} onClose={() => { setShowModal(false); setEditingEquipment(null); }} onSave={handleSave} isSaving={isSaving} />
      )}

      <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5 overflow-x-hidden">
        <div className="mx-auto max-w-[1450px] rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-4 sm:p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-4 sm:space-y-5">

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold text-xs truncate">EQUIPMENT MANAGEMENT</p>
              </div>
              <h1 className="text-[32px] sm:text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Équipements</h1>
              <p className="text-white/40 text-sm sm:text-base mt-2">Gestion des équipements de température</p>
            </div>
            <div className="flex items-center gap-2 mt-1 shrink-0">
              {isAdmin ? (
                <>
                  <button onClick={() => { setEditingEquipment(null); setShowModal(true); }} className="h-10 px-4 sm:px-5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2">
                    <Plus size={16} /><span className="hidden sm:inline">Ajouter</span>
                  </button>
                  <button onClick={() => setIsAdmin(false)} className="h-10 px-3 sm:px-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition flex items-center gap-2 text-sm font-bold">
                    <Unlock size={14} /><span className="hidden sm:inline">Admin</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {showPinInput ? (
                    <>
                      <input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && checkPin()} placeholder="PIN" autoFocus className={`h-10 w-16 sm:w-20 rounded-2xl border px-3 text-white text-sm outline-none text-center ${pinError ? "border-red-500/60 bg-red-500/10" : "border-white/10 bg-white/[0.05]"}`} />
                      <button onClick={checkPin} className="h-10 px-3 sm:px-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black">OK</button>
                      <button onClick={() => { setShowPinInput(false); setPin(""); }} className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 flex items-center justify-center transition"><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => setShowPinInput(true)} className="h-10 px-3 sm:px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition flex items-center gap-2 text-sm font-bold">
                      <Lock size={14} /><span className="hidden sm:inline">Mode admin</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-cyan-300 text-sm font-semibold">Équipements</p><h2 className="text-[40px] sm:text-[48px] font-black text-white leading-none mt-2 sm:mt-3">{equipments.length}</h2><p className="text-cyan-400/50 text-xs mt-1">enregistrés</p></div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0"><Snowflake size={18} className="text-cyan-300" /></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-green-300 text-sm font-semibold">En ligne</p><h2 className="text-[40px] sm:text-[48px] font-black text-white leading-none mt-2 sm:mt-3">{onlineCount}</h2><p className="text-green-400/50 text-xs mt-1">avec relevé récent</p></div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/20 shrink-0"><Wifi size={18} className="text-green-300" /></div>
              </div>
            </div>
            <div className={`rounded-[24px] border p-4 sm:p-5 ${alertsCount > 0 ? "border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/10" : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-red-300 text-sm font-semibold">Alertes</p><h2 className="text-[40px] sm:text-[48px] font-black text-white leading-none mt-2 sm:mt-3">{alertsCount}</h2>{alertsCount > 0 && <p className="text-red-400/70 text-xs mt-1 font-bold">Action requise</p>}</div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/20 shrink-0"><AlertTriangle size={18} className={`text-red-300 ${alertsCount > 0 ? "animate-pulse" : ""}`} /></div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>
          ) : equipments.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-12 text-center">
              <Snowflake size={40} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/30 text-sm">Aucun équipement enregistré</p>
              {isAdmin && <button onClick={() => { setEditingEquipment(null); setShowModal(true); }} className="mt-4 px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black text-sm font-black flex items-center gap-2 mx-auto"><Plus size={14} /> Ajouter le premier équipement</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {equipments.map((equipment) => {
                const currentTemp = temperatures[equipment.name?.toLowerCase().trim()];
                const isAlert = currentTemp !== undefined && (currentTemp < equipment.temp_min || currentTemp > equipment.temp_max);
                const isOnline = currentTemp !== undefined;
                return (
                  <div key={equipment.id} className={`rounded-[24px] border p-4 sm:p-5 transition-all ${isAlert ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-900/5" : isOnline ? "border-green-500/20 bg-gradient-to-br from-green-500/[0.07] to-green-900/5" : "border-white/[0.08] bg-white/[0.02]"}`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isAlert ? "bg-red-500/20 border border-red-500/30" : "bg-cyan-500/20 border border-cyan-500/20"}`}>
                          <Snowflake size={18} className={isAlert ? "text-red-300" : "text-cyan-300"} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-black text-base leading-tight break-words">{equipment.name}</h3>
                          <p className="text-white/30 text-xs">{equipment.type || "—"}</p>
                        </div>
                      </div>
                      {isAlert ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold"><AlertTriangle size={9} /> ALERTE</span>
                      ) : isOnline ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-bold"><Wifi size={9} /> ONLINE</span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/30 text-xs font-bold">— OFFLINE</span>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-white/40 text-xs"><MapPin size={12} className="text-white/25 shrink-0" /><span>Zone : <span className="text-white/60 font-medium">{equipment.zone}</span></span></div>
                      <div className="flex items-center gap-2 text-white/40 text-xs"><Thermometer size={12} className="text-white/25 shrink-0" /><span>Seuils : <span className="text-white/60 font-medium">{equipment.temp_min}°C → {equipment.temp_max}°C</span></span></div>
                    </div>
                    <div className={`rounded-2xl p-4 mb-4 flex items-center justify-between ${isAlert ? "bg-red-500/10 border border-red-500/20" : isOnline ? "bg-green-500/10 border border-green-500/20" : "bg-white/[0.03] border border-white/[0.06]"}`}>
                      <div>
                        <p className="text-white/30 text-xs mb-1">Température live</p>
                        <p className={`text-3xl font-black ${isAlert ? "text-red-400" : isOnline ? "text-green-300" : "text-white/20"}`}>{currentTemp !== undefined ? `${currentTemp}°C` : "—"}</p>
                      </div>
                      {isAlert && <AlertTriangle size={24} className="text-red-400 animate-pulse" />}
                      {!isAlert && isOnline && <CheckCircle2 size={24} className="text-green-400" />}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingEquipment(equipment); setShowModal(true); }} className="flex-1 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white transition text-xs font-bold flex items-center justify-center gap-1.5"><Pencil size={12} /> Modifier</button>
                        <button onClick={() => deleteEquipment(equipment.id)} className="h-9 w-9 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
              {isAdmin && (
                <button onClick={() => { setEditingEquipment(null); setShowModal(true); }} className="rounded-[24px] border-2 border-dashed border-white/10 bg-transparent hover:bg-white/[0.02] hover:border-white/20 p-5 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] text-white/25 hover:text-white/50">
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center"><Plus size={20} /></div>
                  <p className="text-sm font-bold">Ajouter un équipement</p>
                </button>
              )}
            </div>
          )}

          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shrink-0"><Settings2 size={16} className="text-white/40" /></div>
              <div><h2 className="text-base font-black text-white">Récapitulatif des zones</h2><p className="text-white/30 text-xs">Plages de températures réglementaires</p></div>
            </div>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Équipement","Zone","Type","Min","Max","Statut"].map((h) => (
                      <th key={h} className="text-left text-white/30 font-bold text-[10px] uppercase tracking-widest pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {equipments.map((eq) => {
                    const temp = temperatures[eq.name?.toLowerCase().trim()];
                    const isAlert = temp !== undefined && (temp < eq.temp_min || temp > eq.temp_max);
                    return (
                      <tr key={eq.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                        <td className="py-2.5 pr-4 text-white font-medium text-sm">{eq.name}</td>
                        <td className="py-2.5 pr-4 text-white/50 text-xs">{eq.zone}</td>
                        <td className="py-2.5 pr-4 text-white/50 text-xs">{eq.type || "—"}</td>
                        <td className="py-2.5 pr-4 text-cyan-400 font-bold text-sm">{eq.temp_min}°C</td>
                        <td className="py-2.5 pr-4 text-cyan-400 font-bold text-sm">{eq.temp_max}°C</td>
                        <td className="py-2.5">
                          {isAlert ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold"><AlertTriangle size={9} /> ALERTE</span>
                          ) : temp !== undefined ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-bold"><CheckCircle2 size={9} /> OK</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/30 text-xs font-bold">— Offline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {!isAdmin && (
            <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0"><ShieldCheck size={16} className="text-white/30" /></div>
              <div className="flex-1 min-w-0"><p className="text-white/40 text-xs font-medium">Accès administrateur requis pour ajouter ou modifier des équipements.</p></div>
              <button onClick={() => setShowPinInput(true)} className="h-9 px-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white transition text-xs font-bold flex items-center gap-2 shrink-0"><Lock size={12} /> Déverrouiller</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
