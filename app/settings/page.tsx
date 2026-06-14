"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
} from "lucide-react";

import {
  DEFAULT_MENU_ITEMS,
  ICON_MAP,
  SIDEBAR_ORDER_KEY,
  getSidebarItems,
} from "../components/Sidebar";

import { supabase } from "@/lib/supabase";

type MenuItem = typeof DEFAULT_MENU_ITEMS[number];

export default function SettingsPage() {
  // ── Menu order ──────────────────────────────
  const [items, setItems] = useState<MenuItem[]>([]);
  const [menuSaved, setMenuSaved] = useState(false);

  // ── PIN admin ────────────────────────────────
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinStatus, setPinStatus] = useState<"idle" | "success" | "error">("idle");
  const [pinMessage, setPinMessage] = useState("");
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  useEffect(() => {
    setItems(getSidebarItems());
    // Vérifier si un PIN existe déjà
    async function checkPin() {
      const { data } = await supabase.from("settings").select("admin_pin").single();
      setHasExistingPin(!!(data?.admin_pin));
    }
    checkPin();
  }, []);

  // ── Menu handlers ────────────────────────────
  function moveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    setMenuSaved(false);
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    setMenuSaved(false);
  }

  function handleSaveMenu() {
    const ids = items.map((item) => item.id);
    localStorage.setItem(SIDEBAR_ORDER_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("ck_sidebar_updated"));
    setMenuSaved(true);
    setTimeout(() => setMenuSaved(false), 3000);
  }

  function handleResetMenu() {
    localStorage.removeItem(SIDEBAR_ORDER_KEY);
    window.dispatchEvent(new Event("ck_sidebar_updated"));
    setItems([...DEFAULT_MENU_ITEMS]);
    setMenuSaved(false);
  }

  // ── PIN handlers ─────────────────────────────
  async function handleSavePin() {
    setPinStatus("idle");
    setPinMessage("");

    // Validation format
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinStatus("error");
      setPinMessage("Le nouveau PIN doit contenir exactement 4 chiffres.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatus("error");
      setPinMessage("Les deux PIN ne correspondent pas.");
      return;
    }

    setIsSavingPin(true);

    // Si un PIN existe déjà, vérifier l'ancien
    if (hasExistingPin) {
      setIsVerifyingPin(true);
      const { data } = await supabase.from("settings").select("admin_pin").single();
      setIsVerifyingPin(false);
      if (data?.admin_pin !== currentPin) {
        setPinStatus("error");
        setPinMessage("PIN actuel incorrect.");
        setIsSavingPin(false);
        return;
      }
    }

    // Sauvegarder le nouveau PIN
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, admin_pin: newPin });

    setIsSavingPin(false);

    if (error) {
      setPinStatus("error");
      setPinMessage("Erreur lors de la sauvegarde. Réessayez.");
      return;
    }

    setPinStatus("success");
    setPinMessage(hasExistingPin ? "PIN modifié avec succès !" : "PIN créé avec succès !");
    setHasExistingPin(true);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setTimeout(() => { setPinStatus("idle"); setPinMessage(""); }, 4000);
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5 overflow-x-hidden">
      <div className="mx-auto max-w-[900px] rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-4 sm:p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-4 sm:space-y-5">

        {/* HEADER */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold text-xs">PARAMÈTRES</p>
            </div>
            <h1 className="text-[32px] sm:text-[48px] font-black leading-[0.95] tracking-[-0.04em] text-white">Paramètres</h1>
            <p className="text-white/40 text-sm sm:text-base mt-2">Personnalisation de l'application</p>
          </div>
        </div>

        {/* ── SECTION PIN ADMIN ───────────────────── */}
        <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] to-blue-900/5 p-4 sm:p-5 space-y-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0">
              <KeyRound size={16} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">PIN Administrateur</h2>
              <p className="text-white/30 text-xs mt-0.5">
                {hasExistingPin ? "Modifiez votre PIN de 4 chiffres" : "Créez votre PIN administrateur (4 chiffres)"}
              </p>
            </div>
            {hasExistingPin && (
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/25 text-green-300 text-xs font-bold shrink-0">
                <ShieldCheck size={12} /> PIN configuré
              </span>
            )}
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Lock size={14} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-white/40 text-xs leading-relaxed">
              Ce PIN sécurise les actions sensibles dans toutes les pages de l'application : ajout/suppression d'équipements, relevés de températures, maintenance, PMS et gestion des employés. Il remplace le code par défaut.
            </p>
          </div>

          <div className="space-y-3">
            {/* PIN actuel — uniquement si un PIN existe */}
            {hasExistingPin && (
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">PIN actuel *</label>
                <div className="relative">
                  <input
                    type={showCurrentPin ? "text" : "password"}
                    maxLength={4}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 pr-10 text-white text-sm outline-none tracking-[0.3em]"
                  />
                  <button onClick={() => setShowCurrentPin(!showCurrentPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                    {showCurrentPin ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nouveau PIN */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{hasExistingPin ? "Nouveau PIN *" : "PIN (4 chiffres) *"}</label>
                <div className="relative">
                  <input
                    type={showNewPin ? "text" : "password"}
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 pr-10 text-white text-sm outline-none tracking-[0.3em]"
                  />
                  <button onClick={() => setShowNewPin(!showNewPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                    {showNewPin ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Indicateur de force */}
                {newPin.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= newPin.length ? "bg-cyan-400" : "bg-white/10"}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmer PIN */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Confirmer le PIN *</label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className={`w-full h-11 rounded-2xl bg-white/[0.05] border px-4 pr-10 text-white text-sm outline-none tracking-[0.3em] ${
                      confirmPin.length === 4
                        ? confirmPin === newPin ? "border-green-500/40" : "border-red-500/40"
                        : "border-white/10"
                    }`}
                  />
                  <button onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                    {showConfirmPin ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {confirmPin.length === 4 && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      {confirmPin === newPin
                        ? <CheckCircle2 size={14} className="text-green-400" />
                        : <span className="text-red-400 text-xs font-bold">✗</span>
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Message statut */}
          {pinMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-2xl border text-sm font-medium ${
              pinStatus === "success"
                ? "bg-green-500/15 border-green-500/30 text-green-300"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            }`}>
              {pinStatus === "success" ? <CheckCircle2 size={15} /> : <span>⚠</span>}
              {pinMessage}
            </div>
          )}

          <button
            onClick={handleSavePin}
            disabled={isSavingPin || newPin.length !== 4 || confirmPin.length !== 4}
            className="h-11 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition text-black font-black text-sm flex items-center gap-2"
          >
            {isSavingPin ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <KeyRound size={15} />
            )}
            {hasExistingPin ? "Modifier le PIN" : "Créer le PIN"}
          </button>
        </div>

        {/* ── SECTION ORDRE DU MENU ───────────────── */}
        <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-4">

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shrink-0">
                <Settings size={16} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Ordre du menu</h2>
                <p className="text-white/30 text-xs mt-0.5">Utilisez les flèches pour réorganiser les modules</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleResetMenu} className="h-9 px-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white transition text-xs font-bold flex items-center gap-2">
                <RotateCcw size={13} /> Réinitialiser
              </button>
              <button onClick={handleSaveMenu} className={`h-9 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition ${menuSaved ? "bg-green-400 hover:bg-green-300 text-black" : "bg-cyan-400 hover:bg-cyan-300 text-black"}`}>
                {menuSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                {menuSaved ? "Sauvegardé !" : "Sauvegarder"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => {
              const Icon = ICON_MAP[item.icon];
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4 transition hover:bg-white/[0.04]">
                  <GripVertical size={16} className="text-white/20 shrink-0" />
                  <span className="text-white/25 text-xs font-bold w-5 text-center shrink-0">{index + 1}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 shrink-0">
                    {Icon && <Icon size={16} className="text-cyan-300" />}
                  </div>
                  <span className="text-white font-bold text-sm flex-1 min-w-0 truncate">{item.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 disabled:cursor-not-allowed transition flex items-center justify-center text-white/60 hover:text-white">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveDown(index)} disabled={index === items.length - 1} className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 disabled:cursor-not-allowed transition flex items-center justify-center text-white/60 hover:text-white">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-white/20 text-xs">
            💡 Les modifications sont appliquées immédiatement dans le menu après avoir cliqué sur "Sauvegarder".
          </p>
        </div>

      </div>
    </div>
  );
}
