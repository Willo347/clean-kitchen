"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Snowflake,
  ArrowLeft,
  AlertTriangle,
  Activity,
} from "lucide-react";

import Link from "next/link";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
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

export default function EquipmentMonitoringPage() {

  const params = useParams();

  const [equipment, setEquipment] = useState<Equipment | null>(null);

  const [logs, setLogs] = useState<TemperatureLog[]>([]);

  useEffect(() => {
    if (params?.id) {
      fetchData();
    }

    const channel = supabase
      .channel("equipment-live")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "temperature_logs",
        },
        () => {
          fetchData();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [params]);

  async function fetchData() {

    const { data: equipmentData } = await supabase
      .from("equipments")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!equipmentData) return;

    setEquipment(equipmentData);

    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select("*")
      .ilike("equipment", equipmentData.name)
      .order("created_at", { ascending: true });

    setLogs(logsData || []);
  }

  const latestTemp =
    logs.length > 0
      ? logs[logs.length - 1].temperature
      : null;

  const isAlert =
    latestTemp !== null &&
    equipment &&
    (
      latestTemp < equipment.temp_min ||
      latestTemp > equipment.temp_max
    );

  const chartData = logs.map((log) => ({
    time: new Date(log.created_at).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: log.temperature,
  }));

  return (
    <div className="p-8 space-y-8">

      {/* BACK BUTTON */}
      <Link
        href="/monitoring"
        className="
          inline-flex
          items-center
          gap-3
          text-cyan-300
          hover:text-cyan-200
          transition
        "
      >

        <ArrowLeft size={22} />

        <span className="font-semibold text-lg">
          Retour Monitoring
        </span>

      </Link>

      {/* HEADER */}
      <div
        className="
          rounded-[32px]
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
                w-28
                h-28
                rounded-[28px]
                bg-cyan-500/20
                flex
                items-center
                justify-center
              "
            >
              <Snowflake
                size={48}
                className="text-cyan-300"
              />
            </div>

            <div>

              <p className="text-cyan-400 uppercase tracking-[0.25em] font-semibold text-sm">
                Équipement HACCP
              </p>

              <h1 className="text-6xl font-black text-white mt-3">
                {equipment?.name}
              </h1>

              <p className="text-white/50 text-2xl mt-3">
                Zone : {equipment?.zone}
              </p>

            </div>

          </div>

          {/* STATUS */}
          <div className="text-right">

            <p className="text-white/40 text-lg">
              Statut HACCP
            </p>

            <div className="mt-4 flex items-center gap-3 justify-end">

              <div
                className={`
                  w-4
                  h-4
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
                  text-3xl
                  font-black
                  ${
                    isAlert
                      ? "text-red-400"
                      : "text-green-400"
                  }
                `}
              >
                {isAlert ? "ALERTE" : "CONFORME"}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* CURRENT TEMP */}
        <div
          className="
            rounded-[30px]
            border
            border-cyan-500/20
            bg-cyan-500/10
            backdrop-blur-xl
            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-cyan-300 text-lg">
                Température actuelle
              </p>

              <h2 className="text-6xl font-black text-cyan-300 mt-4">
                {latestTemp ?? "--"}°C
              </h2>

            </div>

            <Activity
              size={44}
              className="text-cyan-300"
            />

          </div>

        </div>

        {/* MIN */}
        <div
          className="
            rounded-[30px]
            border
            border-green-500/20
            bg-green-500/10
            backdrop-blur-xl
            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-green-300 text-lg">
                Température minimum
              </p>

              <h2 className="text-6xl font-black text-green-300 mt-4">
                {equipment?.temp_min}°C
              </h2>

            </div>

            <Snowflake
              size={44}
              className="text-green-300"
            />

          </div>

        </div>

        {/* MAX */}
        <div
          className="
            rounded-[30px]
            border
            border-red-500/20
            bg-red-500/10
            backdrop-blur-xl
            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-300 text-lg">
                Température maximum
              </p>

              <h2 className="text-6xl font-black text-red-300 mt-4">
                {equipment?.temp_max}°C
              </h2>

            </div>

            <AlertTriangle
              size={44}
              className="text-red-300"
            />

          </div>

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
          p-8
        "
      >

        <h2 className="text-5xl font-black text-white">
          Historique des températures
        </h2>

        <p className="text-white/40 text-xl mt-3">
          Monitoring HACCP temps réel
        </p>

        <div className="h-[420px] mt-10">

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
              />

              <YAxis
                stroke="#94a3b8"
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#22d3ee"
                strokeWidth={4}
                fill="url(#colorTemp)"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* LOGS */}
      <div
        className="
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.03]
          backdrop-blur-xl
          p-8
        "
      >

        <h2 className="text-4xl font-black text-white">
          Historique des relevés
        </h2>

        <div className="mt-8 space-y-4">

          {logs
            .slice()
            .reverse()
            .map((log) => (

              <div
                key={log.id}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-[20px]
                  border
                  border-white/10
                  bg-white/[0.02]
                  p-5
                "
              >

                <div>

                  <p className="text-white text-xl font-bold">
                    {log.temperature}°C
                  </p>

                  <p className="text-white/40 mt-1">
                    {new Date(log.created_at).toLocaleString("fr-FR")}
                  </p>

                </div>

                <div
                  className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold
                    ${
                      log.temperature < (equipment?.temp_min ?? 0) ||
                      log.temperature > (equipment?.temp_max ?? 0)
                        ? "bg-red-500/20 text-red-300"
                        : "bg-green-500/20 text-green-300"
                    }
                  `}
                >
                  {
                    log.temperature < (equipment?.temp_min ?? 0) ||
                    log.temperature > (equipment?.temp_max ?? 0)
                      ? "ALERTE"
                      : "CONFORME"
                  }
                </div>

              </div>

            ))}

        </div>

      </div>

    </div>
  );
}