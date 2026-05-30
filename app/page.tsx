"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Bell,
  Activity,
  ClipboardCheck,
  Thermometer,
  Boxes,
  FileText,
  ChevronRight,
  ChevronLeft,
  MapPin,
  CalendarDays,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  Package,
} from "lucide-react"

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]

const DAYS_FR = ["L", "M", "M", "J", "V", "S", "D"]

// ─────────────────────────────────────────────
// MINI CALENDAR COMPONENT
// ─────────────────────────────────────────────

function MiniCalendar() {
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const today = now.getDate()
  const isCurrentMonth =
    currentMonth === now.getMonth() && currentYear === now.getFullYear()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  // Convert Sunday=0 to Monday=0
  const startOffset = (firstDay + 6) % 7

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-[#071224] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-cyan-300" />
          <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300">
            CALENDRIER
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-3 w-3 text-white/60" />
          </button>
          <span className="text-[13px] font-bold text-white min-w-[110px] text-center">
            {MONTHS_FR[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <ChevronRight className="h-3 w-3 text-white/60" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {DAYS_FR.map((d, i) => (
          <div key={i} className="text-[11px] font-bold text-white/30 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const isToday = isCurrentMonth && day === today
          return (
            <div
              key={i}
              className={`
                flex h-8 w-8 mx-auto items-center justify-center rounded-full
                text-[13px] font-semibold transition cursor-pointer
                ${
                  isToday
                    ? "bg-cyan-400 text-black font-black"
                    : "text-white/70 hover:bg-white/10"
                }
              `}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────

export default function DashboardPage() {
  const now = new Date()

  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  const dayName = dayNames[now.getDay()]
  const dayNumber = now.getDate()
  const monthName = MONTHS_FR[now.getMonth()]
  const year = now.getFullYear()

  const recentActivity = [
    {
      icon: Truck,
      color: "text-violet-300",
      bg: "bg-violet-500/15 border-violet-500/20",
      title: "Livraison réceptionnée",
      subtitle: "Fournisseur Metro",
      time: "10:35",
    },
    {
      icon: Thermometer,
      color: "text-orange-300",
      bg: "bg-orange-500/15 border-orange-500/20",
      title: "Température normalisée",
      subtitle: "Chambre froide 1",
      time: "09:42",
    },
    {
      icon: ClipboardCheck,
      color: "text-cyan-300",
      bg: "bg-cyan-500/15 border-cyan-500/20",
      title: "Tâche terminée",
      subtitle: "Nettoyage hotte",
      time: "09:15",
    },
    {
      icon: Package,
      color: "text-pink-300",
      bg: "bg-pink-500/15 border-pink-500/20",
      title: "Stock faible",
      subtitle: "Sauce tomate",
      time: "08:50",
    },
  ]

  const haccpItems = [
    { label: "Audit HACCP", time: "14:00", ok: true },
    { label: "Contrôle DLC", time: "16:00", ok: true },
    { label: "Export conformité", time: "18:30", ok: true },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-[#020817] p-5 text-white">
      <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)]">

        {/* ── HEADER ─────────────────────────────── */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[12px] font-semibold tracking-[0.32em] text-cyan-300">
                SMART KITCHEN
              </span>
            </div>

            <h1 className="text-[64px] font-black leading-[0.95] tracking-[-0.05em]">
              Tableau de bord
            </h1>

            <p className="mt-3 text-[17px] text-white/45">
              Vue d'ensemble de votre activité en temps réel
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Bell className="h-5 w-5 text-white/70" />
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <Activity className="h-5 w-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* ── KPI CARDS ──────────────────────────── */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_220px] gap-4">

          {/* PMS ENTRETIEN */}
          <Link href="/pms-entretien">
            <div className="group h-[200px] cursor-pointer rounded-[24px] border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-blue-900/15 p-5 transition-all hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-[0_8px_32px_rgba(6,182,212,0.15)]">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-[10px] font-black tracking-[0.28em] text-cyan-200/90">
                  PMS ENTRETIEN
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20">
                  <ClipboardCheck className="h-5 w-5 text-cyan-300" />
                </div>
              </div>

              <div className="text-[58px] font-black leading-none tracking-tight text-white">
                22
              </div>

              <p className="mt-2 text-[14px] text-white/60">
                tâches à effectuer
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-cyan-300 group-hover:gap-2 transition-all">
                Voir le détail
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* TEMPÉRATURES */}
          <Link href="/temperatures">
            <div className="group h-[200px] cursor-pointer rounded-[24px] border border-orange-400/25 bg-gradient-to-br from-orange-500/20 via-amber-600/10 to-purple-900/15 p-5 transition-all hover:scale-[1.02] hover:border-orange-400/50 hover:shadow-[0_8px_32px_rgba(251,146,60,0.15)]">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-[10px] font-black tracking-[0.28em] text-orange-200/90">
                  TEMPÉRATURES
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/20">
                  <Thermometer className="h-5 w-5 text-orange-300" />
                </div>
              </div>

              <div className="text-[58px] font-black leading-none tracking-tight text-white">
                0
              </div>

              <p className="mt-2 text-[14px] text-white/60">
                alertes actives
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-orange-300 group-hover:gap-2 transition-all">
                Voir le détail
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* STOCKS */}
          <Link href="/stocks">
            <div className="group h-[200px] cursor-pointer rounded-[24px] border border-pink-400/25 bg-gradient-to-br from-pink-500/20 via-rose-600/10 to-indigo-900/15 p-5 transition-all hover:scale-[1.02] hover:border-pink-400/50 hover:shadow-[0_8px_32px_rgba(236,72,153,0.15)]">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-[10px] font-black tracking-[0.28em] text-pink-200/90">
                  STOCKS
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/20">
                  <Boxes className="h-5 w-5 text-pink-300" />
                </div>
              </div>

              <div className="text-[58px] font-black leading-none tracking-tight text-white">
                0
              </div>

              <p className="mt-2 text-[14px] text-white/60">
                produits faibles
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-pink-300 group-hover:gap-2 transition-all">
                Voir le détail
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* TRAÇABILITÉ */}
          <Link href="/traceability">
            <div className="group h-[200px] cursor-pointer rounded-[24px] border border-violet-400/25 bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-indigo-900/15 p-5 transition-all hover:scale-[1.02] hover:border-violet-400/50 hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)]">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-[10px] font-black tracking-[0.28em] text-violet-200/90">
                  TRAÇABILITÉ
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/20">
                  <FileText className="h-5 w-5 text-violet-300" />
                </div>
              </div>

              <div className="text-[58px] font-black leading-none tracking-tight text-white">
                248
              </div>

              <p className="mt-2 text-[14px] text-white/60">
                produits tracés
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-violet-300 group-hover:gap-2 transition-all">
                Voir le détail
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* DATE + MÉTÉO */}
          <div className="h-[200px] rounded-[24px] border border-white/10 bg-[#071224] p-5 flex flex-col justify-between">

            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15">
                <CalendarDays className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="text-right">
                <p className="text-[12px] text-white/50">{dayName}</p>
                <p className="text-[46px] font-black leading-none">{dayNumber}</p>
                <p className="text-[11px] text-white/35">{monthName} {year}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[32px]">⛅</span>
              <div>
                <p className="text-[34px] font-black leading-none">18°C</p>
                <p className="text-[11px] text-white/45">Partiellement nuageux</p>
              </div>
            </div>

            <div className="flex h-10 items-center justify-between rounded-xl border border-white/10 bg-[#050d1c] px-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                <span className="text-[12px] text-white/70">Lyon, France</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-white/30" />
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ───────────────────────── */}
        <div className="mt-4 grid grid-cols-[1.6fr_1fr] gap-4">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* MONITORING LIVE */}
            <div className="rounded-[28px] border border-white/10 bg-[#071224] p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-300" />
                    <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300">
                      MONITORING LIVE
                    </p>
                  </div>
                  <h2 className="text-[20px] font-black">Températures (°C)</h2>
                </div>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[13px] text-white/60 hover:bg-white/10 transition flex items-center gap-2">
                  Toutes les zones
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Chart */}
              <div className="relative h-[220px] overflow-hidden rounded-[20px] border border-white/5 bg-[#020817]">
                <div className="absolute inset-0 opacity-15">
                  <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                {/* Y axis labels */}
                <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-between py-3 text-[10px] text-white/25 font-mono">
                  <span>10°C</span>
                  <span>5°C</span>
                  <span>0°C</span>
                  <span>-5°C</span>
                </div>

                {/* X axis labels */}
                <div className="absolute bottom-2 left-10 right-4 flex justify-between text-[10px] text-white/25 font-mono">
                  {["00:00","04:00","08:00","12:00","16:00","20:00","24:00"].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>

                <svg viewBox="0 0 800 220" className="absolute inset-0 h-full w-full">
                  {/* Chambre froide 1 */}
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3BCBFF" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3BCBFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4EF2FF" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#4EF2FF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D946EF" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#D946EF" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Fill areas */}
                  <path
                    d="M0 100 C80 80 120 120 220 95 C320 72 360 110 460 88 C560 68 620 105 800 75 L800 220 L0 220 Z"
                    fill="url(#g1)"
                  />
                  <path
                    d="M0 130 C80 110 120 148 220 122 C320 98 360 138 460 115 C560 95 620 130 800 105 L800 220 L0 220 Z"
                    fill="url(#g2)"
                  />
                  <path
                    d="M0 168 C80 150 120 178 220 158 C320 136 360 172 460 155 C560 138 620 165 800 145 L800 220 L0 220 Z"
                    fill="url(#g3)"
                  />

                  {/* Lines */}
                  <path
                    d="M0 100 C80 80 120 120 220 95 C320 72 360 110 460 88 C560 68 620 105 800 75"
                    stroke="#3BCBFF"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 130 C80 110 120 148 220 122 C320 98 360 138 460 115 C560 95 620 130 800 105"
                    stroke="#4EF2FF"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 168 C80 150 120 178 220 158 C320 136 360 172 460 155 C560 138 620 165 800 145"
                    stroke="#D946EF"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-6">
                {[
                  { color: "bg-cyan-400", label: "Chambre froide 1" },
                  { color: "bg-sky-300", label: "Chambre froide 2" },
                  { color: "bg-fuchsia-500", label: "Congélateur" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-[13px] text-white/50">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVITÉ RÉCENTE */}
            <div className="rounded-[28px] border border-white/10 bg-[#071224] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-pink-300" />
                  <p className="text-[11px] font-bold tracking-[0.28em] text-pink-300">
                    ACTIVITÉ RÉCENTE
                  </p>
                </div>
                <button className="text-[13px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1">
                  Voir toutes les activités
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {recentActivity.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      rounded-[20px] border p-4
                      ${item.bg}
                      transition hover:scale-[1.02] cursor-default
                    `}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/10`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="text-[12px] font-bold text-white/40">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[14px] font-bold text-white leading-tight">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[12px] text-white/45">
                      {item.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* MINI CALENDAR */}
            <MiniCalendar />

            {/* HACCP */}
            <div className="rounded-[24px] border border-white/10 bg-[#071224] p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300">
                  HACCP
                </p>
              </div>

              <div className="space-y-2">
                {haccpItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition cursor-pointer"
                  >
                    <span className="text-[14px] font-semibold text-white/80">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-cyan-400">
                        {item.time}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATS BOTTOM */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[20px] border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-orange-900/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-300" />
                  <p className="text-[10px] font-bold tracking-wider text-orange-300/80">
                    TEMP. MOYENNE
                  </p>
                </div>
                <p className="text-[34px] font-black leading-none text-white">
                  4,2°C
                </p>
              </div>

              <div className="rounded-[20px] border border-green-500/20 bg-gradient-to-br from-green-500/15 to-green-900/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-300" />
                  <p className="text-[10px] font-bold tracking-wider text-green-300/80">
                    ÉQUIPEMENTS
                  </p>
                </div>
                <p className="text-[34px] font-black leading-none text-white">
                  8
                </p>
                <p className="text-[11px] text-green-400/70 mt-1">actifs</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
