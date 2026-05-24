"use client";

import { useState } from "react";

import {
  Truck,
  Package,
  Calendar,
  Thermometer,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function NewDeliveryPage() {

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({

      product: "",

      category: "Viande",

      supplier: "",

      lot: "",

      dlc: "",

      quantity: 1,

      unit: "pièce",

      temperature: "",
    });

  const handleChange = (
    e: any
  ) => {

    setForm({
      ...form,

      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async () => {

      try {

        setLoading(true);

        /* INSERT PRODUCT */
        await supabase
          .from(
            "traceability_products"
          )
          .insert([
            {
              product:
                form.product,

              category:
                form.category,

              supplier:
                form.supplier,

              lot: form.lot,

              dlc: form.dlc,

              quantity:
                form.quantity,

              unit: form.unit,

              temperature:
                form.temperature,
            },
          ]);

        /* INSERT HISTORY */
        await supabase
          .from(
            "stock_movements"
          )
          .insert([
            {
              product:
                form.product,

              movement_type:
                "Entrée",

              quantity:
                form.quantity,

              unit: form.unit,
            },
          ]);

        alert(
          "Livraison ajoutée avec succès 🚚"
        );

        setForm({
          product: "",
          category: "Viande",
          supplier: "",
          lot: "",
          dlc: "",
          quantity: 1,
          unit: "pièce",
          temperature: "",
        });

      } catch (error) {

        console.error(error);

        alert(
          "Erreur lors de l'ajout"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            DELIVERY CENTER
          </p>

        </div>

        <h1 className="text-7xl font-black">
          Nouvelle livraison
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Réception intelligente des marchandises
        </p>

      </div>

      {/* FORM */}
      <div
        className="
          max-w-5xl

          rounded-3xl

          border
          border-white/10

          bg-white/[0.04]

          p-10
        "
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* PRODUCT */}
          <div>

            <label className="text-gray-400 mb-3 block">
              Produit
            </label>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">

              <Package className="text-cyan-300" />

              <input
                type="text"
                name="product"
                value={form.product}
                onChange={
                  handleChange
                }
                placeholder="Entrecôte..."
                className="bg-transparent w-full outline-none"
              />

            </div>

          </div>

          {/* CATEGORY */}
          <div>

            <label className="text-gray-400 mb-3 block">
              Catégorie
            </label>

            <select
              name="category"
              value={form.category}
              onChange={
                handleChange
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
            >

              <option>
                Viande
              </option>

              <option>
                Poisson
              </option>

              <option>
                Surgelé
              </option>

              <option>
                Fruits & légumes
              </option>

              <option>
                Produits laitiers
              </option>

              <option>
                Produits secs
              </option>

            </select>

          </div>

          {/* SUPPLIER */}
          <div>

            <label className="text-gray-400 mb-3 block">
              Fournisseur
            </label>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">

              <Truck className="text-cyan-300" />

              <input
                type="text"
                name="supplier"
                value={form.supplier}
                onChange={
                  handleChange
                }
                placeholder="Metro..."
                className="bg-transparent w-full outline-none"
              />

            </div>

          </div>

          {/* LOT */}
          <div>

            <label className="text-gray-400 mb-3 block">
              Lot
            </label>

            <input
              type="text"
              name="lot"
              value={form.lot}
              onChange={
                handleChange
              }
              placeholder="LOT-2025..."
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

          {/* DLC */}
          <div>

            <label className="text-gray-400 mb-3 block">
              DLC
            </label>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">

              <Calendar className="text-cyan-300" />

              <input
                type="date"
                name="dlc"
                value={form.dlc}
                onChange={
                  handleChange
                }
                className="bg-transparent w-full outline-none"
              />

            </div>

          </div>

          {/* TEMPERATURE */}
          <div>

            <label className="text-gray-400 mb-3 block">
              Température réception
            </label>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">

              <Thermometer className="text-cyan-300" />

              <input
                type="text"
                name="temperature"
                value={
                  form.temperature
                }
                onChange={
                  handleChange
                }
                placeholder="4°C"
                className="bg-transparent w-full outline-none"
              />

            </div>

          </div>

          {/* QUANTITY */}
          <div>

            <label className="text-gray-400 mb-3 block">
              Quantité
            </label>

            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={
                handleChange
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

          {/* UNIT */}
          <div>

            <label className="text-gray-400 mb-3 block">
              Unité
            </label>

            <select
              name="unit"
              value={form.unit}
              onChange={
                handleChange
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
            >

              <option>
                pièce
              </option>

              <option>
                kg
              </option>

              <option>
                litre
              </option>

              <option>
                carton
              </option>

            </select>

          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            mt-10

            flex
            items-center
            justify-center
            gap-3

            rounded-2xl

            bg-cyan-500

            px-8
            py-5

            text-black
            font-black

            hover:scale-[1.02]

            transition-all
          "
        >

          <Save />

          {loading

            ? "Ajout..."

            : "Valider la livraison"}

        </button>

      </div>

    </main>
  );
}