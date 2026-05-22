"use client";

import { useEffect, useState } from "react";
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
    // ÉQUIPEMENTS
    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*")
      .order("name");

    setEquipments(equipmentsData || []);

    // EMPLOYÉS
    const { data: employeesData, error: employeesError } = await supabase
      .from("employees")
      .select("*")
      .order("full_name");

    console.log("EMPLOYEES =", employeesData);
    console.log("EMPLOYEES ERROR =", employeesError);

    setEmployees(employeesData || []);

    // LOGS TEMPÉRATURES
    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setLogs(logsData || []);
  }

  async function addTemperature() {
    if (
      !selectedEquipment ||
      !selectedEmployee ||
      !temperature
    ) {
      alert("Remplis tous les champs");
      return;
    }

    const equipment = equipments.find(
      (e) => String(e.id) === selectedEquipment
    );

    const employee = employees.find(
      (e) => String(e.id) === selectedEmployee
    );

    const tempValue = Number(temperature);

    await supabase.from("temperature_logs").insert([
      {
        equipment: equipment?.name || "",
        equipment_id: equipment?.id || null,

        employee_id: employee?.id || null,
        employee_name: employee?.full_name || "",

        temperature: tempValue,
      },
    ]);

    setTemperature("");
    fetchData();
  }

  function isAlert(log: any) {
    return Number(log.temperature) > 7;
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Relevé des températures
      </h1>

      {/* FORMULAIRE */}
      <div className="bg-white/10 p-6 rounded-2xl mb-10">

        {/* ÉQUIPEMENTS */}
        <select
          value={selectedEquipment}
          onChange={(e) =>
            setSelectedEquipment(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-black/30 mb-4"
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

        {/* EMPLOYÉS */}
        <select
          value={selectedEmployee}
          onChange={(e) =>
            setSelectedEmployee(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-black/30 mb-4"
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

        {/* TEMPÉRATURE */}
        <input
          type="number"
          placeholder="Température"
          value={temperature}
          onChange={(e) =>
            setTemperature(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-black/30 mb-4"
        />

        {/* BOUTON */}
        <button
          onClick={addTemperature}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-4 rounded-xl font-bold"
        >
          Ajouter le relevé
        </button>
      </div>

      {/* HISTORIQUE */}
      <h2 className="text-3xl font-bold mb-6">
        Historique
      </h2>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-6 rounded-2xl border ${
              isAlert(log)
                ? "bg-red-700 border-red-400"
                : "bg-green-700 border-green-400"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">
                  {log.equipment}
                </h3>

                <p className="text-lg opacity-80">
                  Employé : {log.employee_name || "Inconnu"}
                </p>

                <p className="opacity-70">
                  {new Date(
                    log.created_at
                  ).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-4xl font-bold">
                  {log.temperature}°C
                </p>

                {isAlert(log) && (
                  <p className="font-bold mt-2">
                    ⚠️ ALERTE HACCP
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}