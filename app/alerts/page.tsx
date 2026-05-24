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

  const [alerts, setAlerts] =
    useState<any[]>([]);

  useEffect(() => {

    generateAlerts();

  }, []);

  const generateAlerts =
    async () => {

      const { data } =
        await supabase
          .from(
            "traceability_products"
          )
          .select("*");

      if (!data)
        return;

      /* FIX TYPESCRIPT */
      const generatedAlerts: any[] =
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

          /* EXPIRED */
          if (diffDays <= 0) {

            generatedAlerts.push({
              type:
                "DLC expirée",

              level:
                "Critique",

              product:
                item.product,

              message:
                `Produit périmé depuis ${Math.abs(diffDays)} jour(s)`,

              color:
                "red",
            });

          }

          /* WARNING */
          else if (
            diffDays <= 3
          ) {

            generatedAlerts.push({
              type:
                "DLC proche",

              level:
                "Attention",

              product:
                item.product,

              message:
                `Expire dans ${diffDays} jour(s)`,

              color:
                "orange",
            });
          }
        }

        /* LOW STOCK */
        if (
          (item.quantity || 0) <= 2
        ) {

          generatedAlerts.push({
            type:
              "Stock faible",

            level:
              "Attention",

            product:
              item.product,

            message:
              `Stock faible : ${item.quantity} ${item.unit}`,

            color:
              "yellow",
          });
        }
      });

      setAlerts(
        generatedAlerts
      );
    };

  const criticalAlerts =
    alerts.filter(
      (a) =>
        a.level ===
        "Critique"
    );

  const warningAlerts =
    alerts.filter(
      (a) =>
        a.level ===
        "Attention"
    );

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

        {/* CRITICAL */}
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

            {criticalAlerts.length}

          </h2>

        </motion.div>

        {/* WARNING */}
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

              <Thermometer className="text-orange-300" />

            </div>

            <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />

          </div>

          <p className="text-orange-200">
            Alertes attention
          </p>

          <h2 className="text-6xl font-black mt-4">

            {warningAlerts.length}

          </h2>

        </motion.div>

        {/* SYSTEM */}
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

          <h2 className="text-4xl font-black mt-6">
            ACTIF
          </h2>

        </motion.div>

      </div>

      {/* LIST */}
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

          {alerts.map(
            (
              alert,
              index
            ) => (

              <motion.div
                key={index}
                whileHover={{
                  scale: 1.01,
                }}
                className={`
                  flex
                  items-center
                  justify-between

                  rounded-2xl
                  border
                  p-5

                  ${
                    alert.color ===
                    "red"

                      ? "border-red-500/10 bg-red-500/5"

                      : alert.color ===
                        "orange"

                        ? "border-orange-500/10 bg-orange-500/5"

                        : "border-yellow-500/10 bg-yellow-500/5"
                  }
                `}
              >

                <div className="flex items-center gap-5">

                  <div
                    className={`
                      p-4
                      rounded-2xl

                      ${
                        alert.color ===
                        "red"

                          ? "bg-red-500/20"

                          : alert.color ===
                            "orange"

                            ? "bg-orange-500/20"

                            : "bg-yellow-500/20"
                      }
                    `}
                  >

                    <AlertTriangle
                      className={`
                        ${
                          alert.color ===
                          "red"

                            ? "text-red-400"

                            : alert.color ===
                              "orange"

                              ? "text-orange-300"

                              : "text-yellow-300"
                        }
                      `}
                    />

                  </div>

                  <div>

                    <h3 className="text-xl font-bold">

                      {alert.product}

                    </h3>

                    <p className="text-gray-400 mt-1">

                      {alert.message}

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-8">

                  <div
                    className={`
                      px-4
                      py-2
                      rounded-2xl
                      font-bold

                      ${
                        alert.level ===
                        "Critique"

                          ? "bg-red-500/20 text-red-300"

                          : "bg-orange-500/20 text-orange-300"
                      }
                    `}
                  >

                    {alert.level}

                  </div>

                  <div className="flex items-center gap-2 text-gray-400">

                    <Clock3 className="w-4 h-4" />

                    <span className="text-sm">
                      Temps réel
                    </span>

                  </div>

                </div>

              </motion.div>
            )
          )}

          {alerts.length === 0 && (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-20
              "
            >

              <Package className="w-16 h-16 text-cyan-300 mb-6" />

              <h3 className="text-3xl font-black mb-3">
                Aucune alerte
              </h3>

              <p className="text-gray-400">
                Tous les produits sont conformes
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}