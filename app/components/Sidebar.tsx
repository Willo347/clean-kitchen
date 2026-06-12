"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
  Bell,
} from "lucide-react";

export const DEFAULT_MENU_ITEMS = [
  { id: "dashboard",     name: "Tableau de bord", href: "/",              icon: "LayoutDashboard" },
  { id: "temperatures",  name: "Températures",    href: "/temperatures",  icon: "Thermometer" },
  { id: "equipments",    name: "Équipements",     href: "/equipments",    icon: "Snowflake" },
  { id: "stocks",        name: "Stocks",          href: "/stocks",        icon: "Package" },
  { id: "deliveries",    name: "Livraisons",      href: "/deliveries/new",icon: "Truck" },
  { id: "traceability",  name: "Traçabilité",     href: "/traceability",  icon: "ClipboardList" },
  { id: "alerts",        name: "Alertes",         href: "/alerts",        icon: "AlertTriangle" },
  { id: "pms",           name: "PMS entretien",   href: "/pms-entretien", icon: "ShieldCheck" },
  { id: "maintenance",   name: "Maintenance",     href: "/maintenance",   icon: "Wrench" },
  { id: "monitoring",    name: "Monitoring",      href: "/monitoring",    icon: "Activity" },
  { id: "employees",     name: "Employés",        href: "/employees",     icon: "Users" },
  { id: "notifications", name: "Notifications",   href: "/notifications", icon: "Bell" },
  { id: "settings",      name: "Paramètres",      href: "/settings",      icon: "Settings" },
];

export const ICON_MAP: Record<string, React.ElementType> = {
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
  Wrench,
  Bell,
};

export const SIDEBAR_ORDER_KEY = "ck_sidebar_order";

export function getSidebarItems() {
  if (typeof window === "undefined") return DEFAULT_MENU_ITEMS;
  try {
    const saved = localStorage.getItem(SIDEBAR_ORDER_KEY);
    if (!saved) return DEFAULT_MENU_ITEMS;
    const savedIds: string[] = JSON.parse(saved);
    const ordered = savedIds
      .map((id) => DEFAULT_MENU_ITEMS.find((item) => item.id === id))
      .filter(Boolean) as typeof DEFAULT_MENU_ITEMS;
    // Ajoute les items manquants à la fin (nouveaux modules ajoutés)
    const missing = DEFAULT_MENU_ITEMS.filter((item) => !savedIds.includes(item.id));
    return [...ordered, ...missing];
  } catch {
    return DEFAULT_MENU_ITEMS;
  }
}

export default function Sidebar() {

  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);

  // Charge l'ordre personnalisé depuis localStorage
  useEffect(() => {
    setMenuItems(getSidebarItems());
    // Écoute les changements (quand l'utilisateur réorganise depuis les paramètres)
    function handleStorageChange() {
      setMenuItems(getSidebarItems());
    }
    window.addEventListener("ck_sidebar_updated", handleStorageChange);
    return () => window.removeEventListener("ck_sidebar_updated", handleStorageChange);
  }, []);

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
        <div className="flex items-center gap-3">
          <img
            src="/ck-logo-new.png"
            alt="Clean Kitchen"
            className="h-[52px] w-auto object-contain"
          />
        </div>

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
          {menuItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const active = pathname === item.href;

            return (
              <Link
                key={item.id}
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

                  <div className={`
                    rounded-2xl p-2.5 transition-all
                    ${active
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "bg-white/[0.04] text-gray-400 group-hover:text-cyan-300"
                    }
                  `}>
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>

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
