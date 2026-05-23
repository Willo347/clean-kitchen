"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import toast, { Toaster } from "react-hot-toast";

import { supabase } from "@/lib/supabase";

export default function TemperaturesPage() {

  const [equipments, setEquipments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [temperature, setTemperature] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {

    // équipements
    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*")
      .order("name");

    if (equipmentsData) {
      setEquipments(equipmentsData);
    }

    // employés
    const { data: employeesData } = await supabase
      .from("employees")
      .select("*")
      .order("full_name");

    if (employeesData) {
      setEmployees(employeesData);
    }

    // logs
    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select(`
        *,
        equipments (
          id,
          name,
          temp_min,
          temp_max
        ),
        employees (
          id,
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (logsData) {
      setLogs(logsData);
    }
  }

  async function addTemperature() {

    if (
      !selectedEquipment ||
      !selectedEmployee ||
      !temperature
    ) {

      toast.error(
        "Remplis tous les champs"
      );

      return;
    }

    const { error } = await supabase
      .from("temperature_logs")
      .insert([
        {
          equipement_id: Number(selectedEquipment),
          employee_id: Number(selectedEmployee),
          temperature: Number(temperature),
        },
      ]);

    if (error) {

      console.log(error);

      toast.error(
        "Erreur lors de l’enregistrement"
      );

      return;
    }

    toast.success(
      "Relevé enregistré"
    );

    setTemperature("");
    setSelectedEquipment("");
    setSelectedEmployee("");

    fetchData();
  }

  function isAlert(log: any) {

    const equipment = log.equipments;

    if (!equipment) return false;

    return (
      log.temperature < equipment.temp_min ||
      log.temperature > equipment.temp_max
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#070B14] text-white p-8"
    >

      {/* TOAST */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "white",
            border:
              "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "16px",
          },
        }}
      />

      {/* HEADER */}
      <div className="mb-12">

        <p className="text-blue-400 font-semibold mb-3 tracking-widest uppercase">
          Clean Kitchen
        </p>

        <h1 className="text-6xl font-black tracking-tight">
          Relevé des températures
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Surveillance HACCP en temps réel
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* FORMULAIRE */}
        <motion.div
          whileHover={{
            scale: 1.01,
          }}
          className="xl:col-span-1"
        >

          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl">

            <h2 className="text-2xl font-bold mb-8">
              Nouveau relevé
            </h2>

            {/* équipement */}
            <div className="mb-5">

              <label className="block mb-2 text-sm text-gray-400">
                Équipement
              </label>

              <select
                value={selectedEquipment}
                onChange={(e) =>
                  setSelectedEquipment(
                    e.target.value
                  )
                }
                className="w-full p-4 rounded-2xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-500"
              >
                <option value="">
                  Choisir un équipement
                </option>

                {equipments.map((equipment) => (
                  <option
                    key={equipment.id}
                    value={equipment.id}
                  >
                    {equipment.name}
                  </option>
                ))}
              </select>
            </div>

            {/* employé */}
            <div className="mb-5">

              <label className="block mb-2 text-sm text-gray-400">
                Employé
              </label>

              <select
                value={selectedEmployee}
                onChange={(e) =>
                  setSelectedEmployee(
                    e.target.value
                  )
                }
                className="w-full p-4 rounded-2xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-500"
              >
                <option value="">
                  Choisir un employé
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* température */}
            <div className="mb-6">

              <label className="block mb-2 text-sm text-gray-400">
                Température
              </label>

              <input
                type="number"
                placeholder="Ex : 4"
                value={temperature}
                onChange={(e) =>
                  setTemperature(
                    e.target.value
                  )
                }
                className="w-full p-4 rounded-2xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* bouton */}
            <button
              onClick={addTemperature}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-all duration-300 p-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/40"
            >
              Ajouter le relevé
            </button>

          </div>
        </motion.div>

        {/* HISTORIQUE */}
        <div className="xl:col-span-2">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-3xl font-bold">
              Historique
            </h2>

            <div className="bg-white/[0.04] border border-white/10 px-4 py-2 rounded-2xl text-sm text-gray-300">
              {logs.length} relevés
            </div>

          </div>

          <div className="space-y-5">

            {logs.map((log) => {

              const alert = isAlert(log);

              return (
                <motion.div
                  key={log.id}
                  whileHover={{
                    scale: 1.01,
                  }}
                  className={`rounded-3xl border p-6 backdrop-blur-2xl transition-all duration-300
                  ${
                    alert
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/[0.04] border-white/10"
                  }`}
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <h3 className="text-2xl font-bold">
                        {log.equipments?.name}
                      </h3>

                      <p className="text-gray-400 mt-2">
                        {log.employees?.full_name}
                      </p>

                      <p className="text-sm text-gray-500 mt-3">
                        {new Date(
                          log.created_at
                        ).toLocaleString()}
                      </p>

                    </div>

                    <div className="text-right">

                      <p
                        className={`text-5xl font-black ${
                          alert
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {log.temperature}°
                      </p>

                      {alert && (
                        <p className="mt-3 text-red-300 font-bold">
                          ⚠️ ALERTE HACCP
                        </p>
                      )}

                    </div>

                  </div>
                </motion.div>
              );
            })}

          </div>
        </div>

      </div>

    </motion.main>
  );
}