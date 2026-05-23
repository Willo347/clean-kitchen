"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { toast } from "sonner";

import Topbar from "./components/Topbar";
import { supabase } from "@/lib/supabase";

import {
  Thermometer,
  AlertTriangle,
  Refrigerator,
  ShieldCheck,
  Database,
  Wifi,
  Clock3,
  Activity,
  Flame,
} from "lucide-react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  Area,
} from "recharts";

export default function DashboardPage() {

  const [logsCount, setLogsCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [equipmentsCount, setEquipmentsCount] = useState(0);

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {

    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  async function fetchDashboard() {

    setLastUpdate(
      new Date().toLocaleTimeString()
    );

    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select(`
        *,
        equipments (
          name,
          temp_min,
          temp_max
        ),
        employees (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (logsData) {

      setLogsCount(logsData.length);

      setRecentLogs(logsData.slice(0, 5));

      const alerts = logsData.filter((log: any) => {

        const eq = log.equipments;

        if (!eq) return false;

        return (
          log.temperature < eq.temp_min ||
          log.temperature > eq.temp_max
        );
      });

      setAlertsCount(alerts.length);

      if (alerts.length > 0) {

        toast.error(
          `${alerts.length} alerte(s) HACCP détectée(s)`
        );

      }

      setChartData(
        logsData
          .slice(0, 7)
          .reverse()
          .map((log: any) => ({
            temperature: log.temperature,
            date: new Date(
              log.created_at
            ).toLocaleTimeString(),
          }))
      );
    }

    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    if (equipmentsData) {
      setEquipmentsCount(equipmentsData.length);
    }
  }

  function isAlert(log: any) {

    const eq = log.equipments;

    if (!eq) return false;

    return (
      log.temperature < eq.temp_min ||
      log.temperature > eq.temp_max
    );
  }

  const stats = [
    {
      title: "Relevés enregistrés",
      value: logsCount,
      icon: Thermometer,
      color: "from-blue-500/20 to-cyan-500/10",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/20",
      badge: "LIVE",
    },
    {
      title: "Alertes détectées",
      value: alertsCount,
      icon: AlertTriangle,
      color: "from-red-500/20 to-orange-500/10",
      border: "border-red-500/20",
      glow: "shadow-red-500/20",
      badge: "HACCP",
    },
    {
      title: "Équipements",
      value: equipmentsCount,
      icon: Refrigerator,
      color: "from-cyan-500/20 to-blue-500/10",
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/20",
      badge: "Actifs",
    },
    {
      title: "Score conformité",
      value: "98%",
      icon: ShieldCheck,
      color: "from-green-500/20 to-emerald-500/10",
      border: "border-green-500/20",
      glow: "shadow-green-500/20",
      badge: "Conforme",
    },
  ];

  return (
    <main className="min-h-screen bg-[#070B14] text-white p-8">

      <Topbar />

      {/* HEADER */}
      <div className="mb-14">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />

          <p className="text-green-400 font-semibold tracking-widest uppercase">
            LIVE SYSTEM
          </p>

        </div>

        <h1 className="text-7xl font-black tracking-tight">
          Dashboard HACCP
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Surveillance intelligente temps réel
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mb-10">

        {stats.map((card, index) => {

          const Icon = card.icon;

          return (

            <motion.div
              key={index}
              whileHover={{
                scale: 1.04,
                y: -8,
              }}
              className={`
                relative
                overflow-hidden
                rounded-3xl
                border
                ${card.border}
                bg-gradient-to-br
                ${card.color}
                backdrop-blur-2xl
                p-7
                shadow-2xl
                ${card.glow}
                group
              `}
            >

              {/* SHINE */}
              <div
                className="
                  absolute
                  top-0
                  left-[-100%]
                  w-[120%]
                  h-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/10
                  to-transparent
                  group-hover:left-[120%]
                  transition-all
                  duration-1000
                "
              />

              {/* LIVE DOT */}
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute top-6 right-6 w-3 h-3 rounded-full bg-green-400"
              />

              <div className="relative z-10">

                <div className="flex items-center justify-between mb-6">

                  <div className="bg-white/10 p-4 rounded-2xl">
                    <Icon className="text-white" />
                  </div>

                  <span className="text-sm font-bold text-white">
                    {card.badge}
                  </span>

                </div>

                <p className="text-gray-300 text-sm">
                  {card.title}
                </p>

                <motion.h2
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                  className="text-6xl font-black mt-4"
                >
                  {typeof card.value === "number" ? (
                    <CountUp end={card.value} duration={1} />
                  ) : (
                    card.value
                  )}
                </motion.h2>

              </div>

            </motion.div>
          );
        })}

      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* GRAPH */}
        <div className="xl:col-span-2 bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Températures temps réel
              </h2>

              <p className="text-gray-400 mt-2">
                Actualisation automatique toutes les 5 secondes
              </p>

            </div>

            <div className="bg-green-500/10 border border-green-500/20 px-5 py-2 rounded-2xl text-green-300 text-sm font-semibold">
              LIVE
            </div>

          </div>

          <div className="h-[260px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={chartData}>

                <defs>

                  <linearGradient
                    id="colorTemp"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#3B82F6"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#3B82F6"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="none"
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                />

                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#3B82F6"
                  strokeWidth={5}
                  dot={{
                    r: 6,
                    fill: "#3B82F6",
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* MINI STATS */}
          <div className="grid grid-cols-3 gap-5 mt-8">

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">

              <div className="flex items-center gap-3 mb-3">

                <Activity className="text-cyan-400" />

                <p className="text-gray-400 text-sm">
                  Température moyenne
                </p>

              </div>

              <h3 className="text-3xl font-black">
                4.2°
              </h3>

            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">

              <div className="flex items-center gap-3 mb-3">

                <Flame className="text-red-400" />

                <p className="text-red-300 text-sm">
                  Alertes critiques
                </p>

              </div>

              <h3 className="text-3xl font-black text-red-400">
                {alertsCount}
              </h3>

            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">

              <div className="flex items-center gap-3 mb-3">

                <ShieldCheck className="text-green-400" />

                <p className="text-green-300 text-sm">
                  HACCP Status
                </p>

              </div>

              <h3 className="text-3xl font-black text-green-400">
                OK
              </h3>

            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-8">

          {/* ACTIVITY */}
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-3xl font-bold">
                Activité récente
              </h2>

              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

            </div>

            <div className="space-y-5">

              {recentLogs.map((log) => {

                const alert = isAlert(log);

                return (

                  <div
                    key={log.id}
                    className={`
                      rounded-2xl
                      border
                      p-4
                      ${
                        alert
                          ? "bg-red-500/10 border-red-500/20"
                          : "bg-white/[0.03] border-white/5"
                      }
                    `}
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="font-bold text-lg">
                          {log.equipments?.name}
                        </p>

                        <p className="text-gray-400 text-sm mt-1">
                          {log.employees?.full_name}
                        </p>

                      </div>

                      <p
                        className={`text-2xl font-black ${
                          alert
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {log.temperature}°
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* SYSTEM */}
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">

            <h2 className="text-3xl font-bold mb-8">
              État système
            </h2>

            <div className="space-y-5">

              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-2xl p-4">

                <div className="flex items-center gap-4">

                  <div className="bg-green-500/20 p-3 rounded-2xl">
                    <Database className="text-green-400" />
                  </div>

                  <div>

                    <p className="font-bold">
                      Supabase
                    </p>

                    <p className="text-gray-400 text-sm">
                      Base connectée
                    </p>

                  </div>

                </div>

                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

              </div>

              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">

                <div className="flex items-center gap-4">

                  <div className="bg-blue-500/20 p-3 rounded-2xl">
                    <Wifi className="text-blue-400" />
                  </div>

                  <div>

                    <p className="font-bold">
                      Synchronisation
                    </p>

                    <p className="text-gray-400 text-sm">
                      Temps réel actif
                    </p>

                  </div>

                </div>

                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />

              </div>

              <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-2xl p-4">

                <div className="flex items-center gap-4">

                  <div className="bg-white/10 p-3 rounded-2xl">
                    <Clock3 className="text-white" />
                  </div>

                  <div>

                    <p className="font-bold">
                      Dernière MAJ
                    </p>

                    <p className="text-gray-400 text-sm">
                      {lastUpdate}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}