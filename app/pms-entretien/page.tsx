"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ShieldCheck,
  CheckCircle2,
  Clock3,
  CalendarDays,
  Plus,
  X,
  Trash2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  title: string;
  frequency: string;
  status: string;
  day_of_week?: string | null;
  validated_by?: string | null;
  validated_at?: string | null;
};

const ADMIN_PIN = "2405";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function PMSEntretienPage() {

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [authorized, setAuthorized] =
    useState(false);

  const [pin, setPin] =
    useState("");

  const [showAddPanel, setShowAddPanel] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [frequency, setFrequency] =
    useState("Quotidien");

  const [selectedDay, setSelectedDay] =
    useState("Lundi");

  const [showTodayPanel, setShowTodayPanel] =
    useState(true);

  const [showValidationModal, setShowValidationModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [employeeName, setEmployeeName] =
    useState("");

  async function fetchTasks() {

    const { data } =
      await supabase
        .from("pms_tasks")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (data) {
      setTasks(data);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function addTask() {

    if (!title) return;

    const payload: any = {
      title,
      frequency,
      status: "pending",
    };

    if (
      frequency ===
      "Hebdomadaire"
    ) {
      payload.day_of_week =
        selectedDay;
    }

    const { error } =
      await supabase
        .from("pms_tasks")
        .insert([payload]);

    if (!error) {

      setTitle("");

      fetchTasks();
    }
  }

  async function validateTask() {

    if (
      !selectedTask ||
      !employeeName
    ) {
      return;
    }

    await supabase
      .from("pms_tasks")
      .update({
        status: "validated",
        validated_by:
          employeeName,
        validated_at:
          new Date().toISOString(),
      })
      .eq("id", selectedTask.id);

    setShowValidationModal(false);

    setSelectedTask(null);

    setEmployeeName("");

    fetchTasks();
  }

  async function deleteTask(
    taskId: string
  ) {

    if (!authorized) return;

    const confirmDelete =
      confirm(
        "Supprimer cette tâche ?"
      );

    if (!confirmDelete) return;

    await supabase
      .from("pms_tasks")
      .delete()
      .eq("id", taskId);

    fetchTasks();
  }

  const filteredTasks =
    useMemo(() => {

      return tasks.filter(
        (task) => {

          if (
            task.frequency ===
            "Quotidien"
          ) {
            return true;
          }

          if (
            task.frequency ===
              "Hebdomadaire" &&
            task.day_of_week ===
              selectedDay
          ) {
            return true;
          }

          return false;
        }
      );

    }, [tasks, selectedDay]);

  const validatedTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "validated"
    );

  const pendingTasks =
    filteredTasks.filter(
      (task) =>
        task.status !==
        "validated"
    );

  const frenchDate =
    new Date().toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  return (

    <div className="min-h-screen bg-[#020617] text-white px-4 md:px-8 py-8">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

          <div>

            <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-[0.35em] text-xs md:text-sm font-semibold mb-3">

              <ShieldCheck size={16} />

              PMS HACCP

            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-none">

              PMS
              <br />
              Entretien

            </h1>

            <p className="text-zinc-400 text-lg md:text-xl mt-4">

              Gestion HACCP des tâches cuisine

            </p>

          </div>

          {/* TODAY BUTTON */}

          <button
            onClick={() =>
              setShowTodayPanel(
                !showTodayPanel
              )
            }
            className="
              rounded-[32px]
              border border-pink-500/20
              bg-pink-500/10
              p-6 md:p-8
              text-left
              hover:bg-pink-500/15
              transition
              cursor-pointer
            "
          >

            <div className="text-pink-200 uppercase tracking-[0.3em] text-sm font-bold mb-5">

              Aujourd'hui

            </div>

            <div className="flex items-center gap-4">

              <div className="w-5 h-5 rounded-full bg-red-400" />

              <div>

                <h2 className="text-3xl md:text-5xl font-black leading-none capitalize">

                  {frenchDate}

                </h2>

                <p className="text-zinc-300 text-lg md:text-2xl mt-5">

                  {
                    pendingTasks.length
                  }{" "}
                  tâche(s)
                  restante(s)

                </p>

              </div>

            </div>

          </button>

        </div>

        {/* DAYS */}

        <div className="flex flex-wrap gap-3">

          {DAYS.map((day) => (

            <button
              key={day}
              onClick={() =>
                setSelectedDay(day)
              }
              className={`
                px-6 py-4
                rounded-2xl
                text-lg md:text-xl
                font-black
                transition

                ${
                  selectedDay === day
                    ? `
                      bg-cyan-400
                      text-black
                    `
                    : `
                      bg-white/5
                      hover:bg-white/10
                      text-white
                    `
                }
              `}
            >

              {day}

            </button>

          ))}

        </div>

        {/* KPI */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <button
            onClick={() =>
              setShowTodayPanel(
                true
              )
            }
            className="
              rounded-[32px]
              border border-cyan-500/20
              bg-cyan-500/10
              p-6
              text-left
              hover:bg-cyan-500/15
              transition
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-cyan-300 text-xl">
                  Tâches du jour
                </p>

                <h2 className="text-6xl font-black mt-5">
                  {
                    filteredTasks.length
                  }
                </h2>

              </div>

              <CalendarDays className="w-12 h-12 text-cyan-300" />

            </div>

          </button>

          <button
            onClick={() =>
              setShowTodayPanel(
                true
              )
            }
            className="
              rounded-[32px]
              border border-green-500/20
              bg-green-500/10
              p-6
              text-left
              hover:bg-green-500/15
              transition
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-green-300 text-xl">
                  Validées
                </p>

                <h2 className="text-6xl font-black mt-5">
                  {
                    validatedTasks.length
                  }
                </h2>

              </div>

              <CheckCircle2 className="w-12 h-12 text-green-300" />

            </div>

          </button>

          <button
            onClick={() =>
              setShowTodayPanel(
                true
              )
            }
            className="
              rounded-[32px]
              border border-orange-500/20
              bg-orange-500/10
              p-6
              text-left
              hover:bg-orange-500/15
              transition
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-orange-300 text-xl">
                  À faire
                </p>

                <h2 className="text-6xl font-black mt-5">
                  {
                    pendingTasks.length
                  }
                </h2>

              </div>

              <Clock3 className="w-12 h-12 text-orange-300" />

            </div>

          </button>

        </div>

        {/* TASKS PANEL */}

        {showTodayPanel && (

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">

            <div className="flex items-start justify-between mb-8">

              <div>

                <h2 className="text-4xl md:text-6xl font-black">

                  Tâches du jour

                </h2>

                <p className="text-zinc-400 text-lg md:text-2xl mt-3">

                  {selectedDay}

                </p>

              </div>

              <button
                onClick={() =>
                  setShowTodayPanel(
                    false
                  )
                }
                className="
                  w-14 h-14
                  rounded-3xl
                  bg-white/5
                  hover:bg-white/10
                  flex items-center justify-center
                "
              >

                <X size={24} />

              </button>

            </div>

            <div className="space-y-5">

              {filteredTasks.map(
                (task) => (

                  <div
                    key={task.id}
                    className="
                      rounded-3xl
                      bg-black/30
                      border border-white/5
                      p-5 md:p-6
                    "
                  >

                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                      <div className="min-w-0">

                        <h3 className="text-3xl md:text-4xl font-black break-words">

                          {task.title}

                        </h3>

                        <div className="flex flex-wrap gap-3 mt-4">

                          <div className="px-4 py-2 rounded-full bg-white/5 text-zinc-300 text-sm md:text-base">

                            {
                              task.frequency
                            }

                          </div>

                          {task.day_of_week && (

                            <div className="px-4 py-2 rounded-full bg-white/5 text-zinc-300 text-sm md:text-base">

                              {
                                task.day_of_week
                              }

                            </div>

                          )}

                        </div>

                      </div>

                      <div className="flex items-center gap-4 flex-wrap">

                        {task.status ===
                        "validated" ? (

                          <button
                            className="
                              px-5 py-3
                              rounded-2xl
                              bg-green-500/20
                              text-green-300
                              font-black
                              text-lg
                            "
                          >

                            VALIDÉE

                          </button>

                        ) : (

                          <button
                            onClick={() => {

                              setSelectedTask(
                                task
                              );

                              setShowValidationModal(
                                true
                              );
                            }}
                            className="
                              px-5 py-3
                              rounded-2xl
                              bg-orange-500/20
                              hover:bg-orange-500/30
                              text-orange-300
                              font-black
                              text-lg
                            "
                          >

                            À FAIRE

                          </button>

                        )}

                        {authorized && (

                          <button
                            onClick={() =>
                              deleteTask(
                                task.id
                              )
                            }
                            className="
                              w-12 h-12
                              rounded-2xl
                              bg-red-500/10
                              hover:bg-red-500/20
                              text-red-400
                              flex items-center justify-center
                              transition
                            "
                          >

                            <Trash2 size={20} />

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

        {/* ADD TASK */}

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

            <div className="flex items-center gap-5 min-w-0">

              <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">

                <Plus className="text-cyan-300 w-8 h-8" />

              </div>

              <div className="min-w-0">

                <h2 className="text-3xl md:text-5xl font-black leading-[0.95] break-words">

                  Ajouter une
                  <br />
                  tâche PMS

                </h2>

                <p className="text-zinc-400 text-base md:text-xl mt-3">

                  Accès administrateur sécurisé

                </p>

              </div>

            </div>

            {!authorized ? (

              <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">

                <input
                  type="password"
                  placeholder="Code PIN"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value
                    )
                  }
                  className="
                    h-16
                    w-full md:w-[260px]
                    rounded-3xl
                    bg-black/30
                    border border-white/10
                    px-6
                    text-lg
                    outline-none
                  "
                />

                <button
                  onClick={() => {

                    if (
                      pin ===
                      ADMIN_PIN
                    ) {

                      setAuthorized(
                        true
                      );

                    } else {

                      alert(
                        "PIN incorrect"
                      );
                    }
                  }}
                  className="
                    h-16
                    px-8
                    rounded-3xl
                    bg-cyan-400
                    hover:bg-cyan-300
                    transition
                    text-black
                    text-lg
                    font-black
                  "
                >

                  Déverrouiller

                </button>

              </div>

            ) : (

              <button
                onClick={() =>
                  setShowAddPanel(
                    !showAddPanel
                  )
                }
                className="
                  h-16
                  px-8
                  rounded-3xl
                  bg-cyan-400
                  hover:bg-cyan-300
                  transition
                  text-black
                  text-lg
                  font-black
                "
              >

                {showAddPanel
                  ? "Fermer"
                  : "Nouvelle tâche"}

              </button>

            )}

          </div>

          {showAddPanel && (

            <div className="border-t border-white/10 mt-8 pt-8">

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Nom tâche"
                  className="
                    h-16
                    rounded-3xl
                    bg-black/30
                    border border-white/10
                    px-6
                    text-lg
                    outline-none
                  "
                />

                <select
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(
                      e.target.value
                    )
                  }
                  className="
                    h-16
                    rounded-3xl
                    bg-black/30
                    border border-white/10
                    px-6
                    text-lg
                  "
                >

                  <option>
                    Quotidien
                  </option>

                  <option>
                    Hebdomadaire
                  </option>

                  <option>
                    Mensuel
                  </option>

                </select>

                <button
                  onClick={addTask}
                  className="
                    h-16
                    rounded-3xl
                    bg-cyan-400
                    hover:bg-cyan-300
                    transition
                    text-black
                    text-lg
                    font-black
                  "
                >

                  Ajouter

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* MODAL */}

      {showValidationModal &&
        selectedTask && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#071226] p-8">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-3xl font-black">

                  Validation tâche

                </h2>

                <p className="text-zinc-400 mt-2">

                  {selectedTask.title}

                </p>

              </div>

              <button
                onClick={() =>
                  setShowValidationModal(false)
                }
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"
              >

                <X />

              </button>

            </div>

            <div className="space-y-4">

              <input
                value={employeeName}
                onChange={(e) =>
                  setEmployeeName(
                    e.target.value
                  )
                }
                placeholder="Nom employé"
                className="
                  w-full h-14
                  rounded-2xl
                  bg-black/30
                  border border-white/10
                  px-5
                "
              />

              <button
                onClick={validateTask}
                className="
                  w-full h-14
                  rounded-2xl
                  bg-cyan-400
                  hover:bg-cyan-300
                  transition
                  text-black
                  font-black
                "
              >

                Valider la tâche

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}