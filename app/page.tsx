"use client"

import Link from "next/link"
import {
  Bell,
  Activity,
  ClipboardCheck,
  Thermometer,
  Boxes,
  FileText,
  ChevronRight,
  MapPin,
 CalendarDays,
  Truck,
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#020817] p-5 text-white">
      <div className="mx-auto max-w-[1450px] rounded-[32px] border border-white/5 bg-[#030b1d] p-5 shadow-[0_0_80px_rgba(0,150,255,0.08)]">

        {/* HEADER */}
        <div className="mb-5 flex items-start justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

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
            <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Bell className="h-5 w-5 text-white/70" />
            </button>

            <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Activity className="h-5 w-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_220px] gap-4">

          {/* PMS */}
          <Link href="/pms-entretien">
            <div className="h-[180px] cursor-pointer rounded-[24px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 to-blue-900/10 p-4 transition-all hover:scale-[1.01]">

              <div className="mb-5 flex items-start justify-between">
                <p className="text-[10px] font-bold tracking-[0.25em] text-white/90">
                  PMS ENTRETIEN
                </p>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <ClipboardCheck className="h-5 w-5 text-cyan-300" />
                </div>
              </div>

              <div className="text-[54px] font-black leading-none">
                22
              </div>

              <p className="mt-2 text-[14px] text-white/75">
                tâches à effectuer
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] text-cyan-300">
                Voir les tâches
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* TEMPERATURES */}
          <Link href="/temperatures">
            <div className="h-[180px] cursor-pointer rounded-[24px] border border-orange-400/20 bg-gradient-to-br from-orange-500/12 to-purple-900/10 p-4 transition-all hover:scale-[1.01]">

              <div className="mb-5 flex items-start justify-between">
                <p className="text-[10px] font-bold tracking-[0.25em] text-white/90">
                  TEMPÉRATURES
                </p>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Thermometer className="h-5 w-5 text-orange-300" />
                </div>
              </div>

              <div className="text-[54px] font-black leading-none">
                0
              </div>

              <p className="mt-2 text-[14px] text-white/75">
                alertes actives
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] text-orange-300">
                Voir le détail
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* STOCKS */}
          <Link href="/stocks">
            <div className="h-[180px] cursor-pointer rounded-[24px] border border-pink-400/20 bg-gradient-to-br from-pink-500/12 to-indigo-900/10 p-4 transition-all hover:scale-[1.01]">

              <div className="mb-5 flex items-start justify-between">
                <p className="text-[10px] font-bold tracking-[0.25em] text-white/90">
                  STOCKS
                </p>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Boxes className="h-5 w-5 text-pink-300" />
                </div>
              </div>

              <div className="text-[54px] font-black leading-none">
                0
              </div>

              <p className="mt-2 text-[14px] text-white/75">
                produits faibles
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] text-pink-300">
                Voir les stocks
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* TRACEABILITY FIXED */}
          <Link href="/traceability">
            <div className="h-[180px] cursor-pointer rounded-[24px] border border-violet-400/20 bg-gradient-to-br from-violet-500/12 to-indigo-900/10 p-4 transition-all hover:scale-[1.01]">

              <div className="mb-5 flex items-start justify-between">
                <p className="text-[10px] font-bold tracking-[0.25em] text-white/90">
                  TRAÇABILITÉ
                </p>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <FileText className="h-5 w-5 text-violet-300" />
                </div>
              </div>

              <div className="text-[54px] font-black leading-none">
                248
              </div>

              <p className="mt-2 text-[14px] text-white/75">
                produits tracés
              </p>

              <div className="mt-4 flex items-center gap-1 text-[13px] text-violet-300">
                Voir le détail
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* WEATHER */}
          <div className="h-[180px] rounded-[24px] border border-white/10 bg-[#071224] p-4">

            <div className="mb-4 flex items-start justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15">
                <CalendarDays className="h-6 w-6 text-cyan-300" />
              </div>

              <div className="text-right">
                <p className="text-[13px] text-white/60">
                  Mercredi
                </p>

                <p className="text-[52px] font-black leading-none">
                  27
                </p>

                <p className="text-[12px] text-white/40">
                  mai 2025
                </p>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <div className="text-[36px]">⛅</div>

              <div>
                <p className="text-[40px] font-black leading-none">
                  18°C
                </p>

                <p className="text-[12px] text-white/50">
                  Partiellement nuageux
                </p>
              </div>
            </div>

            <div className="flex h-12 items-center justify-between rounded-2xl border border-white/10 bg-[#050d1c] px-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-300" />
                <span className="text-[13px]">Lyon, France</span>
              </div>

              <ChevronRight className="h-4 w-4 text-white/40" />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-4 grid grid-cols-[1.7fr_1fr] gap-4">

          {/* MONITORING */}
          <div className="rounded-[28px] border border-white/10 bg-[#071224] p-5">

            <div className="mb-5 flex items-start justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-300" />

                  <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300">
                    MONITORING LIVE
                  </p>
                </div>

                <h2 className="text-[18px] font-bold">
                  Températures (°C)
                </h2>
              </div>

              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[14px] text-white/70">
                Toutes les zones
              </button>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-[24px] border border-white/5 bg-[#020817]">

              <div className="absolute inset-0 opacity-20">
                <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>

              <svg
                viewBox="0 0 800 320"
                className="absolute inset-0 h-full w-full"
              >
                <path
                  d="M0 150 C80 120 120 190 220 150 C320 110 360 180 460 145 C560 115 620 175 800 135"
                  stroke="#3BCBFF"
                  strokeWidth="4"
                  fill="none"
                />

                <path
                  d="M0 210 C80 185 120 245 220 205 C320 165 360 235 460 195 C560 170 620 225 800 185"
                  stroke="#4EF2FF"
                  strokeWidth="4"
                  fill="none"
                />

                <path
                  d="M0 255 C80 230 120 275 220 245 C320 210 360 275 460 240 C560 215 620 260 800 225"
                  stroke="#D946EF"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* ACTIVITE */}
          <div className="rounded-[28px] border border-white/10 bg-[#071224] p-5">

            <div className="mb-5 flex items-center gap-2">
              <Activity className="h-4 w-4 text-pink-300" />

              <p className="text-[11px] font-bold tracking-[0.28em] text-pink-300">
                ACTIVITÉ RÉCENTE
              </p>
            </div>

            <div className="space-y-5">

              {[
                {
                  icon: Truck,
                  color: "text-violet-300",
                  title: "Livraison réceptionnée",
                  subtitle: "Fournisseur Metro",
                  time: "10:35",
                },
                {
                  icon: Thermometer,
                  color: "text-orange-300",
                  title: "Température normalisée",
                  subtitle: "Chambre froide 1",
                  time: "09:42",
                },
                {
                  icon: ClipboardCheck,
                  color: "text-cyan-300",
                  title: "Tâche terminée",
                  subtitle: "Nettoyage hotte",
                  time: "09:15",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between border-b border-white/5 pb-4"
                >
                  <div className="flex gap-3">

                    <item.icon className={`mt-1 h-5 w-5 ${item.color}`} />

                    <div>
                      <p className="text-[16px] font-semibold">
                        {item.title}
                      </p>

                      <p className="text-[14px] text-white/45">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[14px] text-white/45">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}