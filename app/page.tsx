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
            y: -8,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-7
            backdrop-blur-2xl
          "
        >

          <div
            className="
              absolute
              inset-0
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-700
              bg-gradient-to-br
              from-blue-500/20
              via-cyan-500/10
              to-transparent
            "
          />

          <div
            className="
              absolute
              inset-0
              rounded-3xl
              border
              border-blue-400/0
              group-hover:border-blue-400/30
              transition-all
              duration-500
            "
          />

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
            y: -8,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10
            p-7
            backdrop-blur-2xl
          "
        >

          <div
            className="
              absolute
              inset-0
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-700
              bg-gradient-to-br
              from-red-500/20
              via-orange-500/10
              to-transparent
            "
          />

          <div
            className="
              absolute
              inset-0
              rounded-3xl
              border
              border-red-400/0
              group-hover:border-red-400/30
              transition-all
              duration-500
            "
          />

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
            y: -8,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            p-7
            backdrop-blur-2xl
          "
        >

          <div
            className="
              absolute
              inset-0
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-700
              bg-gradient-to-br
              from-cyan-500/20
              via-blue-500/10
              to-transparent
            "
          />

          <div
            className="
              absolute
              inset-0
              rounded-3xl
              border
              border-cyan-400/0
              group-hover:border-cyan-400/30
              transition-all
              duration-500
            "
          />

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
            y: -8,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border
            border-green-500/20
            bg-green-500/10
            p-7
            backdrop-blur-2xl
          "
        >

          <div
            className="
              absolute
              inset-0
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-700
              bg-gradient-to-br
              from-green-500/20
              via-emerald-500/10
              to-transparent
            "
          />

          <div
            className="
              absolute
              inset-0
              rounded-3xl
              border
              border-green-400/0
              group-hover:border-green-400/30
              transition-all
              duration-500
            "
          />

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

    </motion.main>
  );
}