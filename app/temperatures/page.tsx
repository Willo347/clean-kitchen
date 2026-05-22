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
      .order("name", { ascending: true });

    setEquipments(equipmentsData || []);

    // EMPLOYÉS
    const { data: employeesData } = await supabase
      .from("employees")
      .select("*")
      .order("full_name", { ascending: true });

    setEmployees(employeesData || []);

    // HISTORIQUE
    const { data: logsData } = await supabase
      .from("temperature_logs")
      .select(`
        *,
        equipments:equipement_id (
          id,
          name,
          temp_min,
          temp_max
        ),
        employees:employee_id (
          id,
          full_name
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    setLogs(logsData || []);
  }

  async function addTemperature() {

    if (
      !selectedEquipment ||
      !selectedEmployee ||
      !temperature
    ) {
      alert("Veuillez remplir tous les champs");
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
      alert("Erreur lors de l'ajout");
      return;
    }

    setSelectedEquipment("");
    setSelectedEmployee("");
    setTemperature("");

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
      <div>

        <h2 className="text-3xl font-bold mb-6">
          Historique des relevés
        </h2>

        <div className="space-y-4">

          {logs.map((log) => {

            const alert = isAlert(log);

            return (
              <div
                key={log.id}
                className={`p-5 rounded-2xl border ${
                  alert
                    ? "bg-red-700/70 border-red-400"
                    : "bg-white/10 border-white/10"
                }`}
              >

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="text-2xl font-bold">
                      {log.equipments?.name}
                    </h3>

                    <p className="text-gray-300 mt-2">
                      Employé :
                      {" "}
                      {log.employees?.full_name}
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-4xl font-bold">
                      {log.temperature}°C
                    </p>

                    {alert && (
                      <p className="text-yellow-300 font-bold mt-2">
                        ⚠️ ALERTE HACCP
                      </p>
                    )}

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </main>
  );
}