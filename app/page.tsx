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

      /* PRODUCTS */
      const {
        data: productsData,
      } =
        await supabase
          .from(
            "traceability_products"
          )
          .select("*");

      /* MOVEMENTS */
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
          .limit(5);

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

        /* DLC */
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

        /* LOW STOCK */
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

          {/* ALERT BELL */}
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

            {/* DROPDOWN */}
            {openNotifications && (

              <div
                className="
                  absolute
                  right-0
                  top-20

                  w-[420px]

                  rounded-3xl

                  border
                  border-white/10

                  bg-[#071120]

                  shadow-2xl

                  p-6

                  z-50
                "
              >

                <div className="flex items-center justify-between mb-6">

                  <h3 className="text-2xl font-black">
                    Notifications
                  </h3>

                  <div
                    className="
                      px-3
                      py-1

                      rounded-xl

                      bg-red-500/10

                      text-red-300
                      text-sm
                      font-bold
                    "
                  >

                    {alerts.length} alertes

                  </div>

                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">

                  {alerts.slice(0, 6).map(
                    (
                      alert,
                      index
                    ) => (

                      <div
                        key={index}
                        className="
                          rounded-2xl

                          border
                          border-white/10

                          bg-white/[0.03]

                          p-4
                        "
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="font-bold">

                              {alert.product}

                            </p>

                            <p className="text-gray-400 text-sm mt-1">

                              {alert.message}

                            </p>

                          </div>

                          <AlertTriangle className="text-red-300 w-5 h-5" />

                        </div>

                      </div>
                    )
                  )}

                  {alerts.length === 0 && (

                    <div className="text-center py-10">

                      <ShieldCheck className="w-12 h-12 text-cyan-300 mx-auto mb-4" />

                      <p className="font-bold text-xl">
                        Aucun problème
                      </p>

                      <p className="text-gray-400 mt-2">
                        Tout est conforme
                      </p>

                    </div>

                  )}

                </div>

              </div>

            )}

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

            <div className="bg-cyan-500/20 p-4 rounded-2xl">

              <Boxes className="text-cyan-300" />

            </div>

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

            <div className="bg-green-500/20 p-4 rounded-2xl">

              <Package className="text-green-300" />

            </div>

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

            <div className="bg-red-500/20 p-4 rounded-2xl">

              <AlertTriangle className="text-red-300" />

            </div>

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

            <div className="bg-cyan-500/20 p-4 rounded-2xl">

              <ShieldCheck className="text-cyan-300" />

            </div>

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

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* ACTIVITY */}
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-3xl font-black">
              Activité récente
            </h2>

            <Clock3 className="text-cyan-300" />

          </div>

          <div className="space-y-5">

            {movements.map(
              (
                movement,
                index
              ) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center
                    justify-between

                    rounded-2xl

                    border
                    border-white/10

                    bg-white/[0.03]

                    p-5
                  "
                >

                  <div>

                    <p className="font-bold text-lg">

                      {
                        movement.product
                      }

                    </p>

                    <p className="text-gray-400 text-sm mt-1">

                      {
                        movement.movement_type
                      }

                    </p>

                  </div>

                  <div
                    className={`
                      px-4
                      py-2
                      rounded-2xl
                      font-bold

                      ${
                        movement.movement_type ===
                        "Entrée"

                          ? "bg-green-500/10 text-green-300"

                          : "bg-red-500/10 text-red-300"
                      }
                    `}
                  >

                    {
                      movement.movement_type ===
                      "Entrée"

                        ? "+"

                        : "-"
                    }

                    {
                      movement.quantity
                    }

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* ALERTS */}
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-3xl font-black">
              Alertes HACCP
            </h2>

            <Thermometer className="text-red-300" />

          </div>

          <div className="space-y-5">

            {alerts.slice(0, 5).map(
              (
                alert,
                index
              ) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center
                    justify-between

                    rounded-2xl

                    border
                    border-red-500/10

                    bg-red-500/5

                    p-5
                  "
                >

                  <div>

                    <p className="font-bold text-lg">

                      {alert.product}

                    </p>

                    <p className="text-gray-400 text-sm mt-1">

                      {alert.message}

                    </p>

                  </div>

                  <AlertTriangle className="text-red-300" />

                </div>
              )
            )}

            {alerts.length === 0 && (

              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center

                  py-16
                "
              >

                <ShieldCheck className="w-16 h-16 text-cyan-300 mb-5" />

                <h3 className="text-2xl font-black mb-2">
                  Aucun problème détecté
                </h3>

                <p className="text-gray-400">
                  Tous les systèmes sont conformes
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* QUICK ACCESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

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