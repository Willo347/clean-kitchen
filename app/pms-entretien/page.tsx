"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Flame,
  Lock,
  Plus,
  Clock3,
  ChevronRight,
  X,
  BellRing,
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
  overdue?: boolean;
};

const ADMIN_PIN = "2405";

export default function PMSEntretienPage() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  const [priority, setPriority] =
    useState("standard");

  const [dayOfWeek, setDayOfWeek] =
    useState("Lundi");

  const [activeView, setActiveView] =
    useState<
      "all" |
      "validated" |
      "pending" |
      "overdue" |
      null
    >(null);

  const [showValidationModal, setShowValidationModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [employeeName, setEmployeeName] =
    useState("");

  const [employeePin, setEmployeePin] =
    useState("");

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
      category,
      priority,
      status: "pending",
      overdue: false,
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

  async function validateTask() {

    if (
      !selectedTask ||
      !employeeName ||
      !employeePin
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
        overdue: false,
      })
      .eq("id", selectedTask.id);

    setShowValidationModal(false);

    setSelectedTask(null);

    setEmployeeName("");

    setEmployeePin("");

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

  const overdueTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.overdue === true
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

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">

          <button
            onClick={() =>
              setActiveView("all")
            }
            className="
              rounded-3xl
              border border-cyan-500/20
              bg-cyan-500/10
              p-6
              hover:scale-[1.02]
              transition
              text-left
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-cyan-300 text-sm">
                  Tâches totales
                </p>

                <h2 className="text-6xl font-black mt-4">
                  {tasks.length}
                </h2>

              </div>

              <ClipboardList className="text-cyan-400 w-10 h-10" />

            </div>

            <div className="flex items-center gap-2 text-cyan-300 mt-6 font-semibold">
              Voir détail
              <ChevronRight size={18} />
            </div>

          </button>

          <button
            onClick={() =>
              setActiveView(
                "validated"
              )
            }
            className="
              rounded-3xl
              border border-green-500/20
              bg-green-500/10
              p-6
              hover:scale-[1.02]
              transition
              text-left
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-green-300 text-sm">
                  Validées
                </p>

                <h2 className="text-6xl font-black mt-4">
                  {
                    validatedTasks.length
                  }
                </h2>

              </div>

              <CheckCircle2 className="text-green-400 w-10 h-10" />

            </div>

          </button>

          <button
            onClick={() =>
              setActiveView(
                "pending"
              )
            }
            className="
              rounded-3xl
              border border-orange-500/20
              bg-orange-500/10
              p-6
              hover:scale-[1.02]
              transition
              text-left
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-orange-300 text-sm">
                  À faire
                </p>

                <h2 className="text-6xl font-black mt-4">
                  {
                    pendingTasks.length
                  }
                </h2>

              </div>

              <Clock3 className="text-orange-400 w-10 h-10" />

            </div>

          </button>

          <button
            onClick={() =>
              setActiveView(
                "overdue"
              )
            }
            className="
              rounded-3xl
              border border-pink-500/20
              bg-pink-500/10
              p-6
              hover:scale-[1.02]
              transition
              text-left
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-pink-300 text-sm">
                  En retard
                </p>

                <h2 className="text-6xl font-black mt-4">
                  {
                    overdueTasks.length
                  }
                </h2>

              </div>

              <BellRing className="text-pink-400 w-10 h-10" />

            </div>

          </button>

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
                    "Tâches à faire"}

                  {activeView ===
                    "overdue" &&
                    "Tâches en retard"}

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
                  hover:bg-white/10
                  transition
                "
              >
                <X />
              </button>

            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">

              {(activeView === "all"
                ? tasks
                : activeView ===
                  "validated"
                ? validatedTasks
                : activeView ===
                  "pending"
                ? pendingTasks
                : overdueTasks
              ).map((task) => (

                <div
                  key={task.id}
                  className="
                    rounded-3xl
                    bg-black/30
                    border border-white/5
                    p-5
                  "
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-2xl font-black">
                        {task.title}
                      </h3>

                      <div className="flex gap-2 mt-3 flex-wrap">

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

                      <div className="text-right">

                        <div className="px-5 py-3 rounded-2xl bg-green-500/20 text-green-300 font-bold">
                          VALIDÉE
                        </div>

                      </div>

                    ) : (

                      <button
                        onClick={() => {

                          setSelectedTask(task);

                          setShowValidationModal(true);
                        }}
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

              <div className="flex gap-3">

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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

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

              </div>

            </div>

          )}

        </div>

        {/* TASKS */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          <TaskSection
            title="Opérationnel"
            subtitle="Tâches cuisine"
            color="cyan"
            icon={
              <Sparkles className="text-cyan-300 w-7 h-7" />
            }
            tasks={
              operationnelles
            }
            progress={progress(
              operationnelles.length,
              operationnelles.filter(
                (t) =>
                  t.status ===
                  "validated"
              ).length
            )}
            setSelectedTask={
              setSelectedTask
            }
            setShowValidationModal={
              setShowValidationModal
            }
          />

          <TaskSection
            title="Entretien périodique"
            subtitle="Entretien HACCP"
            color="pink"
            icon={
              <Flame className="text-pink-300 w-7 h-7" />
            }
            tasks={
              periodiques
            }
            progress={progress(
              periodiques.length,
              periodiques.filter(
                (t) =>
                  t.status ===
                  "validated"
              ).length
            )}
            setSelectedTask={
              setSelectedTask
            }
            setShowValidationModal={
              setShowValidationModal
            }
          />

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

              <input
                type="password"
                value={employeePin}
                onChange={(e) =>
                  setEmployeePin(
                    e.target.value
                  )
                }
                placeholder="Code PIN"
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

function TaskSection({
  title,
  subtitle,
  icon,
  tasks,
  color,
  progress,
  setSelectedTask,
  setShowValidationModal,
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
        backdrop-blur-xl

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

        <div className="rounded-2xl bg-black/20 p-4">

          <div className="text-zinc-400 text-xs">
            Validées
          </div>

          <div className="text-2xl font-black mt-1">
            {validated}
          </div>

        </div>

        <div className="rounded-2xl bg-black/20 p-4">

          <div className="text-zinc-400 text-xs">
            Restantes
          </div>

          <div className="text-2xl font-black mt-1">
            {tasks.length -
              validated}
          </div>

        </div>

        <div className="rounded-2xl bg-black/20 p-4">

          <div className="text-zinc-400 text-xs">
            Progression
          </div>

          <div className="text-2xl font-black mt-1">
            {progress}%
          </div>

        </div>

      </div>

      <div className="h-3 rounded-full bg-black/30 overflow-hidden mb-8">

        <div
          className={`
            h-full
            rounded-full
            transition-all

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

          <div
            key={task.id}
            className="
              rounded-3xl
              bg-black/25
              border border-white/5
              p-5
              hover:bg-black/40
              transition
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

                    <div className="text-right text-xs text-zinc-400 leading-tight">

                      <div>
                        Par {task.validated_by}
                      </div>

                      {task.validated_at && (

                        <div>
                          {new Date(
                            task.validated_at
                          ).toLocaleDateString("fr-FR")}{" "}
                          {new Date(
                            task.validated_at
                          ).toLocaleTimeString("fr-FR")}
                        </div>

                      )}

                    </div>

                  )}

                </div>

              ) : (

                <button
                  onClick={() => {

                    setSelectedTask(task);

                    setShowValidationModal(true);
                  }}
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

        ))}

      </div>

    </div>

  );
}