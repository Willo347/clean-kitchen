"use client";

import { useEffect, useState } from "react";

import {
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function DashboardPage() {

  const [equipmentCount, setEquipmentCount] =
    useState(0);

  const [alertCount, setAlertCount] =
    useState(0);

  const [onlineCount, setOnlineCount] =
    useState(0);

  const [averageTemp, setAverageTemp] =
    useState<number | null>(null);

  async function loadDashboard() {

    // EQUIPMENTS
    const { data: equipments } = await supabase
      .from("equipments")
      .select("*");

    if (equipments) {

      setEquipmentCount(equipments.length);

      setOnlineCount(equipments.length);
    }

    // TEMPERATURES
    const { data: logs } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (logs && logs.length > 0) {

      const latestTemps: Record<number, number> = {};

      logs.forEach((log: any) => {

        if (
          log.equipment_id &&
          latestTemps[log.equipment_id] === undefined
        ) {
          latestTemps[log.equipment_id] =
            log.temperature;
        }

      });

      const temps =
        Object.values(latestTemps);

      // ALERTS
      let alerts = 0;

      equipments?.forEach((equipment: any) => {

        const temp =
          latestTemps[equipment.id];

        if (
          temp !== undefined &&
          (
            temp < equipment.temp_min ||
            temp > equipment.temp_max
          )
        ) {
          alerts++;
        }

      });

      setAlertCount(alerts);

      // AVERAGE
      const avg =
        temps.reduce((a, b) => a + b, 0) /
        temps.length;

      setAverageTemp(avg);
    }
  }

  useEffect(() => {

    loadDashboard();

  }, []);

  return (

    <div className="p-10">

      {/* HEADER */}

      <div className="mb-12">

        <div className="flex items-center gap-3 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400" />

          <span className="text-cyan-400 tracking-[0.25em] text-sm font-semibold uppercase">
            HACCP CONTROL CENTER
          </span>

        </div>

        <h1 className="text-7xl font-black text-white mb-4">
          Dashboard
        </h1>

        <p className="text-white/50 text-2xl">
          Supervision intelligente des opérations HACCP
        </p>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-8">

        {/* EQUIPMENTS */}

        <div
          className="
            rounded-[36px]
            border
            border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-white/50 text-xl mb-3">
                Équipements
              </p>

              <h2 className="text-6xl font-black text-white">
                {equipmentCount}
              </h2>

            </div>

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

          </div>

          <p className="text-white/40 text-lg">
            Équipements connectés au système HACCP
          </p>

        </div>

        {/* ALERTS */}

        <div
          className="
            rounded-[36px]
            border
            border-red-500/20
            bg-red-500/[0.06]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-red-300/70 text-xl mb-3">
                Alertes HACCP
              </p>

              <h2 className="text-6xl font-black text-red-300">
                {alertCount}
              </h2>

            </div>

            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-red-500/20
                flex
                items-center
                justify-center
              "
            >

              <AlertTriangle
                size={42}
                className="text-red-300"
              />

            </div>

          </div>

          <p className="text-red-200/50 text-lg">
            Températures hors conformité
          </p>

        </div>

        {/* ONLINE */}

        <div
          className="
            rounded-[36px]
            border
            border-green-500/20
            bg-green-500/[0.06]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-green-300/70 text-xl mb-3">
                Système Online
              </p>

              <h2 className="text-6xl font-black text-green-300">
                {onlineCount}
              </h2>

            </div>

            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-green-500/20
                flex
                items-center
                justify-center
              "
            >

              <CheckCircle2
                size={42}
                className="text-green-300"
              />

            </div>

          </div>

          <p className="text-green-200/50 text-lg">
            Équipements opérationnels
          </p>

        </div>

        {/* TEMP */}

        <div
          className="
            rounded-[36px]
            border
            border-blue-500/20
            bg-blue-500/[0.06]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-blue-300/70 text-xl mb-3">
                Température Moyenne
              </p>

              <h2 className="text-6xl font-black text-blue-300">

                {averageTemp !== null
                  ? averageTemp.toFixed(1)
                  : "--"}°C

              </h2>

            </div>

            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-blue-500/20
                flex
                items-center
                justify-center
              "
            >

              <Activity
                size={42}
                className="text-blue-300"
              />

            </div>

          </div>

          <p className="text-blue-200/50 text-lg">
            Analyse temps réel HACCP
          </p>

        </div>

      </div>

    </div>
  );
}