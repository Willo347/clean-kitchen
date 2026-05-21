"use client";

import Link from "next/link";
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

  const fetchData = async () => {
    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    if (logsData && equipmentsData) {
      const formattedLogs = logsData.map((log) => ({
        ...log,
        equipment: equipmentsData.find(
          (eq) => eq.id === log.equipement_id
        ),
      }));

      setLogs(formattedLogs);
      setEquipments(equipmentsData);
    }
  };

  const average =
    logs.length > 0
      ? (
          logs.reduce((acc, log) => acc + log.temperature, 0) /
          logs.length
        ).toFixed(1)
      : "0";

  const alerts = logs.filter((log) => log.temperature > 4);

  const conformity =
    logs.length > 0
      ? Math.round(
          ((logs.length - alerts.length) / logs.length) * 100
        )
      : 100;

  const chartData = logs
    .slice()
    .reverse()
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString(),
      temperature: log.temperature,
    }));

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Rapport HACCP - Clean Kitchen", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Équipement", "Température", "Date"]],
      body: logs.map((log) => [
        log.equipment?.name || "Équipement",
        `${log.temperature}°C`,
        new Date(log.created_at).toLocaleString(),
      ]),
    });

    doc.save("rapport-haccp.pdf");
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-bold">
            Clean Kitchen
          </h1>

          <p className="text-gray-400 mt-2">
            Dashboard HACCP
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
          >
            Export PDF
          </button>

          <Link
            href="/temperatures"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl"
          >
            Températures
          </Link>

          <Link
            href="/equipments"
            className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-xl"
          >
            Équipements
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-3xl">
          <p className="text-gray-400">
            Température moyenne
          </p>

          <h2 className="text-5xl font-bold text-green-400 mt-2">
            {average}°C
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl">
          <p className="text-gray-400">
            Alertes actives
          </p>

          <h2 className="text-5xl font-bold text-red-400 mt-2">
            {alerts.length}
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl">
          <p className="text-gray-400">
            Équipements
          </p>

          <h2 className="text-5xl font-bold text-blue-400 mt-2">
            {equipments.length}
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl">
          <p className="text-gray-400">
            Conformité
          </p>

          <h2 className="text-5xl font-bold text-green-400 mt-2">
            {conformity}%
          </h2>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl mb-8">
        <h2 className="text-3xl font-bold mb-6">
          Évolution des températures
        </h2>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#888" />

              <YAxis stroke="#888" />

              <Tooltip />

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

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 p-6 rounded-3xl">
          <h2 className="text-3xl font-bold mb-6">
            Derniers relevés
          </h2>

          <div className="space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="bg-zinc-800 p-4 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-xl">
                    {log.equipment?.name || "Équipement"}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {new Date(
                      log.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div
                  className={`text-4xl font-bold ${
                    log.temperature > 4
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {log.temperature}°C
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl">
          <h2 className="text-3xl font-bold mb-6 text-red-400">
            Alertes critiques
          </h2>

          <div className="space-y-4">
            {alerts.map((log) => (
              <div
                key={log.id}
                className="border border-red-500 bg-red-950 p-4 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-xl">
                    {log.equipment?.name || "Équipement"}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {new Date(
                      log.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="text-4xl font-bold text-red-400">
                  {log.temperature}°C
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <p className="text-green-400">
                Aucun problème détecté ✅
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}