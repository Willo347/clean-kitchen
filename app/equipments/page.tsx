"use client";

import { useEffect, useState } from "react";

import {
  Pencil,
  Trash2,
  Plus,
  Snowflake,
  Wifi,
  AlertTriangle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Equipment = {
  id: number;
  name: string;
  zone: string;
  type: string;
  temp_min: number;
  temp_max: number;
};

type TemperatureLog = {
  equipment_id: number;
  temperature: number;
};

export default function EquipmentsPage() {

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [temperatures, setTemperatures] = useState<
    Record<number, number>
  >({});

  async function loadEquipments() {

    const { data, error } = await supabase
      .from("equipments")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) {
      setEquipments(data);
    }
  }

  async function loadTemperatures() {

    const { data, error } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {

      const latestTemps: Record<number, number> = {};

      data.forEach((log: any) => {

        if (
          log.equipment_id &&
          latestTemps[log.equipment_id] === undefined
        ) {
          latestTemps[log.equipment_id] = log.temperature;
        }

      });

      setTemperatures(latestTemps);
    }
  }

  async function deleteEquipment(id: number) {

    await supabase
      .from("equipments")
      .delete()
      .eq("id", id);

    loadEquipments();
  }

  async function addEquipment() {

    const name = prompt("Nom équipement");
    if (!name) return;

    const zone = prompt("Zone");
    if (!zone) return;

    const type = prompt("Type");
    if (!type) return;

    await supabase
      .from("equipments")
      .insert({
        name,
        zone,
        type,
        temp_min: 0,
        temp_max: 4,
      });

    loadEquipments();
  }

  useEffect(() => {

    loadEquipments();
    loadTemperatures();

  }, []);

  return (

    <div className="p-10">

      {/* HEADER */}

      <div className="flex items-start justify-between mb-10">

        <div>

          <div className="flex items-center gap-3 mb-3">

            <div className="w-4 h-4 rounded-full bg-cyan-400" />

            <span className="text-cyan-400 tracking-[0.25em] text-sm font-semibold uppercase">
              Equipment Management
            </span>

          </div>

          <h1 className="text-7xl font-black text-white mb-4">
            Équipements
          </h1>

          <p className="text-white/50 text-2xl">
            Gestion intelligente des équipements HACCP
          </p>

        </div>

        <button
          onClick={addEquipment}
          className="
            px-8
            py-5
            rounded-3xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-500
            text-white
            font-bold
            text-xl
            shadow-[0_0_40px_rgba(0,200,255,0.35)]
            hover:scale-105
            transition
            flex
            items-center
            gap-3
          "
        >
          <Plus size={24} />
          Ajouter un équipement
        </button>

      </div>

      {/* LIST */}

      <div className="space-y-8">

        {equipments.map((equipment) => {

          const currentTemp =
            temperatures[equipment.id];

          const isAlert =
            currentTemp !== undefined &&
            (
              currentTemp < equipment.temp_min ||
              currentTemp > equipment.temp_max
            );

          return (

            <div
              key={equipment.id}
              className="
                relative
                overflow-hidden
                rounded-[36px]
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                p-8
              "
            >

              <div className="flex items-center justify-between">

                {/* LEFT */}

                <div className="flex items-center gap-6">

                  <div
                    className="
                      w-24
                      h-24
                      rounded-3xl
                      bg-cyan-500/20
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Snowflake
                      size={42}
                      className="text-cyan-300"
                    />
                  </div>

                  <div>

                    <div className="flex items-center gap-4 mb-3">

                      <h2 className="text-5xl font-black text-white">
                        {equipment.name}
                      </h2>

                      <div
                        className={`
                          px-4
                          py-2
                          rounded-full
                          text-lg
                          font-bold
                          ${
                            isAlert
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                          }
                        `}
                      >
                        {isAlert ? "ALERTE" : "Stable"}
                      </div>

                    </div>

                    <p className="text-white/50 text-2xl mb-4">
                      Zone : {equipment.zone}
                    </p>

                    <div className="flex items-center gap-2 text-cyan-300">

                      <Wifi size={18} />

                      <span className="text-lg">
                        Online
                      </span>

                    </div>

                  </div>

                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-8">

                  {isAlert && (
                    <AlertTriangle
                      size={42}
                      className="text-red-400"
                    />
                  )}

                  <div className="flex gap-4">

                    <button
                      className="
                        w-16
                        h-16
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Pencil className="text-cyan-300" />
                    </button>

                    <button
                      onClick={() =>
                        deleteEquipment(equipment.id)
                      }
                      className="
                        w-16
                        h-16
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Trash2 className="text-red-300" />
                    </button>

                  </div>

                  <div className="text-right">

                    <p className="text-white/50 text-xl mb-3">
                      Température live
                    </p>

                    <div
                      className={`
                        text-6xl
                        font-black
                        ${
                          isAlert
                            ? "text-red-400"
                            : "text-white"
                        }
                      `}
                    >
                      {currentTemp ?? "--"}°C
                    </div>

                    <p className="text-white/40 text-lg mt-2">
                      HACCP :
                      {" "}
                      {equipment.temp_min}°C → {equipment.temp_max}°C
                    </p>

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}