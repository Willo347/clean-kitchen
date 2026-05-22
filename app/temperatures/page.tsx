"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Equipment = {
  id: number;
  name: string;
  temp_min: number;
  temp_max: number;
};

type Employee = {
  id: number;
  full_name: string;
};

type Log = {
  id: number;
  temperature: number;
  created_at: string;

  equipments: {
    name: string;
    temp_min: number;
    temp_max: number;
  };

  employees: {
    full_name: string;
  };
};

export default function TemperaturesPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  const [equipmentId, setEquipmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [temperature, setTemperature] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // EQUIPMENTS
    const { data: equipmentsData, error: equipmentsError } =
      await supabase
        .from("equipments")
        .select("*")
        .order("id", { ascending: true });

    console.log("EQUIPMENTS :", equipmentsData);
    console.log("EQUIPMENTS ERROR :", equipmentsError);

    if (equipmentsData) {
      setEquipments(equipmentsData);
    }

    // EMPLOYEES
    const { data: employeesData, error: employeesError } =
      await supabase
        .from("employees")
        .select("*")
        .order("id", { ascending: true });

    console.log("EMPLOYEES :", employeesData);
    console.log("EMPLOYEES ERROR :", employeesError);

    if (employeesData) {
      setEmployees(employeesData);
    }

    // LOGS
    const { data: logsData, error: logsError } =
      await supabase
        .from("temperature_logs")
        .select(`
          *,
          equipments:equipment_id (
            name,
            temp_min,
            temp_max
          ),
          employees:employee_id (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

    console.log("LOGS :", logsData);
    console.log("LOGS ERROR :", logsError);

    if (logsData) {
      setLogs(logsData as any);
    }
  }

  async function addTemperature() {
    if (!equipmentId || !employeeId || !temperature) {
      alert("Remplis tous les champs");
      return;
    }

    const { error } = await supabase
      .from("temperature_logs")
      .insert([
        {
          equipment_id: Number(equipmentId),
          employee_id: Number(employeeId),
          temperature: Number(temperature),
        },
      ]);

    if (error) {
      console.log(error);
      alert("Erreur lors de l'ajout");
      return;
    }

    alert("Relevé ajouté");

    setEquipmentId("");
    setEmployeeId("");
    setTemperature("");

    fetchData();
  }

  function isAlert(log: Log) {
    if (!log.equipments) return false;

    return (
      log.temperature < log.equipments.temp_min ||
      log.temperature > log.equipments.temp_max
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Relevé des températures
      </h1>

      {/* FORMULAIRE */}
      <div className="bg-white/10 p-6 rounded-2xl mb-10">
        {/* EQUIPEMENT */}
        <select
          value={equipmentId}
          onChange={(e) => setEquipmentId(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/10 mb-4"
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

        {/* EMPLOYE */}
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/10 mb-4"
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

        {/* TEMPERATURE */}
        <input
          type="number"
          placeholder="Température"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/10 mb-4"
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
      <div className="bg-white/10 p-6 rounded-2xl">
        <h2 className="text-3xl font-bold mb-6">
          Historique
        </h2>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-4 rounded-xl ${
                isAlert(log)
                  ? "bg-red-500/20 border border-red-500"
                  : "bg-white/5"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-xl">
                    {log.equipments?.name}
                  </p>

                  <p className="text-sm text-gray-300">
                    Employé :{" "}
                    {log.employees?.full_name}
                  </p>

                  <p className="text-sm text-gray-400">
                    {new Date(
                      log.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {log.temperature}°C
                  </p>

                  {isAlert(log) && (
                    <p className="text-red-400 font-bold">
                      ⚠️ ALERTE HACCP
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <p className="text-gray-400">
              Aucun relevé enregistré
            </p>
          )}
        </div>
      </div>
    </main>
  );
}