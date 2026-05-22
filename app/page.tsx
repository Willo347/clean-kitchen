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

  const conformity =
    logs.length > 0
      ? Math.round(
          ((logs.length - alerts.length) / logs.length) * 100
        )
      : 100;

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
    <main className="flex-1 p-8 overflow-auto bg-[#0b1220] min-h-screen text-white">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-5xl font-bold">Clean Kitchen</h1>
          <p className="text-gray-400 mt-2">
            Dashboard HACCP Premium
          </p>
        </div>

        <button
          onClick={exportPDF}
          className="bg-red-500 hover:bg-red-600 transition px-6 py-3 rounded-2xl font-bold shadow-lg"
        >
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-[#111827] p-6 rounded-3xl shadow-xl">
          <p className="text-gray-400">
            Température moyenne
          </p>

          <h2 className="text-5xl text-green-400 font-bold mt-4">
            {averageTemp}°C
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-3xl shadow-xl">
          <p className="text-gray-400">
            Alertes actives
          </p>

          <h2 className="text-5xl text-red-400 font-bold mt-4">
            {alerts.length}
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-3xl shadow-xl">
          <p className="text-gray-400">
            Équipements
          </p>

          <h2 className="text-5xl text-blue-400 font-bold mt-4">
            {equipments.length}
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-3xl shadow-xl">
          <p className="text-gray-400">
            Conformité HACCP
          </p>

          <h2 className="text-5xl text-green-400 font-bold mt-4">
            {conformity}%
          </h2>
        </div>
      </div>

      <div className="bg-[#111827] p-8 rounded-3xl mb-10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">
            Évolution des températures
          </h2>

          <div className="text-sm text-gray-400">
            Surveillance temps réel
          </div>
        </div>

        <div className="h-[380px]">
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
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#111827] p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-red-400">
            Alertes HACCP
          </h2>

          {alerts.length > 0 && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold animate-pulse">
              ⚠️ PROBLÈME DÉTECTÉ
            </div>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="bg-green-500/10 border border-green-500 p-6 rounded-2xl">
            <p className="text-green-400 text-xl font-bold">
              ✅ Aucun problème détecté
            </p>

            <p className="text-gray-400 mt-2">
              Tous les équipements respectent les normes HACCP.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {alerts.map((log, index) => (
              <div
                key={index}
                className="bg-red-500/10 border border-red-500 p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 text-2xl font-bold">
                      ⚠️ ALERTE HACCP
                    </p>

                    <p className="text-gray-300 mt-3">
                      Température détectée :
                      <span className="text-red-400 font-bold ml-2">
                        {log.temperature}°C
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(
                        log.created_at
                      ).toLocaleDateString()}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(
                        log.created_at
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}