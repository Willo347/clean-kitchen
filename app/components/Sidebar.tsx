"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import {
  LayoutDashboard,
  Refrigerator,
  ClipboardList,
  Bell,
  ShieldCheck,
  Settings,
  Activity,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Équipements",
    icon: Refrigerator,
  },
  {
    label: "Contrôles",
    icon: ClipboardList,
  },
  {
    label: "Alertes",
    icon: Bell,
  },
  {
    label: "HACCP",
    icon: ShieldCheck,
  },
  {
    label: "Monitoring",
    icon: Activity,
  },
  {
    label: "Paramètres",
    icon: Settings,
  },
];

export default function Sidebar() {

  return (
    <aside
      className="
        relative

        w-[320px]

        border-r
        border-white/10

        bg-black/20
        backdrop-blur-2xl

        p-6

        overflow-hidden
      "
    >

      {/* BACKGROUND GLOW */}
      <div
        className="
          absolute
          top-[-100px]
          left-[-100px]

          w-[300px]
          h-[300px]

          rounded-full

          bg-blue-500/10

          blur-3xl
        "
      />

      {/* LOGO */}
      <div className="relative z-10 mb-10">

        <motion.div
          whileHover={{
            scale: 1.03,
          }}
          className="
            relative
            overflow-hidden

            rounded-3xl

            border
            border-white/10

            bg-white/[0.04]

            p-6
          "
        >

          {/* SHINE */}
          <div
            className="
              absolute
              top-0
              left-[-100%]

              w-[120%]
              h-full

              bg-gradient-to-r
              from-transparent
              via-white/10
              to-transparent

              animate-[shine_8s_linear_infinite]
            "
          />

          <div className="relative z-10">

            <div className="flex items-center gap-4">

              <div
                className="
                  w-16
                  h-16

                  rounded-3xl

                  bg-gradient-to-br
                  from-blue-500
                  to-cyan-400

                  flex
                  items-center
                  justify-center

                  text-2xl
                  font-black
                "
              >
                CK
              </div>

              <div>

                <h1 className="text-2xl font-black">
                  Clean Kitchen
                </h1>

                <p className="text-gray-400 text-sm mt-1">
                  HACCP Monitoring
                </p>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

      {/* LIVE STATUS */}
      <motion.div
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="
          relative
          z-10

          flex
          items-center
          gap-4

          rounded-2xl

          border
          border-green-500/20

          bg-green-500/10

          px-5
          py-4

          mb-8
        "
      >

        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

        <div>

          <p className="font-semibold text-green-300">
            SYSTEM ONLINE
          </p>

          <p className="text-green-400/70 text-sm">
            Monitoring actif
          </p>

        </div>

      </motion.div>

      {/* MENU */}
      <nav className="relative z-10 flex flex-col gap-3">

        {items.map((item, index) => {

          const Icon = item.icon;

          return (

            <Link
              key={index}
              href="#"
            >

              <motion.div
                whileHover={{
                  x: 6,
                }}
                className={`
                  relative
                  overflow-hidden

                  flex
                  items-center
                  gap-4

                  rounded-2xl

                  px-5
                  py-4

                  border

                  transition-all
                  duration-300

                  ${
                    item.active
                      ? `
                        bg-gradient-to-r
                        from-blue-500/20
                        to-cyan-500/10

                        border-blue-500/20

                        shadow-lg
                        shadow-blue-500/10
                      `
                      : `
                        bg-white/[0.03]
                        border-white/5

                        hover:bg-white/[0.06]
                      `
                  }
                `}
              >

                {/* ACTIVE GLOW */}
                {item.active && (

                  <motion.div
                    animate={{
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                    className="
                      absolute
                      inset-0

                      bg-gradient-to-r
                      from-blue-500/10
                      to-cyan-500/10
                    "
                  />

                )}

                <div className="relative z-10 flex items-center gap-4">

                  <div
                    className={`
                      p-3
                      rounded-2xl

                      ${
                        item.active
                          ? "bg-blue-500/20"
                          : "bg-white/[0.05]"
                      }
                    `}
                  >

                    <Icon
                      className={`
                        w-5
                        h-5

                        ${
                          item.active
                            ? "text-cyan-300"
                            : "text-gray-300"
                        }
                      `}
                    />

                  </div>

                  <span
                    className={`
                      font-semibold

                      ${
                        item.active
                          ? "text-white"
                          : "text-gray-300"
                      }
                    `}
                  >
                    {item.label}
                  </span>

                </div>

                {/* LIVE INDICATOR */}
                {item.active && (

                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                    className="
                      ml-auto

                      w-3
                      h-3

                      rounded-full

                      bg-cyan-400
                    "
                  />

                )}

              </motion.div>

            </Link>
          );
        })}

      </nav>

      {/* FOOTER */}
      <div
        className="
          absolute
          bottom-6
          left-6
          right-6

          rounded-3xl

          border
          border-white/10

          bg-white/[0.04]

          p-5
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              w-14
              h-14

              rounded-2xl

              bg-gradient-to-br
              from-cyan-500
              to-blue-500

              flex
              items-center
              justify-center

              font-black
            "
          >
            AI
          </div>

          <div>

            <p className="font-bold">
              AI Monitoring
            </p>

            <p className="text-gray-400 text-sm">
              Analyse intelligente active
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}