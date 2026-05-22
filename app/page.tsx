"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    setLogs(logsData || []);
    setEquipments(equipmentsData || []);
  }

  const alerts = logs.filter((log: any) => {
    const equipment = equipments.find(
      (eq: any) => eq.id === log.equipment_id
    );

    if (!equipment) return false;

    return (
      log.temperature < equipment.temp_min ||
      log.temperature > equipment.temp_max
    );
  });

  const averageTemp =
    logs.length > 0
      ? (
          logs.reduce((acc, log) => acc + log.temperature, 0) /
          logs.length
        ).toFixed(1)
      : "0";

  function exportPDF() {
    const doc = new jsPDF();

    doc.text("Rapport HACCP - Clean Kitchen", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Equipement", "Température", "Date"]],
      body: logs.map((log) => [
        log.equipment || "N/A",
        `${log.temperature}°C`,
        new Date(log.created_at).toLocaleString(),
      ]),
    });

    doc.save("rapport-haccp.pdf");
  }

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold">Clean Kitchen</h1>
          <p className="text-gray-400 mt-2">Dashboard HACCP</p>
        </div>

        <button
          onClick={exportPDF}
          className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-semibold"
        >
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111827] p-6 rounded-2xl">
          <p className="text-gray-400">Température moyenne</p>
          <h2 className="text-5xl text-green-400 font-bold mt-2">
            {averageTemp}°C
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl">
          <p className="text-gray-400">Alertes actives</p>
          <h2 className="text-5xl text-red-400 font-bold mt-2">
            {alerts.length}
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl">
          <p className="text-gray-400">Équipements</p>
          <h2 className="text-5xl text-blue-400 font-bold mt-2">
            {equipments.length}
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl">
          <p className="text-gray-400">Conformité</p>
          <h2 className="text-5xl text-green-400 font-bold mt-2">
            {logs.length > 0
              ? Math.round(
                  ((logs.length - alerts.length) / logs.length) * 100
                )
              : 100}
            %
          </h2>
        </div>
      </div>

      <div className="bg-[#111827] p-6 rounded-2xl mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Évolution des températures
        </h2>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={logs}>
              <XAxis
                dataKey="created_at"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString()
                }
              />

              <YAxis />

              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleString()
                }
              />

              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#111827] p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-red-400">
          Alertes HACCP
        </h2>

        {alerts.length === 0 && (
          <p className="text-green-400">
            Aucun problème détecté ✅
          </p>
        )}

        <div className="space-y-4">
          {alerts.map((log, index) => (
            <div
              key={index}
              className="bg-[#1f2937] p-4 rounded-xl border border-red-500"
            >
              <p className="font-bold text-lg">
                ⚠️ Température hors norme
              </p>

              <p className="text-gray-300 mt-2">
                Température relevée :
                <span className="text-red-400 font-bold ml-2">
                  {log.temperature}°C
                </span>
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}