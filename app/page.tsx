"use client"

import Link from "next/link"
import { motion } from "framer-motion"
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
  ShieldCheck,
  CloudSun,
  AlertTriangle,
  Refrigerator,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const temperatureData = [
  { hour: "00h", cold1: 3, cold2: 2, freezer: -18 },
  { hour: "02h", cold1: 4, cold2: 3, freezer: -18.5 },
  { hour: "04h", cold1: 3, cold2: 2, freezer: -18.2 },
  { hour: "06h", cold1: 5, cold2: 3, freezer: -17.8 },
  { hour: "08h", cold1: 6, cold2: 4, freezer: -18.1 },
  { hour: "10h", cold1: 5, cold2: 3, freezer: -18.4 },
  { hour: "12h", cold1: 5, cold2: 4, freezer: -18.2 },
  { hour: "14h", cold1: 6, cold2: 3, freezer: -18.1 },
  { hour: "16h", cold1: 5, cold2: 3, freezer: -18.5 },
  { hour: "18h", cold1: 6, cold2: 2, freezer: -18.4 },
  { hour: "20h", cold1: 5, cold2: 3, freezer: -18.1 },
  { hour: "22h", cold1: 4, cold2: 3, freezer: -18.3 },
]

const glassCard =
  "rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl"

export default function DashboardPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060b1f] text-white">

      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-150px] top-[-150px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute right-[-100px] top-[100px] h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[180px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-pink-500/5 blur-[180px]" />
      </div>

      <div className="mx-auto max-w-[1600px] p-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start justify-between"
        >
          <div>

            <div className="mb-3 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />

              <span className="text-xs font-semibold tracking-[0.35em] text-cyan-300">
                SMART KITCHEN
              </span>
            </div>

            <h1 className="text-[72px] font-black leading-none tracking-[-0.06em]">
              Tableau de bord
            </h1>

            <p className="mt-4 text-lg text-white/50">
              Vue d'ensemble de votre activité en temps réel
            </p>
          </div>

          <div className="flex gap-3">

            <button
              className={`${glassCard} flex h-14 w-14 items-center justify-center transition-all hover:border-cyan-400/30 hover:bg-white/10`}
            >
              <Bell className="h-5 w-5 text-white/70" />
            </button>

            <button
              className={`${glassCard} flex h-14 w-14 items-center justify-center transition-all hover:border-cyan-400/30 hover:bg-white/10`}
            >
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </button>

          </div>
        </motion.div>

        {/* KPI ROW */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_260px] gap-5">

          {/* PMS */}
          <Link href="/pms-entretien">
            <motion.div
              whileHover={{ y: -5 }}
              className={`${glassCard} relative h-[190px] overflow-hidden p-5`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-cyan-500/5" />

              <div className="relative z-10">

                <div className="mb-6 flex items-start justify-between">

                  <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-200">
                    PMS ENTRETIEN
                  </p>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
                    <ClipboardCheck className="h-5 w-5 text-cyan-300" />
                  </div>

                </div>

                <div className="text-[58px] font-black leading-none">
                  22
                </div>

                <p className="mt-2 text-sm text-white/55">
                  tâches à effectuer
                </p>

                <div className="mt-5 flex items-center gap-1 text-sm text-cyan-300">
                  Voir les tâches
                  <ChevronRight className="h-4 w-4" />
                </div>

              </div>
            </motion.div>
          </Link>

          {/* TEMPERATURES */}
          <Link href="/temperatures">
            <motion.div
              whileHover={{ y: -5 }}
              className={`${glassCard} relative h-[190px] overflow-hidden p-5`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-orange-500/5" />

              <div className="relative z-10">

                <div className="mb-6 flex items-start justify-between">

                  <p className="text-[11px] font-bold tracking-[0.25em] text-orange-200">
                    TEMPÉRATURES
                  </p>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
                    <Thermometer className="h-5 w-5 text-orange-300" />
                  </div>

                </div>

                <div className="text-[58px] font-black leading-none">
                  0
                </div>

                <p className="mt-2 text-sm text-white/55">
                  alertes actives
                </p>

                <div className="mt-5 flex items-center gap-1 text-sm text-orange-300">
                  Voir le détail
                  <ChevronRight className="h-4 w-4" />
                </div>

              </div>
            </motion.div>
          </Link>

          {/* STOCKS */}
          <Link href="/stocks">
            <motion.div
              whileHover={{ y: -5 }}
              className={`${glassCard} relative h-[190px] overflow-hidden p-5`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-transparent to-pink-500/5" />

              <div className="relative z-10">

                <div className="mb-6 flex items-start justify-between">

                  <p className="text-[11px] font-bold tracking-[0.25em] text-pink-200">
                    STOCKS
                  </p>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/10">
                    <Boxes className="h-5 w-5 text-pink-300" />
                  </div>

                </div>

                <div className="text-[58px] font-black leading-none">
                  0
                </div>

                <p className="mt-2 text-sm text-white/55">
                  produits faibles
                </p>

                <div className="mt-5 flex items-center gap-1 text-sm text-pink-300">
                  Voir les stocks
                  <ChevronRight className="h-4 w-4" />
                </div>

              </div>
            </motion.div>
          </Link>
                    {/* TRACEABILITE */}
          <Link href="/traceability">
            <motion.div
              whileHover={{ y: -5 }}
              className={`${glassCard} relative h-[190px] overflow-hidden p-5`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-violet-500/5" />

              <div className="relative z-10">

                <div className="mb-6 flex items-start justify-between">

                  <p className="text-[11px] font-bold tracking-[0.25em] text-violet-200">
                    TRAÇABILITÉ
                  </p>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                    <FileText className="h-5 w-5 text-violet-300" />
                  </div>

                </div>

                <div className="text-[58px] font-black leading-none">
                  248
                </div>

                <p className="mt-2 text-sm text-white/55">
                  produits tracés
                </p>

                <div className="mt-5 flex items-center gap-1 text-sm text-violet-300">
                  Voir le détail
                  <ChevronRight className="h-4 w-4" />
                </div>

              </div>
            </motion.div>
          </Link>

          {/* WEATHER */}
          <motion.div
            whileHover={{ y: -3 }}
            className={`${glassCard} h-[190px] p-5`}
          >
            <div className="mb-5 flex items-start justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
                <CloudSun className="h-6 w-6 text-cyan-300" />
              </div>

              <div className="text-right">
                <p className="text-xs text-white/55">
                  Mercredi
                </p>

                <p className="text-[52px] font-black leading-none">
                  27
                </p>

                <p className="text-xs text-white/40">
                  Mai 2026
                </p>
              </div>

            </div>

            <div className="mb-4 flex items-center gap-3">

              <div className="text-[42px]">
                ⛅
              </div>

              <div>
                <p className="text-[42px] font-black leading-none">
                  18°
                </p>

                <p className="text-xs text-white/50">
                  Partiellement nuageux
                </p>
              </div>

            </div>

            <div className="flex h-12 items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-300" />

                <span className="text-sm">
                  Lyon, France
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-white/40" />
            </div>
          </motion.div>
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-5 grid grid-cols-[1.75fr_1fr] gap-5">

          {/* MONITORING */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${glassCard} p-6`}
          >
            <div className="mb-6 flex items-start justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-300" />

                  <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300">
                    MONITORING LIVE
                  </p>
                </div>

                <h2 className="text-[22px] font-bold">
                  Températures (°C)
                </h2>
              </div>

              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">
                Toutes les zones
              </button>

            </div>

            <div className="h-[340px] rounded-[24px] border border-white/5 bg-[#020817] p-4">

              <div className="mb-5 flex gap-5">

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-cyan-400" />
                  <span className="text-sm text-white/60">
                    Chambre froide 1
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-400" />
                  <span className="text-sm text-white/60">
                    Chambre froide 2
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-violet-400" />
                  <span className="text-sm text-white/60">
                    Congélateur
                  </span>
                </div>

              </div>

              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={temperatureData}>
                  <CartesianGrid
                    stroke="rgba(255,255,255,.05)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="hour"
                    stroke="#64748b"
                  />

                  <YAxis
                    stroke="#64748b"
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#071224",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: "16px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="cold1"
                    stroke="#3BCBFF"
                    strokeWidth={3}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="cold2"
                    stroke="#FB923C"
                    strokeWidth={3}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="freezer"
                    stroke="#D946EF"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* CALENDAR */}
            <div className={`${glassCard} p-5`}>

              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-cyan-300" />

                <h3 className="font-semibold">
                  Calendrier
                </h3>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs">

                {["L","M","M","J","V","S","D"].map((d) => (
                  <div
                    key={d}
                    className="pb-2 text-white/40"
                  >
                    {d}
                  </div>
                ))}

                {[26,27,28,29,30,31,1].map((d) => (
                  <div
                    key={d}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      d === 29
                        ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,.6)]"
                        : "bg-white/5 text-white/60"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* HACCP */}
            <div className={`${glassCard} p-5`}>

              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-300" />

                <h3 className="font-semibold">
                  HACCP
                </h3>
              </div>

              <div className="space-y-3">

                {[
                  "Audit HACCP",
                  "Contrôle DLC",
                  "Export conformité",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <span className="text-sm">
                      {item}
                    </span>

                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                ))}

              </div>
            </div>
                        {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4">

              <div className={`${glassCard} p-4`}>
                <Thermometer className="mb-2 h-4 w-4 text-cyan-300" />

                <div className="text-2xl font-black">
                  2.8°
                </div>

                <p className="text-xs text-white/50">
                  Temp. moyenne
                </p>
              </div>

              <div className={`${glassCard} p-4`}>
                <Refrigerator className="mb-2 h-4 w-4 text-violet-300" />

                <div className="text-2xl font-black">
                  18
                </div>

                <p className="text-xs text-white/50">
                  Équipements
                </p>
              </div>

              <div className={`${glassCard} p-4`}>
                <AlertTriangle className="mb-2 h-4 w-4 text-orange-300" />

                <div className="text-2xl font-black">
                  3
                </div>

                <p className="text-xs text-white/50">
                  Alertes ouvertes
                </p>
              </div>

              <div className={`${glassCard} p-4`}>
                <ClipboardCheck className="mb-2 h-4 w-4 text-pink-300" />

                <div className="text-2xl font-black">
                  7
                </div>

                <p className="text-xs text-white/50">
                  Tâches en attente
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${glassCard} mt-5 p-6`}
        >
          <div className="mb-6 flex items-center justify-between">

            <div>
              <p className="mb-2 text-[11px] font-bold tracking-[0.28em] text-pink-300">
                ACTIVITÉ RÉCENTE
              </p>

              <h2 className="text-[22px] font-bold">
                Dernières opérations
              </h2>
            </div>

            <Activity className="h-5 w-5 text-cyan-300" />

          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

            {[
              {
                icon: Truck,
                title: "Livraison réceptionnée",
                description: "Metro • Contrôle validé",
                time: "10:35",
                color: "text-violet-300",
              },
              {
                icon: Thermometer,
                title: "Température normalisée",
                description: "Chambre froide 1",
                time: "09:42",
                color: "text-orange-300",
              },
              {
                icon: ClipboardCheck,
                title: "Nettoyage terminé",
                description: "Hotte cuisine",
                time: "09:15",
                color: "text-cyan-300",
              },
              {
                icon: ShieldCheck,
                title: "Audit HACCP",
                description: "Conformité validée",
                time: "08:40",
                color: "text-green-300",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                }}
                className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">

                  <div className="mb-4 flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <item.icon
                        className={`h-5 w-5 ${item.color}`}
                      />
                    </div>

                    <span className="text-xs text-white/40">
                      {item.time}
                    </span>

                  </div>

                  <h3 className="mb-2 font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-white/50">
                    {item.description}
                  </p>

                </div>
              </motion.div>
            ))}

          </div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5"
        >
          <div className="mb-4">
            <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300">
              ACTIONS RAPIDES
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            {[
              {
                label: "Créer un contrôle",
                icon: ClipboardCheck,
                color: "cyan",
              },
              {
                label: "Ajouter un stock",
                icon: Boxes,
                color: "pink",
              },
              {
                label: "Déclarer une panne",
                icon: AlertTriangle,
                color: "orange",
              },
              {
                label: "Exporter HACCP",
                icon: ShieldCheck,
                color: "violet",
              },
            ].map((action, index) => (
              <motion.button
                key={index}
                whileHover={{
                  y: -3,
                }}
                className={`${glassCard} flex h-[88px] items-center justify-between px-5 transition-all hover:border-cyan-400/20`}
              >
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <action.icon className="h-5 w-5" />
                  </div>

                  <span className="text-sm font-medium">
                    {action.label}
                  </span>

                </div>

                <ChevronRight className="h-4 w-4 text-white/40" />
              </motion.button>
            ))}

          </div>
        </motion.div>

      </div>
    </div>
  )
}