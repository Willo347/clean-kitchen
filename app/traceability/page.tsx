"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Package,
  Thermometer,
  Truck,
  Plus,
  X,
} from "lucide-react";

const categories = [
  {
    name: "Viande",
    emoji: "🥩",
  },

  {
    name: "Poisson",
    emoji: "🐟",
  },

  {
    name: "Surgelé",
    emoji: "🥶",
  },

  {
    name: "Fruits & légumes",
    emoji: "🥬",
  },

  {
    name: "Produits laitiers",
    emoji: "🧀",
  },

  {
    name: "Produits secs",
    emoji: "🥫",
  },

  {
    name: "Desserts",
    emoji: "🍰",
  },

  {
    name: "Boulangerie",
    emoji: "🍞",
  },
];

const traceabilityItems = [
  {
    product: "Poulet frais",
    lot: "LOT-2458",
    supplier: "Metro",
    temperature: "3°C",
    dlc: "28/05/2026",
    status: "ok",
  },

  {
    product: "Saumon fumé",
    lot: "LOT-9182",
    supplier: "Pomona",
    temperature: "7°C",
    dlc: "25/05/2026",
    status: "warning",
  },

  {
    product: "Mozzarella",
    lot: "LOT-5521",
    supplier: "Transgourmet",
    temperature: "4°C",
    dlc: "02/06/2026",
    status: "ok",
  },
];

export default function TraceabilityPage() {

  const [open, setOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">

        <div>

          <div className="flex items-center gap-4 mb-4">

            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

            <p className="text-cyan-400 font-semibold tracking-widest uppercase">
              TRACEABILITY CENTER
            </p>

          </div>

          <h1 className="text-7xl font-black tracking-tight">
            Traçabilité
          </h1>

          <p className="text-gray-400 mt-5 text-xl">
            Gestion intelligente des produits, lots et DLC
          </p>

        </div>

        {/* BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className="
            flex
            items-center
            gap-3

            rounded-2xl

            bg-cyan-500

            px-6
            py-4

            text-black
            font-bold
            text-lg

            hover:scale-105

            transition-all
          "
        >

          <Plus className="w-6 h-6" />

          Ajouter produit

        </button>

      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-10">

        {/* CARD */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-2xl
            p-7
          "
        >

          <div className="flex items-center justify-between mb-6">

            <div className="bg-cyan-500/20 p-4 rounded-2xl">

              <Package className="text-cyan-300 w-7 h-7" />

            </div>

            <span className="text-cyan-300 text-sm font-semibold">
              PRODUITS
            </span>

          </div>

          <h2 className="text-5xl font-black">
            248
          </h2>

          <p className="text-gray-400 mt-3">
            Produits suivis
          </p>

        </motion.div>

        {/* CARD */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="
            rounded-3xl
            border
            border-orange-500/20
            bg-orange-500/10
            backdrop-blur-2xl
            p-7
          "
        >

          <div className="flex items-center justify-between mb-6">

            <div className="bg-orange-500/20 p-4 rounded-2xl">

              <Calendar className="text-orange-300 w-7 h-7" />

            </div>

            <span className="text-orange-300 text-sm font-semibold">
              DLC
            </span>

          </div>

          <h2 className="text-5xl font-black">
            12
          </h2>

          <p className="text-orange-200/70 mt-3">
            Expirent bientôt
          </p>

        </motion.div>

        {/* CARD */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="
            rounded-3xl
            border
            border-green-500/20
            bg-green-500/10
            backdrop-blur-2xl
            p-7
          "
        >

          <div className="flex items-center justify-between mb-6">

            <div className="bg-green-500/20 p-4 rounded-2xl">

              <CheckCircle2 className="text-green-300 w-7 h-7" />

            </div>

            <span className="text-green-300 text-sm font-semibold">
              CONFORME
            </span>

          </div>

          <h2 className="text-5xl font-black">
            98%
          </h2>

          <p className="text-green-200/70 mt-3">
            Produits conformes
          </p>

        </motion.div>

        {/* CARD */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10
            backdrop-blur-2xl
            p-7
          "
        >

          <div className="flex items-center justify-between mb-6">

            <div className="bg-red-500/20 p-4 rounded-2xl">

              <AlertTriangle className="text-red-300 w-7 h-7" />

            </div>

            <span className="text-red-300 text-sm font-semibold">
              ALERTES
            </span>

          </div>

          <h2 className="text-5xl font-black">
            3
          </h2>

          <p className="text-red-200/70 mt-3">
            Anomalies détectées
          </p>

        </motion.div>

      </div>

      {/* TABLE */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-2xl
          overflow-hidden
        "
      >

        {/* HEADER */}
        <div
          className="
            grid
            grid-cols-6
            border-b
            border-white/10
            px-8
            py-6
            text-gray-400
            font-semibold
          "
        >

          <div>Produit</div>
          <div>Lot</div>
          <div>Fournisseur</div>
          <div>Température</div>
          <div>DLC</div>
          <div>Statut</div>

        </div>

        {/* CONTENT */}
        {traceabilityItems.map((item, index) => (

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
            whileHover={{
              backgroundColor:
                "rgba(255,255,255,0.03)",
            }}
            className="
              grid
              grid-cols-6
              items-center
              px-8
              py-6
              border-b
              border-white/5
            "
          >

            {/* PRODUCT */}
            <div className="flex items-center gap-4">

              <div className="bg-cyan-500/20 p-3 rounded-2xl">

                <Package className="w-5 h-5 text-cyan-300" />

              </div>

              <div>

                <p className="font-bold text-lg">
                  {item.product}
                </p>

                <p className="text-gray-500 text-sm">
                  Produit alimentaire
                </p>

              </div>

            </div>

            {/* LOT */}
            <div>

              <p className="font-semibold">
                {item.lot}
              </p>

            </div>

            {/* SUPPLIER */}
            <div className="flex items-center gap-3">

              <Truck className="w-5 h-5 text-cyan-300" />

              <span>
                {item.supplier}
              </span>

            </div>

            {/* TEMP */}
            <div className="flex items-center gap-3">

              <Thermometer className="w-5 h-5 text-cyan-300" />

              <span className="font-bold">
                {item.temperature}
              </span>

            </div>

            {/* DLC */}
            <div>

              <p className="font-semibold">
                {item.dlc}
              </p>

            </div>

            {/* STATUS */}
            <div>

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2

                  px-4
                  py-2

                  rounded-full
                  font-semibold

                  ${
                    item.status === "ok"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-orange-500/20 text-orange-300"
                  }
                `}
              >

                <AlertTriangle className="w-4 h-4" />

                {item.status === "ok"
                  ? "Conforme"
                  : "Surveillance"}

              </div>

            </div>

          </motion.div>

        ))}

      </div>

      {/* MODAL */}
      {open && (

        <div
          className="
            fixed
            inset-0

            bg-black/70
            backdrop-blur-sm

            flex
            items-center
            justify-center

            z-50
          "
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              w-full
              max-w-3xl

              rounded-3xl

              border
              border-white/10

              bg-[#071120]

              p-8
            "
          >

            {/* TOP */}
            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-4xl font-black">
                  Ajouter produit
                </h2>

                <p className="text-gray-400 mt-2">
                  Sélection rapide catégorie produit
                </p>

              </div>

              <button
                onClick={() => setOpen(false)}
                className="
                  rounded-2xl

                  bg-white/10

                  p-3

                  hover:bg-red-500/20

                  transition-all
                "
              >

                <X />

              </button>

            </div>

            {/* CATEGORIES */}
            <div className="grid grid-cols-2 gap-4">

              {categories.map((category) => (

                <button
                  key={category.name}
                  onClick={() =>
                    setSelectedCategory(
                      category.name
                    )
                  }
                  className={`
                    rounded-2xl

                    border

                    p-6

                    text-left

                    transition-all

                    ${
                      selectedCategory ===
                      category.name

                        ? "border-cyan-400 bg-cyan-500/20"

                        : "border-white/10 bg-white/[0.03]"
                    }
                  `}
                >

                  <div className="text-4xl mb-4">
                    {category.emoji}
                  </div>

                  <p className="text-xl font-bold">
                    {category.name}
                  </p>

                </button>

              ))}

            </div>

          </motion.div>

        </div>

      )}

    </main>
  );
}