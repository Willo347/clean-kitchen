"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { motion } from "framer-motion";

import {
  LayoutDashboard,
  Refrigerator,
  ClipboardList,
  Bell,
  ShieldCheck,
  Settings,
  Activity,
  Users,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Équipements",
    icon: Refrigerator,
    href: "/equipments",
  },
  {
    label: "Contrôles",
    icon: ClipboardList,
    href: "/controls",
  },
  {
    label: "Alertes",
    icon: Bell,
    href: "/alerts",
  },
  {
    label: "HACCP",
    icon: ShieldCheck,
    href: "/haccp",
  },
  {
    label: "Monitoring",
    icon: Activity,
    href: "/monitoring",
  },
  {
    label: "Employés",
    icon: Users,
    href: "/employees",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {

  const pathname = usePathname();

  return (
    <aside
      className="
        relative
        w-[320px]
        h-screen
        overflow-y-auto
        border-r
        border-white/10
        bg-black/20
        backdrop-blur-2xl
        p-6
        scrollbar-thin
        scrollbar-thumb-white/10
        scrollbar-track-transparent
      "
    >

      {/* GLOW */}
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
          whileHover={{ scale: 1.03 }}
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

          <div className="relative z-10 flex items-center gap-4">

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

        </motion.div>

      </div>

      {/* LIVE */}
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

      {/* NAV */}
      <nav className="relative z-10 flex flex-col gap-3">

        {items.map((item, index) => {

          const Icon = item.icon;

          const active = pathname === item.href;

          return (

            <Link
              key={index}
              href={item.href}
            >

              <motion.div
                whileHover={{ x: 6 }}
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
                    active
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

                {active && (

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
                        active
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
                          active
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
                        active
                          ? "text-white"
                          : "text-gray-300"
                      }
                    `}
                  >
                    {item.label}
                  </span>

                </div>

              </motion.div>

            </Link>
          );
        })}

      </nav>

      {/* AI FOOTER */}
      <div
        className="
          relative
          mt-10
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