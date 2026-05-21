"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TemperaturesPage() {
  const [temperature, setTemperature] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");

  useEffect(() => {
    fetchLogs();
    fetchEquipments();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("temperature_logs")
      .select(`
        *,
        equipment:equipement_id (
          name,
          zone,
          type
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
  };

  const fetchEquipments = async () => {
    const { data, error } = await supabase
      .from("equipments")
      .select("*");

    if (!error && data) {
      setEquipments(data);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEquipment || !temperature) {
      alert("Choisis un équipement et une température");
      return;
    }

    const { error } = await supabase
      .from("temperature_logs")
      .insert([
        {
          temperature: Number(temperature),
          equipement_id: selectedEquipment,
        },
      ]);

    if (!error) {
      setTemperature("");
      fetchLogs();
      alert("Relevé ajouté ✅");
    } else {
      console.log(error);
      alert("Erreur lors de l'ajout");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-8">
        Relevé des températures
      </h1>

      <div className="bg-zinc-900 p-6 rounded-3xl mb-8">
        <div className="space-y-4">
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4"
          >
            <option value="">
              Choisir un équipement
            </option>

            {equipments.map((equipment) => (
              <option
                key={equipment.id}
                value={equipment.id}
              >
                {equipment.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Température"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-4 font-bold"
          >
            Ajouter le relevé
          </button>
        </div>
      </div>

      <h2 className="text-4xl font-bold mb-6">
        Historique
      </h2>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-6 rounded-3xl border ${
              log.temperature > 4
                ? "bg-red-950 border-red-500"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">
                  {log.equipment?.name || "Équipement"}
                </h3>

                <p className="text-gray-400">
                  {log.equipment?.zone}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <div
                  className={`text-5xl font-bold ${
                    log.temperature > 4
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  🌡️ {log.temperature}°C
                </div>

                <div className="mt-2">
                  {log.temperature > 4 ? (
                    <span className="bg-red-500 px-4 py-2 rounded-full text-sm font-bold">
                      ⚠️ ALERTE
                    </span>
                  ) : (
                    <span className="bg-green-500 px-4 py-2 rounded-full text-sm font-bold">
                      ✅ Conforme
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}