"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

import Topbar from "./components/Topbar";

import { supabase } from "@/lib/supabase";

import { toast } from "sonner";

import {
  Thermometer,
  AlertTriangle,
  Refrigerator,
  ShieldCheck,
  Database,
  Wifi,
  Clock3,
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  async function fetchDashboard() {

    const now = new Date();

    setLastUpdate(
      now.toLocaleTimeString()
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

        const equipment = log.equipments;

        if (!equipment) return false;

        return (
          log.temperature < equipment.temp_min ||
          log.temperature > equipment.temp_max
        );
      });

      setAlertsCount(alerts.length);

      if (alerts.length > 0) {

        toast.error(
          `${alerts.length} alerte(s) HACCP détectée(s)`
        );

      }

      const formattedChartData = logsData
        .slice(0, 7)
        .reverse()
        .map((log: any) => ({
          temperature: log.temperature,
          date: new Date(
            log.created_at
          ).toLocaleTimeString(),
        }));

      setChartData(formattedChartData);
    }

    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    if (equipmentsData) {
      setEquipmentsCount(equipmentsData.length);
    }

    setLoading(false);
  }

  function isAlert(log: any) {

    const equipment = log.equipments;

    if (!equipment) return false;

    return (
      log.temperature < equipment.temp_min ||
      log.temperature > equipment.temp_max
    );
  }

  if (loading) {

    return (
      <main className="min-h-screen bg-[#070B14] flex items-center justify-center">

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "linear",
          }}
          className="w-24 h-24 rounded-full border-[5px] border-white/10 border-t-cyan-400"
        />

      </main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#070B14] text-white p-8"
    >

      <Topbar />

      {/* HEADER */}
      <div className="mb-14">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />

          <p className="text-green-400 font-semibold tracking-widest uppercase">
            LIVE SYSTEM
          </p>

        </div>

        <h1 className="text-7xl font-black tracking-tight leading-none">
          Dashboard HACCP
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Surveillance intelligente temps réel
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mb-10">

        {/* RELEVÉS */}
        <motion.div
          whileHover={{
            scale: 1.04,
            y: -5,
          }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl"
        >

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center justify-between mb-6">

              <div className="bg-blue-500/20 p-4 rounded-2xl">
                <Thermometer className="text-blue-400" />
              </div>

              <span className="text-green-400 text-sm font-bold">
                LIVE
              </span>

            </div>

            <p className="text-gray-400 text-sm">
              Relevés enregistrés
            </p>

            <h2 className="text-6xl font-black mt-4">
              <CountUp end={logsCount} duration={1} />
            </h2>

          </div>

        </motion.div>

        {/* ALERTES */}
        <motion.div
          whileHover={{
            scale: 1.04,
            y: -5,
          }}
          className="group relative overflow-hidden rounded-3xl border border-red-500/20 bg-red-500/10 p-7 backdrop-blur-2xl"
        >

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-red-500/20 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center justify-between mb-6">

              <div className="bg-red-500/20 p-4 rounded-2xl">
                <AlertTriangle className="text-red-400" />
              </div>

              <span className="text-red-300 text-sm font-bold">
                HACCP
              </span>

            </div>

            <p className="text-gray-400 text-sm">
              Alertes détectées
            </p>

            <h2 className="text-6xl font-black mt-4">
              <CountUp end={alertsCount} duration={1} />
            </h2>

          </div>

        </motion.div>

        {/* ÉQUIPEMENTS */}
        <motion.div
          whileHover={{
            scale: 1.04,
            y: -5,
          }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl"
        >

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center justify-between mb-6">

              <div className="bg-cyan-500/20 p-4 rounded-2xl">
                <Refrigerator className="text-cyan-400" />
              </div>

              <span className="text-cyan-300 text-sm font-bold">
                Actifs
              </span>

            </div>

            <p className="text-gray-400 text-sm">
              Équipements
            </p>

            <h2 className="text-6xl font-black mt-4">
              <CountUp end={equipmentsCount} duration={1} />
            </h2>

          </div>

        </motion.div>

        {/* CONFORMITÉ */}
        <motion.div
          whileHover={{
            scale: 1.04,
            y: -5,
          }}
          className="group relative overflow-hidden rounded-3xl border border-green-500/20 bg-green-500/10 p-7 backdrop-blur-2xl"
        >

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-green-500/20 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center justify-between mb-6">

              <div className="bg-green-500/20 p-4 rounded-2xl">
                <ShieldCheck className="text-green-400" />
              </div>

              <span className="text-green-300 text-sm font-bold">
                Conforme
              </span>

            </div>

            <p className="text-gray-400 text-sm">
              Score conformité
            </p>

            <h2 className="text-6xl font-black mt-4">
              98%
            </h2>

          </div>

        </motion.div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* GRAPH */}
        <div className="xl:col-span-2 bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl overflow-hidden">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Températures temps réel
              </h2>

              <p className="text-gray-400 mt-2">
                Actualisation automatique toutes les 5 secondes
              </p>

            </div>

            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-5 py-2 rounded-2xl text-green-300 text-sm font-semibold">

              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

              LIVE

            </div>

          </div>

          <div className="h-[350px]">

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
                      stopOpacity={0.45}
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

                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "18px",
                    color: "white",
                  }}
                />

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
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* MINI STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">

              <p className="text-gray-400 text-sm mb-3">
                Température moyenne
              </p>

              <h3 className="text-4xl font-black text-blue-400">
                4°
              </h3>

            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">

              <p className="text-green-300 text-sm mb-3">
                Température minimum
              </p>

              <h3 className="text-4xl font-black text-green-400">
                2°
              </h3>

            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">

              <p className="text-red-300 text-sm mb-3">
                Température maximum
              </p>

              <h3 className="text-4xl font-black text-red-400">
                8°
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
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                    }}
                    key={log.id}
                    className={`
                      rounded-2xl
                      border
                      p-4
                      transition-all
                      duration-300
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

                      <motion.div
                        animate={
                          alert
                            ? {
                                scale: [1, 1.08, 1],
                              }
                            : {}
                        }
                        transition={{
                          repeat: Infinity,
                          duration: 1.8,
                        }}
                      >

                        <p
                          className={`text-2xl font-black ${
                            alert
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          {log.temperature}°
                        </p>

                      </motion.div>

                    </div>

                  </motion.div>
                );
              })}

            </div>

          </div>

          {/* STATUS */}
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

    </motion.main>
  );
}