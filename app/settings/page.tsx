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
} from "lucide-react";

import {
  DEFAULT_MENU_ITEMS,
  ICON_MAP,
  SIDEBAR_ORDER_KEY,
  getSidebarItems,
} from "@/components/Sidebar";

type MenuItem = typeof DEFAULT_MENU_ITEMS[number];

export default function SettingsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setItems(getSidebarItems());
  }, []);

  function moveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    setSaved(false);
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    setSaved(false);
  }

  function handleSave() {
    const ids = items.map((item) => item.id);
    localStorage.setItem(SIDEBAR_ORDER_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("ck_sidebar_updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    localStorage.removeItem(SIDEBAR_ORDER_KEY);
    window.dispatchEvent(new Event("ck_sidebar_updated"));
    setItems([...DEFAULT_MENU_ITEMS]);
    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5 overflow-x-hidden">
      <div className="mx-auto max-w-[900px] rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-4 sm:p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-4 sm:space-y-5">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold text-xs">PARAMÈTRES</p>
            </div>
            <h1 className="text-[32px] sm:text-[48px] font-black leading-[0.95] tracking-[-0.04em] text-white">
              Paramètres
            </h1>
            <p className="text-white/40 text-sm sm:text-base mt-2">
              Personnalisation de l'application
            </p>
          </div>
        </div>

        {/* SECTION — Ordre du menu */}
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
              <button
                onClick={handleReset}
                className="h-9 px-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white transition text-xs font-bold flex items-center gap-2"
              >
                <RotateCcw size={13} /> Réinitialiser
              </button>
              <button
                onClick={handleSave}
                className={`h-9 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                  saved
                    ? "bg-green-400 hover:bg-green-300 text-black"
                    : "bg-cyan-400 hover:bg-cyan-300 text-black"
                }`}
              >
                {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                {saved ? "Sauvegardé !" : "Sauvegarder"}
              </button>
            </div>
          </div>

          {/* Liste réorganisable */}
          <div className="space-y-2">
            {items.map((item, index) => {
              const Icon = ICON_MAP[item.icon];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4 transition hover:bg-white/[0.04]"
                >
                  {/* Grip icon */}
                  <GripVertical size={16} className="text-white/20 shrink-0" />

                  {/* Position */}
                  <span className="text-white/25 text-xs font-bold w-5 text-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Icon */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 shrink-0">
                    {Icon && <Icon size={16} className="text-cyan-300" />}
                  </div>

                  {/* Name */}
                  <span className="text-white font-bold text-sm flex-1 min-w-0 truncate">
                    {item.name}
                  </span>

                  {/* Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 disabled:cursor-not-allowed transition flex items-center justify-center text-white/60 hover:text-white"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === items.length - 1}
                      className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 disabled:cursor-not-allowed transition flex items-center justify-center text-white/60 hover:text-white"
                    >
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
