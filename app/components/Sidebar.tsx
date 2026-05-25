"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Thermometer,
  Snowflake,
  Package,
  Truck,
  ClipboardList,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Users,
  Settings,
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
    name: "PMS entretien",
    href: "/pms-entretien",
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

  return (

    <aside
      className="
        fixed
        top-0
        left-0

        h-screen
        w-[290px]

        overflow-y-auto

        border-r
        border-white/10

        bg-[#081120]/85
        backdrop-blur-3xl

        px-4
        py-5

        z-50
      "
    >

      {/* LOGO */}
      <div
        className="
          flex
          justify-center
          items-center

          mb-8
          mt-4
        "
      >

        <img
          src="/ck-logo-new.png"
          alt="CK Logo"
          className="
            w-[390px]
            max-w-none

            h-auto
            object-contain

            scale-[1.15]
          "
        />

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

                  ${
                    active
                      ? `
                        border-cyan-500/30
                        bg-cyan-500/10

                        shadow-[0_0_30px_rgba(6,182,212,0.12)]
                      `
                      : `
                        border-white/10
                        bg-white/[0.03]

                        hover:bg-white/[0.06]
                        hover:border-cyan-500/20
                      `
                  }
                `}
              >

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

      </div>

    </aside>
  );
}