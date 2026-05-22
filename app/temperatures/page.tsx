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
    // =========================
    // EQUIPMENTS
    // =========================
    const { data: equipmentsData, error: equipmentsError } = await supabase
      .from("equipments")
      .select("*")
      .order("name");

    console.log("EQUIPMENTS:", equipmentsData);
    console.log("EQUIPMENTS ERROR:", equipmentsError);

    if (equipmentsData) {
      setEquipments(equipmentsData);
    }

    // =========================
    // EMPLOYEES
    // =========================
    const { data: employeesData, error: employeesError } = await supabase
      .from("employees")
      .select("id, full_name")
      .order("full_name");

    console.log("EMPLOYEES DATA:", employeesData);
    console.log("EMPLOYEES ERROR:", employeesError);

    if (employeesData) {
      setEmployees(employeesData);
    }

    // =========================
    // LOGS
    // =========================
    const { data: logsData, error: logsError } = await supabase
      .from("temperature_logs")
      .select(`
        *,
        equipments(name),
        employees(full_name)
      `)
      .order("created_at", { ascending: false });

    console.log("LOGS:", logsData);
    console.log("LOGS ERROR:", logsError);

    if (logsData) {
      setLogs(logsData);
    }
  }

  async function addTemperature() {
    if (!selectedEquipment || !selectedEmployee || !temperature) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase.from("temperature_logs").insert([
      {
        equipment_id: selectedEquipment,
        employee_id: selectedEmployee,
        temperature: Number(temperature),
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erreur lors de l'ajout");
      return;
    }

    setTemperature("");
    fetchData();
  }

  function isAlert(log: any) {
    return log.temperature > 8 || log.temperature < 0;
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Relevé des températures
      </h1>

      {/* FORMULAIRE */}
      <div className="bg-white/10 p-6 rounded-2xl mb-10">
        
        {/* EQUIPMENTS */}
        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/30 mb-4"
        >
          <option value="">Choisir un équipement</option>

          {equipments.map((equipment) => (
            <option key={equipment.id} value={equipment.id}>
              {equipment.name}
            </option>
          ))}
        </select>

        {/* EMPLOYEES */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/30 mb-4"
        >
          <option value="">Choisir un employé</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
            </option>
          ))}
        </select>

        {/* TEMPERATURE */}
        <input
          type="number"
          placeholder="Température"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/30 mb-4"
        />

        <button
          onClick={addTemperature}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-bold"
        >
          Ajouter le relevé
        </button>
      </div>

      {/* LOGS */}
      <div className="space-y-4">
        {logs.map((log: any) => (
          <div
            key={log.id}
            className="bg-white/10 p-6 rounded-2xl flex justify-between items-center"
          >
            <div>
              <p className="text-2xl font-bold">
                {log.equipments?.name}
              </p>

              <p className="text-white/70">
                Employé : {log.employees?.full_name}
              </p>

              <p className="text-white/50 text-sm">
                {new Date(log.created_at).toLocaleString()}
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
        ))}
      </div>
    </main>
  );
}