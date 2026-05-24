"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Thermometer,
  Refrigerator,
  ClipboardList,
  Bell,
  ShieldCheck,
  Users,
  Settings,
  Truck,
  Sparkles,
  GripVertical,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const defaultItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },

  {
    id: "releves",
    name: "Relevés",
    href: "/temperatures",
    icon: Thermometer,
  },

  {
    id: "traceability",
    name: "Traçabilité",
    href: "/traceability",
    icon: Truck,
  },

  {
    id: "equipments",
    name: "Équipements",
    href: "/equipments",
    icon: Refrigerator,
  },

  {
    id: "cleaning",
    name: "PMS / Nettoyage",
    href: "/cleaning",
    icon: Sparkles,
  },

  {
    id: "controls",
    name: "Contrôles",
    href: "/controls",
    icon: ClipboardList,
  },

  {
    id: "employees",
    name: "Employés",
    href: "/employees",
    icon: Users,
  },

  {
    id: "alerts",
    name: "Alertes",
    href: "/alerts",
    icon: Bell,
  },

  {
    id: "haccp",
    name: "HACCP",
    href: "/haccp",
    icon: ShieldCheck,
  },

  {
    id: "settings",
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

function SortableItem({
  item,
  collapsed,
}: any) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="touch-none"
    >

      <Link
        href={item.href}
        className="
          group

          flex
          items-center

          rounded-3xl

          border
          border-white/10

          bg-white/[0.03]

          px-5
          py-5

          hover:border-cyan-500/30
          hover:bg-cyan-500/10

          transition-all
        "
      >

        {/* DRAG */}
        {!collapsed && (

          <div
            {...listeners}
            className="
              cursor-grab
              active:cursor-grabbing

              opacity-40

              group-hover:opacity-100

              transition-all

              mr-4
            "
          >

            <GripVertical className="w-5 h-5 text-gray-500" />

          </div>

        )}

        {/* ICON */}
        <div
          className="
            rounded-2xl

            bg-white/[0.05]

            p-4

            group-hover:bg-cyan-500/20

            transition-all
          "
        >

          <Icon
            className="
              w-6
              h-6

              text-white/80

              group-hover:text-cyan-300
            "
          />

        </div>

        {/* TEXT */}
        {!collapsed && (

          <span
            className="
              text-2xl
              font-bold

              text-white/90

              group-hover:text-cyan-300

              transition-all

              ml-5
            "
          >
            {item.name}
          </span>

        )}

      </Link>

    </div>
  );
}

export default function Sidebar() {

  const [items, setItems] =
    useState(defaultItems);

  const [collapsed, setCollapsed] =
    useState(false);

  /* LOAD ORDER */
  useEffect(() => {

    const saved =
      localStorage.getItem(
        "sidebar-order"
      );

    if (saved) {

      try {

        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {

          setItems(parsed);

        }

      } catch (error) {

        console.log(
          "Sidebar reset"
        );

        localStorage.removeItem(
          "sidebar-order"
        );

      }

    }

  }, []);

  /* SAVE ORDER */
  useEffect(() => {

    localStorage.setItem(
      "sidebar-order",
      JSON.stringify(items)
    );

  }, [items]);

  function handleDragEnd(event: any) {

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setItems((items) => {

      const oldIndex =
        items.findIndex(
          (item) => item.id === active.id
        );

      const newIndex =
        items.findIndex(
          (item) => item.id === over.id
        );

      return arrayMove(
        items,
        oldIndex,
        newIndex
      );
    });
  }

  return (
    <aside
      className={`
        min-h-screen

        border-r
        border-white/10

        bg-[#071120]

        p-6

        flex
        flex-col

        overflow-y-auto

        transition-all

        ${
          collapsed
            ? "w-[120px]"
            : "w-[320px]"
        }
      `}
    >

      {/* TOP */}
      <div className="flex items-center justify-between mb-10">

        {!collapsed && (

          <div className="flex items-center gap-4">

            <div
              className="
                w-14
                h-14

                rounded-2xl

                bg-gradient-to-br
                from-cyan-400
                to-blue-500

                flex
                items-center
                justify-center

                text-2xl
                font-black
              "
            >
              CK
            </div>

            <div>

              <h1 className="text-3xl font-black">
                Clean Kitchen
              </h1>

              <p className="text-gray-400 text-sm">
                HACCP Monitoring
              </p>

            </div>

          </div>

        )}

        <button
          onClick={() =>
            setCollapsed(!collapsed)
          }
          className="
            rounded-2xl

            border
            border-white/10

            bg-white/[0.04]

            p-3

            hover:bg-cyan-500/10

            transition-all
          "
        >

          {collapsed ? (
            <ChevronRight />
          ) : (
            <ChevronLeft />
          )}

        </button>

      </div>

      {/* STATUS */}
      {!collapsed && (

        <div
          className="
            rounded-3xl

            border
            border-green-500/20

            bg-green-500/10

            p-6

            mb-8
          "
        >

          <div className="flex items-center gap-3">

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

            <div>

              <p className="text-green-300 font-bold">
                SYSTEM ONLINE
              </p>

              <p className="text-green-200/70 text-sm">
                Monitoring actif
              </p>

            </div>

          </div>

        </div>

      )}

      {/* MENU */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >

        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
        >

          <div className="space-y-4">

            {items.map((item) => (

              <SortableItem
                key={item.id}
                item={item}
                collapsed={collapsed}
              />

            ))}

          </div>

        </SortableContext>

      </DndContext>

      {/* FOOTER */}
      {!collapsed && (

        <div className="mt-auto pt-8">

          <div
            className="
              rounded-3xl

              border
              border-cyan-500/20

              bg-cyan-500/10

              p-5
            "
          >

            <p className="text-cyan-300 font-bold">
              Clean Kitchen AI
            </p>

            <p className="text-cyan-200/70 text-sm mt-1">
              Surveillance intelligente HACCP active
            </p>

          </div>

        </div>

      )}

    </aside>
  );
}