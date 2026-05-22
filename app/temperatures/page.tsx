"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TemperaturesPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [temperature, setTemperature] = useState("");
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // équipements
    const { data: equipmentsData } = await supabase
      .from("equipments")
      .select("*");

    if (equipmentsData) {
      setEquipments(equipmentsData);
    }

    // employés
    const { data: employeesData } = await supabase
      .from("employees")
      .select("*");

    if (employeesData) {
      setEmployees(employeesData);
    }

    // relevés
    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select(`
        *,
        equipments(name),
        employees(full_name)
      `)
      .order("created_at", { ascending: false });

    if (logsData) {
      setLogs(logsData);
    }
  }

  async function addTemperature() {
    if (!selectedEquipment || !selectedEmployee || !temperature) {
      alert("Remplis tous les champs");
      return;
    }

    await supabase.from("temperature_logs").insert([
      {
        equipement_id: Number(selectedEquipment),
        employee_id: Number(selectedEmployee),
        temperature: Number(temperature),
      },
    ]);

    setTemperature("");
    fetchData();
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Relevé des températures
      </h1>

      <div className="bg-white/10 p-6 rounded-2xl max-w-3xl space-y-4">

        {/* équipement */}
        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/30"
        >
          <option value="">Choisir un équipement</option>

          {equipments.map((equipment) => (
            <option key={equipment.id} value={equipment.id}>
              {equipment.name}
            </option>
          ))}
        </select>

        {/* employé */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/30"
        >
          <option value="">Choisir un employé</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
            </option>
          ))}
        </select>

        {/* température */}
        <input
          type="number"
          placeholder="Température"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/30"
        />

        <button
          onClick={addTemperature}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-4 rounded-xl font-bold"
        >
          Ajouter le relevé
        </button>
      </div>

      {/* historique */}
      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-6">
          Historique
        </h2>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white/10 p-4 rounded-xl flex justify-between"
            >
              <div>
                <p className="font-bold">
                  {log.equipments?.name}
                </p>

                <p className="text-sm text-gray-300">
                  Employé : {log.employees?.full_name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold">
                  {log.temperature}°C
                </p>

                <p className="text-sm text-gray-400">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}