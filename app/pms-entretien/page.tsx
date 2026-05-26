"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ClipboardList,
} from "lucide-react";

interface CleaningTask {
  id: number;
  title: string;
  frequency: string;
  completed: boolean;
  validated_by?: string | null;
  validated_at?: string | null;
}

export default function PMSEntretienPage() {

  const [tasks, setTasks] = useState<CleaningTask[]>([]);

  const [title, setTitle] = useState("");

  const [frequency, setFrequency] =
    useState("Quotidien");

  const [loading, setLoading] =
    useState(true);

  // FETCH TASKS
  async function fetchTasks() {

    const { data, error } =
      await supabase
        .from("pms_tasks")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    console.log("TASKS:", data);
    console.log("TASKS ERROR:", error);

    if (!error && data) {
      setTasks(data);
    }

    setLoading(false);
  }

  // AUTO REFRESH
  useEffect(() => {

    fetchTasks();

    const interval = setInterval(() => {
      fetchTasks();
    }, 2000);

    return () =>
      clearInterval(interval);

  }, []);

  // ADD TASK
  async function addTask() {

    if (!title.trim()) return;

    const insertData = {
      title: title.trim(),
      frequency,
      completed: false,
    };

    console.log(
      "INSERT DATA:",
      insertData
    );

    const { error } =
      await supabase
        .from("pms_tasks")
        .insert([insertData]);

    console.log(
      "INSERT ERROR:",
      error
    );

    if (error) {
      alert("Erreur insertion PMS");
      return;
    }

    setTitle("");
    setFrequency("Quotidien");

    fetchTasks();
  }

  // TOGGLE TASK
  async function toggleTask(
    task: CleaningTask
  ) {

    const { error } =
      await supabase
        .from("pms_tasks")
        .update({
          completed:
            !task.completed,

          validated_by:
            !task.completed
              ? "Manager"
              : null,

          validated_at:
            !task.completed
              ? new Date().toLocaleString(
                  "fr-FR"
                )
              : null,
        })
        .eq("id", task.id);

    if (!error) {
      fetchTasks();
    }
  }

  // STATS
  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) => !task.completed
    ).length;

  return (

    <div className="space-y-6 md:space-y-8">

      {/* HEADER */}
      <div className="space-y-3">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          <p className="uppercase tracking-[0.2em] md:tracking-[0.3em] text-cyan-400 font-semibold text-[10px] md:text-sm">
            PMS HACCP
          </p>

        </div>

        <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black text-white leading-none">
          PMS Entretien
        </h1>

        <p className="text-white/50 text-base md:text-xl">
          Plan de nettoyage et entretien HACCP
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-6">

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

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-cyan-300 text-base md:text-lg">
                Tâches totales
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-cyan-300 mt-4">
                {tasks.length}
              </h2>

            </div>

            <ClipboardList
              size={42}
              className="text-cyan-300"
            />

          </div>

        </div>

        {/* COMPLETED */}
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

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-green-300 text-base md:text-lg">
                Tâches validées
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-green-300 mt-4">
                {completedTasks}
              </h2>

            </div>

            <CheckCircle2
              size={42}
              className="text-green-300"
            />

          </div>

        </div>

        {/* PENDING */}
        <div
          className="
            rounded-[30px]
            border
            border-orange-500/20
            bg-orange-500/10
            backdrop-blur-xl
            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-orange-300 text-base md:text-lg">
                Tâches en attente
              </p>

              <h2 className="text-4xl md:text-6xl font-black text-orange-300 mt-4">
                {pendingTasks}
              </h2>

            </div>

            <AlertTriangle
              size={42}
              className="text-orange-300"
            />

          </div>

        </div>

      </div>

      {/* ADD TASK */}
      <div
        className="
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.03]
          backdrop-blur-xl
          p-5 md:p-8
        "
      >

        <div className="flex items-center gap-3 mb-6 md:mb-8">

          <Plus className="text-cyan-400" />

          <h2 className="text-2xl md:text-4xl font-black text-white">
            Ajouter une tâche PMS
          </h2>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Nom de la tâche"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            className="
              h-14 md:h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
              text-sm md:text-base
              outline-none
            "
          />

          {/* FREQUENCY */}
          <select
            value={frequency}
            onChange={(e) =>
              setFrequency(
                e.target.value
              )
            }
            className="
              h-14 md:h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
              text-sm md:text-base
              outline-none
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

          {/* BUTTON */}
          <button
            onClick={addTask}
            className="
              h-14 md:h-16
              rounded-2xl
              bg-cyan-400
              hover:bg-cyan-300
              transition
              text-black
              font-black
              text-base md:text-lg
            "
          >
            Ajouter
          </button>

        </div>

      </div>

      {/* TASKS */}
      <div className="space-y-4">

        {loading ? (

          <div className="text-white/50">
            Chargement...
          </div>

        ) : tasks.length === 0 ? (

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-8
              text-center
              text-white/50
            "
          >
            Aucune tâche PMS
          </div>

        ) : (

          tasks.map((task) => (

            <div
              key={task.id}
              className="
                rounded-[28px]
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
                  gap-5
                "
              >

                {/* LEFT */}
                <div>

                  <div className="flex items-center gap-3 mb-3">

                    <ShieldCheck className="text-cyan-300 shrink-0" />

                    <h2 className="text-2xl md:text-3xl font-black text-white break-words">

                      {task.title}

                    </h2>

                  </div>

                  <p className="text-white/50 text-sm md:text-base">

                    Fréquence :
                    {" "}
                    {task.frequency}

                  </p>

                  {task.completed && (

                    <div className="mt-4 space-y-1">

                      <p className="text-green-300 text-sm">

                        Validé par :
                        {" "}
                        {task.validated_by}

                      </p>

                      <p className="text-green-300/70 text-xs">

                        {task.validated_at}

                      </p>

                    </div>

                  )}

                </div>

                {/* BUTTON */}
                <button
                  onClick={() =>
                    toggleTask(task)
                  }
                  className={`
                    w-full
                    lg:w-auto
                    px-5 md:px-6
                    py-4
                    rounded-2xl
                    text-sm md:text-base
                    font-black
                    transition

                    ${
                      task.completed
                        ? `
                          bg-green-500/20
                          text-green-300
                          border
                          border-green-500/30
                        `
                        : `
                          bg-orange-500/20
                          text-orange-300
                          border
                          border-orange-500/30
                        `
                    }
                  `}
                >

                  {task.completed
                    ? "✔ Effectué"
                    : "En attente"}

                </button>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
}