"use client";

import { useState } from "react";

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
}

export default function PMSEntretienPage() {

  const [tasks, setTasks] = useState<CleaningTask[]>([
    {
      id: 1,
      title: "Nettoyage chambre froide",
      frequency: "Quotidien",
      completed: false,
    },

    {
      id: 2,
      title: "Désinfection plan de travail",
      frequency: "Quotidien",
      completed: true,
    },
  ]);

  const [title, setTitle] =
    useState("");

  const [frequency, setFrequency] =
    useState("Quotidien");

  // STATS
  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) => !task.completed
    ).length;

  // ADD TASK
  function addTask() {

    if (!title) return;

    const newTask: CleaningTask = {
      id: Date.now(),
      title,
      frequency,
      completed: false,
    };

    setTasks([
      newTask,
      ...tasks,
    ]);

    setTitle("");
    setFrequency("Quotidien");
  }

  // TOGGLE
  function toggleTask(id: number) {

    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed:
                !task.completed,
            }
          : task
      )
    );
  }

  return (

    <div className="p-8 space-y-8">

      {/* HEADER */}
      <div className="space-y-3">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          <p className="uppercase tracking-[0.3em] text-cyan-400 font-semibold text-sm">
            PMS HACCP
          </p>

        </div>

        <h1 className="text-6xl font-black text-white">
          PMS Entretien
        </h1>

        <p className="text-white/50 text-xl">
          Plan de nettoyage et entretien HACCP
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* TOTAL */}
        <div
          className="
            rounded-[30px]
            border
            border-cyan-500/20
            bg-cyan-500/10
            backdrop-blur-xl
            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-cyan-300 text-lg">
                Tâches totales
              </p>

              <h2 className="text-6xl font-black text-cyan-300 mt-4">
                {tasks.length}
              </h2>

            </div>

            <ClipboardList
              size={50}
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
            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-green-300 text-lg">
                Tâches validées
              </p>

              <h2 className="text-6xl font-black text-green-300 mt-4">
                {completedTasks}
              </h2>

            </div>

            <CheckCircle2
              size={50}
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
            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-orange-300 text-lg">
                Tâches en attente
              </p>

              <h2 className="text-6xl font-black text-orange-300 mt-4">
                {pendingTasks}
              </h2>

            </div>

            <AlertTriangle
              size={50}
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
          p-8
        "
      >

        <div className="flex items-center gap-3 mb-8">

          <Plus className="text-cyan-400" />

          <h2 className="text-4xl font-black text-white">
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
              h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
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
              h-16
              rounded-2xl
              bg-white/[0.05]
              border
              border-white/10
              px-5
              text-white
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
              h-16
              rounded-2xl
              bg-cyan-400
              hover:bg-cyan-300
              transition
              text-black
              font-black
              text-lg
            "
          >
            Ajouter
          </button>

        </div>

      </div>

      {/* TASKS */}
      <div className="space-y-4">

        {tasks.map((task) => (

          <div
            key={task.id}
            className="
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-xl
              p-6

              flex
              items-center
              justify-between
              gap-6
            "
          >

            <div>

              <h2 className="text-2xl font-black text-white">
                {task.title}
              </h2>

              <p className="text-white/50 mt-2">
                Fréquence : {task.frequency}
              </p>

            </div>

            <button
              onClick={() =>
                toggleTask(task.id)
              }
              className={`
                px-6
                py-4
                rounded-2xl
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

        ))}

      </div>

    </div>

  );
}