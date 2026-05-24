"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Thermometer,
  Calendar,
  FileText,
  Snowflake,
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

  useEffect(() => {

    fetchTemperatures();

  }, [
    startDate,
    endDate,
  ]);

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

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            TEMPERATURE MONITORING
          </p>

        </div>

        <h1 className="text-7xl font-black">
          Températures HACCP
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Surveillance chaîne du froid
        </p>

      </div>

      {/* FILTERS */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-7
          mb-10
        "
      >

        <div className="flex flex-col xl:flex-row gap-5 items-center justify-between">

          <div className="flex flex-col md:flex-row gap-5 w-full">

            {/* START DATE */}
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
                  py-4
                "
              >

                <Calendar className="text-cyan-300 w-5 h-5" />

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
                  "
                />

              </div>

            </div>

            {/* END DATE */}
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
                  py-4
                "
              >

                <Calendar className="text-cyan-300 w-5 h-5" />

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

              px-7
              py-4

              rounded-2xl

              bg-cyan-500

              text-black
              font-black

              hover:scale-105

              transition-all
            "
          >

            <FileText className="w-5 h-5" />

            Export PDF

          </button>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-10">

        {/* TOTAL */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <Thermometer className="text-cyan-300" />

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          </div>

          <p className="text-cyan-200">
            Relevés
          </p>

          <h2 className="text-6xl font-black mt-4">

            {temperatures.length}

          </h2>

        </motion.div>

        {/* AVERAGE */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-green-500/20
            bg-green-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <Snowflake className="text-green-300" />

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

          </div>

          <p className="text-green-200">
            Température moyenne
          </p>

          <h2 className="text-6xl font-black mt-4">

            {averageTemp}°C

          </h2>

        </motion.div>

        {/* CRITICAL */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <Thermometer className="text-red-300" />

            <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />

          </div>

          <p className="text-red-200">
            Températures critiques
          </p>

          <h2 className="text-6xl font-black mt-4">

            {criticalTemps.length}

          </h2>

        </motion.div>

      </div>

      {/* TABLE */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-8
        "
      >

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-black">
            Historique températures
          </h2>

          <div
            className="
              bg-cyan-500/10
              border
              border-cyan-500/20
              px-5
              py-2
              rounded-2xl
              text-cyan-300
              text-sm
              font-semibold
            "
          >
            LIVE MONITORING
          </div>

        </div>

        <div className="space-y-5">

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
                  flex
                  items-center
                  justify-between

                  rounded-2xl
                  border
                  p-5

                  ${
                    item.temperature >= 8

                      ? "border-red-500/10 bg-red-500/5"

                      : "border-white/10 bg-white/[0.03]"
                  }
                `}
              >

                <div className="flex items-center gap-5">

                  <div
                    className={`
                      p-4
                      rounded-2xl

                      ${
                        item.temperature >= 8

                          ? "bg-red-500/20"

                          : "bg-cyan-500/20"
                      }
                    `}
                  >

                    <Thermometer
                      className={`
                        ${
                          item.temperature >= 8

                            ? "text-red-300"

                            : "text-cyan-300"
                        }
                      `}
                    />

                  </div>

                  <div>

                    <h3 className="text-xl font-bold">

                      {
                        item.equipment ||
                        "Équipement"
                      }

                    </h3>

                    <p className="text-gray-400 mt-1">

                      {
                        new Date(
                          item.created_at
                        ).toLocaleString()
                      }

                    </p>

                  </div>

                </div>

                <div
                  className={`
                    px-5
                    py-3

                    rounded-2xl

                    text-2xl
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

              </motion.div>
            )
          )}

          {temperatures.length === 0 && (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-20
              "
            >

              <Thermometer className="w-16 h-16 text-cyan-300 mb-6" />

              <h3 className="text-3xl font-black mb-3">
                Aucun relevé
              </h3>

              <p className="text-gray-400">
                Aucun historique disponible
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}