"use client";

import { useEffect, useState } from "react";

import {
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock3,
  Package,
} from "lucide-react";

import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";

export default function HistoryPage() {

  const [movements, setMovements] =
    useState<any[]>([]);

  useEffect(() => {

    fetchMovements();

  }, []);

  const fetchMovements =
    async () => {

      const { data } =
        await supabase
          .from("stock_movements")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (data) {

        setMovements(data);
      }
    };

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            HISTORY CENTER
          </p>

        </div>

        <h1 className="text-7xl font-black">
          Historique
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Historique des mouvements de stock et livraisons
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-10">

        {/* TOTAL */}
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-7
          "
        >

          <div className="flex items-center justify-between mb-6">

            <p className="text-gray-400 font-semibold">
              Mouvements
            </p>

            <History className="text-cyan-300" />

          </div>

          <h2 className="text-6xl font-black">
            {movements.length}
          </h2>

        </div>

        {/* ENTRIES */}
        <div
          className="
            rounded-3xl
            border
            border-green-500/20
            bg-green-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-6">

            <p className="text-green-200 font-semibold">
              Entrées
            </p>

            <ArrowDownCircle className="text-green-300" />

          </div>

          <h2 className="text-6xl font-black">

            {
              movements.filter(
                (m) =>
                  m.movement_type ===
                  "Entrée"
              ).length
            }

          </h2>

        </div>

        {/* OUTPUTS */}
        <div
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-6">

            <p className="text-red-200 font-semibold">
              Sorties
            </p>

            <ArrowUpCircle className="text-red-300" />

          </div>

          <h2 className="text-6xl font-black">

            {
              movements.filter(
                (m) =>
                  m.movement_type ===
                  "Sortie"
              ).length
            }

          </h2>

        </div>

      </div>

      {/* LIST */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          overflow-hidden
        "
      >

        <div
          className="
            grid
            grid-cols-[2fr_1fr_1fr_1fr]
            border-b
            border-white/10
            px-8
            py-6
            text-gray-400
            font-semibold
          "
        >

          <div>Produit</div>
          <div>Type</div>
          <div>Quantité</div>
          <div>Date</div>

        </div>

        {movements.map(
          (movement, index) => (

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                grid
                grid-cols-[2fr_1fr_1fr_1fr]

                items-center

                px-8
                py-6

                border-b
                border-white/5
              "
            >

              {/* PRODUCT */}
              <div className="flex items-center gap-4">

                <div
                  className="
                    bg-cyan-500/20
                    p-3
                    rounded-2xl
                  "
                >

                  <Package className="text-cyan-300" />

                </div>

                <div>

                  <p className="font-bold text-lg">
                    {movement.product}
                  </p>

                </div>

              </div>

              {/* TYPE */}
              <div>

                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2

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

                      ? (
                        <ArrowDownCircle className="w-5 h-5" />
                      )

                      : (
                        <ArrowUpCircle className="w-5 h-5" />
                      )
                  }

                  {movement.movement_type}

                </div>

              </div>

              {/* QUANTITY */}
              <div className="font-bold">

                {movement.quantity}
                {" "}
                {movement.unit}

              </div>

              {/* DATE */}
              <div className="flex items-center gap-3 text-gray-400">

                <Clock3 className="w-5 h-5" />

                {new Date(
                  movement.created_at
                ).toLocaleString("fr-FR")}

              </div>

            </motion.div>
          )
        )}

      </div>

    </main>
  );
}