"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TemperaturesPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [temperature, setTemperature] = useState("");

  useEffect(() => {
    fetchEquipments();
  }, []);

  async function fetchEquipments() {
    const { data, error } = await supabase
      .from("equipments")
      .select("*");

    if (!error && data) {
      setEquipments(data);
    }
  }

  async function addTemperature() {
    if (!selectedEquipment || !temperature) return;

    const equipment = equipments.find(
      (eq) => eq.id === Number(selectedEquipment)
    );

    await supabase.from("temperature_logs").insert([
      {
        equipment_id: equipment.id,
        equipment: equipment.name,
        temperature: Number(temperature),
        type: equipment.type,
      },
    ]);

    setTemperature("");
    alert("Relevé ajouté ✅");
  }

  return (
    <main className="flex-1 p-8 overflow-auto bg-[#0b1220] min-h-screen text-white">
      <h1 className="text-5xl font-bold mb-10">
        Relevé des températures
      </h1>

      <div className="bg-[#111827] p-8 rounded-3xl shadow-xl max-w-4xl">
        <div className="space-y-5">
          <select
            value={selectedEquipment}
            onChange={(e) =>
              setSelectedEquipment(e.target.value)
            }
            className="w-full bg-[#1f2937] border border-gray-700 p-4 rounded-2xl"
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
            onChange={(e) =>
              setTemperature(e.target.value)
            }
            className="w-full bg-[#1f2937] border border-gray-700 p-4 rounded-2xl"
          />

          <button
            onClick={addTemperature}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-4 rounded-2xl font-bold"
          >
            Ajouter le relevé
          </button>
        </div>
      </div>
    </main>
  );
}