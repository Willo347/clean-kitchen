"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Thermometer,
  Boxes,
  Truck,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";

import { motion } from "framer-motion";

export default function Sidebar() {

  const pathname =
    usePathname();

  const links = [

    {
      label:
        "Dashboard",

      href: "/",

      icon:
        LayoutDashboard,
    },

    {
      label:
        "Températures",

      href:
        "/temperatures",

      icon:
        Thermometer,
    },

    {
      label:
        "Stocks",

      href:
        "/stocks",

      icon:
        Boxes,
    },

    {
      label:
        "Livraisons",

      href:
        "/deliveries/new",

      icon:
        Truck,
    },

    {
      label:
        "Traçabilité",

      href:
        "/traceability",

      icon:
        ClipboardList,
    },

    {
      label:
        "Alertes",

      href:
        "/alerts",

      icon:
        ShieldAlert,
    },
  ];

  return (

    <aside
      className="
        w-full
        xl:w-[320px]

        min-h-screen

        border-r
        border-white/10

        bg-[#071120]

        p-6
      "
    >

      {/* LOGO */}
      <div className="mb-10">

        <div className="flex items-center gap-4">

          <div
            className="
              w-5
              h-5

              rounded-full

              bg-cyan-400

              animate-pulse
            "
          />

          <div>

            <h1 className="text-3xl font-black text-white">
              CLEAN KITCHEN
            </h1>

            <p className="text-cyan-400 text-sm tracking-widest uppercase mt-1">
              HACCP SYSTEM
            </p>

          </div>

        </div>

      </div>

      {/* NAVIGATION */}
      <nav className="space-y-4">

        {links.map(
          (
            link,
            index
          ) => {

            const isActive =
              pathname ===
              link.href;

            const Icon =
              link.icon;

            return (

              <Link
                key={index}
                href={
                  link.href
                }
              >

                <motion.div

                  whileHover={{
                    scale: 1.02,
                    x: 4,
                  }}

                  whileTap={{
                    scale: 0.98,
                  }}

                  className={`
                    flex
                    items-center
                    gap-5

                    rounded-3xl

                    px-6
                    py-6

                    transition-all

                    ${
                      isActive

                        ? `
                          bg-cyan-500/20
                          border
                          border-cyan-500/20
                        `

                        : `
                          bg-white/[0.03]
                          border
                          border-white/5
                        `
                    }
                  `}
                >

                  <div
                    className={`
                      p-4
                      rounded-2xl

                      ${
                        isActive

                          ? `
                            bg-cyan-500/20
                            text-cyan-300
                          `

                          : `
                            bg-white/[0.05]
                            text-gray-300
                          `
                      }
                    `}
                  >

                    <Icon className="w-7 h-7" />

                  </div>

                  <div>

                    <p
                      className={`
                        text-xl
                        font-black

                        ${
                          isActive

                            ? "text-cyan-300"

                            : "text-white"
                        }
                      `}
                    >

                      {
                        link.label
                      }

                    </p>

                    <p className="text-gray-500 text-sm mt-1">

                      Navigation rapide

                    </p>

                  </div>

                </motion.div>

              </Link>
            );
          }
        )}

      </nav>

      {/* FOOTER */}
      <div className="mt-10">

        <div
          className="
            rounded-3xl

            border
            border-cyan-500/20

            bg-cyan-500/10

            p-6
          "
        >

          <p className="text-cyan-300 text-sm font-semibold uppercase tracking-widest mb-3">
            SYSTEM STATUS
          </p>

          <h2 className="text-3xl font-black text-white">
            HACCP ACTIVE
          </h2>

          <p className="text-cyan-100/70 mt-3">
            Tous les systèmes fonctionnent normalement.
          </p>

        </div>

      </div>

    </aside>
  );
}