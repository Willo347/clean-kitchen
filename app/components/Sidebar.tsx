"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Thermometer,
  Truck,
  ShieldCheck,
  Users,
  Settings,
} from "lucide-react";

export default function Sidebar() {

  const pathname = usePathname();

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
      name: "Traçabilité",
      href: "/tracabilite",
      icon: Truck,
    },
    {
      name: "Nettoyage",
      href: "/nettoyage",
      icon: ShieldCheck,
    },
    {
      name: "Employés",
      href: "/employees",
      icon: Users,
    },
    {
      name: "Paramètres",
      href: "/parametres",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-[#060B16] border-r border-white/10 px-6 py-8 flex flex-col">

      {/* LOGO */}
      <div className="mb-14">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-900/50">

            <span className="text-2xl font-black text-white">
              CK
            </span>

          </div>

          <div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              Clean Kitchen
            </h1>

            <p className="text-gray-400 text-sm">
              HACCP Platform
            </p>

          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-3">

        {menuItems.map((item) => {

          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group
                flex
                items-center
                gap-4
                px-5
                py-4
                rounded-2xl
                transition-all
                duration-300
                border

                ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400 text-white shadow-lg shadow-blue-900/40"
                    : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.06] hover:border-white/10 hover:text-white"
                }
              `}
            >

              <div
                className={`
                  transition-all
                  duration-300

                  ${
                    active
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }
                `}
              >
                <Icon size={22} />
              </div>

              <span className="font-semibold text-[15px]">
                {item.name}
              </span>

            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="mt-auto">

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 backdrop-blur-xl">

          <p className="text-sm text-gray-400 mb-2">
            Système
          </p>

          <div className="flex items-center gap-3">

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

            <p className="font-semibold text-white">
              Tous les services fonctionnent
            </p>

          </div>
        </div>
      </div>
    </aside>
  );
}