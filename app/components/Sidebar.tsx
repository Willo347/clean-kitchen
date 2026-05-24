"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Thermometer,
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

  return (
    <aside
      className="
        w-[260px]

        min-h-screen

        border-r
        border-cyan-500/10

        bg-black/20

        backdrop-blur-2xl

        p-5

        overflow-y-auto

        relative
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

                  ${
                    active
                      ? `
                        bg-cyan-500/20

                        border-cyan-400/30

                        shadow-[0_0_30px_rgba(0,255,255,0.12)]
                      `
                      : `
                        bg-white/[0.04]

                        border-white/5

                        hover:bg-white/[0.08]
                      `
                  }
                `}
              >
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