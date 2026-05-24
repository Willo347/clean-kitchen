"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import {
  Plus,
  Snowflake,
  Thermometer,
} from "lucide-react";

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
    useState([
      {
        name: "Chambre froide",
        temp: "4°C",
        type: "chambre_froide",
      },
    ]);

  const currentType =
    selectedType
      ? equipmentTypes[selectedType]
      : null;

  const addEquipment = () => {

    if (!equipmentName || !currentType) return;

    setEquipments((prev) => [
      ...prev,
      {
        name: equipmentName,
        temp: `${currentType.max}°C`,
        type: selectedType,
      },
    ]);

    setEquipmentName("");
    setSelectedType("");
  };

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

        {/* MODAL */}
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

              {/* TEMPS */}
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

              {/* BUTTON */}
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
      <div className="grid gap-6">

        {equipments.map((equipment, index) => (

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
            className="
              rounded-3xl

              border
              border-white/10

              bg-white/[0.04]

              backdrop-blur-2xl

              p-8
            "
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-5">

                <div
                  className="
                    bg-cyan-500/20
                    p-5
                    rounded-3xl
                  "
                >

                  <Snowflake className="text-cyan-300 w-8 h-8" />

                </div>

                <div>

                  <h2 className="text-3xl font-black">
                    {equipment.name}
                  </h2>

                  <p className="text-gray-400 mt-2">
                    Surveillance HACCP active
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="text-gray-400 mb-2">
                  Température actuelle
                </p>

                <h2 className="text-5xl font-black">
                  {equipment.temp}
                </h2>

              </div>

            </div>

          </motion.div>
        ))}

      </div>

    </main>
  );
}