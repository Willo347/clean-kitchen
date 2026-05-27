"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Activity,
  AlertTriangle,
  Box,
  ClipboardCheck,
  Truck,
  Waves,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { supabase } from "@/lib/supabase";

export default function DashboardPage() {

  const [averageTemp, setAverageTemp] =
    useState(0);

  const [alertCount, setAlertCount] =
    useState(0);

  const [lowStockCount, setLowStockCount] =
    useState(0);

  const [deliveryCount, setDeliveryCount] =
    useState(0);

  const [pmsCount, setPmsCount] =
    useState(0);

  const [onlineModules] =
    useState(8);

  const [chartData, setChartData] =
    useState<any[]>([]);

  async function loadDashboard() {

    // =========================
    // TEMPERATURES
    // =========================

    const { data: logs } =
      await supabase
        .from("temperature_logs")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

    const { data: equipments } =
      await supabase
        .from("equipments")
        .select("*");

    if (logs && logs.length > 0) {

      const latestTemps:
        Record<number, number> = {};

      logs
        .slice()
        .reverse()
        .forEach((log: any) => {

          let equipmentId =
            log.equipment_id;

          // compatibilité anciens logs
          if (
            !equipmentId &&
            log.equipment &&
            equipments
          ) {

            const found =
              equipments.find(
                (eq: any) =>
                  eq.name?.toLowerCase() ===
                  log.equipment?.toLowerCase()
              );

            if (found) {
              equipmentId =
                found.id;
            }

          }

          if (
            equipmentId &&
            latestTemps[
              equipmentId
            ] === undefined
          ) {

            latestTemps[
              equipmentId
            ] = Number(
              log.temperature
            );

          }

        });

      // =========================
      // MOYENNE
      // =========================

      const temps =
        Object.values(
          latestTemps
        )
          .map(Number)
          .filter(
            (t) => !isNaN(t)
          );

      if (temps.length > 0) {

        const avg =
          temps.reduce(
            (a, b) => a + b,
            0
          ) / temps.length;

        setAverageTemp(avg);

      } else {

        setAverageTemp(0);

      }

      // =========================
      // ALERTES HACCP
      // =========================

      let alerts = 0;

      equipments?.forEach(
        (equipment: any) => {

          const temp =
            latestTemps[
              equipment.id
            ];

          if (
            temp !== undefined &&
            (
              temp <
                equipment.temp_min ||
              temp >
                equipment.temp_max
            )
          ) {

            alerts++;

          }

        }
      );

      setAlertCount(alerts);

      // =========================
      // CHART LIVE
      // =========================

      const formatted =
        logs
          .slice(-10)
          .map(
            (
              log: any,
              index: number
            ) => ({

              name: `${index + 1}`,

              temperature:
                Number(
                  log.temperature
                ) || 0,

            })
          );

      setChartData(formatted);

    }

    // =========================
    // STOCKS
    // =========================

    const { data: products } =
      await supabase
        .from("products")
        .select("*");

    if (products) {

      const lowStock =
        products.filter(
          (product: any) => {

            // nouvelles colonnes
            const currentStock =
              Number(
                product.current_stock
              );

            const minimumStock =
              Number(
                product.minimum_stock
              );

            // fallback anciennes colonnes
            const quantity =
              Number(
                product.quantity
              );

            const minQuantity =
              Number(
                product.min_quantity
              );

            // priorité nouvelles colonnes
            const finalCurrent =
              !isNaN(currentStock)
                ? currentStock
                : quantity;

            const finalMin =
              !isNaN(minimumStock)
                ? minimumStock
                : minQuantity;

            return (
              finalCurrent <=
              finalMin
            );

          }
        ).length;

      setLowStockCount(
        lowStock
      );

    }

    // =========================
    // PMS
    // =========================

    const { data: tasks } =
      await supabase
        .from("pms_tasks")
        .select("*");

    if (tasks) {

      const pending =
        tasks.filter(
          (task: any) =>
            task.status !==
            "completed"
        ).length;

      setPmsCount(
        pending
      );

    }

    // =========================
    // DELIVERIES
    // =========================

    const { data: deliveries } =
      await supabase
        .from("deliveries")
        .select("*");

    if (deliveries) {

      setDeliveryCount(
        deliveries.length
      );

    }

  }

  useEffect(() => {

    loadDashboard();

    // =========================
    // REALTIME
    // =========================

    const channel =
      supabase.channel(
        "dashboard-live"
      );

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "temperature_logs",
        },
        () => {

          loadDashboard();

        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {

          loadDashboard();

        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pms_tasks",
        },
        () => {

          loadDashboard();

        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
        },
        () => {

          loadDashboard();

        }
      )
      .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, []);

  const statusColor =
    useMemo(() => {

      if (alertCount > 0)
        return "text-red-400";

      return "text-emerald-400";

    }, [alertCount]);

  return (

    <div className="space-y-8 pb-20">

      {/* HEADER */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

        <div>

          <div className="flex items-center gap-3 mb-4">

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

            <span className="text-cyan-400 tracking-[0.3em] uppercase text-xs font-bold">
              CLEAN KITCHEN SYSTEM
            </span>

          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4">
            Dashboard
          </h1>

          <p className="text-white/50 text-lg md:text-2xl">
            Centre de contrôle HACCP intelligent
          </p>

        </div>

        <div
          className="
            rounded-[30px]
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-8
            py-6
            backdrop-blur-xl
          "
        >

          <div className="flex items-center gap-4">

            <div className="w-5 h-5 rounded-full bg-emerald-400 animate-pulse" />

            <div>

              <p className="text-emerald-300 tracking-[0.2em] uppercase text-sm font-bold">
                Système opérationnel
              </p>

              <p className="text-white/60 mt-1">
                Tous les modules sont synchronisés
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* PMS */}

        <Link href="/pms-entretien">

          <div className="rounded-[34px] border border-cyan-500/20 bg-cyan-500/[0.05] p-7 backdrop-blur-xl hover:scale-[1.02] transition cursor-pointer h-full">

            <div className="flex items-center justify-between mb-6">

              <div>

                <p className="text-cyan-300 tracking-[0.25em] uppercase text-sm font-bold mb-4">
                  PMS ENTRETIEN
                </p>

                <h2 className="text-6xl font-black text-white">
                  {pmsCount}
                </h2>

              </div>

              <ClipboardCheck
                size={46}
                className="text-cyan-300"
              />

            </div>

            <p className="text-white/60 text-2xl font-semibold leading-tight mb-8">
              tâches à effectuer
            </p>

          </div>

        </Link>

        {/* TEMP */}

        <Link href="/temperatures">

          <div className="rounded-[34px] border border-orange-500/20 bg-orange-500/[0.05] p-7 backdrop-blur-xl hover:scale-[1.02] transition cursor-pointer h-full">

            <div className="flex items-center justify-between mb-6">

              <div>

                <p className="text-orange-300 tracking-[0.25em] uppercase text-sm font-bold mb-4">
                  TEMPÉRATURES
                </p>

                <h2 className="text-6xl font-black text-white">
                  {alertCount}
                </h2>

              </div>

              <Activity
                size={46}
                className="text-orange-300"
              />

            </div>

            <p className="text-white/60 text-2xl font-semibold leading-tight mb-8">
              alertes actives
            </p>

          </div>

        </Link>

        {/* STOCK */}

        <Link href="/stocks">

          <div className="rounded-[34px] border border-pink-500/20 bg-pink-500/[0.05] p-7 backdrop-blur-xl hover:scale-[1.02] transition cursor-pointer h-full">

            <div className="flex items-center justify-between mb-6">

              <div>

                <p className="text-pink-300 tracking-[0.25em] uppercase text-sm font-bold mb-4">
                  STOCKS
                </p>

                <h2 className="text-6xl font-black text-white">
                  {lowStockCount}
                </h2>

              </div>

              <Box
                size={46}
                className="text-pink-300"
              />

            </div>

            <p className="text-white/60 text-2xl font-semibold leading-tight mb-8">
              produits faibles
            </p>

          </div>

        </Link>

        {/* DELIVERIES */}

        <Link href="/deliveries">

          <div className="rounded-[34px] border border-violet-500/20 bg-violet-500/[0.05] p-7 backdrop-blur-xl hover:scale-[1.02] transition cursor-pointer h-full">

            <div className="flex items-center justify-between mb-6">

              <div>

                <p className="text-violet-300 tracking-[0.25em] uppercase text-sm font-bold mb-4">
                  LIVRAISONS
                </p>

                <h2 className="text-6xl font-black text-white">
                  {deliveryCount}
                </h2>

              </div>

              <Truck
                size={46}
                className="text-violet-300"
              />

            </div>

            <p className="text-white/60 text-2xl font-semibold leading-tight mb-8">
              réceptions du jour
            </p>

          </div>

        </Link>

      </div>

      {/* MONITORING */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.7fr] gap-6">

        {/* CONTROL CENTER */}

        <div className="rounded-[38px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 overflow-hidden">

          <div className="flex items-start justify-between mb-8">

            <div>

              <div className="flex items-center gap-3 mb-4">

                <Waves
                  size={18}
                  className="text-cyan-400"
                />

                <span className="text-cyan-400 tracking-[0.25em] uppercase text-sm font-bold">
                  Monitoring live
                </span>

              </div>

              <h2 className="text-6xl font-black text-white leading-none">
                Centre de contrôle
              </h2>

            </div>

          </div>

          {/* CHART */}

          <div className="h-[360px] rounded-[34px] bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-white/5 p-6 mb-6">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart data={chartData}>

                <defs>

                  <linearGradient
                    id="temp"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#22d3ee"
                      stopOpacity={0.8}
                    />

                    <stop
                      offset="100%"
                      stopColor="#22d3ee"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#ffffff30"
                />

                <YAxis
                  stroke="#ffffff30"
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#22d3ee"
                  strokeWidth={5}
                  fill="url(#temp)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

          {/* STATS */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="rounded-[24px] bg-cyan-500/10 p-6 border border-cyan-500/10">

              <p className="text-white/50 mb-3">
                Température
              </p>

              <h3 className="text-5xl font-black text-white leading-none break-words">
                {averageTemp.toFixed(1)}°C
              </h3>

            </div>

            <div className="rounded-[24px] bg-red-500/10 p-6 border border-red-500/10">

              <p className="text-white/50 mb-3">
                Alertes
              </p>

              <h3 className="text-5xl font-black text-red-300 leading-none">
                {alertCount}
              </h3>

            </div>

            <div className="rounded-[24px] bg-emerald-500/10 p-6 border border-emerald-500/10">

              <p className="text-white/50 mb-3">
                Modules
              </p>

              <h3 className="text-5xl font-black text-emerald-300 leading-none">
                {onlineModules}
              </h3>

            </div>

            <div className="rounded-[24px] bg-violet-500/10 p-6 border border-violet-500/10">

              <p className="text-white/50 mb-3">
                Sync
              </p>

              <h3 className="text-5xl font-black text-violet-300 leading-none">
                OK
              </h3>

            </div>

          </div>

        </div>

        {/* JOURNAL */}

        <div className="rounded-[38px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">

          <div className="flex items-center gap-3 mb-5">

            <Activity
              size={18}
              className="text-pink-400"
            />

            <span className="text-pink-400 tracking-[0.25em] uppercase text-sm font-bold">
              Activité récente
            </span>

          </div>

          <h2 className="text-6xl font-black text-white leading-none mb-8">
            Journal live
          </h2>

          <div className="space-y-5">

            <div className="rounded-[28px] bg-white/[0.04] border border-white/5 p-6">

              <h3 className="text-3xl font-black text-white mb-2">
                PMS validé
              </h3>

              <p className="text-white/40 text-xl">
                Cuisine froide • il y a 2 min
              </p>

            </div>

            <div className="rounded-[28px] bg-white/[0.04] border border-white/5 p-6">

              <h3 className="text-3xl font-black text-white mb-2">
                Contrôle température
              </h3>

              <p className="text-white/40 text-xl">
                Chambre froide positive
              </p>

            </div>

            <div className="rounded-[28px] bg-white/[0.04] border border-white/5 p-6">

              <h3 className="text-3xl font-black text-white mb-2">
                Livraison reçue
              </h3>

              <p className="text-white/40 text-xl">
                Fournisseur validé HACCP
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}