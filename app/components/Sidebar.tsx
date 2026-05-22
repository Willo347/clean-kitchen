"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Thermometer,
  Truck,
  ShieldCheck,
  Users,
  Settings,
} from "lucide-react";

export default function Sidebar() {
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
    <aside className="w-64 min-h-screen bg-[#111827] border-r border-gray-800 p-4">
      <h1 className="text-2xl font-bold text-white mb-8">
        Clean Kitchen
      </h1>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-blue-600 hover:text-white transition"
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}