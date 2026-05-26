"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import {
  Truck,
  Save,
  Package,
  Calendar,
  Building2,
  Hash,
} from "lucide-react";

export default function DeliveriesPage() {

  const [product, setProduct] =
    useState("");

  const [supplier, setSupplier] =
    useState("");

  const [batch, setBatch] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const handleSave = async () => {

    alert("Livraison enregistrée");

  };

  return (

    <main className="min-h-screen text-white p-6 md:p-10">

      {/* HEADER */}
      <div className="mb-10">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            DELIVERY TABLET MODE
          </p>

        </div>

        <h1 className="text-5xl md:text-7xl font-black">
          Livraisons
        </h1>

        <p className="text-gray-400 mt-4 text-lg md:text-xl">
          Gestion intelligente des marchandises
        </p>

      </div>

      {/* FORM */}
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.04]
          p-6
          md:p-10
        "
      >

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* PRODUCT */}
          <div>

            <label className="text-gray-300 mb-3 block text-lg">
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
                py-5
              "
            >

              <Package className="text-cyan-300 w-7 h-7" />

              <input
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                placeholder="Nom du produit"
                className="
                  bg-transparent
                  outline-none
                  w-full
                  text-xl
                "
              />

            </div>

          </div>

          {/* SUPPLIER */}
          <div>

            <label className="text-gray-300 mb-3 block text-lg">
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
                py-5
              "
            >

              <Building2 className="text-cyan-300 w-7 h-7" />

              <input
                value={supplier}
                onChange={(e) =>
                  setSupplier(e.target.value)
                }
                placeholder="Nom fournisseur"
                className="
                  bg-transparent
                  outline-none
                  w-full
                  text-xl
                "
              />

            </div>

          </div>

          {/* BATCH */}
          <div>

            <label className="text-gray-300 mb-3 block text-lg">
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
                py-5
              "
            >

              <Hash className="text-cyan-300 w-7 h-7" />

              <input
                value={batch}
                onChange={(e) =>
                  setBatch(e.target.value)
                }
                placeholder="Numéro de lot"
                className="
                  bg-transparent
                  outline-none
                  w-full
                  text-xl
                "
              />

            </div>

          </div>

          {/* QUANTITY */}
          <div>

            <label className="text-gray-300 mb-3 block text-lg">
              Quantité
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
                py-5
              "
            >

              <Truck className="text-cyan-300 w-7 h-7" />

              <input
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Quantité"
                className="
                  bg-transparent
                  outline-none
                  w-full
                  text-xl
                "
              />

            </div>

          </div>

          {/* EXPIRY */}
          <div className="xl:col-span-2">

            <label className="text-gray-300 mb-3 block text-lg">
              Date DLC
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
                py-5
              "
            >

              <Calendar className="text-cyan-300 w-7 h-7" />

              <input
                type="date"
                value={expiry}
                onChange={(e) =>
                  setExpiry(e.target.value)
                }
                className="
                  bg-transparent
                  outline-none
                  w-full
                  text-xl
                "
              />

            </div>

          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleSave}
          className="
            mt-10

            w-full

            rounded-3xl

            bg-cyan-500/20
            border
            border-cyan-400/20

            py-6

            text-2xl
            font-black

            flex
            items-center
            justify-center
            gap-4

            hover:bg-cyan-500/30

            transition-all
          "
        >

          <Save className="w-7 h-7" />

          Enregistrer livraison

        </button>

      </motion.div>

    </main>
  );
}