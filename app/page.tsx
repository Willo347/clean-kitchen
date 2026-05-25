"use client";

import Link from "next/link";
import {
<<<<<<< HEAD
  LayoutDashboard,
  Thermometer,
  Package,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Minus,
  Snowflake,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-white overflow-hidden">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-[320px] min-h-screen border-r border-cyan-500/10 bg-black/20 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="mb-10">
            <h1 className="text-6xl font-black leading-none">
              CLEAN
              <br />
              KITCHEN
            </h1>

            <p className="text-cyan-400 mt-4 text-xl tracking-widest">
              HACCP SYSTEM
            </p>
          </div>

          <div className="space-y-5 pb-20">
            {[
              {
                icon: LayoutDashboard,
                label: "Dashboard",
                href: "/",
              },
              {
                icon: Thermometer,
                label: "Températures",
                href: "/temperatures",
                active: true,
              },
              {
                icon: Package,
                label: "Stocks",
                href: "/stocks",
              },
              {
                icon: Truck,
                label: "Livraisons",
                href: "/deliveries/new",
              },
              {
                icon: ShieldCheck,
                label: "Traçabilité",
                href: "/traceability",
              },
              {
                icon: AlertTriangle,
                label: "Alertes",
                href: "/alerts",
              },
            ].map((item, index) => (
              <Link key={index} href={item.href}>
                <div
                  className={`rounded-[32px] p-7 mb-5 transition-all border cursor-pointer ${
                    item.active
                      ? "bg-cyan-500/20 border-cyan-400/40"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-black/20 flex items-center justify-center">
                      <item.icon className="w-10 h-10" />
                    </div>

                    <div>
                      <p className="text-3xl font-bold">{item.label}</p>

                      <p className="text-white/40 text-lg">
                        Navigation rapide
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.15),transparent_40%)]" />

          <div className="relative z-10">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-4 h-4 rounded-full bg-cyan-400" />

                <p className="text-cyan-400 text-2xl font-bold tracking-widest">
                  TABLET MODE
                </p>
              </div>

              <h1 className="text-[110px] font-black leading-none">
                Températures HACCP
              </h1>

              <p className="text-white/50 text-3xl mt-5">
                Contrôle rapide chaîne du froid
              </p>
            </div>

            {/* TOP BAR */}
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 mb-10">
              <div className="grid grid-cols-3 gap-8">
                <div className="rounded-3xl bg-black/20 border border-white/5 p-6">
                  <p className="text-white/40 mb-4 text-xl">Date début</p>

                  <div className="text-3xl">24/05/2026</div>
                </div>

                <div className="rounded-3xl bg-black/20 border border-white/5 p-6">
                  <p className="text-white/40 mb-4 text-xl">Date fin</p>

                  <div className="text-3xl">24/05/2026</div>
                </div>
=======
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function DashboardPage() {

  const [equipmentCount, setEquipmentCount] =
    useState(0);

  const [alertCount, setAlertCount] =
    useState(0);

  const [onlineCount, setOnlineCount] =
    useState(0);

  const [averageTemp, setAverageTemp] =
    useState<number | null>(null);

  async function loadDashboard() {

    // EQUIPMENTS
    const { data: equipments } = await supabase
      .from("equipments")
      .select("*");

    if (equipments) {

      setEquipmentCount(equipments.length);

      setOnlineCount(equipments.length);
    }

    // TEMPERATURES
    const { data: logs } = await supabase
      .from("temperature_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (logs && logs.length > 0) {

      const latestTemps: Record<number, number> = {};

      logs.forEach((log: any) => {

        if (
          log.equipment_id &&
          latestTemps[log.equipment_id] === undefined
        ) {
          latestTemps[log.equipment_id] =
            log.temperature;
        }

      });

      const temps =
        Object.values(latestTemps);

      // ALERTS
      let alerts = 0;

      equipments?.forEach((equipment: any) => {

        const temp =
          latestTemps[equipment.id];

        if (
          temp !== undefined &&
          (
            temp < equipment.temp_min ||
            temp > equipment.temp_max
          )
        ) {
          alerts++;
        }

      });

      setAlertCount(alerts);

      // AVERAGE
      const avg =
        temps.reduce((a, b) => a + b, 0) /
        temps.length;

      setAverageTemp(avg);
    }
  }

  useEffect(() => {

    loadDashboard();

  }, []);

  return (

    <div className="p-10">

      {/* HEADER */}

      <div className="mb-12">

        <div className="flex items-center gap-3 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400" />

          <span className="text-cyan-400 tracking-[0.25em] text-sm font-semibold uppercase">
            HACCP CONTROL CENTER
          </span>

        </div>

        <h1 className="text-7xl font-black text-white mb-4">
          Dashboard
        </h1>

        <p className="text-white/50 text-2xl">
          Supervision intelligente des opérations HACCP
        </p>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-8">

        {/* EQUIPMENTS */}

        <div
          className="
            rounded-[36px]
            border
            border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-white/50 text-xl mb-3">
                Équipements
              </p>

              <h2 className="text-6xl font-black text-white">
                {equipmentCount}
              </h2>

            </div>

            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-cyan-500/20
                flex
                items-center
                justify-center
              "
            >

              <Snowflake
                size={42}
                className="text-cyan-300"
              />

            </div>
>>>>>>> ultimate-haccp-version

                <button className="rounded-3xl bg-cyan-500 text-black font-black text-3xl">
                  Export PDF
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-8 mb-10">
              <div className="rounded-[40px] p-10 border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-xl">
                <Thermometer className="w-12 h-12 text-cyan-400 mb-10" />

                <p className="text-2xl text-white/60 mb-5">Relevés</p>

                <h2 className="text-7xl font-black">17</h2>
              </div>

              <div className="rounded-[40px] p-10 border border-green-500/20 bg-green-500/10 backdrop-blur-xl">
                <Snowflake className="w-12 h-12 text-green-400 mb-10" />

                <p className="text-2xl text-white/60 mb-5">Moyenne</p>

                <h2 className="text-7xl font-black">4.6°C</h2>
              </div>

              <div className="rounded-[40px] p-10 border border-red-500/20 bg-red-500/10 backdrop-blur-xl">
                <Thermometer className="w-12 h-12 text-red-300 mb-10" />

                <p className="text-2xl text-white/60 mb-5">Critiques</p>

                <h2 className="text-7xl font-black">3</h2>
              </div>
            </div>

            {/* EQUIPMENT */}
            <div className="rounded-[50px] border border-red-500/20 bg-red-500/10 backdrop-blur-xl p-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-6xl font-black mb-3">
                    Équipement
                  </h2>

                  <p className="text-white/40 text-2xl">
                    23/05/2026 18:45:28
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <button className="w-28 h-28 rounded-3xl bg-red-500/30 flex items-center justify-center">
                    <Minus className="w-12 h-12" />
                  </button>

                  <div className="px-14 py-8 rounded-3xl bg-red-400/30 text-6xl font-black">
                    15°C
                  </div>

                  <button className="w-28 h-28 rounded-3xl bg-green-500/30 flex items-center justify-center">
                    <Plus className="w-12 h-12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
<<<<<<< HEAD
        </main>
      </div>
=======

          <p className="text-white/40 text-lg">
            Équipements connectés au système HACCP
          </p>

        </div>

        {/* ALERTS */}

        <div
          className="
            rounded-[36px]
            border
            border-red-500/20
            bg-red-500/[0.06]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-red-300/70 text-xl mb-3">
                Alertes HACCP
              </p>

              <h2 className="text-6xl font-black text-red-300">
                {alertCount}
              </h2>

            </div>

            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-red-500/20
                flex
                items-center
                justify-center
              "
            >

              <AlertTriangle
                size={42}
                className="text-red-300"
              />

            </div>

          </div>

          <p className="text-red-200/50 text-lg">
            Températures hors conformité
          </p>

        </div>

        {/* ONLINE */}

        <div
          className="
            rounded-[36px]
            border
            border-green-500/20
            bg-green-500/[0.06]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-green-300/70 text-xl mb-3">
                Système Online
              </p>

              <h2 className="text-6xl font-black text-green-300">
                {onlineCount}
              </h2>

            </div>

            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-green-500/20
                flex
                items-center
                justify-center
              "
            >

              <CheckCircle2
                size={42}
                className="text-green-300"
              />

            </div>

          </div>

          <p className="text-green-200/50 text-lg">
            Équipements opérationnels
          </p>

        </div>

        {/* TEMP */}

        <div
          className="
            rounded-[36px]
            border
            border-blue-500/20
            bg-blue-500/[0.06]
            backdrop-blur-xl
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-blue-300/70 text-xl mb-3">
                Température Moyenne
              </p>

              <h2 className="text-6xl font-black text-blue-300">

                {averageTemp !== null
                  ? averageTemp.toFixed(1)
                  : "--"}°C

              </h2>

            </div>

            <div
              className="
                w-24
                h-24
                rounded-3xl
                bg-blue-500/20
                flex
                items-center
                justify-center
              "
            >

              <Activity
                size={42}
                className="text-blue-300"
              />

            </div>

          </div>

          <p className="text-blue-200/50 text-lg">
            Analyse temps réel HACCP
          </p>

        </div>

      </div>

>>>>>>> ultimate-haccp-version
    </div>
  );
}