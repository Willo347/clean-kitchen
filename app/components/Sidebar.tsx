"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Thermometer,
<<<<<<< HEAD
  Package,
  Truck,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },

    {
      label: "Températures",
      href: "/temperatures",
      icon: Thermometer,
    },

    {
      label: "Stocks",
      href: "/stocks",
      icon: Package,
    },

    {
      label: "Livraisons",
      href: "/deliveries/new",
      icon: Truck,
    },

    {
      label: "Traçabilité",
      href: "/traceability",
      icon: ShieldCheck,
    },

    {
      label: "Alertes",
      href: "/alerts",
      icon: AlertTriangle,
    },
  ];
=======
  Snowflake,
  Package,
  Truck,
  ClipboardList,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Users,
  Settings,
  Sparkles,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },

  {
    name: "Températures",
    href: "/temperatures",
    icon: Thermometer,
  },

  {
    name: "Équipements",
    href: "/equipments",
    icon: Snowflake,
  },

  {
    name: "Stocks",
    href: "/stocks",
    icon: Package,
  },

  {
    name: "Livraisons",
    href: "/deliveries/new",
    icon: Truck,
  },

  {
    name: "Traçabilité",
    href: "/traceability",
    icon: ClipboardList,
  },

  {
    name: "Alertes",
    href: "/alerts",
    icon: AlertTriangle,
  },

  {
    name: "HACCP",
    href: "/haccp",
    icon: ShieldCheck,
  },

  {
    name: "Monitoring",
    href: "/monitoring",
    icon: Activity,
  },

  {
    name: "Employés",
    href: "/employees",
    icon: Users,
  },

  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {

  const pathname = usePathname();
>>>>>>> ultimate-haccp-version

  return (
    <aside
      className="
<<<<<<< HEAD
        w-[260px]
=======
        fixed
        top-0
        left-0
>>>>>>> ultimate-haccp-version

        h-screen
        w-[290px]

        overflow-y-auto

        border-r
        border-cyan-500/10

<<<<<<< HEAD
        bg-black/20

        backdrop-blur-2xl

        p-5

        overflow-y-auto

        relative
=======
        bg-[#081120]/85
        backdrop-blur-3xl

        p-5

        z-50
>>>>>>> ultimate-haccp-version
      "
    >
      {/* GLOW */}
      <div
        className="
          absolute

          top-[-200px]
          left-[-200px]

          w-[500px]
          h-[500px]

          rounded-full

          bg-cyan-500/10

          blur-3xl

          pointer-events-none
        "
      />

      {/* LOGO */}
<<<<<<< HEAD
      <div className="relative z-10 mb-10">
        <h1
          className="
            text-5xl

            font-black

            leading-[0.9]

            tracking-tight
          "
        >
          CLEAN
          <br />
          KITCHEN
        </h1>

        <p
          className="
            text-cyan-400

            text-sm

            tracking-[0.3em]

            mt-4
          "
        >
          HACCP SYSTEM
        </p>
      </div>

      {/* NAV */}
      <div className="relative z-10 space-y-4 pb-10">
        {links.map((item, index) => {
          const active =
            pathname === item.href;

          const Icon =
            item.icon;

          return (
            <Link
              href={item.href}
              key={index}
            >
              <div
                className={`
                  rounded-[28px]

                  border

                  p-5

                  transition-all
=======
      <div className="mb-8">

        <div className="flex items-center gap-2 mb-4">

          <Sparkles className="w-4 h-4 text-cyan-400" />

          <p className="text-cyan-400 font-bold tracking-[0.2em] uppercase text-xs">
            HACCP SYSTEM
          </p>

        </div>

        <h1
          className="
            text-5xl
            font-black
            leading-[0.9]
            text-white
          "
        >
          CLEAN
          <br />
          KITCHEN
        </h1>

      </div>

      {/* MENU */}
      <div className="space-y-4 pb-20">

        {menuItems.map((item, index) => {

          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (

            <Link
              key={index}
              href={item.href}
            >

              <div
                className={`
                  group

                  flex
                  items-center
                  gap-4

                  rounded-[28px]

                  border

                  p-4

                  transition-all
                  duration-300
>>>>>>> ultimate-haccp-version

                  ${
                    active
                      ? `
<<<<<<< HEAD
                        bg-cyan-500/20

                        border-cyan-400/30

                        shadow-[0_0_30px_rgba(0,255,255,0.12)]
                      `
                      : `
                        bg-white/[0.04]

                        border-white/5

                        hover:bg-white/[0.08]
=======
                        border-cyan-500/30
                        bg-cyan-500/10

                        shadow-[0_0_30px_rgba(6,182,212,0.12)]
                      `
                      : `
                        border-white/10
                        bg-white/[0.03]

                        hover:bg-white/[0.06]
                        hover:border-cyan-500/20
>>>>>>> ultimate-haccp-version
                      `
                  }
                `}
              >
<<<<<<< HEAD
                <div className="flex items-center gap-4">
                  <div
                    className="
                      w-14
                      h-14

                      rounded-2xl

                      bg-black/20

                      border
                      border-white/5

                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {item.label}
                    </p>

                    <p className="text-white/40 text-sm mt-1">
                      Navigation rapide
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
=======

                {/* ICON */}
                <div
                  className={`
                    rounded-2xl
                    p-4

                    transition-all

                    ${
                      active
                        ? `
                          bg-cyan-500/20
                          text-cyan-300
                        `
                        : `
                          bg-white/[0.04]
                          text-gray-400

                          group-hover:text-cyan-300
                        `
                    }
                  `}
                >

                  <Icon className="w-6 h-6" />

                </div>

                {/* TEXT */}
                <div>

                  <h2 className="text-xl font-black text-white leading-none">
                    {item.name}
                  </h2>

                  <p className="text-gray-500 text-xs mt-1">
                    Navigation rapide
                  </p>

                </div>

              </div>

            </Link>
          );
        })}

>>>>>>> ultimate-haccp-version
      </div>

      {/* FOOTER */}
      <div
        className="
          relative
          z-10

          mt-8

          rounded-[30px]

          border
          border-cyan-500/10

          bg-cyan-500/10

          backdrop-blur-xl

          p-6
        "
      >
        <p
          className="
            text-cyan-300

            text-xs

            tracking-[0.3em]

            mb-3
          "
        >
          SYSTEM STATUS
        </p>

        <h2 className="text-3xl font-black">
          HACCP OK
        </h2>

        <p className="text-white/50 text-sm mt-3">
          Tous les systèmes fonctionnent normalement.
        </p>
      </div>
    </aside>
  );
}