"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  Thermometer,
  Refrigerator,
  ClipboardList,
  Bell,
  ShieldCheck,
  Users,
  Settings,
  Truck,
  Sparkles,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },

  {
    name: "Relevés",
    href: "/temperatures",
    icon: Thermometer,
  },

  {
    name: "Traçabilité",
    href: "/traceability",
    icon: Truck,
  },

  {
    name: "Équipements",
    href: "/equipments",
    icon: Refrigerator,
  },

  {
    name: "PMS / Nettoyage",
    href: "/cleaning",
    icon: Sparkles,
  },

  {
    name: "Contrôles",
    href: "/controls",
    icon: ClipboardList,
  },

  {
    name: "Employés",
    href: "/employees",
    icon: Users,
  },

  {
    name: "Alertes",
    href: "/alerts",
    icon: Bell,
  },

  {
    name: "HACCP",
    href: "/haccp",
    icon: ShieldCheck,
  },

  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {

  return (
    <aside
      className="
        w-[320px]
        min-h-screen

        border-r
        border-white/10

        bg-[#071120]

        p-6

        flex
        flex-col

        overflow-y-auto
      "
    >

      {/* LOGO */}
      <div
        className="
          rounded-3xl

          border
          border-white/10

          bg-white/[0.04]

          p-7

          mb-10
        "
      >

        <div className="flex items-center gap-5">

          <div
            className="
              w-16
              h-16

              rounded-2xl

              bg-gradient-to-br
              from-cyan-400
              to-blue-500

              flex
              items-center
              justify-center

              text-3xl
              font-black
            "
          >
            CK
          </div>

          <div>

            <h1 className="text-4xl font-black leading-none">
              Clean
              <br />
              Kitchen
            </h1>

            <p className="text-gray-400 mt-2">
              HACCP Monitoring
            </p>

          </div>

        </div>

      </div>

      {/* STATUS */}
      <div
        className="
          rounded-3xl

          border
          border-green-500/20

          bg-green-500/10

          p-6

          mb-8
        "
      >

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

          <div>

            <p className="text-green-300 font-bold">
              SYSTEM ONLINE
            </p>

            <p className="text-green-200/70 text-sm">
              Monitoring actif
            </p>

          </div>

        </div>

      </div>

      {/* MENU */}
      <div className="space-y-4">

        {menuItems.map((item, index) => {

          const Icon = item.icon;

          return (
            <Link
              key={index}
              href={item.href}
              className="
                group

                flex
                items-center
                gap-5

                rounded-3xl

                border
                border-white/10

                bg-white/[0.03]

                px-6
                py-6

                hover:border-cyan-500/30
                hover:bg-cyan-500/10

                transition-all
              "
            >

              <div
                className="
                  rounded-2xl

                  bg-white/[0.05]

                  p-4

                  group-hover:bg-cyan-500/20

                  transition-all
                "
              >

                <Icon
                  className="
                    w-6
                    h-6

                    text-white/80

                    group-hover:text-cyan-300
                  "
                />

              </div>

              <span
                className="
                  text-2xl
                  font-bold

                  text-white/90

                  group-hover:text-cyan-300

                  transition-all
                "
              >
                {item.name}
              </span>

            </Link>
          );
        })}

      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-8">

        <div
          className="
            rounded-3xl

            border
            border-cyan-500/20

            bg-cyan-500/10

            p-5
          "
        >

          <p className="text-cyan-300 font-bold">
            Clean Kitchen AI
          </p>

          <p className="text-cyan-200/70 text-sm mt-1">
            Surveillance intelligente HACCP active
          </p>

        </div>

      </div>

    </aside>
  );
}