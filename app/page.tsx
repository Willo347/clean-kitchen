"use client";

import { useEffect, useState } from "react";
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

    // logs températures
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

    // équipements
    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    if (equipmentsData) {
      setEquipmentsCount(equipmentsData.length);
    }
  }

  return (
    <main className="min-h-screen bg-[#070B14] text-white p-8">

      {/* HEADER */}
      <div className="mb-12">

        <p className="text-blue-400 font-semibold tracking-widest uppercase mb-3">
          Clean Kitchen
        </p>

        <h1 className="text-6xl font-black tracking-tight">
          Dashboard HACCP
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Surveillance globale de votre établissement
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* relevés */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="bg-blue-500/20 p-3 rounded-2xl">
              <Thermometer className="text-blue-400" />
            </div>

            <span className="text-green-400 text-sm font-bold">
              LIVE
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Relevés enregistrés
          </p>

          <h2 className="text-5xl font-black mt-3">
            {logsCount}
          </h2>

        </div>

        {/* alertes */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="bg-red-500/20 p-3 rounded-2xl">
              <AlertTriangle className="text-red-400" />
            </div>

            <span className="text-red-300 text-sm font-bold">
              HACCP
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Alertes détectées
          </p>

          <h2 className="text-5xl font-black mt-3">
            {alertsCount}
          </h2>

        </div>

        {/* équipements */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="bg-cyan-500/20 p-3 rounded-2xl">
              <Refrigerator className="text-cyan-400" />
            </div>

            <span className="text-cyan-300 text-sm font-bold">
              Actifs
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Équipements
          </p>

          <h2 className="text-5xl font-black mt-3">
            {equipmentsCount}
          </h2>

        </div>

        {/* conformité */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="bg-green-500/20 p-3 rounded-2xl">
              <ShieldCheck className="text-green-400" />
            </div>

            <span className="text-green-300 text-sm font-bold">
              Conforme
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Score conformité
          </p>

          <h2 className="text-5xl font-black mt-3">
            98%
          </h2>

        </div>

      </div>

      {/* GRAPH */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-3xl font-bold">
              Températures
            </h2>

            <p className="text-gray-400 mt-2">
              Historique des relevés HACCP
            </p>

          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-blue-300 text-sm">
            LIVE DATA
          </div>

        </div>

        <div className="h-[300px]">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={chartData}>

              <XAxis
                dataKey="date"
                stroke="#6B7280"
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3B82F6"
                strokeWidth={4}
                dot={{
                  r: 6,
                  fill: "#3B82F6",
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>
      </div>

    </main>
  );
}