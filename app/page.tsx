"use client";

import { useEffect, useState } from "react";

import {
  Boxes,
  AlertTriangle,
  Package,
  ShieldCheck,
  Clock3,
  Thermometer,
  Bell,
} from "lucide-react";

import { motion } from "framer-motion";

import Link from "next/link";

import { supabase } from "@/lib/supabase";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [movements, setMovements] =
    useState<any[]>([]);

  const [alerts, setAlerts] =
    useState<any[]>([]);

  const [
    openNotifications,
    setOpenNotifications,
  ] = useState(false);

  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard =
    async () => {

      const {
        data: productsData,
      } =
        await supabase
          .from(
            "traceability_products"
          )
          .select("*");

      const {
        data: movementsData,
      } =
        await supabase
          .from(
            "stock_movements"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(10);

      if (productsData) {

        setProducts(
          productsData
        );

        generateAlerts(
          productsData
        );
      }

      if (movementsData) {

        setMovements(
          movementsData
        );
      }
    };

  const generateAlerts =
    (
      data: any[]
    ) => {

      const generated: any[] =
        [];

      const today =
        new Date();

      data.forEach((item) => {

        if (item.dlc) {

          const dlcDate =
            new Date(item.dlc);

          const diffDays =
            Math.ceil(
              (
                dlcDate.getTime() -
                today.getTime()
              ) /
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
            );

          if (diffDays <= 0) {

            generated.push({
              type:
                "Critique",

              product:
                item.product,

              message:
                "Produit périmé",
            });

          } else if (
            diffDays <= 3
          ) {

            generated.push({
              type:
                "Attention",

              product:
                item.product,

              message:
                "DLC proche",
            });
          }
        }

        if (
          (item.quantity || 0) <= 2
        ) {

          generated.push({
            type:
              "Stock faible",

            product:
              item.product,

            message:
              "Stock faible",
          });
        }
      });

      setAlerts(
        generated
      );
    };

  const totalProducts =
    products.length;

  const totalQuantity =
    products.reduce(
      (
        acc,
        item
      ) =>
        acc +
        (item.quantity || 0),
      0
    );

  const criticalAlerts =
    alerts.filter(
      (a) =>
        a.type ===
        "Critique"
    );

  /* CHART DATA */
  const stockChartData =
    products.slice(0, 6).map(
      (item) => ({
        name:
          item.product,
        stock:
          item.quantity || 0,
      })
    );

  const alertsChartData = [
    {
      name: "Critiques",
      value:
        criticalAlerts.length,
    },
    {
      name: "Alertes",
      value:
        alerts.length,
    },
  ];

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            CLEAN KITCHEN AI
          </p>

        </div>

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-7xl font-black">
              Dashboard HACCP
            </h1>

            <p className="text-gray-400 mt-5 text-xl">
              Monitoring intelligent restauration
            </p>

          </div>

          {/* BELL */}
          <div className="relative">

            <button
              onClick={() =>
                setOpenNotifications(
                  !openNotifications
                )
              }
              className="
                relative

                rounded-2xl

                border
                border-red-500/20

                bg-red-500/10

                p-4
              "
            >

              <Bell className="text-red-300" />

              {alerts.length > 0 && (

                <div
                  className="
                    absolute
                    -top-2
                    -right-2

                    w-7
                    h-7

                    rounded-full

                    bg-red-500

                    flex
                    items-center
                    justify-center

                    text-xs
                    font-black
                  "
                >

                  {alerts.length}

                </div>

              )}

            </button>

          </div>

        </div>

      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-7 mb-10">

        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <Boxes className="text-cyan-300" />

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          </div>

          <p className="text-gray-400">
            Produits
          </p>

          <h2 className="text-6xl font-black mt-4">

            {totalProducts}

          </h2>

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <Package className="text-green-300" />

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

          </div>

          <p className="text-gray-400">
            Quantité totale
          </p>

          <h2 className="text-6xl font-black mt-4">

            {totalQuantity}

          </h2>

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <AlertTriangle className="text-red-300" />

            <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />

          </div>

          <p className="text-red-200">
            Alertes critiques
          </p>

          <h2 className="text-6xl font-black mt-4">

            {criticalAlerts.length}

          </h2>

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <ShieldCheck className="text-cyan-300" />

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          </div>

          <p className="text-cyan-200">
            Système HACCP
          </p>

          <h2 className="text-4xl font-black mt-6">
            ACTIF
          </h2>

        </motion.div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* STOCK CHART */}
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
          "
        >

          <h2 className="text-3xl font-black mb-8">
            Évolution stock
          </h2>

          <div className="h-[320px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={
                  stockChartData
                }
              >

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#06b6d4"
                  strokeWidth={4}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* ALERTS CHART */}
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
          "
        >

          <h2 className="text-3xl font-black mb-8">
            Analyse alertes
          </h2>

          <div className="h-[320px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  alertsChartData
                }
              >

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#ef4444"
                  radius={[
                    10,
                    10,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* QUICK ACCESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link href="/stocks">

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
              hover:scale-[1.02]
              transition-all
              cursor-pointer
            "
          >

            <p className="text-5xl mb-5">
              📦
            </p>

            <h2 className="text-2xl font-black mb-3">
              Stocks
            </h2>

            <p className="text-gray-400">
              Gestion marchandises
            </p>

          </div>

        </Link>

        <Link href="/deliveries/new">

          <div
            className="
              rounded-3xl
              border
              border-cyan-500/20
              bg-cyan-500/10
              p-7
              hover:scale-[1.02]
              transition-all
              cursor-pointer
            "
          >

            <p className="text-5xl mb-5">
              🚚
            </p>

            <h2 className="text-2xl font-black mb-3">
              Nouvelle livraison
            </h2>

            <p className="text-cyan-100/70">
              Réception fournisseur
            </p>

          </div>

        </Link>

        <Link href="/alerts">

          <div
            className="
              rounded-3xl
              border
              border-red-500/20
              bg-red-500/10
              p-7
              hover:scale-[1.02]
              transition-all
              cursor-pointer
            "
          >

            <p className="text-5xl mb-5">
              🚨
            </p>

            <h2 className="text-2xl font-black mb-3">
              Alertes
            </h2>

            <p className="text-red-200">
              Surveillance HACCP
            </p>

          </div>

        </Link>

      </div>

    </main>
  );
}