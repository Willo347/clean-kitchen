"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Thermometer, Wrench, Boxes, FileText,
  AlertTriangle, Clock, CheckCircle2,
  RefreshCw, Loader2, ShieldAlert,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Alerte {
  id: string;
  message: string;
  detail?: string;
  level: "danger" | "warning";
  time?: string;
}

interface AlerteSection {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge: string;
  alertes: Alerte[];
}

// ─────────────────────────────────────────────
// ALERTE CARD
// ─────────────────────────────────────────────

function AlerteCard({ alerte }: { alerte: Alerte }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 transition hover:scale-[1.01] ${
      alerte.level === "danger"
        ? "border-red-500/30 bg-red-500/[0.08]"
        : "border-orange-500/25 bg-orange-500/[0.06]"
    }`}>
      <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${alerte.level === "danger" ? "text-red-400" : "text-orange-400"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm leading-snug">{alerte.message}</p>
        {alerte.detail && <p className="text-white/45 text-xs mt-1">{alerte.detail}</p>}
        {alerte.time && (
          <p className="text-white/30 text-[11px] mt-1.5 flex items-center gap-1">
            <Clock size={9} /> {alerte.time}
          </p>
        )}
      </div>
      <span className={`shrink-0 text-[10px] font-black px-2 py-1 rounded-lg ${
        alerte.level === "danger"
          ? "bg-red-500/20 text-red-300"
          : "bg-orange-500/20 text-orange-300"
      }`}>
        {alerte.level === "danger" ? "CRITIQUE" : "ATTENTION"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────

function AlerteSection({ section }: { section: AlerteSection }) {
  const Icon = section.icon;

  if (section.alertes.length === 0) {
    return (
      <div className={`rounded-[24px] border ${section.border} bg-white/[0.02] p-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl ${section.bg} border ${section.border} flex items-center justify-center`}>
            <Icon size={16} className={section.color} />
          </div>
          <p className={`text-[11px] font-bold tracking-widest uppercase ${section.color}`}>{section.label}</p>
          <span className="ml-auto text-[10px] bg-green-500/20 border border-green-500/30 text-green-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 size={9} /> OK
          </span>
        </div>
        <p className="text-white/25 text-sm">Aucune alerte dans cette catégorie.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-[24px] border ${section.border} bg-white/[0.02] p-5`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl ${section.bg} border ${section.border} flex items-center justify-center`}>
          <Icon size={16} className={section.color} />
        </div>
        <p className={`text-[11px] font-bold tracking-widest uppercase ${section.color}`}>{section.label}</p>
        <span className={`ml-auto text-[10px] ${section.badge} px-2 py-0.5 rounded-full font-bold`}>
          {section.alertes.length}
        </span>
      </div>
      <div className="space-y-2">
        {section.alertes.map((a) => <AlerteCard key={a.id} alerte={a} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function AlertesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tempAlertes, setTempAlertes] = useState<Alerte[]>([]);
  const [maintenanceAlertes, setMaintenanceAlertes] = useState<Alerte[]>([]);
  const [stockAlertes, setStockAlertes] = useState<Alerte[]>([]);
  const [dlcAlertes, setDlcAlertes] = useState<Alerte[]>([]);

  async function fetchAlertes() {
    // ── TEMPÉRATURES ──────────────────────────
    const { data: equipments } = await supabase.from("equipments").select("*");
    const { data: tempLogs } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    const tempAlertesFound: Alerte[] = [];
    if (equipments && tempLogs) {
      equipments.forEach((eq) => {
        const latest = tempLogs.find((l) => l.equipment?.toLowerCase().trim() === eq.name?.toLowerCase().trim());
        if (latest) {
          if (latest.temperature > eq.temp_max) {
            tempAlertesFound.push({
              id: `temp-high-${eq.id}`,
              message: `${eq.name} — température trop élevée`,
              detail: `${latest.temperature}°C (max autorisé : ${eq.temp_max}°C)`,
              level: "danger",
              time: new Date(latest.created_at).toLocaleString("fr-FR"),
            });
          } else if (latest.temperature < eq.temp_min) {
            tempAlertesFound.push({
              id: `temp-low-${eq.id}`,
              message: `${eq.name} — température trop basse`,
              detail: `${latest.temperature}°C (min autorisé : ${eq.temp_min}°C)`,
              level: "warning",
              time: new Date(latest.created_at).toLocaleString("fr-FR"),
            });
          }
        } else {
          tempAlertesFound.push({
            id: `temp-missing-${eq.id}`,
            message: `${eq.name} — relevé manquant`,
            detail: `Aucun relevé enregistré pour cet équipement`,
            level: "warning",
          });
        }
      });
    }
    setTempAlertes(tempAlertesFound);

    // ── MAINTENANCE ───────────────────────────
    const { data: reports } = await supabase
      .from("maintenance_reports")
      .select("*")
      .neq("status", "Résolu");

    const { data: certs } = await supabase
      .from("maintenance_certificates")
      .select("*");

    const maintenanceAlertesFound: Alerte[] = [];
    if (reports) {
      reports.forEach((r) => {
        maintenanceAlertesFound.push({
          id: `report-${r.id}`,
          message: `${r.equipment_name} — ${r.description}`,
          detail: `Statut : ${r.status}`,
          level: r.priority === "Critique" ? "danger" : "warning",
        });
      });
    }
    if (certs) {
      const today = new Date();
      certs.forEach((c) => {
        if (!c.next_date) return;
        const nextDate = new Date(c.next_date);
        const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          maintenanceAlertesFound.push({
            id: `cert-expired-${c.id}`,
            message: `Certificat expiré — ${c.name}`,
            detail: `Équipement : ${c.equipment} · Expiré le ${new Date(c.next_date).toLocaleDateString("fr-FR")}`,
            level: "danger",
          });
        } else if (diffDays <= 30) {
          maintenanceAlertesFound.push({
            id: `cert-soon-${c.id}`,
            message: `Certificat à renouveler — ${c.name}`,
            detail: `Équipement : ${c.equipment} · Expire dans ${diffDays} jour(s)`,
            level: "warning",
          });
        }
      });
    }
    setMaintenanceAlertes(maintenanceAlertesFound);

    // ── DLC ───────────────────────────────────
    const { data: products } = await supabase
      .from("traceability_products")
      .select("*");

    const dlcAlertesFound: Alerte[] = [];
    if (products) {
      const today = new Date();
      products.forEach((p) => {
        if (!p.dlc) return;
        const dlcDate = new Date(p.dlc);
        const diffDays = Math.ceil((dlcDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          dlcAlertesFound.push({
            id: `dlc-expired-${p.id}`,
            message: `DLC expirée — ${p.product}`,
            detail: `Lot : ${p.lot || "—"} · Fournisseur : ${p.supplier || "—"} · Expirée le ${dlcDate.toLocaleDateString("fr-FR")}`,
            level: "danger",
          });
        } else if (diffDays <= 3) {
          dlcAlertesFound.push({
            id: `dlc-soon-${p.id}`,
            message: `DLC dans ${diffDays} jour(s) — ${p.product}`,
            detail: `Lot : ${p.lot || "—"} · Fournisseur : ${p.supplier || "—"}`,
            level: "warning",
          });
        }
      });
    }
    setDlcAlertes(dlcAlertesFound);

    // ── STOCKS ────────────────────────────────
    // Pour l'instant pas de seuil défini — section vide
    setStockAlertes([]);
  }

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchAlertes();
      setIsLoading(false);
    }
    init();
  }, []);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchAlertes();
    setIsRefreshing(false);
  }

  const totalAlertes = tempAlertes.length + maintenanceAlertes.length + stockAlertes.length + dlcAlertes.length;

  const sections: AlerteSection[] = [
    {
      key: "temperatures",
      label: "Températures",
      icon: Thermometer,
      color: "text-orange-300",
      bg: "bg-orange-500/15",
      border: "border-orange-500/20",
      badge: "bg-orange-500/20 border border-orange-500/30 text-orange-300",
      alertes: tempAlertes,
    },
    {
      key: "maintenance",
      label: "Maintenance & Certificats",
      icon: Wrench,
      color: "text-cyan-300",
      bg: "bg-cyan-500/15",
      border: "border-cyan-500/20",
      badge: "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300",
      alertes: maintenanceAlertes,
    },
    {
      key: "dlc",
      label: "DLC / Traçabilité",
      icon: FileText,
      color: "text-violet-300",
      bg: "bg-violet-500/15",
      border: "border-violet-500/20",
      badge: "bg-violet-500/20 border border-violet-500/30 text-violet-300",
      alertes: dlcAlertes,
    },
    {
      key: "stocks",
      label: "Stocks",
      icon: Boxes,
      color: "text-pink-300",
      bg: "bg-pink-500/15",
      border: "border-pink-500/20",
      badge: "bg-pink-500/20 border border-pink-500/30 text-pink-300",
      alertes: stockAlertes,
    },
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-white p-5">
      <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-5">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <p className="uppercase tracking-[0.32em] text-red-400 font-semibold text-xs">ALERTES HACCP</p>
            </div>
            <h1 className="text-[52px] font-black leading-[0.95] tracking-[-0.04em] text-white">Alertes</h1>
            <p className="text-white/40 text-base mt-2">Surveillance en temps réel de votre conformité</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-2 h-10 px-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 transition flex items-center gap-2 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Températures", count: tempAlertes.length, color: "text-orange-300", border: "border-orange-500/20", bg: "from-orange-500/15" },
            { label: "Maintenance", count: maintenanceAlertes.length, color: "text-cyan-300", border: "border-cyan-500/20", bg: "from-cyan-500/15" },
            { label: "DLC", count: dlcAlertes.length, color: "text-violet-300", border: "border-violet-500/20", bg: "from-violet-500/15" },
            { label: "Stocks", count: stockAlertes.length, color: "text-pink-300", border: "border-pink-500/20", bg: "from-pink-500/15" },
          ].map((item) => (
            <div key={item.label} className={`rounded-[24px] border ${item.border} bg-gradient-to-br ${item.bg} to-transparent p-5`}>
              <p className={`text-xs font-bold ${item.color}`}>{item.label}</p>
              <h2 className="text-[42px] font-black text-white leading-none mt-2">{item.count}</h2>
              <p className="text-white/30 text-xs mt-1">{item.count === 0 ? "Aucune alerte" : item.count === 1 ? "alerte active" : "alertes actives"}</p>
            </div>
          ))}
        </div>

        {/* STATUT GLOBAL */}
        <div className={`rounded-[24px] border p-5 flex items-center gap-4 ${
          totalAlertes === 0
            ? "border-green-500/30 bg-green-500/10"
            : totalAlertes <= 3
            ? "border-orange-500/30 bg-orange-500/10"
            : "border-red-500/30 bg-red-500/10"
        }`}>
          <ShieldAlert size={24} className={totalAlertes === 0 ? "text-green-400" : totalAlertes <= 3 ? "text-orange-400" : "text-red-400"} />
          <div>
            <p className={`font-black text-base ${totalAlertes === 0 ? "text-green-300" : totalAlertes <= 3 ? "text-orange-300" : "text-red-300"}`}>
              {totalAlertes === 0 ? "Système conforme — Aucune alerte active" : `${totalAlertes} alerte(s) nécessitent votre attention`}
            </p>
            <p className="text-white/30 text-xs mt-0.5">Dernière vérification : {new Date().toLocaleString("fr-FR")}</p>
          </div>
        </div>

        {/* SECTIONS */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {sections.map((section) => (
              <AlerteSection key={section.key} section={section} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
