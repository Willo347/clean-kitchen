"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  Thermometer,
  ClipboardList,
  Package,
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
    icon: ClipboardList,
  },
  {
    name: "Stocks",
    href: "/stocks",
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
    <aside className="w-72 bg-[#111827] min-h-screen p-6 border-r border-gray-800">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Clean Kitchen
        </h1>

        <p className="text-gray-400 mt-2">
          Dashboard HACCP
        </p>
      </div>

      <nav className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-4 bg-[#1f2937] hover:bg-blue-600 transition p-4 rounded-2xl text-white font-medium"
            >
              <Icon size={22} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 bg-[#1f2937] p-5 rounded-2xl">
        <p className="text-sm text-gray-400">
          Version Premium
        </p>

        <p className="text-xl font-bold text-white mt-1">
          HACCP Pro
        </p>
      </div>
    </aside>
  );
}