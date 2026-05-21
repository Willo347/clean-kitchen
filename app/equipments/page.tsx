"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EquipmentsPage() {
  const [name, setName] = useState("");
  const [zone, setZone] = useState("");
  const [type, setType] = useState("");

  const [equipments, setEquipments] = useState<any[]>([]);

  const fetchEquipments = async () => {
    const { data } = await supabase
      .from("equipments")
      .select("*")
      .order("id", { ascending: false });

    if (data) {
      setEquipments(data);
    }
  };

  const addEquipment = async () => {
    if (!name || !zone || !type) return;

    await supabase.from("equipments").insert([
      {
        name,
        zone,
        type,
      },
    ]);

    setName("");
    setZone("");
    setType("");

    fetchEquipments();
  };

  const deleteEquipment = async (id: number) => {
    await supabase.from("equipments").delete().eq("id", id);

    fetchEquipments();
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Équipements
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Nom de l'équipement"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
          />

          <input
            type="text"
            placeholder="Zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
          />

          <input
            type="text"
            placeholder="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
          />

          <button
            onClick={addEquipment}
            className="bg-blue-600 hover:bg-blue-700 transition rounded-xl p-4 font-bold"
          >
            Ajouter un équipement
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {equipments.map((equipment) => (
          <div
            key={equipment.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center"
          >
            <div>
              <p className="text-2xl font-bold">
                {equipment.name}
              </p>

              <p className="text-zinc-400">
                {equipment.zone}
              </p>

              <p className="text-blue-400 mt-1">
                {equipment.type}
              </p>
            </div>

            <button
              onClick={() => deleteEquipment(equipment.id)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}