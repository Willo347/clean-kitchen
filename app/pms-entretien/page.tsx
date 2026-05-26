"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Flame,
  Plus,
  Clock3,
  ChevronRight,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  title: string;
  frequency: string;
  category: "operationnel" | "periodique";
  priority?: string;
  status: string;
  day_of_week?: string | null;
  validated_by?: string | null;
  validated_at?: string | null;
};

const ADMIN_PIN = "2405";

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

  const [category, setCategory] =
    useState<
      "operationnel" | "periodique"
    >("operationnel");

  const [dayOfWeek, setDayOfWeek] =
    useState("Lundi");

  const [activeView, setActiveView] =
    useState<
      "all" |
      "validated" |
      "pending" |
      null
    >(null);

  async function fetchTasks() {

    setLoading(true);

    const { data, error } =
      await supabase
        .from("pms_tasks")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (!error && data) {
      setTasks(data as Task[]);
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
      category,
      status: "pending",
    };

    if (
      category === "periodique"
    ) {
      payload.day_of_week =
        dayOfWeek;
    }

    const { error } =
      await supabase
        .from("pms_tasks")
        .insert([payload]);

    if (!error) {

      setTitle("");

      fetchTasks();

    } else {

      console.log(error);

      alert(
        "Erreur ajout tâche"
      );
    }
  }

  async function validateTask(
    taskId: string
  ) {

    const employee =
      prompt(
        "Nom de l'employé ayant effectué la tâche :"
      );

    if (!employee) return;

    await supabase
      .from("pms_tasks")
      .update({
        status: "validated",
        validated_by: employee,
        validated_at:
          new Date().toISOString(),
      })
      .eq("id", taskId);

    fetchTasks();
  }

  const validatedTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.status ===
            "validated"
        ),
      [tasks]
    );

  const pendingTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.status !==
            "validated"
        ),
      [tasks]
    );

  const operationnelles =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.category ===
            "operationnel"
        ),
      [tasks]
    );

  const periodiques =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.category ===
            "periodique"
        ),
      [tasks]
    );

  function progress(
    total: number,
    done: number
  ) {

    if (!total) return 0;

    return Math.round(
      (done / total) * 100
    );
  }

  return (

    <div className="min-h-screen bg-[#020617] text-white px-4 md:px-8 py-8">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div>

          <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-[0.35em] text-xs md:text-sm font-semibold mb-3">
            <ShieldCheck size={16} />
            PMS HACCP
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none">
            PMS Entretien
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl mt-4">
            Gestion HACCP des tâches cuisine
          </p>

        </div>

        {/* KPI */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <KpiCard
            title="Tâches totales"
            value={tasks.length}
            color="cyan"
            icon={
              <ClipboardList className="w-10 h-10 text-cyan-400" />
            }
            onClick={() =>
              setActiveView("all")
            }
          />

          <KpiCard
            title="Tâches validées"
            value={
              validatedTasks.length
            }
            color="green"
            icon={
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            }
            onClick={() =>
              setActiveView(
                "validated"
              )
            }
          />

          <KpiCard
            title="Tâches en attente"
            value={
              pendingTasks.length
            }
            color="red"
            icon={
              <AlertTriangle className="w-10 h-10 text-red-400" />
            }
            onClick={() =>
              setActiveView(
                "pending"
              )
            }
          />

        </div>

        {/* DETAIL PANEL */}

        {activeView && (

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-3xl font-black">

                  {activeView === "all" &&
                    "Toutes les tâches"}

                  {activeView ===
                    "validated" &&
                    "Tâches validées"}

                  {activeView ===
                    "pending" &&
                    "Tâches en attente"}

                </h2>

              </div>

              <button
                onClick={() =>
                  setActiveView(
                    null
                  )
                }
                className="
                  w-12 h-12
                  rounded-2xl
                  bg-white/5
                  flex items-center justify-center
                "
              >
                <X />
              </button>

            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">

              {(activeView === "all"
                ? tasks
                : activeView ===
                  "validated"
                ? validatedTasks
                : pendingTasks
              ).map((task) => (

                <TaskCard
                  key={task.id}
                  task={task}
                  onValidate={
                    validateTask
                  }
                />

              ))}

            </div>

          </div>

        )}

        {/* ADD TASK */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">

          <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                <Plus className="text-cyan-300" />
              </div>

              <div>

                <h2 className="text-2xl md:text-4xl font-black">
                  Ajouter une tâche PMS
                </h2>

                <p className="text-zinc-400">
                  Accès administrateur sécurisé
                </p>

              </div>

            </div>

            {!authorized ? (

              <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">

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
                    h-14
                    rounded-2xl
                    bg-black/30
                    border border-white/10
                    px-5
                    outline-none
                    min-w-[250px]
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
                    h-14
                    px-8
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
                  h-14
                  px-8
                  rounded-2xl
                  bg-cyan-400
                  hover:bg-cyan-300
                  transition
                  text-black
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

            <div className="border-t border-white/10 p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

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
                    h-14
                    rounded-2xl
                    bg-black/30
                    border border-white/10
                    px-5
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

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target
                        .value as any
                    )
                  }
                  className="
                    h-14
                    rounded-2xl
                    bg-black/30
                    border border-white/10
                    px-5
                    outline-none
                  "
                >
                  <option value="operationnel">
                    Opérationnel
                  </option>

                  <option value="periodique">
                    Entretien périodique
                  </option>

                </select>

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

                {category ===
                  "periodique" && (

                  <div className="md:col-span-2 xl:col-span-4">

                    <select
                      value={
                        dayOfWeek
                      }
                      onChange={(e) =>
                        setDayOfWeek(
                          e.target
                            .value
                        )
                      }
                      className="
                        w-full h-14
                        rounded-2xl
                        bg-black/30
                        border border-white/10
                        px-5
                        outline-none
                      "
                    >
                      <option>
                        Lundi
                      </option>
                      <option>
                        Mardi
                      </option>
                      <option>
                        Mercredi
                      </option>
                      <option>
                        Jeudi
                      </option>
                      <option>
                        Vendredi
                      </option>
                      <option>
                        Samedi
                      </option>
                      <option>
                        Dimanche
                      </option>
                    </select>

                  </div>

                )}

              </div>

            </div>

          )}

        </div>

        {/* TASK SECTIONS */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          <TaskSection
            title="Opérationnel"
            subtitle="Tâches quotidiennes cuisine"
            color="cyan"
            icon={
              <Sparkles className="text-cyan-300 w-7 h-7" />
            }
            tasks={
              operationnelles
            }
            onValidate={
              validateTask
            }
            progress={progress(
              operationnelles.length,
              operationnelles.filter(
                (t) =>
                  t.status ===
                  "validated"
              ).length
            )}
          />

          <TaskSection
            title="Entretien périodique"
            subtitle="Entretien HACCP programmé"
            color="pink"
            icon={
              <Flame className="text-pink-300 w-7 h-7" />
            }
            tasks={
              periodiques
            }
            onValidate={
              validateTask
            }
            progress={progress(
              periodiques.length,
              periodiques.filter(
                (t) =>
                  t.status ===
                  "validated"
              ).length
            )}
          />

        </div>

        {loading && (

          <div className="text-center text-zinc-500 py-10">
            Chargement...
          </div>

        )}

      </div>

    </div>
  );
}

/* COMPONENTS */

function KpiCard({
  title,
  value,
  color,
  icon,
  onClick,
}: any) {

  return (

    <button
      onClick={onClick}
      className={`
        rounded-3xl
        p-6
        text-left
        transition
        hover:scale-[1.02]
        border

        ${
          color === "cyan"
            ? "border-cyan-500/20 bg-cyan-500/10"
            : color === "green"
            ? "border-green-500/20 bg-green-500/10"
            : "border-red-500/20 bg-red-500/10"
        }
      `}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm opacity-80">
            {title}
          </p>

          <h2 className="text-6xl font-black mt-4">
            {value}
          </h2>

        </div>

        {icon}

      </div>

      <div className="flex items-center gap-2 mt-6 opacity-80 font-semibold">
        Voir détail
        <ChevronRight size={18} />
      </div>

    </button>

  );
}

function TaskSection({
  title,
  subtitle,
  icon,
  tasks,
  color,
  onValidate,
  progress,
}: any) {

  const validated =
    tasks.filter(
      (t: any) =>
        t.status ===
        "validated"
    ).length;

  return (

    <div
      className={`
        rounded-[32px]
        border
        p-8
        min-h-[700px]

        ${
          color === "cyan"
            ? `
              border-cyan-500/20
              bg-cyan-500/10
            `
            : `
              border-pink-500/20
              bg-pink-500/10
            `
        }
      `}
    >

      <div className="flex items-start justify-between gap-4 mb-8">

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-3 mb-3">

            {icon}

            <h2
              className={`
                text-3xl md:text-5xl
                font-black
                leading-tight
                break-words

                ${
                  color ===
                  "cyan"
                    ? "text-cyan-300"
                    : "text-pink-300"
                }
              `}
            >
              {title}
            </h2>

          </div>

          <p className="text-zinc-300 text-lg">
            {subtitle}
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 px-5 py-4 text-center min-w-[90px]">

          <div className="text-zinc-400 text-sm">
            Total
          </div>

          <div className="text-4xl font-black">
            {tasks.length}
          </div>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">

        <StatCard
          label="Validées"
          value={validated}
        />

        <StatCard
          label="Restantes"
          value={
            tasks.length -
            validated
          }
        />

        <StatCard
          label="Progression"
          value={`${progress}%`}
        />

      </div>

      <div className="h-3 rounded-full bg-black/30 overflow-hidden mb-8">

        <div
          className={`
            h-full rounded-full

            ${
              color === "cyan"
                ? "bg-cyan-400"
                : "bg-pink-400"
            }
          `}
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">

        {tasks.map((task: any) => (

          <TaskCard
            key={task.id}
            task={task}
            onValidate={
              onValidate
            }
          />

        ))}

      </div>

    </div>

  );
}

function StatCard({
  label,
  value,
}: any) {

  return (

    <div className="rounded-2xl bg-black/20 p-4">

      <div className="text-zinc-400 text-xs">
        {label}
      </div>

      <div className="text-2xl font-black mt-1">
        {value}
      </div>

    </div>

  );
}

function TaskCard({
  task,
  onValidate,
}: any) {

  return (

    <div
      className="
        rounded-3xl
        bg-black/25
        border border-white/5
        p-5
      "
    >

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>

          <div className="flex items-center gap-3 mb-3">

            <Clock3 className="w-5 h-5 text-zinc-400" />

            <h3 className="text-2xl font-black">
              {task.title}
            </h3>

          </div>

          <div className="flex flex-wrap gap-2">

            <div className="px-3 py-1 rounded-full bg-white/5 text-zinc-300 text-sm">
              {task.frequency}
            </div>

            {task.day_of_week && (

              <div className="px-3 py-1 rounded-full bg-white/5 text-zinc-300 text-sm">
                {task.day_of_week}
              </div>

            )}

          </div>

        </div>

        {task.status ===
        "validated" ? (

          <div className="flex flex-col items-end gap-2">

            <div className="px-5 py-3 rounded-2xl bg-green-500/20 text-green-300 font-bold">
              VALIDÉE
            </div>

            {task.validated_by && (

              <div className="text-xs text-zinc-400 text-right">

                <div>
                  Par {task.validated_by}
                </div>

                {task.validated_at && (

                  <div>
                    {new Date(
                      task.validated_at
                    ).toLocaleString()}
                  </div>

                )}

              </div>

            )}

          </div>

        ) : (

          <button
            onClick={() =>
              onValidate(
                task.id
              )
            }
            className="
              px-5 py-3
              rounded-2xl
              bg-orange-500/20
              hover:bg-orange-500/30
              transition
              text-orange-300
              font-bold
            "
          >
            À FAIRE
          </button>

        )}

      </div>

    </div>

  );
}