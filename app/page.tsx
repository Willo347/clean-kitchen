"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [showAlertsOnly, setShowAlertsOnly] =
    useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    setLogs(logsData || []);
    setEquipments(equipmentsData || []);
  }

  const logsWithStatus = useMemo(() => {
    return logs.map((log) => {
      const equipement = equipments.find(
        (e) => e.id === log.equipement_id
      );

      if (!equipement) {
        return {
          ...log,
          status: "unknown",
        };
      }

      const isAlert =
        log.temperature < equipement.temp_min ||
        log.temperature > equipement.temp_max;

      return {
        ...log,
        equipmentName: equipement.name,
        status: isAlert ? "alert" : "ok",
      };
    });
  }, [logs, equipments]);

  const filteredLogs = useMemo(() => {
    return logsWithStatus.filter((log) => {
      const matchSearch =
        !search ||
        log.equipmentName
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchAlert =
        !showAlertsOnly || log.status === "alert";

      return matchSearch && matchAlert;
    });
  }, [logsWithStatus, search, showAlertsOnly]);

  const alertes = filteredLogs.filter(
    (log) => log.status === "alert"
  );

  const moyenne =
    filteredLogs.length > 0
      ? (
          filteredLogs.reduce(
            (acc, log) => acc + log.temperature,
            0
          ) / filteredLogs.length
        ).toFixed(1)
      : "0";

  const conformite =
    filteredLogs.length > 0
      ? Math.round(
          ((filteredLogs.length - alertes.length) /
            filteredLogs.length) *
            100
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

      head: [
        [
          "Equipement",
          "Température",
          "Statut",
          "Date",
        ],
      ],

      body: filteredLogs.map((log) => [
        log.equipmentName || "N/A",
        `${log.temperature}°C`,
        log.status === "alert"
          ? "ALERTE"
          : "Conforme",
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
          className="bg-red-500 hover:bg-red-600 transition px-6 py-3 rounded-2xl font-bold"
        >
          Export PDF HACCP
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-[#1e293b] p-6 rounded-2xl">
          <p className="text-gray-400 mb-2">
            Température moyenne
          </p>

          <h2 className="text-4xl font-bold text-green-400">
            {moyenne}°C
          </h2>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl">
          <p className="text-gray-400 mb-2">
            Alertes actives
          </p>

          <h2 className="text-4xl font-bold text-red-400">
            {alertes.length}
          </h2>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl">
          <p className="text-gray-400 mb-2">
            Équipements
          </p>

          <h2 className="text-4xl font-bold text-blue-400">
            {equipments.length}
          </h2>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl">
          <p className="text-gray-400 mb-2">
            Conformité HACCP
          </p>

          <h2 className="text-4xl font-bold text-green-400">
            {conformite}%
          </h2>
        </div>

      </div>

      <div className="bg-[#1e293b] p-6 rounded-2xl mb-8">

        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="bg-[#0f172a] border border-gray-700 rounded-2xl px-5 py-3 flex-1"
          />

          <button
            onClick={() =>
              setShowAlertsOnly(!showAlertsOnly)
            }
            className={`px-5 py-3 rounded-2xl font-bold transition ${
              showAlertsOnly
                ? "bg-red-500"
                : "bg-[#0f172a] border border-gray-700"
            }`}
          >
            🚨 Alertes uniquement
          </button>

        </div>

        <h2 className="text-3xl font-bold mb-6">
          Évolution des températures
        </h2>

        <div className="h-[400px]">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={filteredLogs}>

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

      <div className="bg-[#1e293b] p-6 rounded-2xl">

        <h2 className="text-3xl font-bold text-red-400 mb-6">
          Historique HACCP
        </h2>

        <div className="space-y-4">

          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`p-5 rounded-2xl border ${
                log.status === "alert"
                  ? "bg-red-500/10 border-red-500"
                  : "bg-green-500/10 border-green-500"
              }`}
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xl font-bold">
                    {log.equipmentName || "Equipement"}
                  </p>

                  <p className="mt-2 text-gray-300">
                    Température :
                    <span
                      className={`ml-2 font-bold ${
                        log.status === "alert"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {log.temperature}°C
                    </span>
                  </p>
                </div>

                <div className="text-right">

                  <div
                    className={`px-4 py-2 rounded-full font-bold ${
                      log.status === "alert"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  >
                    {log.status === "alert"
                      ? "ALERTE"
                      : "CONFORME"}
                  </div>

                  <p className="text-sm text-gray-400 mt-3">
                    {new Date(
                      log.created_at
                    ).toLocaleString()}
                  </p>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

    </main>
  );
}