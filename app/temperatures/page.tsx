"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TemperaturesPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [equipmentId, setEquipmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [temperature, setTemperature] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    const { data: employeesData } = await supabase
      .from("employees")
      .select("*");

    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setEquipments(equipmentsData || []);
    setEmployees(employeesData || []);
    setLogs(logsData || []);
  }

  async function addTemperature() {
    if (!equipmentId || !employeeId || !temperature) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    await supabase.from("temperature_logs").insert([
      {
        equipement_id: Number(equipmentId),
        employee_id: Number(employeeId),
        temperature: Number(temperature),
      },
    ]);

    setTemperature("");

    fetchData();

    alert("Relevé ajouté ✅");
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">

      <h1 className="text-5xl font-bold mb-10">
        Relevé des températures
      </h1>

      <div className="bg-[#1e293b] p-6 rounded-2xl mb-10">

        <div className="flex flex-col gap-5">

          <select
            value={equipmentId}
            onChange={(e) =>
              setEquipmentId(e.target.value)
            }
            className="bg-[#0f172a] p-4 rounded-xl"
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

          <select
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(e.target.value)
            }
            className="bg-[#0f172a] p-4 rounded-xl"
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

          <input
            type="number"
            placeholder="Température"
            value={temperature}
            onChange={(e) =>
              setTemperature(e.target.value)
            }
            className="bg-[#0f172a] p-4 rounded-xl"
          />

          <button
            onClick={addTemperature}
            className="bg-blue-600 hover:bg-blue-700 transition p-4 rounded-xl font-bold"
          >
            Ajouter le relevé
          </button>

        </div>

      </div>

      <div className="bg-[#1e293b] p-6 rounded-2xl">

        <h2 className="text-3xl font-bold mb-6">
          Historique des relevés
        </h2>

        <div className="flex flex-col gap-4">

          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#0f172a] p-4 rounded-xl border border-gray-700"
            >
              🌡 {log.temperature}°C
            </div>
          ))}

        </div>

      </div>

    </main>
  );
}