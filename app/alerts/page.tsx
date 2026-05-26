"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Thermometer,
  Snowflake,
} from "lucide-react";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { supabase } from "@/lib/supabase";

interface Equipment {
  id: number;
  name: string;
  zone: string;
  type: string;
  temp_min: number;
  temp_max: number;
}

interface TemperatureLog {
  id: number;
  equipment: string;
  temperature: number;
  created_at: string;
}

export default function MonitoringPage() {

  const [equipments, setEquipments] =
    useState<Equipment[]>([]);

  const [logs, setLogs] =
    useState<TemperatureLog[]>([]);

  useEffect(() => {

    fetchData();

  }, []);

  async function fetchData() {

    const { data: equipmentsData } =
      await supabase
        .from("equipments")
        .select("*")
        .order("id");

    const { data: logsData } =
      await supabase
        .from("temperature_logs")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

    setEquipments(
      equipmentsData || []
    );

    setLogs(
      logsData || []
    );
  }

  const latestLogs =
    equipments.map((equipment) => {

      const equipmentLogs =
        logs.filter(
          (log) =>
            log.equipment
              ?.toLowerCase()
              .trim() ===
            equipment.name
              .toLowerCase()
              .trim()
        );

      const latestLog =
        equipmentLogs[
          equipmentLogs.length - 1
        ];

      return {
        ...equipment,
        currentTemp:
          latestLog?.temperature ?? null,
      };
    });

  const averageTemp =
    logs.length > 0
      ? (
          logs.reduce(
            (acc, log) =>
              acc + log.temperature,
            0
          ) / logs.length
        ).toFixed(1)
      : "0";

  const alertsCount =
    latestLogs.filter(
      (eq) =>
        eq.currentTemp !== null &&
        (
          eq.currentTemp < eq.temp_min ||
          eq.currentTemp > eq.temp_max
        )
    ).length;

  const chartData =
    logs.slice(-10).map((log) => ({
      time:
        new Date(
          log.created_at
        ).toLocaleTimeString(
          "fr-FR",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

      temperature:
        log.temperature,
    }));

  return (

    <div className="space-y-6 md:space-y-8">

      {/* HEADER */}
      <div className="space-y-3">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 tracking-[0.18em] md:tracking-[0.25em] uppercase font-semibold text-[10px] md:text-sm">
            Live HACCP Monitoring
          </p>

        </div>

        <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black text-white leading-none">
          Monitoring
        </h1>

        <p className="text-white/50 text-base md:text-xl">
          Surveillance temps réel HACCP
        </p>

      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-6">

        {/* AVG TEMP */}
        <div
          className="
            rounded-[30px]

            border
            border-cyan-500/20

            bg-cyan-500/10
            backdrop-blur-xl

            p-5 md:p-6

            flex
            items-center
            justify-between

            gap-4
          "
        >

          <div className="min-w-0">

            <p className="text-cyan-300 text-base md:text-lg">
              Température moyenne
            </p>

            <h2 className="text-4xl md:text-6xl font-black text-cyan-300 mt-4 break-words">
              {averageTemp}°C
            </h2>

            <p className="text-cyan-200/50 mt-4 text-sm md:text-base">
              Analyse HACCP
            </p>

          </div>

          <div
            className="
              w-16
              h-16

              md:w-24
              md:h-24

              rounded-[24px]

              bg-cyan-400/20

              flex
              items-center
              justify-center

              shrink-0
            "
          >

            <Thermometer
              size={34}
              className="text-cyan-300"
            />

          </div>

        </div>

        {/* ALERTS */}
        <div
          className="
            rounded-[30px]

            border
            border-red-500/20

            bg-red-500/10
            backdrop-blur-xl

            p-5 md:p-6

            flex
            items-center
            justify-between

            gap-4
          "
        >

          <div className="min-w-0">

            <p className="text-red-300 text-base md:text-lg">
              Alertes HACCP
            </p>

            <h2 className="text-4xl md:text-6xl font-black text-red-300 mt-4">
              {alertsCount}
            </h2>

            <p className="text-red-200/50 mt-4 text-sm md:text-base">
              Températures critiques
            </p>

          </div>

          <div
            className="
              w-16
              h-16

              md:w-24
              md:h-24

              rounded-[24px]

              bg-red-400/20

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

        {/* SYSTEM */}
        <div
          className="
            rounded-[30px]

            border
            border-green-500/20

            bg-green-500/10
            backdrop-blur-xl

            p-5 md:p-6

            flex
            items-center
            justify-between

            gap-4
          "
        >

          <div className="min-w-0">

            <p className="text-green-300 text-base md:text-lg">
              Système HACCP
            </p>

            <h2 className="text-4xl md:text-6xl font-black text-green-300 mt-4 break-words">
              ONLINE
            </h2>

            <p className="text-green-200/50 mt-4 text-sm md:text-base">
              Monitoring actif
            </p>

          </div>

          <Activity
            size={42}
            className="text-green-300 shrink-0"
          />

        </div>

      </div>

      {/* CHART */}
      <div
        className="
          rounded-[32px]

          border
          border-white/10

          bg-white/[0.03]
          backdrop-blur-xl

          p-5 md:p-8
        "
      >

        <h2 className="text-3xl md:text-5xl font-black text-white">
          Températures Live
        </h2>

        <p className="text-white/40 text-base md:text-xl mt-3">
          Historique des relevés HACCP
        </p>

        <div className="h-[260px] md:h-[360px] mt-8">

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart data={chartData}>

              <defs>

                <linearGradient
                  id="colorTemp"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#22d3ee"
                    stopOpacity={0.5}
                  />

                  <stop
                    offset="100%"
                    stopColor="#22d3ee"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={12}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={12}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#22d3ee"
                strokeWidth={3}
                fill="url(#colorTemp)"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* LIVE EQUIPMENTS */}
      <div className="space-y-5 md:space-y-6">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          <h2 className="text-3xl md:text-5xl font-black text-white">
            Équipements Live
          </h2>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">

          {latestLogs.map((equipment) => {

            const isAlert =
              equipment.currentTemp !== null &&
              (
                equipment.currentTemp < equipment.temp_min ||
                equipment.currentTemp > equipment.temp_max
              );

            return (

              <div
                key={equipment.id}
                className="
                  rounded-[30px]

                  border
                  border-white/10

                  bg-white/[0.03]
                  backdrop-blur-xl

                  p-5 md:p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between

                    gap-6
                  "
                >

                  {/* LEFT */}
                  <div
                    className="
                      flex
                      items-center

                      gap-4 md:gap-5

                      min-w-0
                    "
                  >

                    <div
                      className="
                        w-16
                        h-16

                        md:w-20
                        md:h-20

                        rounded-[24px]

                        bg-cyan-500/20

                        flex
                        items-center
                        justify-center

                        shrink-0
                      "
                    >

                      <Snowflake
                        size={30}
                        className="text-cyan-300"
                      />

                    </div>

                    <div className="min-w-0">

                      <h3
                        className="
                          text-2xl
                          md:text-4xl

                          font-black

                          leading-none

                          text-white

                          break-words
                        "
                      >

                        {equipment.name}

                      </h3>

                      <p className="text-sm md:text-lg text-white/50 mt-3 break-words">

                        Zone :
                        {" "}
                        {equipment.zone}

                      </p>

                      <div className="flex items-center gap-3 mt-4">

                        <div
                          className={`
                            w-3
                            h-3

                            rounded-full

                            ${
                              isAlert
                                ? "bg-red-400"
                                : "bg-green-400"
                            }
                          `}
                        />

                        <span
                          className={`
                            text-sm md:text-lg
                            font-bold

                            ${
                              isAlert
                                ? "text-red-400"
                                : "text-green-400"
                            }
                          `}
                        >

                          {isAlert
                            ? "ALERTE"
                            : "CONFORME"}

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="lg:text-right shrink-0">

                    <p className="text-white/40 text-sm md:text-base">
                      Température HACCP
                    </p>

                    <div className="mt-2 space-y-1">

                      <div
                        className="
                          text-3xl
                          md:text-5xl

                          font-black

                          text-cyan-300

                          leading-none
                        "
                      >

                        {equipment.currentTemp ?? "--"}°C

                      </div>

                      <div
                        className="
                          text-2xl md:text-3xl

                          font-black

                          text-cyan-300

                          leading-none
                        "
                      >
                        →
                      </div>

                      <div
                        className="
                          text-3xl
                          md:text-5xl

                          font-black

                          text-cyan-300

                          leading-none
                        "
                      >

                        {equipment.temp_max}°C

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}