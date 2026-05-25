"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Thermometer,
  Calendar,
  FileText,
  Snowflake,
  Plus,
  Minus,
} from "lucide-react";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { supabase } from "@/lib/supabase";

export default function TemperaturesPage() {

  const [temperatures, setTemperatures] =
    useState<any[]>([]);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  useEffect(() => {

    fetchTemperatures();

  }, []);

  useEffect(() => {

    fetchTemperatures();

  }, [
    startDate,
    endDate,
  ]);

  const fetchTemperatures =
    async () => {

      let query =
        supabase
          .from(
            "temperature_logs"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (startDate) {

        query =
          query.gte(
            "created_at",
            startDate
          );
      }

      if (endDate) {

        query =
          query.lte(
            "created_at",
            endDate
          );
      }

      const {
        data,
      } =
        await query;

      if (data) {

        setTemperatures(
          data
        );
      }
    };

  const updateTemperature =
    async (
      id: string,
      currentTemp: number,
      action: "plus" | "minus"
    ) => {

      const newTemp =
        action === "plus"

          ? currentTemp + 1

          : currentTemp - 1;

      await supabase
        .from(
          "temperature_logs"
        )
        .update({
          temperature:
            newTemp,
        })
        .eq(
          "id",
          id
        );

      fetchTemperatures();
    };

  const exportPDF = () => {

    const doc =
      new jsPDF();

    doc.setFontSize(24);

    doc.text(
      "Rapport Températures HACCP",
      14,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Période : ${
        startDate || "Début"
      } → ${
        endDate || "Aujourd'hui"
      }`,
      14,
      32
    );

    autoTable(doc, {

      startY: 45,

      head: [[
        "Équipement",
        "Température",
        "Date",
      ]],

      body:
        temperatures.map(
          (
            item
          ) => [

            item.equipment ||
              "Équipement",

            `${item.temperature}°C`,

            new Date(
              item.created_at
            ).toLocaleString(),
          ]
        ),
    });

    doc.save(
      "rapport-temperatures-haccp.pdf"
    );
  };

  const criticalTemps =
    temperatures.filter(
      (t) =>
        t.temperature >= 8
    );

  const averageTemp =
    temperatures.length > 0

      ? (
          temperatures.reduce(
            (
              acc,
              item
            ) =>
              acc +
              item.temperature,
            0
          ) /
          temperatures.length
        ).toFixed(1)

      : "0";

  return (

    <main className="min-h-screen p-6 md:p-10 text-white">

      {/* HEADER */}
      <div className="mb-10">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            TABLET MODE
          </p>

        </div>

        <h1 className="text-5xl md:text-7xl font-black">
          Températures HACCP
        </h1>

        <p className="text-gray-400 mt-4 text-lg md:text-xl">
          Contrôle rapide chaîne du froid
        </p>

      </div>

      {/* FILTERS */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-6
          mb-8
        "
      >

        <div className="flex flex-col xl:flex-row gap-5 items-center justify-between">

          <div className="flex flex-col md:flex-row gap-5 w-full">

            {/* START */}
            <div className="flex-1">

              <label className="text-sm text-gray-400 mb-2 block">
                Date début
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-3

                  rounded-2xl

                  border
                  border-white/10

                  bg-black/20

                  px-5
                  py-5
                "
              >

                <Calendar className="text-cyan-300" />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                  className="
                    bg-transparent
                    outline-none
                    w-full
                    text-lg
                  "
                />

          </div>

        </div>

            {/* END */}
            <div className="flex-1">

              <label className="text-sm text-gray-400 mb-2 block">
                Date fin
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-3

                  rounded-2xl

                  border
                  border-white/10

                  bg-black/20

                  px-5
                  py-5
                "
              >

                <Calendar className="text-cyan-300" />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                  className="
                    bg-transparent
                    outline-none
                    w-full
                    text-lg
                  "
                />

              </div>

            </div>

          </div>

          {/* EXPORT */}
          <button
            onClick={exportPDF}
            className="
              flex
              items-center
              gap-3

              px-8
              py-5

              rounded-2xl

              bg-cyan-500

              text-black
              text-lg
              font-black

              hover:scale-105

              transition-all
            "
          >

            <FileText />

            Export PDF

          </button>

          </div>

        </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <motion.div
          whileHover={{
            scale: 1.02,
          }}
          className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            p-7
          "
        >

          <Thermometer className="text-cyan-300 mb-6 w-10 h-10" />

          <p className="text-cyan-200">
            Relevés
          </p>

          <h2 className="text-5xl font-black mt-4">

            {temperatures.length}

          </h2>

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.02,
          }}
          className="
            rounded-3xl
            border
            border-green-500/20
            bg-green-500/10
            p-7
          "
        >

          <Snowflake className="text-green-300 mb-6 w-10 h-10" />

          <p className="text-green-200">
            Moyenne
          </p>

          <h2 className="text-5xl font-black mt-4">

            {averageTemp}°C

          </h2>

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.02,
          }}
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10
            p-7
          "
        >

          <Thermometer className="text-red-300 mb-6 w-10 h-10" />

          <p className="text-red-200">
            Critiques
          </p>

          <h2 className="text-5xl font-black mt-4">

            {criticalTemps.length}

          </h2>

        </motion.div>

      </div>

      {/* TEMPERATURE CARDS */}
      <div className="space-y-6">

        {temperatures.map(
          (
            item,
            index
          ) => (

            <motion.div
              key={index}
              whileHover={{
                scale: 1.01,
              }}
              className={`
                rounded-3xl
                border
                p-8

                ${
                  item.temperature >= 8

                    ? "border-red-500/20 bg-red-500/10"

                    : "border-white/10 bg-white/[0.04]"
                }
              `}
            >

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

                {/* INFO */}
                <div>

                  <h2 className="text-4xl font-black">

                    {
                      item.equipment ||
                      "Équipement"
                    }

                  </h2>

                  <p className="text-gray-400 mt-3 text-lg">

                    {
                      new Date(
                        item.created_at
                      ).toLocaleString()
                    }

                  </p>

                </div>

                {/* TABLET CONTROLS */}
                <div className="flex items-center gap-6">

                  {/* MINUS */}
                  <button
                    onClick={() =>
                      updateTemperature(
                        item.id,
                        item.temperature,
                        "minus"
                      )
                    }
                    className="
                      w-20
                      h-20

                      rounded-3xl

                      bg-red-500/20

                      flex
                      items-center
                      justify-center

                      active:scale-95

                      transition-all
                    "
                  >

                    <Minus className="w-10 h-10 text-red-300" />

                  </button>

                  {/* TEMP */}
                  <div
                    className={`
                      px-10
                      py-6

                      rounded-3xl

                      text-5xl
                      font-black

                      ${
                        item.temperature >= 8

                          ? "bg-red-500/20 text-red-300"

                          : "bg-cyan-500/20 text-cyan-300"
                      }
                    `}
                  >

                    {item.temperature}°C

                  </div>

                  {/* PLUS */}
                  <button
                    onClick={() =>
                      updateTemperature(
                        item.id,
                        item.temperature,
                        "plus"
                      )
                    }
                    className="
                      w-20
                      h-20

                      rounded-3xl

                      bg-green-500/20

                      flex
                      items-center
                      justify-center

                      active:scale-95

                      transition-all
                    "
                  >

                    <Plus className="w-10 h-10 text-green-300" />

                  </button>

                </div>

              </div>

            </motion.div>
          )
        )}

      </div>

    </main>
  );
}