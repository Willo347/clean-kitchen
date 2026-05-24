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

  const [newEquipment, setNewEquipment] =
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

  const addEquipment =
    async () => {

      if (!newEquipment) {
        return;
      }

      await supabase
        .from(
          "temperature_logs"
        )
        .insert([
          {
            equipment:
              newEquipment,

            temperature: 0,
          },
        ]);

      setNewEquipment("");

      fetchTemperatures();
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

    autoTable(doc, {

      startY: 40,

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

            item.equipment,

            `${item.temperature}°C`,

            new Date(
              item.created_at
            ).toLocaleString(),
          ]
        ),
    });

    doc.save(
      "rapport-temperatures.pdf"
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

      </div>

      {/* ADD EQUIPMENT */}
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

        <div className="flex flex-col xl:flex-row gap-5">

          <input
            value={newEquipment}
            onChange={(e) =>
              setNewEquipment(
                e.target.value
              )
            }
            placeholder="Ajouter un équipement..."
            className="
              flex-1

              rounded-3xl

              bg-black/20

              border
              border-white/10

              px-6
              py-6

              text-2xl

              outline-none
            "
          />

          <button
            onClick={addEquipment}
            className="
              rounded-3xl

              bg-cyan-500

              px-10
              py-6

              text-black
              text-2xl
              font-black
            "
          >

            Ajouter

          </button>

        </div>

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

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="
                flex-1

                rounded-3xl

                bg-black/20

                border
                border-white/10

                px-6
                py-5

                text-xl
              "
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="
                flex-1

                rounded-3xl

                bg-black/20

                border
                border-white/10

                px-6
                py-5

                text-xl
              "
            />

          </div>

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
            "
          >

            <FileText />

            Export PDF

          </button>

        </div>

      </div>
    </main>
  );
}