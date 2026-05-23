"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

import { supabase } from "@/lib/supabase";

import {
  Thermometer,
  AlertTriangle,
  Refrigerator,
  ShieldCheck,
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {

    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select(`
        *,
        equipments (
          temp_min,
          temp_max
        )
      `)
      .order("created_at", { ascending: false });

    if (logsData) {

      setLogsCount(logsData.length);

      const alerts = logsData.filter((log: any) => {

        const equipment = log.equipments;

        if (!equipment) return false;

        return (
          log.temperature < equipment.temp_min ||
          log.temperature > equipment.temp_max
        );
      });

      setAlertsCount(alerts.length);

      const formattedChartData = logsData
        .slice(0, 7)
        .reverse()
        .map((log: any) => ({
          temperature: log.temperature,
          date: new Date(
            log.created_at
          ).toLocaleDateString(),
        }));

      setChartData(formattedChartData);
    }

    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    if (equipmentsData) {
      setEquipmentsCount(equipmentsData.length);
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#070B14] text-white p-8"
    >

      {/* HEADER */}
      <div className="mb-14">

        <p className="text-blue-400 font-semibold tracking-[0.25em] uppercase mb-4">
          Clean Kitchen
        </p>

        <h1 className="text-7xl font-black tracking-tight leading-none">
          Dashboard HACCP
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Surveillance intelligente de votre établissement
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
          transition={{
            type: "spring",
            stiffness: 250,
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
              <CountUp
                end={logsCount}
                duration={2}
              />
            </h2>

          </div>
        </motion.div>

        {/* ALERTES */}
        <motion.div
          whileHover={{
            scale: 1.04,
            y: -5,
          }}
          transition={{
            type: "spring",
            stiffness: 250,
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
              <CountUp
                end={alertsCount}
                duration={2}
              />
            </h2>

          </div>
        </motion.div>

        {/* ÉQUIPEMENTS */}
        <motion.div
          whileHover={{
            scale: 1.04,
            y: -5,
          }}
          transition={{
            type: "spring",
            stiffness: 250,
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
              <CountUp
                end={equipmentsCount}
                duration={2}
              />
            </h2>

          </div>
        </motion.div>

        {/* CONFORMITÉ */}
        <motion.div
          whileHover={{
            scale: 1.04,
            y: -5,
          }}
          transition={{
            type: "spring",
            stiffness: 250,
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
              <CountUp
                end={98}
                duration={2}
                suffix="%"
              />
            </h2>

          </div>
        </motion.div>

      </div>

      {/* GRAPH */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl overflow-hidden"
      >

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-3xl font-bold">
              Températures
            </h2>

            <p className="text-gray-400 mt-2">
              Historique des relevés HACCP
            </p>

          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 px-5 py-2 rounded-2xl text-blue-300 text-sm font-semibold">
            LIVE DATA
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
                  backdropFilter: "blur(20px)",
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
                dot={{
                  r: 7,
                  fill: "#3B82F6",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 10,
                  fill: "#60A5FA",
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </motion.div>

    </motion.main>
  );
}