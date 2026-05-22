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
  const [alertes, setAlertes] = useState<any[]>([]);

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

    checkAlertes(logsData || [], equipmentsData || []);
  }

  function checkAlertes(logsData: any[], equipmentsData: any[]) {
    const nouvellesAlertes: any[] = [];

    logsData.forEach((log) => {
      const equipement = equipmentsData.find(
        (e) => e.id === log.equipement_id
      );

      if (!equipement) return;

      if (
        equipement.temp_min !== null &&
        log.temperature < equipement.temp_min
      ) {
        nouvellesAlertes.push({
          message: `❄️ ${equipement.name} trop froid (${log.temperature}°C)`,
        });
      }

      if (
        equipement.temp_max !== null &&
        log.temperature > equipement.temp_max
      ) {
        nouvellesAlertes.push({
          message: `🔥 ${equipement.name} trop chaud (${log.temperature}°C)`,
        });
      }
    });

    setAlertes(nouvellesAlertes);
  }

  const moyenne =
    logs.length > 0
      ? (
          logs.reduce((acc, log) => acc + log.temperature, 0) /
          logs.length
        ).toFixed(1)
      : "0";

  const conformite =
    logs.length > 0
      ? Math.round(
          ((logs.length - alertes.length) / logs.length) * 100
        )
      : 100;

  function exportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(22);

    doc.text("Rapport HACCP - Clean Kitchen", 14, 20);

    doc.setFontSize(12);

    doc.text(
      `Conformité HACCP : ${conformite}%`,
      14,
      30
    );

    autoTable(doc, {
      startY: 40,

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
    <main className="min-h-screen bg-[#0f172a] text-white p-8">

      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-5xl font-bold">
            Clean Kitchen
          </h1>

          <p className="text-gray-400 mt-2">
            Dashboard HACCP Premium
          </p>
        </div>

        <button
          onClick={exportPDF}
          className="bg-red-500 hover:bg-red-600 transition px-6 py-3 rounded-2xl font-bold shadow-lg"
        >
          Export PDF HACCP
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 mb-2">
            Température moyenne
          </p>

          <h2 className="text-4xl font-bold text-green-400">
            {moyenne}°C
          </h2>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 mb-2">
            Alertes actives
          </p>

          <h2 className="text-4xl font-bold text-red-400">
            {alertes.length}
          </h2>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 mb-2">
            Équipements
          </p>

          <h2 className="text-4xl font-bold text-blue-400">
            {equipments.length}
          </h2>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 mb-2">
            Conformité HACCP
          </p>

          <h2 className="text-4xl font-bold text-green-400">
            {conformite}%
          </h2>
        </div>

      </div>

      <div className="bg-[#1e293b] p-6 rounded-2xl mb-8 shadow-lg">

        <h2 className="text-3xl font-bold mb-6">
          Évolution des températures
        </h2>

        <div className="h-[400px]">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={logs}>

              <XAxis dataKey="created_at" />

              <YAxis />

              <Tooltip />

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

      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-3xl font-bold text-red-400">
            Alertes HACCP
          </h2>

          {alertes.length > 0 && (
            <div className="bg-red-500 px-4 py-2 rounded-full animate-pulse font-bold">
              🚨 Danger détecté
            </div>
          )}

        </div>

        {alertes.length === 0 && (
          <div className="bg-green-500/10 border border-green-500 p-5 rounded-2xl">
            <p className="text-green-400 font-bold text-xl">
              ✅ Aucun problème détecté
            </p>

            <p className="text-gray-400 mt-2">
              Tous les équipements sont conformes HACCP.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">

          {alertes.map((alerte, index) => (
            <div
              key={index}
              className="bg-red-500/20 border border-red-500 p-5 rounded-2xl"
            >
              <p className="text-red-400 font-bold text-lg">
                {alerte.message}
              </p>
            </div>
          ))}

        </div>

      </div>

    </main>
  );
}