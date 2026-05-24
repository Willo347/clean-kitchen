"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import {
  Truck,
  Package,
  Calendar,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function NewDeliveryPage() {

  const [product, setProduct] =
    useState("");

  const [supplier, setSupplier] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [batch, setBatch] =
    useState("");

  const [dlc, setDlc] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const saveDelivery =
    async () => {

      if (
        !product ||
        !supplier
      ) {
        return;
      }

      setLoading(true);

      /* TRACEABILITY */
      await supabase
        .from(
          "traceability_products"
        )
        .insert([
          {
            product,
            supplier,
            quantity,
            batch,
            dlc,
          },
        ]);

      /* STOCK MOVEMENT */
      await supabase
        .from(
          "stock_movements"
        )
        .insert([
          {
            product,
            quantity,
            movement_type:
              "Entrée",
          },
        ]);

      setProduct("");
      setSupplier("");
      setQuantity(1);
      setBatch("");
      setDlc("");

      setLoading(false);

      alert(
        "Livraison enregistrée"
      );
    };

  return (

    <main className="min-h-screen p-6 md:p-10 text-white">

      {/* HEADER */}
      <div className="mb-10">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            DELIVERY TABLET MODE
          </p>

        </div>

        <h1 className="text-5xl md:text-7xl font-black">
          Nouvelle livraison
        </h1>

        <p className="text-gray-400 mt-4 text-lg md:text-xl">
          Réception fournisseur rapide
        </p>

      </div>

      {/* FORM */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-8
        "
      >

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* PRODUCT */}
          <div>

            <label className="text-gray-400 text-sm block mb-3">
              Produit
            </label>

            <div
              className="
                flex
                items-center
                gap-4

                rounded-3xl

                border
                border-white/10

                bg-black/20

                px-6
                py-6
              "
            >

              <Package className="text-cyan-300 w-7 h-7" />

              <input
                value={product}
                onChange={(e) =>
                  setProduct(
                    e.target.value
                  )
                }
                placeholder="Nom produit"
                className="
                  bg-transparent
                  outline-none
                  w-full

                  text-2xl
                "
              />

            </div>

          </div>

          {/* SUPPLIER */}
          <div>

            <label className="text-gray-400 text-sm block mb-3">
              Fournisseur
            </label>

            <div
              className="
                flex
                items-center
                gap-4

                rounded-3xl

                border
                border-white/10

                bg-black/20

                px-6
                py-6
              "
            >

              <Truck className="text-cyan-300 w-7 h-7" />

              <input
                value={supplier}
                onChange={(e) =>
                  setSupplier(
                    e.target.value
                  )
                }
                placeholder="Nom fournisseur"
                className="
                  bg-transparent
                  outline-none
                  w-full

                  text-2xl
                "
              />

            </div>

          </div>

          {/* QUANTITY */}
          <div>

            <label className="text-gray-400 text-sm block mb-3">
              Quantité
            </label>

            <div
              className="
                flex
                items-center
                justify-between

                rounded-3xl

                border
                border-white/10

                bg-black/20

                px-6
                py-5
              "
            >

              <button
                onClick={() =>
                  setQuantity(
                    Math.max(
                      1,
                      quantity - 1
                    )
                  )
                }
                className="
                  w-16
                  h-16

                  rounded-2xl

                  bg-red-500/20

                  text-red-300
                  text-4xl
                  font-black

                  active:scale-95
                "
              >

                -

              </button>

              <div className="text-5xl font-black">

                {quantity}

              </div>

              <button
                onClick={() =>
                  setQuantity(
                    quantity + 1
                  )
                }
                className="
                  w-16
                  h-16

                  rounded-2xl

                  bg-green-500/20

                  text-green-300
                  text-4xl
                  font-black

                  active:scale-95
                "
              >

                +

              </button>

            </div>

          </div>

          {/* DLC */}
          <div>

            <label className="text-gray-400 text-sm block mb-3">
              DLC
            </label>

            <div
              className="
                flex
                items-center
                gap-4

                rounded-3xl

                border
                border-white/10

                bg-black/20

                px-6
                py-6
              "
            >

              <Calendar className="text-cyan-300 w-7 h-7" />

              <input
                type="date"
                value={dlc}
                onChange={(e) =>
                  setDlc(
                    e.target.value
                  )
                }
                className="
                  bg-transparent
                  outline-none
                  w-full

                  text-2xl
                "
              />

            </div>

          </div>

          {/* BATCH */}
          <div className="xl:col-span-2">

            <label className="text-gray-400 text-sm block mb-3">
              Numéro de lot
            </label>

            <div
              className="
                flex
                items-center
                gap-4

                rounded-3xl

                border
                border-white/10

                bg-black/20

                px-6
                py-6
              "
            >

              <Package className="text-cyan-300 w-7 h-7" />

              <input
                value={batch}
                onChange={(e) =>
                  setBatch(
                    e.target.value
                  )
                }
                placeholder="Lot produit"
                className="
                  bg-transparent
                  outline-none
                  w-full

                  text-2xl
                "
              />

            </div>

          </div>

        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveDelivery}
          disabled={loading}
          className="
            mt-10

            w-full

            flex
            items-center
            justify-center
            gap-4

            rounded-3xl

            bg-cyan-500

            py-7

            text-black
            text-2xl
            font-black

            hover:scale-[1.01]

            transition-all
          "
        >

          <Save className="w-7 h-7" />

          {
            loading

              ? "Enregistrement..."

              : "Valider la livraison"
          }

        </button>

      </motion.div>

    </main>
  );
}