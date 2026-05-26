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
      .order("created_at", {
        ascending: false,
      });

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

    <div className="space-y-8 md:space-y-10">

      {/* HEADER */}
      <div className="mb-2 md:mb-6">

        <div className="flex items-center gap-3 mb-4">

          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-cyan-400" />

          <span className="text-cyan-400 tracking-[0.18em] md:tracking-[0.25em] text-[10px] md:text-sm font-semibold uppercase">
            HACCP CONTROL CENTER
          </span>

        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 leading-none">
          Dashboard
        </h1>

        <p className="text-white/50 text-base md:text-2xl">
          Supervision intelligente des opérations HACCP
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">

        {/* EQUIPMENTS */}
        <div
          className="
            rounded-[30px] md:rounded-[36px]

            border
            border-white/10

            bg-white/[0.03]
            backdrop-blur-xl

            p-5 md:p-8
          "
        >

          <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">

            <div className="min-w-0">

              <p className="text-white/50 text-base md:text-xl mb-3">
                Équipements
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-white">
                {equipmentCount}
              </h2>

            </div>

            <div
              className="
                w-16
                h-16

                md:w-24
                md:h-24

                rounded-2xl md:rounded-3xl

                bg-cyan-500/20

                flex
                items-center
                justify-center

                shrink-0
              "
            >

              <Snowflake
                size={34}
                className="text-cyan-300"
              />

            </div>

          </div>

          <p className="text-white/40 text-sm md:text-lg leading-relaxed">
            Équipements connectés au système HACCP
          </p>

        </div>

        {/* ALERTS */}
        <div
          className="
            rounded-[30px] md:rounded-[36px]

            border
            border-red-500/20

            bg-red-500/[0.06]
            backdrop-blur-xl

            p-5 md:p-8
          "
        >

          <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">

            <div className="min-w-0">

              <p className="text-red-300/70 text-base md:text-xl mb-3">
                Alertes HACCP
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-red-300">
                {alertCount}
              </h2>

            </div>

            <div
              className="
                w-16
                h-16

                md:w-24
                md:h-24

                rounded-2xl md:rounded-3xl

                bg-red-500/20

                flex
                items-center
                justify-center

                shrink-0
              "
            >

              <AlertTriangle
                size={34}
                className="text-red-300"
              />

            </div>

          </div>

          <p className="text-red-200/50 text-sm md:text-lg leading-relaxed">
            Températures hors conformité
          </p>

        </div>

        {/* ONLINE */}
        <div
          className="
            rounded-[30px] md:rounded-[36px]

            border
            border-green-500/20

            bg-green-500/[0.06]
            backdrop-blur-xl

            p-5 md:p-8
          "
        >

          <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">

            <div className="min-w-0">

              <p className="text-green-300/70 text-base md:text-xl mb-3">
                Système Online
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-green-300">
                {onlineCount}
              </h2>

            </div>

            <div
              className="
                w-16
                h-16

                md:w-24
                md:h-24

                rounded-2xl md:rounded-3xl

                bg-green-500/20

                flex
                items-center
                justify-center

                shrink-0
              "
            >

              <CheckCircle2
                size={34}
                className="text-green-300"
              />

            </div>

          </div>

          <p className="text-green-200/50 text-sm md:text-lg leading-relaxed">
            Équipements opérationnels
          </p>

        </div>

        {/* TEMP */}
        <div
          className="
            rounded-[30px] md:rounded-[36px]

            border
            border-blue-500/20

            bg-blue-500/[0.06]
            backdrop-blur-xl

            p-5 md:p-8
          "
        >

          <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">

            <div className="min-w-0">

              <p className="text-blue-300/70 text-base md:text-xl mb-3">
                Température Moyenne
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-blue-300 break-words">

                {averageTemp !== null
                  ? averageTemp.toFixed(1)
                  : "--"}°C

              </h2>

            </div>

            <div
              className="
                w-16
                h-16

                md:w-24
                md:h-24

                rounded-2xl md:rounded-3xl

                bg-blue-500/20

                flex
                items-center
                justify-center

                shrink-0
              "
            >

              <Activity
                size={34}
                className="text-blue-300"
              />

            </div>

          </div>

          <p className="text-blue-200/50 text-sm md:text-lg leading-relaxed">
            Analyse temps réel HACCP
          </p>

        </div>

      </div>

    </div>
  );
}