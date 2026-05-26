"use client";

import { useEffect, useState } from "react";

import {
  Users,
  ShieldCheck,
  Clock3,
  UserPlus,
  Trash2,
  BadgeCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  role: string;
  status: string;
  created_at: string;
}

export default function EmployeesPage() {

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  async function fetchEmployees() {

    const { data } =
      await supabase
        .from("employees")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    setEmployees(data || []);
  }

  useEffect(() => {

    fetchEmployees();

  }, []);

  async function addEmployee() {

    const firstname =
      prompt("Prénom");

    if (!firstname) return;

    const lastname =
      prompt("Nom");

    if (!lastname) return;

    const role =
      prompt("Poste");

    if (!role) return;

    await supabase
      .from("employees")
      .insert({
        firstname,
        lastname,
        role,
        status: "ACTIF",
      });

    fetchEmployees();
  }

  async function deleteEmployee(
    id: number
  ) {

    await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    fetchEmployees();
  }

  const activeEmployees =
    employees.filter(
      (e) => e.status === "ACTIF"
    ).length;

  return (

    <div className="space-y-6 md:space-y-8">

      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          xl:flex-row
          xl:items-start
          xl:justify-between

          gap-6
        "
      >

        <div>

          <div className="flex items-center gap-3 mb-3">

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

            <p className="text-cyan-400 uppercase tracking-[0.2em] md:tracking-[0.25em] text-[10px] md:text-sm font-semibold">
              EMPLOYEE MANAGEMENT
            </p>

          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black text-white leading-none">
            Employés
          </h1>

          <p className="text-white/50 text-base md:text-xl mt-4">
            Gestion du personnel HACCP
          </p>

        </div>

        {/* BUTTON */}
        <button
          onClick={addEmployee}
          className="
            w-full
            xl:w-auto

            px-6 md:px-8
            py-4 md:py-5

            rounded-3xl

            bg-gradient-to-r
            from-cyan-500
            to-blue-500

            text-white
            font-bold

            text-base md:text-lg

            shadow-[0_0_40px_rgba(0,200,255,0.35)]

            hover:scale-[1.02]

            transition

            flex
            items-center
            justify-center
            gap-3
          "
        >

          <UserPlus size={22} />

          Ajouter un employé

        </button>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">

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

          <div className="flex items-center justify-between">

            <div>

              <p className="text-cyan-300 text-base md:text-lg">
                Employés
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-cyan-300 mt-4">
                {employees.length}
              </h2>

            </div>

            <Users
              size={40}
              className="text-cyan-300"
            />

          </div>

        </div>

        {/* ACTIVE */}
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

          <div className="flex items-center justify-between">

            <div>

              <p className="text-green-300 text-base md:text-lg">
                Actifs
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-green-300 mt-4">
                {activeEmployees}
              </h2>

            </div>

            <BadgeCheck
              size={40}
              className="text-green-300"
            />

          </div>

        </div>

        {/* SYSTEM */}
        <div
          className="
            rounded-[30px]

            border
            border-blue-500/20

            bg-blue-500/10

            backdrop-blur-xl

            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-blue-300 text-base md:text-lg">
                HACCP Staff
              </p>

              <h2 className="text-3xl md:text-5xl font-black text-blue-300 mt-4">
                ONLINE
              </h2>

            </div>

            <ShieldCheck
              size={40}
              className="text-blue-300"
            />

          </div>

        </div>

      </div>

      {/* EMPLOYEES */}
      <div className="space-y-5">

        {employees.map((employee) => (

          <div
            key={employee.id}
            className="
              rounded-[30px]

              border
              border-white/10

              bg-white/[0.03]

              backdrop-blur-xl

              p-5 md:p-6
            "
          >

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between

                gap-6
              "
            >

              {/* LEFT */}
              <div className="flex items-center gap-4 min-w-0">

                <div
                  className="
                    w-16
                    h-16

                    md:w-20
                    md:h-20

                    rounded-[22px]

                    bg-cyan-500/20

                    flex
                    items-center
                    justify-center

                    shrink-0
                  "
                >

                  <Users
                    size={30}
                    className="text-cyan-300"
                  />

                </div>

                <div className="min-w-0">

                  <h3 className="text-2xl md:text-4xl font-black text-white break-words">

                    {employee.firstname}
                    {" "}
                    {employee.lastname}

                  </h3>

                  <p className="text-white/50 text-sm md:text-lg mt-2 break-words">

                    Poste :
                    {" "}
                    {employee.role}

                  </p>

                  <div className="flex items-center gap-3 mt-4">

                    <div className="w-3 h-3 rounded-full bg-green-400" />

                    <span className="text-green-400 text-sm md:text-lg font-bold">
                      {employee.status}
                    </span>

                  </div>

                </div>

              </div>

              {/* RIGHT */}
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center

                  gap-5
                "
              >

                {/* DATE */}
                <div className="sm:text-right">

                  <p className="text-white/40 text-sm md:text-base">
                    Ajouté le
                  </p>

                  <div className="flex items-center gap-2 mt-2 sm:justify-end">

                    <Clock3
                      size={16}
                      className="text-cyan-300"
                    />

                    <span className="text-white text-sm md:text-lg font-semibold">

                      {new Date(
                        employee.created_at
                      ).toLocaleDateString("fr-FR")}

                    </span>

                  </div>

                </div>

                {/* DELETE */}
                <button
                  onClick={() =>
                    deleteEmployee(employee.id)
                  }
                  className="
                    w-14
                    h-14

                    rounded-2xl

                    border
                    border-red-500/20

                    bg-red-500/10

                    flex
                    items-center
                    justify-center

                    shrink-0
                  "
                >

                  <Trash2 className="text-red-300" />

                </button>

              </div>

            </div>

          </div>

        ))}

        {/* EMPTY */}
        {employees.length === 0 && (

          <div
            className="
              rounded-[30px]

              border
              border-white/10

              bg-white/[0.03]

              backdrop-blur-xl

              py-16 md:py-24

              flex
              flex-col
              items-center
              justify-center
            "
          >

            <Users className="w-14 h-14 md:w-16 md:h-16 text-cyan-300 mb-6" />

            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
              Aucun employé
            </h3>

            <p className="text-white/40 text-sm md:text-base text-center">
              Aucun membre du personnel enregistré
            </p>

          </div>

        )}

      </div>

    </div>
  );
}