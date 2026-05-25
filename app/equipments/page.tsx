"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Plus,
  Snowflake,
  Thermometer,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Pencil,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const equipmentTypes = {
  frigo: {
    label: "Frigo",
    min: 0,
    max: 4,
  },

  chambre_froide: {
    label: "Chambre froide",
    min: 0,
    max: 4,
  },

  congelateur: {
    label: "Congélateur",
    min: -25,
    max: -18,
  },
};

export default function EquipmentsPage() {

  const [selectedType, setSelectedType] =
    useState<keyof typeof equipmentTypes | "">("");

  const [equipmentName, setEquipmentName] =
    useState("");

  const [equipments, setEquipments] =
    useState<any[]>([]);

  const [editingEquipment, setEditingEquipment] =
    useState<any | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editZone, setEditZone] =
    useState("");

  useEffect(() => {
    fetchEquipments();
  }, []);

  async function fetchEquipments() {

    const { data, error } = await supabase
      .from("equipments")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) {
      setEquipments(data);
    }
  }

  const currentType =
    selectedType
      ? equipmentTypes[selectedType]
      : null;

  async function addEquipment() {

    if (!equipmentName || !currentType) return;

    const { error } = await supabase
      .from("equipments")
      .insert([
        {
          name: equipmentName,
          type: selectedType,
          zone: "Cuisine",
          temp_min: currentType.min,
          temp_max: currentType.max,
        },
      ]);

    if (!error) {

      setEquipmentName("");
      setSelectedType("");

      fetchEquipments();
    }
  }

  async function deleteEquipment(id: number) {

    const confirmDelete = confirm(
      "Supprimer cet équipement ?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("equipments")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchEquipments();
    }
  }

  async function updateEquipment() {

    if (!editingEquipment) return;

    const { error } = await supabase
      .from("equipments")
      .update({
        name: editName,
        zone: editZone,
      })
      .eq("id", editingEquipment.id);

    if (!error) {

      setEditingEquipment(null);

      fetchEquipments();
    }
  }

  return (
    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">

        <div>

          <div className="flex items-center gap-4 mb-4">

            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

            <p className="text-cyan-400 font-semibold tracking-widest uppercase">
              EQUIPMENT MANAGEMENT
            </p>

          </div>

          <h1 className="text-7xl font-black tracking-tight">
            Équipements
          </h1>

          <p className="text-gray-400 mt-5 text-xl">
            Gestion intelligente des équipements HACCP
          </p>

        </div>

        {/* ADD BUTTON */}
        <Dialog>

          <DialogTrigger asChild>

            <button
              className="
                flex
                items-center
                gap-3

                rounded-2xl

                bg-gradient-to-r
                from-cyan-500
                to-blue-500

                px-6
                py-4

                font-bold

                shadow-lg
                shadow-cyan-500/20

                hover:scale-105

                transition-all
              "
            >

              <Plus className="w-5 h-5" />

              Ajouter un équipement

            </button>

          </DialogTrigger>

          <DialogContent
            className="
              border
              border-white/10

              bg-[#0B1220]

              text-white

              rounded-3xl
            "
          >

            <DialogHeader>

              <DialogTitle className="text-3xl font-black mb-6">
                Nouvel équipement
              </DialogTitle>

            </DialogHeader>

            <div className="space-y-6">

              {/* NAME */}
              <div>

                <label className="text-sm text-gray-400 mb-3 block">
                  Nom de l’équipement
                </label>

                <input
                  value={equipmentName}
                  onChange={(e) =>
                    setEquipmentName(e.target.value)
                  }
                  placeholder="Ex: Frigo réserve"
                  className="
                    w-full

                    rounded-2xl

                    border
                    border-white/10

                    bg-white/[0.04]

                    px-5
                    py-4

                    outline-none

                    focus:border-cyan-500/40
                  "
                />

              </div>

              {/* TYPE */}
              <div>

                <label className="text-sm text-gray-400 mb-3 block">
                  Type d’équipement
                </label>

                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    setSelectedType(
                      value as keyof typeof equipmentTypes
                    )
                  }
                >

                  <SelectTrigger
                    className="
                      rounded-2xl
                      border-white/10
                      bg-white/[0.04]
                      h-14
                    "
                  >

                    <SelectValue placeholder="Choisir un type" />

                  </SelectTrigger>

                  <SelectContent
                    className="
                      bg-[#0B1220]
                      border-white/10
                      text-white
                    "
                  >

                    <SelectItem value="frigo">
                      Frigo
                    </SelectItem>

                    <SelectItem value="chambre_froide">
                      Chambre froide
                    </SelectItem>

                    <SelectItem value="congelateur">
                      Congélateur
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>

              {/* AUTO TEMP */}
              {currentType && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    rounded-2xl

                    border
                    border-cyan-500/20

                    bg-cyan-500/10

                    p-5
                  "
                >

                  <div className="flex items-center gap-4 mb-4">

                    <div className="bg-cyan-500/20 p-3 rounded-2xl">

                      <Thermometer className="text-cyan-300" />

                    </div>

                    <div>

                      <p className="font-bold text-cyan-300">
                        Configuration HACCP
                      </p>

                      <p className="text-cyan-200/70 text-sm">
                        Températures automatiques
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-10">

                    <div>

                      <p className="text-gray-400 text-sm">
                        Min
                      </p>

                      <h3 className="text-3xl font-black mt-2">
                        {currentType.min}°C
                      </h3>

                    </div>

                    <div>

                      <p className="text-gray-400 text-sm">
                        Max
                      </p>

                      <h3 className="text-3xl font-black mt-2">
                        {currentType.max}°C
                      </h3>

                    </div>

                  </div>

                </motion.div>

              )}

              {/* SAVE */}
              <button
                onClick={addEquipment}
                className="
                  w-full

                  rounded-2xl

                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-500

                  py-4

                  font-bold

                  hover:scale-[1.02]

                  transition-all
                "
              >
                Enregistrer l’équipement
              </button>

            </div>

          </DialogContent>

        </Dialog>

      </div>

      {/* EQUIPMENT LIST */}
      <div className="space-y-6">

        {equipments.map((equipment, index) => {

          const critical =
            equipment.temp_max > 4;

          return (

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              whileHover={{
                scale: 1.01,
              }}
              className={`
                rounded-3xl

                border

                backdrop-blur-2xl

                p-8

                ${
                  critical
                    ? `
                      border-red-500/20
                      bg-red-500/5
                    `
                    : `
                      border-white/10
                      bg-white/[0.04]
                    `
                }
              `}
            >

              <div className="flex items-center justify-between">

                {/* LEFT */}
                <div className="flex items-center gap-5">

                  <div
                    className={`
                      p-5
                      rounded-3xl

                      ${
                        critical
                          ? "bg-red-500/20"
                          : "bg-cyan-500/20"
                      }
                    `}
                  >

                    <Snowflake
                      className={`
                        w-8
                        h-8

                        ${
                          critical
                            ? "text-red-300"
                            : "text-cyan-300"
                        }
                      `}
                    />

                  </div>

                  <div>

                    <div className="flex items-center gap-3">

                      <h2 className="text-3xl font-black">
                        {equipment.name}
                      </h2>

                      {critical ? (

                        <div
                          className="
                            flex
                            items-center
                            gap-2

                            bg-red-500/20

                            px-3
                            py-1

                            rounded-full

                            text-red-300
                            text-sm
                            font-semibold
                          "
                        >

                          <AlertTriangle className="w-4 h-4" />

                          Critique

                        </div>

                      ) : (

                        <div
                          className="
                            flex
                            items-center
                            gap-2

                            bg-green-500/20

                            px-3
                            py-1

                            rounded-full

                            text-green-300
                            text-sm
                            font-semibold
                          "
                        >

                          <CheckCircle2 className="w-4 h-4" />

                          Stable

                        </div>

                      )}

                    </div>

                    <p className="text-gray-400 mt-3">
                      Zone : {equipment.zone}
                    </p>

                    <div className="flex items-center gap-6 mt-4">

                      <div className="flex items-center gap-2 text-cyan-300">

                        <Wifi className="w-4 h-4" />

                        Online

                      </div>

                    </div>

                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-6">

                  {/* ACTIONS */}
                  <div className="flex gap-3">

                    {/* EDIT */}
                    <Dialog>

                      <DialogTrigger asChild>

                        <button
                          onClick={() => {

                            setEditingEquipment(equipment);

                            setEditName(equipment.name);

                            setEditZone(equipment.zone);
                          }}
                          className="
                            w-14
                            h-14

                            rounded-2xl

                            bg-white/[0.05]

                            border
                            border-white/10

                            flex
                            items-center
                            justify-center

                            hover:bg-cyan-500/20

                            transition-all
                          "
                        >

                          <Pencil className="w-5 h-5 text-cyan-300" />

                        </button>

                      </DialogTrigger>

                      <DialogContent
                        className="
                          border
                          border-white/10

                          bg-[#0B1220]

                          text-white

                          rounded-3xl
                        "
                      >

                        <DialogHeader>

                          <DialogTitle className="text-3xl font-black mb-6">
                            Modifier équipement
                          </DialogTitle>

                        </DialogHeader>

                        <div className="space-y-6">

                          {/* NAME */}
                          <div>

                            <label className="text-sm text-gray-400 mb-3 block">
                              Nom
                            </label>

                            <input
                              value={editName}
                              onChange={(e) =>
                                setEditName(e.target.value)
                              }
                              className="
                                w-full

                                rounded-2xl

                                border
                                border-white/10

                                bg-white/[0.04]

                                px-5
                                py-4

                                outline-none
                              "
                            />

                          </div>

                          {/* ZONE */}
                          <div>

                            <label className="text-sm text-gray-400 mb-3 block">
                              Zone
                            </label>

                            <input
                              value={editZone}
                              onChange={(e) =>
                                setEditZone(e.target.value)
                              }
                              className="
                                w-full

                                rounded-2xl

                                border
                                border-white/10

                                bg-white/[0.04]

                                px-5
                                py-4

                                outline-none
                              "
                            />

                          </div>

                          {/* SAVE */}
                          <button
                            onClick={updateEquipment}
                            className="
                              w-full

                              rounded-2xl

                              bg-gradient-to-r
                              from-cyan-500
                              to-blue-500

                              py-4

                              font-bold

                              hover:scale-[1.02]

                              transition-all
                            "
                          >
                            Enregistrer
                          </button>

                        </div>

                      </DialogContent>

                    </Dialog>

                    {/* DELETE */}
                    <button
                      onClick={() =>
                        deleteEquipment(equipment.id)
                      }
                      className="
                        w-14
                        h-14

                        rounded-2xl

                        bg-red-500/10

                        border
                        border-red-500/20

                        flex
                        items-center
                        justify-center

                        hover:bg-red-500/20

                        transition-all
                      "
                    >

                      <Trash2 className="w-5 h-5 text-red-300" />

                    </button>

                  </div>

                  {/* TEMP */}
                  <div className="text-right">

                    <p className="text-gray-400 mb-3">
                      Température HACCP
                    </p>

                    <h2
                      className={`
                        text-5xl
                        font-black

                        ${
                          critical
                            ? "text-red-300"
                            : "text-white"
                        }
                      `}
                    >
                      {equipment.temp_min}°C → {equipment.temp_max}°C
                    </h2>

                  </div>

                </div>

              </div>

            </motion.div>
          );
        })}

      </div>

    </main>
  );
}