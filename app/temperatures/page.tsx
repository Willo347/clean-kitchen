"use client";

import { useEffect, useState } from "react";

import {
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ClipboardX,
  FileDown,
} from "lucide-react";

import { jsPDF } from "jspdf";

import { supabase } from "@/lib/supabase";

interface Equipment {
  id: number;
  name: string;
  zone: string;
  temp_min: number;
  temp_max: number;
}

interface TemperatureLog {
  id: number;
  equipment: string;
  temperature: number;
  created_at: string;
}

export default function TemperaturesPage() {

  const [equipments, setEquipments] =
    useState<Equipment[]>([]);

  const [logs, setLogs] =
    useState<TemperatureLog[]>([]);

  const [selectedEquipment, setSelectedEquipment] =
    useState("");

  const [temperature, setTemperature] =
    useState("");

  // PDF FILTERS
  const [selectedEquipments, setSelectedEquipments] =
    useState<string[]>([]);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  // FETCH
  useEffect(() => {

    fetchData();

    const channel = supabase
      .channel("temperature-page")

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
          ascending: false,
        });

    setEquipments(equipmentsData || []);

    setLogs(logsData || []);
  }

  // ADD TEMP
  async function addTemperature() {

    if (
      !selectedEquipment ||
      !temperature
    ) {
      return;
    }

    await supabase
      .from("temperature_logs")
      .insert([
        {
          equipment: selectedEquipment,
          temperature: Number(temperature),
        },
      ]);

    setTemperature("");
  }

  // PDF EXPORT
  function exportPDF() {

    const doc = new jsPDF();

    const filteredLogs =
      logs.filter((log) => {

        const logDate =
          new Date(log.created_at);

        const isEquipmentSelected =
          selectedEquipments.length === 0
            ? true
            : selectedEquipments.includes(
                log.equipment
              );

        const isAfterStart =
          startDate
            ? logDate >= new Date(startDate)
            : true;

        const isBeforeEnd =
          endDate
            ? logDate <= new Date(endDate + "T23:59:59")
            : true;

        return (
          isEquipmentSelected &&
          isAfterStart &&
          isBeforeEnd
        );

      });

    doc.setFontSize(22);

    doc.text(
      "HACCP Temperature Report",
      20,
      20
    );

    doc.save("haccp-temperatures.pdf");
  }

  function getLatestTemperature(
    equipmentName: string
  ) {

    const equipmentLogs =
      logs.filter(
        (log) =>
          log.equipment
            ?.toLowerCase()
            .trim() ===
          equipmentName
            .toLowerCase()
            .trim()
      );

    return equipmentLogs[0];
  }

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const missingLogsEquipments =
    equipments.filter((equipment) => {

      const hasTodayLog =
        logs.some((log) => {

          const logDate =
            new Date(log.created_at)
              .toISOString()
              .split("T")[0];

          return (
            log.equipment
              ?.toLowerCase()
              .trim() ===
              equipment.name
                .toLowerCase()
                .trim() &&
            logDate === today
          );

        });

      return !hasTodayLog;

    });

  const alertsCount =
    equipments.filter((equipment) => {

      const latest =
        getLatestTemperature(
          equipment.name
        );

      if (!latest) return false;

      return (
        latest.temperature <
          equipment.temp_min ||
        latest.temperature >
          equipment.temp_max
      );

    }).length;

  return (

    <div className="space-y-6 md:space-y-8">

      {/* HEADER */}
      <div className="space-y-3">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          <p className="uppercase tracking-[0.25em] md:tracking-[0.3em] text-cyan-400 font-semibold text-xs md:text-sm">
            HACCP TEMPERATURE CONTROL
          </p>

        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none">
          Températures
        </h1>

        <p className="text-white/50 text-base md:text-xl">
          Relevés manuels HACCP
        </p>

      </div>

      {/* TOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 md:gap-6">

        {/* TOTAL */}
        <div
          className="
            rounded-[30px]
            border
            border-cyan-500/20
            bg-cyan-500/10
            backdrop-blur-xl
            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-cyan-300 text-base md:text-lg">
                Relevés enregistrés
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-cyan-300 mt-4">
                {logs.length}
              </h2>

            </div>

            <Thermometer
              size={42}
              className="text-cyan-300 shrink-0"
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
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-red-300 text-base md:text-lg">
                Alertes HACCP
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-red-300 mt-4">
                {alertsCount}
              </h2>

            </div>

            <AlertTriangle
              size={42}
              className="text-red-300 shrink-0"
            />

          </div>

        </div>

        {/* MISSING */}
        <div
          className="
            rounded-[30px]
            border
            border-orange-500/20
            bg-orange-500/10
            backdrop-blur-xl
            p-5 md:p-6
          "
        >

          <div className="flex items-start justify-between gap-4">

            <div className="flex-1 min-w-0">

              <p className="text-orange-300 text-base md:text-lg">
                Relevés manquants
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-orange-300 mt-4">
                {missingLogsEquipments.length}
              </h2>

              <div
                className="
                  mt-4
                  space-y-1
                  max-h-[110px]
                  overflow-y-auto
                  pr-2
                "
              >

                {missingLogsEquipments.length === 0 ? (

                  <p className="text-green-300 text-sm font-semibold">
                    Tous les relevés sont à jour
                  </p>

                ) : (

                  missingLogsEquipments.map((equipment) => (

                    <div
                      key={equipment.id}
                      className="
                        text-orange-100
                        text-xs
                        md:text-sm
                        font-medium
                        break-words
                      "
                    >
                      • {equipment.name}
                    </div>

                  ))

                )}

              </div>

            </div>

            <ClipboardX
              size={38}
              className="text-orange-300 shrink-0"
            />

          </div>

        </div>

        {/* STATUS */}
        <div
          className="
            rounded-[30px]
            border
            border-green-500/20
            bg-green-500/10
            backdrop-blur-xl
            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-green-300 text-base md:text-lg">
                Statut HACCP
              </p>

              <h2 className="text-4xl md:text-5xl font-black text-green-300 mt-4">
                ONLINE
              </h2>

            </div>

            <CheckCircle2
              size={42}
              className="text-green-300 shrink-0"
            />

          </div>

        </div>

      </div>

      {/* ADD TEMP */}
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

        <div className="flex items-center gap-3 mb-6 md:mb-8">

          <Plus className="text-cyan-400" />

          <h2 className="text-2xl md:text-4xl font-black text-white">
            Ajouter un relevé
          </h2>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          <select
            value={selectedEquipment}
            onChange={(e) =>
              setSelectedEquipment(
                e.target.value
              )
            }
            className="
              h-14 md:h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
              outline-none
              text-sm md:text-base
            "
          >

            <option value="">
              Sélectionner un équipement
            </option>

            {equipments.map((equipment) => (

              <option
                key={equipment.id}
                value={equipment.name}
              >
                {equipment.name}
              </option>

            ))}

          </select>

          <input
            type="number"
            placeholder="Température °C"
            value={temperature}
            onChange={(e) =>
              setTemperature(
                e.target.value
              )
            }
            className="
              h-14 md:h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
              outline-none
              text-sm md:text-base
            "
          />

          <button
            onClick={addTemperature}
            className="
              h-14 md:h-16
              rounded-2xl
              bg-cyan-400
              hover:bg-cyan-300
              transition
              text-black
              font-black
              text-base md:text-lg
            "
          >
            Ajouter le relevé
          </button>

        </div>

      </div>

      {/* PDF EXPORT */}
      <div
        className="
          rounded-[32px]
          border
          border-cyan-500/20
          bg-cyan-500/[0.05]
          backdrop-blur-xl

          p-5 md:p-8

          space-y-6
        "
      >

        <div className="flex items-center gap-3">

          <FileDown className="text-cyan-300" />

          <h2 className="text-2xl md:text-4xl font-black text-white">
            Export HACCP PDF
          </h2>

        </div>

        {/* EQUIPMENTS */}
        <div>

          <p className="text-white/50 mb-4 text-sm md:text-base">
            Sélectionner les équipements
          </p>

          <div className="flex flex-wrap gap-3">

            {equipments.map((equipment) => {

              const isSelected =
                selectedEquipments.includes(
                  equipment.name
                );

              return (

                <button
                  key={equipment.id}
                  onClick={() => {

                    if (isSelected) {

                      setSelectedEquipments(
                        selectedEquipments.filter(
                          (eq) =>
                            eq !== equipment.name
                        )
                      );

                    } else {

                      setSelectedEquipments([
                        ...selectedEquipments,
                        equipment.name,
                      ]);

                    }

                  }}
                  className={`
                    px-4
                    py-3
                    rounded-2xl
                    border
                    transition
                    font-bold
                    text-sm md:text-base

                    ${
                      isSelected
                        ? "bg-cyan-400 text-black border-cyan-300"
                        : "bg-white/[0.03] text-white border-white/10"
                    }
                  `}
                >
                  {equipment.name}
                </button>

              );

            })}

          </div>

        </div>

        {/* DATES */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="
              h-14 md:h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
              outline-none
              text-sm md:text-base
            "
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className="
              h-14 md:h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
              outline-none
              text-sm md:text-base
            "
          />

          <button
            onClick={exportPDF}
            className="
              h-14 md:h-16
              rounded-2xl
              bg-cyan-400
              hover:bg-cyan-300
              transition
              text-black
              font-black
              text-base md:text-lg

              flex
              items-center
              justify-center
              gap-3
            "
          >

            <FileDown size={20} />

            Exporter PDF

          </button>

        </div>

      </div>

    </div>

  );
}