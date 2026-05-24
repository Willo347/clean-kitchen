"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  AlertTriangle,
  Thermometer,
  ShieldAlert,
  Clock3,
  Package,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function AlertsPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    const { data } =
      await supabase
        .from("traceability_products")
        .select("*");

    if (data) {

      setProducts(data);
    }
  };

  const today =
    new Date();

  const stockAlerts =
    products.filter(
      (item) =>
        (item.quantity || 0) <= 2
    );

  const dlcAlerts =
    products.filter((item) => {

      if (!item.dlc)
        return false;

      const parts =
        item.dlc.split("/");

      if (
        parts.length !== 3
      )
        return false;

      const date =
        new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );

      const diffDays =
        Math.ceil(
          (
            date.getTime() -
            today.getTime()
          ) /
          (1000 * 60 * 60 * 24)
        );

      return diffDays <= 3;
    });

  const totalAlerts =
    stockAlerts.length +
    dlcAlerts.length;

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-red-400 animate-pulse" />

          <p className="text-red-400 font-semibold tracking-widest uppercase">
            ALERT CENTER
          </p>

        </div>

        <h1 className="text-7xl font-black tracking-tight">
          Alertes HACCP
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Surveillance intelligente des anomalies critiques
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-10">

        {/* TOTAL */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-gradient-to-br
            from-red-500/20
            to-red-900/10
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
            {totalAlerts}
          </h2>

        </motion.div>

        {/* STOCK */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-orange-500/20
            bg-gradient-to-br
            from-orange-500/20
            to-yellow-900/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div className="bg-orange-500/20 p-4 rounded-2xl">

              <Package className="text-orange-300" />

            </div>

            <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />

          </div>

          <p className="text-orange-200">
            Stocks faibles
          </p>

          <h2 className="text-6xl font-black mt-4">
            {stockAlerts.length}
          </h2>

        </motion.div>

        {/* HACCP */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-gradient-to-br
            from-cyan-500/20
            to-blue-900/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div className="bg-cyan-500/20 p-4 rounded-2xl">

              <ShieldAlert className="text-cyan-300" />

            </div>

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          </div>

          <p className="text-cyan-200">
            Système HACCP
          </p>

          <h2 className="text-5xl font-black mt-4">
            Actif
          </h2>

        </motion.div>

      </div>

      {/* ALERT LIST */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-2xl
          p-8
        "
      >

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-black">
            Activité des alertes
          </h2>

          <div
            className="
              bg-red-500/10
              border
              border-red-500/20
              px-5
              py-2
              rounded-2xl
              text-red-300
              text-sm
              font-semibold
            "
          >
            LIVE MONITORING
          </div>

        </div>

        <div className="space-y-5">

          {/* STOCK ALERTS */}
          {stockAlerts.map((item, index) => (

            <motion.div
              key={index}
              whileHover={{
                scale: 1.01,
              }}
              className="
                flex
                items-center
                justify-between

                rounded-2xl

                border
                border-orange-500/10

                bg-orange-500/5

                p-5
              "
            >

              <div className="flex items-center gap-5">

                <div className="bg-orange-500/20 p-4 rounded-2xl">

                  <Package className="text-orange-300" />

                </div>

                <div>

                  <h3 className="text-xl font-bold">
                    Stock faible
                  </h3>

                  <p className="text-gray-400 mt-1">

                    {item.product}
                    {" "}
                    :
                    {" "}
                    {item.quantity}
                    {" "}
                    {item.unit}

                  </p>

                </div>

              </div>

              <div className="text-orange-300 font-bold">
                Attention
              </div>

            </motion.div>

          ))}

          {/* DLC ALERTS */}
          {dlcAlerts.map((item, index) => (

            <motion.div
              key={index}
              whileHover={{
                scale: 1.01,
              }}
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

              <div className="flex items-center gap-5">

                <div className="bg-red-500/20 p-4 rounded-2xl">

                  <AlertTriangle className="text-red-300" />

                </div>

                <div>

                  <h3 className="text-xl font-bold">
                    DLC proche
                  </h3>

                  <p className="text-gray-400 mt-1">

                    {item.product}
                    {" "}
                    expire le
                    {" "}
                    {item.dlc}

                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 text-gray-400">

                <Clock3 className="w-4 h-4" />

                <span className="text-sm">
                  Surveillance active
                </span>

              </div>

            </motion.div>

          ))}

          {totalAlerts === 0 && (

            <div
              className="
                rounded-3xl
                border
                border-green-500/20
                bg-green-500/10
                p-8
                text-center
              "
            >

              <h3 className="text-3xl font-black text-green-300 mb-3">
                Aucun problème détecté
              </h3>

              <p className="text-green-200/70">
                Tous les systèmes sont conformes.
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}