"use client";

import { motion } from "framer-motion";

import {
  AlertTriangle,
  Thermometer,
  ShieldAlert,
  Clock3,
} from "lucide-react";

const alerts = [
  {
    id: 1,
    equipment: "Frigo réserve",
    temp: "15°C",
    status: "Critique",
    time: "Il y a 2 min",
  },
  {
    id: 2,
    equipment: "Chambre froide",
    temp: "11°C",
    status: "Attention",
    time: "Il y a 8 min",
  },
  {
    id: 3,
    equipment: "Congélateur",
    temp: "-2°C",
    status: "Critique",
    time: "Il y a 14 min",
  },
];

export default function AlertsPage() {

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
            relative
            overflow-hidden

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
            5
          </h2>

        </motion.div>

        {/* TEMP */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            relative
            overflow-hidden

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
            Températures hors normes
          </p>

          <h2 className="text-6xl font-black mt-4">
            3
          </h2>

        </motion.div>

        {/* HACCP */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            relative
            overflow-hidden

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
            Contrôles HACCP
          </p>

          <h2 className="text-6xl font-black mt-4">
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

          {alerts.map((alert) => (

            <motion.div
              key={alert.id}
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

                <div
                  className="
                    bg-red-500/20
                    p-4
                    rounded-2xl
                  "
                >

                  <AlertTriangle className="text-red-400" />

                </div>

                <div>

                  <h3 className="text-xl font-bold">
                    {alert.equipment}
                  </h3>

                  <p className="text-gray-400 mt-1">
                    Température détectée : {alert.temp}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-8">

                <div>

                  <p className="text-red-300 font-semibold">
                    {alert.status}
                  </p>

                </div>

                <div className="flex items-center gap-2 text-gray-400">

                  <Clock3 className="w-4 h-4" />

                  <span className="text-sm">
                    {alert.time}
                  </span>

                </div>

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </main>
  );
}