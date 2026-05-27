"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ShieldCheck,
  CheckCircle2,
  Clock3,
  BellRing,
  CalendarDays,
  Plus,
  Sparkles,
  Flame,
  X,
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
  overdue?: boolean;
};

const ADMIN_PIN = "2405";

const days = [
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

  const [loading, setLoading] =
    useState(true);

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

  const [dayOfWeek, setDayOfWeek] =
    useState("Lundi");

  const [activeFilter, setActiveFilter] =
    useState<
      "today" |
      "validated" |
      "pending" |
      "overdue" |
      null
    >(null);

  const [selectedDay, setSelectedDay] =
    useState("Lundi");

  function getTodayFrench() {

    return new Date()
      .toLocaleDateString(
        "fr-FR",
        { weekday: "long" }
      )
      .replace(/^./, (c) =>
        c.toUpperCase()
      );
  }

  const todayName =
    getTodayFrench();

  async function fetchTasks() {

    setLoading(true);

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

    setLoading(false);
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
      overdue: false,
    };

    if (
      frequency !== "Quotidien"
    ) {
      payload.day_of_week =
        dayOfWeek;
    }

    await supabase
      .from("pms_tasks")
      .insert([payload]);

    setTitle("");

    fetchTasks();
  }

  async function toggleTask(
    task: Task
  ) {

    const validated =
      task.status ===
      "validated";

    await supabase
      .from("pms_tasks")
      .update({
        status: validated
          ? "pending"
          : "validated",
        validated_at:
          validated
            ? null
            : new Date().toISOString(),
      })
      .eq("id", task.id);

    fetchTasks();
  }

  const todayTasks =
    useMemo(() => {

      return tasks.filter((task) => {

        if (
          task.frequency ===
          "Quotidien"
        ) {
          return true;
        }

        return (
          task.day_of_week ===
          todayName
        );
      });

    }, [tasks]);

  const validatedTasks =
    tasks.filter(
      (t) =>
        t.status ===
        "validated"
    );

  const pendingTasks =
    tasks.filter(
      (t) =>
        t.status !==
        "validated"
    );

  const overdueTasks =
    tasks.filter(
      (t) =>
        t.overdue === true
    );

  const filteredTasks =
    useMemo(() => {

      if (
        activeFilter ===
        "validated"
      ) {
        return validatedTasks;
      }

      if (
        activeFilter ===
        "pending"
      ) {
        return pendingTasks;
      }

      if (
        activeFilter ===
        "overdue"
      ) {
        return overdueTasks;
      }

      return todayTasks;

    }, [
      activeFilter,
      todayTasks,
      validatedTasks,
      pendingTasks,
      overdueTasks,
    ]);

  return (

    <div className="min-h-screen bg-[#020617] text-white px-4 md:px-8 py-8">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

          <div>

            <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-[0.35em] text-xs font-semibold mb-4">
              <ShieldCheck size={15} />
              PMS HACCP
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-none">
              PMS Entretien
            </h1>

            <p className="text-zinc-400 text-lg mt-5">
              Gestion HACCP des tâches cuisine
            </p>

          </div>

          <button
            onClick={() =>
              setActiveFilter(
                activeFilter ===
                  "today"
                  ? null
                  : "today"
              )
            }
            className="
              rounded-[32px]
              border border-pink-500/20
              bg-pink-500/10
              p-6
              min-w-[330px]
              text-left
              hover:scale-[1.02]
              transition
            "
          >

            <div className="text-pink-300 uppercase tracking-[0.25em] text-xs font-bold mb-4">
              Aujourd'hui
            </div>

            <div className="flex items-center gap-4">

              <div className="w-5 h-5 rounded-full bg-red-400" />

              <div>

                <div className="text-4xl font-black">
                  {new Date().toLocaleDateString(
                    "fr-FR",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </div>

                <div className="text-zinc-300 mt-2">
                  {
                    pendingTasks.length
                  } tâche(s)
                  restante(s)
                </div>

              </div>

            </div>

          </button>

        </div>

        {/* DAYS */}

        <div className="flex gap-3 overflow-x-auto pb-2">

          {days.map((day) => (

            <button
              key={day}
              onClick={() =>
                setSelectedDay(day)
              }
              className={`
                px-5 py-3
                rounded-2xl
                whitespace-nowrap
                transition
                font-semibold

                ${
                  selectedDay === day
                    ? `
                      bg-cyan-400
                      text-black
                    `
                    : `
                      bg-white/5
                      text-zinc-300
                      hover:bg-white/10
                    `
                }
              `}
            >
              {day}
            </button>

          ))}

        </div>

        {/* KPI */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <button
            onClick={() =>
              setActiveFilter(
                "today"
              )
            }
            className="
              rounded-3xl
              border border-cyan-500/20
              bg-cyan-500/10
              p-6
              text-left
              hover:scale-[1.02]
              transition
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-cyan-300">
                  Tâches du jour
                </p>

                <h2 className="text-6xl font-black mt-4">
                  {
                    todayTasks.length
                  }
                </h2>

              </div>

              <CalendarDays className="w-10 h-10 text-cyan-300" />

            </div>

          </button>

          <button
            onClick={() =>
              setActiveFilter(
                "validated"
              )
            }
            className="
              rounded-3xl
              border border-green-500/20
              bg-green-500/10
              p-6
              text-left
              hover:scale-[1.02]
              transition
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-green-300">
                  Validées
                </p>

                <h2 className="text-6xl font-black mt-4">
                  {
                    validatedTasks.length
                  }
                </h2>

              </div>

              <CheckCircle2 className="w-10 h-10 text-green-300" />

            </div>

          </button>

          <button
            onClick={() =>
              setActiveFilter(
                "pending"
              )
            }
            className="
              rounded-3xl
              border border-orange-500/20
              bg-orange-500/10
              p-6
              text-left
              hover:scale-[1.02]
              transition
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-orange-300">
                  À faire
                </p>

                <h2 className="text-6xl font-black mt-4">
                  {
                    pendingTasks.length
                  }
                </h2>

              </div>

              <Clock3 className="w-10 h-10 text-orange-300" />

            </div>

          </button>

        </div>

        {/* DASHBOARD */}

        {activeFilter && (

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-4xl font-black">

                  {activeFilter ===
                    "today" &&
                    "Tâches du jour"}

                  {activeFilter ===
                    "validated" &&
                    "Tâches validées"}

                  {activeFilter ===
                    "pending" &&
                    "Tâches à faire"}

                  {activeFilter ===
                    "overdue" &&
                    "Tâches en retard"}

                </h2>

                <p className="text-zinc-400 mt-2">
                  {selectedDay}
                </p>

              </div>

              <button
                onClick={() =>
                  setActiveFilter(
                    null
                  )
                }
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-white/5
                  flex items-center justify-center
                "
              >
                <X />
              </button>

            </div>

            <div className="space-y-4">

              {filteredTasks.map(
                (task) => (

                <div
                  key={task.id}
                  className="
                    rounded-3xl
                    bg-black/30
                    border border-white/5
                    p-5
                  "
                >

                  <div className="flex items-center justify-between gap-5">

                    <div>

                      <h3 className="text-3xl font-black">
                        {task.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-3">

                        <div className="px-3 py-1 rounded-full bg-white/5 text-sm">
                          {task.frequency}
                        </div>

                        {task.day_of_week && (

                          <div className="px-3 py-1 rounded-full bg-white/5 text-sm">
                            {task.day_of_week}
                          </div>

                        )}

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        toggleTask(
                          task
                        )
                      }
                      className={`
                        px-6 py-3
                        rounded-2xl
                        font-black
                        transition

                        ${
                          task.status ===
                          "validated"
                            ? `
                              bg-green-500/20
                              text-green-300
                            `
                            : `
                              bg-orange-500/20
                              text-orange-300
                            `
                        }
                      `}
                    >

                      {task.status ===
                      "validated"
                        ? "VALIDÉE"
                        : "À FAIRE"}

                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* ADD TASK */}

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 flex items-center justify-center">
                <Plus className="text-cyan-300 w-8 h-8" />
              </div>

              <div>

                <h2 className="text-5xl font-black leading-none">
                  Ajouter une tâche PMS
                </h2>

                <p className="text-zinc-400 mt-3">
                  Accès administrateur sécurisé
                </p>

              </div>

            </div>

            {!authorized ? (

              <div className="flex gap-3">

                <input
                  type="password"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value
                    )
                  }
                  placeholder="Code PIN"
                  className="
                    h-16
                    rounded-2xl
                    bg-black/30
                    border border-white/10
                    px-5
                    min-w-[280px]
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
                    px-10
                    rounded-2xl
                    bg-cyan-400
                    hover:bg-cyan-300
                    transition
                    text-black
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
                  px-10
                  rounded-2xl
                  bg-cyan-400
                  hover:bg-cyan-300
                  transition
                  text-black
                  font-black
                "
              >
                Nouvelle tâche
              </button>

            )}

          </div>

          {showAddPanel && (

            <div className="border-t border-white/10 mt-6 pt-6">

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
                    h-14
                    rounded-2xl
                    bg-black/30
                    border border-white/10
                    px-5
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
                    h-14
                    rounded-2xl
                    bg-black/30
                    border border-white/10
                    px-5
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

                {frequency !==
                  "Quotidien" && (

                  <select
                    value={dayOfWeek}
                    onChange={(e) =>
                      setDayOfWeek(
                        e.target.value
                      )
                    }
                    className="
                      h-14
                      rounded-2xl
                      bg-black/30
                      border border-white/10
                      px-5
                    "
                  >

                    {days.map((day) => (

                      <option
                        key={day}
                      >
                        {day}
                      </option>

                    ))}

                  </select>

                )}

                <button
                  onClick={addTask}
                  className="
                    h-14
                    rounded-2xl
                    bg-cyan-400
                    hover:bg-cyan-300
                    transition
                    text-black
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

    </div>
  );
}