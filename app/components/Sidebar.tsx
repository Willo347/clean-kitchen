"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  Menu,
  X,
  Wrench,
} from "lucide-react";

const menuItems = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Températures", href: "/temperatures", icon: Thermometer },
  { name: "Équipements", href: "/equipments", icon: Snowflake },
  { name: "Stocks", href: "/stocks", icon: Package },
  { name: "Livraisons", href: "/deliveries/new", icon: Truck },
  { name: "Traçabilité", href: "/traceability", icon: ClipboardList },
  { name: "Alertes", href: "/alerts", icon: AlertTriangle },
  { name: "PMS entretien", href: "/pms-entretien", icon: ShieldCheck },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Monitoring", href: "/monitoring", icon: Activity },
  { name: "Employés", href: "/employees", icon: Users },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function Sidebar() {

  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── MOBILE TOPBAR ─────────────────────── */}
      <div className="
        fixed top-0 left-0 right-0
        h-[70px] px-5
        flex items-center justify-between
        bg-[#020810] backdrop-blur-3xl
        border-b border-white/10
        z-[60] lg:hidden
      ">
        {/* Mobile logo */}
        <div className="flex items-center gap-3">
          <img
            src="/ck-logo-new.png"
            alt="Clean Kitchen"
            className="h-[52px] w-auto object-contain"
          />
        </div>

        {/* Burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="
            w-11 h-11
            rounded-2xl
            border border-white/10
            bg-white/[0.04]
            flex items-center justify-center
          "
        >
          {mobileOpen
            ? <X className="text-white w-5 h-5" />
            : <Menu className="text-white w-5 h-5" />
          }
        </button>
      </div>

      {/* ── OVERLAY ───────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ── SIDEBAR ───────────────────────────── */}
      <aside className={`
        fixed top-0 left-0
        h-screen w-[270px]
        overflow-y-auto
        border-r border-white/10
        bg-[#020810] backdrop-blur-3xl
        px-4 py-5
        z-50
        transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* ── DESKTOP LOGO ──────────────────────── */}
        <div className="hidden lg:block -mx-4 -mt-5">
          <img
            src="/ck-logo-new.png"
            alt="Clean Kitchen"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Mobile spacing */}
        <div className="h-[80px] lg:hidden" />

        {/* ── MENU ──────────────────────────────── */}
        <nav className="space-y-1.5 pb-20">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                <div className={`
                  group
                  flex items-center gap-4
                  rounded-[20px] border p-3
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:scale-[1.03]
                  ${active
                    ? "border-cyan-500/20 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 shadow-[0_0_30px_rgba(6,182,212,0.10)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-cyan-500/10"
                  }
                `}>

                  {/* Icon */}
                  <div className={`
                    rounded-2xl p-2.5 transition-all
                    ${active
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "bg-white/[0.04] text-gray-400 group-hover:text-cyan-300"
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col">
                    <h2 className="text-[14px] font-semibold tracking-wide text-white leading-none">
                      {item.name}
                    </h2>
                    {active ? (
                      <p className="text-cyan-300 text-[10px] uppercase tracking-[0.25em] mt-1.5">
                        Smart Kitchen
                      </p>
                    ) : (
                      <p className="text-[11px] text-white/35 mt-1">
                        Vue système
                      </p>
                    )}
                  </div>

                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── FOOTER ────────────────────────────── */}
        <div className="
          rounded-3xl
          border border-white/10
          bg-white/[0.03]
          p-4
          backdrop-blur-xl
        ">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Clean Kitchen</h3>
              <p className="text-xs text-white/40 mt-1">Système opérationnel</p>
            </div>
            <div className="
              w-3 h-3 rounded-full
              bg-green-400
              shadow-[0_0_15px_rgba(74,222,128,0.8)]
            " />
          </div>
        </div>

      </aside>
    </>
  );
}
