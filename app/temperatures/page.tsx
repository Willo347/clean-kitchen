"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TemperaturesPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [selectedEquipment, setSelectedEquipment] =
    useState("");

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  const [temperature, setTemperature] = useState("");

  useEffect(() => {
    fetchEquipments();
    fetchEmployees();
  }, []);

  async function fetchEquipments() {
    const { data } = await supabase
      .from("equipments")
      .select("*");

    setEquipments(data || []);
  }

  async function fetchEmployees() {
    const { data } = await supabase
      .from("employees")
      .select("*");

    setEmployees(data || []);
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

    const equipment = equipments.find(
      (eq) => eq.id === Number(selectedEquipment)
    );

    const employee = employees.find(
      (emp) => emp.id === Number(selectedEmployee)
    );

    await supabase.from("temperature_logs").insert([
      {
        equipement_id: equipment.id,
        equipment: equipment.name,
        temperature: Number(temperature),
        employee_name: employee.full_name,
      },
    ]);

    alert("Relevé enregistré ✅");

    setTemperature("");
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">

      <h1 className="text-5xl font-bold mb-10">
        Relevé des températures
      </h1>

      <div className="bg-[#1e293b] p-8 rounded-3xl max-w-3xl">

        <div className="flex flex-col gap-5">

          <select
            value={selectedEquipment}
            onChange={(e) =>
              setSelectedEquipment(e.target.value)
            }
            className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
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
            value={selectedEmployee}
            onChange={(e) =>
              setSelectedEmployee(e.target.value)
            }
            className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
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
            className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
          />

          <button
            onClick={addTemperature}
            className="bg-blue-600 hover:bg-blue-700 transition p-4 rounded-2xl font-bold"
          >
            Enregistrer le relevé
          </button>

        </div>

      </div>

    </main>
  );
}