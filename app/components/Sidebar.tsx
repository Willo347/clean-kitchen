"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Thermometer,
  Package,
  Truck,
  ShieldCheck,
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
    name: "Traçabilité",
    href: "/traceability",
    icon: Truck,
  },
  {
    name: "Stocks",
    href: "/stock",
    icon: Package,
  },
  {
    name: "Nettoyage",
    href: "/cleaning",
    icon: ShieldCheck,
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
  return (
    <aside className="w-72 min-h-screen bg-[#0B0F19] border-r border-white/10 p-6 flex flex-col">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Clean Kitchen
        </h1>

        <p className="text-gray-400 mt-2 text-sm">
          Dashboard HACCP
        </p>
      </div>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="
                flex items-center gap-4
                px-4 py-3
                rounded-2xl
                text-gray-300
                hover:bg-blue-600
                hover:text-white
                transition-all duration-200
                group
              "
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-10">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">
            Version Premium
          </p>

          <h2 className="text-white font-semibold mt-1">
            HACCP Pro
          </h2>
        </div>
      </div>
    </aside>
  );
}