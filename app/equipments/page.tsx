"use client";

import { motion } from "framer-motion";

import {
  Refrigerator,
  Thermometer,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Snowflake,
} from "lucide-react";

const equipments = [
  {
    id: 1,
    name: "Chambre froide",
    temp: "4°C",
    status: "Stable",
    online: true,
    alert: false,
  },
  {
    id: 2,
    name: "Congélateur",
    temp: "-18°C",
    status: "Optimal",
    online: true,
    alert: false,
  },
  {
    id: 3,
    name: "Frigo réserve",
    temp: "12°C",
    status: "Alerte",
    online: true,
    alert: true,
  },
];

export default function EquipmentsPage() {

  return (
    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            EQUIPMENT MONITORING
          </p>

        </div>

        <h1 className="text-7xl font-black tracking-tight">
          Équipements
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Surveillance temps réel des équipements HACCP
        </p>

      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-7 mb-10">

        {/* TOTAL */}
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

              <Refrigerator className="text-cyan-300" />

            </div>

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          </div>

          <p className="text-cyan-200">
            Équipements actifs
          </p>

          <h2 className="text-6xl font-black mt-4">
            12
          </h2>

        </motion.div>

        {/* ONLINE */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-green-500/20
            bg-gradient-to-br
            from-green-500/20
            to-emerald-900/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div className="bg-green-500/20 p-4 rounded-2xl">

              <Wifi className="text-green-300" />

            </div>

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

          </div>

          <p className="text-green-200">
            Connectés
          </p>

          <h2 className="text-6xl font-black mt-4">
            11
          </h2>

        </motion.div>

        {/* ALERT */}
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
            En anomalie
          </p>

          <h2 className="text-6xl font-black mt-4">
            1
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
            border-blue-500/20
            bg-gradient-to-br
            from-blue-500/20
            to-cyan-900/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <div className="bg-blue-500/20 p-4 rounded-2xl">

              <ShieldCheck className="text-blue-300" />

            </div>

            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />

          </div>

          <p className="text-blue-200">
            HACCP Status
          </p>

          <h2 className="text-5xl font-black mt-4">
            OK
          </h2>

        </motion.div>

      </div>

      {/* EQUIPMENT LIST */}
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
            Équipements surveillés
          </h2>

          <div
            className="
              bg-cyan-500/10
              border
              border-cyan-500/20

              px-5
              py-2

              rounded-2xl

              text-cyan-300
              text-sm
              font-semibold
            "
          >
            LIVE SYSTEM
          </div>

        </div>

        <div className="space-y-5">

          {equipments.map((equipment) => (

            <motion.div
              key={equipment.id}
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
                  equipment.alert
                    ? `
                      border-red-500/20
                      bg-red-500/5
                    `
                    : `
                      border-white/10
                      bg-white/[0.03]
                    `
                }
              `}
            >

              <div className="flex items-center gap-5">

                <div
                  className={`
                    p-4
                    rounded-2xl

                    ${
                      equipment.alert
                        ? "bg-red-500/20"
                        : "bg-cyan-500/20"
                    }
                  `}
                >

                  <Snowflake
                    className={
                      equipment.alert
                        ? "text-red-400"
                        : "text-cyan-300"
                    }
                  />

                </div>

                <div>

                  <h3 className="text-2xl font-bold">
                    {equipment.name}
                  </h3>

                  <p className="text-gray-400 mt-1">
                    Surveillance active HACCP
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-10">

                <div className="text-center">

                  <p className="text-gray-400 text-sm mb-2">
                    Température
                  </p>

                  <p className="text-3xl font-black">
                    {equipment.temp}
                  </p>

                </div>

                <div className="text-center">

                  <p className="text-gray-400 text-sm mb-2">
                    Status
                  </p>

                  <p
                    className={`font-bold ${
                      equipment.alert
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {equipment.status}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <div
                    className={`
                      w-3
                      h-3
                      rounded-full

                      ${
                        equipment.online
                          ? "bg-green-400"
                          : "bg-red-400"
                      }
                    `}
                  />

                  <span className="text-gray-300">
                    {equipment.online
                      ? "Online"
                      : "Offline"}
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