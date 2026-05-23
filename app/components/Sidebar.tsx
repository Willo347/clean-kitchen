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

import { motion } from "framer-motion";

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
    <aside className="w-72 min-h-screen bg-[#081120] border-r border-white/5 p-6 relative overflow-hidden">

      {/* GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[250px] h-[250px] bg-blue-500/20 blur-3xl rounded-full" />

      {/* LOGO */}
      <div className="relative z-10 flex items-center gap-4 mb-14">

        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-500/30">

          CK

        </div>

        <div>

          <h1 className="text-3xl font-black text-white leading-none">
            Clean Kitchen
          </h1>

          <p className="text-gray-400 mt-1">
            HACCP Platform
          </p>

        </div>
      </div>

      {/* MENU */}
      <nav className="relative z-10 flex flex-col gap-4">

        {menuItems.map((item) => {

          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <motion.div
              key={item.name}
              whileHover={{
                scale: 1.03,
                x: 5,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
              }}
            >

              <Link
                href={item.href}
                className={`
                  group
                  relative
                  flex
                  items-center
                  gap-4
                  px-5
                  py-5
                  rounded-3xl
                  transition-all
                  duration-300
                  overflow-hidden
                  border

                  ${
                    active
                      ? `
                        bg-gradient-to-r
                        from-blue-600
                        to-cyan-500
                        text-white
                        border-blue-400/30
                        shadow-2xl
                        shadow-cyan-500/20
                      `
                      : `
                        bg-white/[0.03]
                        border-white/5
                        text-gray-300
                        hover:bg-white/[0.06]
                        hover:border-white/10
                      `
                  }
                `}
              >

                {/* glow hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-white/5" />

                <div className="relative z-10 flex items-center gap-4">

                  <div
                    className={`
                      p-2 rounded-2xl
                      ${
                        active
                          ? "bg-white/20"
                          : "bg-white/[0.04]"
                      }
                    `}
                  >

                    <Icon size={22} />

                  </div>

                  <span className="font-semibold text-lg">
                    {item.name}
                  </span>

                </div>

              </Link>

            </motion.div>
          );
        })}
      </nav>

      {/* FOOTER STATUS */}
      <div className="absolute bottom-6 left-6 right-6">

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 backdrop-blur-xl">

          <p className="text-gray-400 text-sm mb-3">
            Système
          </p>

          <div className="flex items-center gap-3">

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

            <p className="text-white font-semibold">
              Tous les services fonctionnent
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}