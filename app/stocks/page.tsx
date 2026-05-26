"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Package,
  Search,
  Plus,
  Minus,
  Boxes,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function StocksPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts =
    async () => {

      const {
        data,
      } =
        await supabase
          .from(
            "traceability_products"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (data) {

        setProducts(
          data
        );
      }
    };

  const updateQuantity =
    async (
      id: string,
      currentQty: number,
      action: "plus" | "minus"
    ) => {

      const newQty =
        action === "plus"

          ? currentQty + 1

          : Math.max(
              0,
              currentQty - 1
            );

      await supabase
        .from(
          "traceability_products"
        )
        .update({
          quantity:
            newQty,
        })
        .eq(
          "id",
          id
        );

      fetchProducts();
    };

  const filteredProducts =
    products.filter((item) => {

      const productName =
        item.product ||
        "Produit inconnu";

      return productName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );
    });

  const lowStock =
    filteredProducts.filter(
      (p) =>
        (p.quantity || 0) <= 2
    );

  return (

    <main className="min-h-screen text-white">

      {/* HEADER */}
      <div className="mb-8 md:mb-10">

        <div className="flex items-center gap-3 md:gap-4 mb-4">

          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase text-xs md:text-sm">
            STOCK TABLET MODE
          </p>

        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-none">
          Gestion Stock
        </h1>

        <p className="text-gray-400 mt-4 text-base md:text-xl">
          Contrôle rapide marchandises
        </p>

      </div>

      {/* SEARCH */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]

          p-4 md:p-6

          mb-8
        "
      >

        <div
          className="
            flex
            items-center
            gap-3 md:gap-4

            rounded-3xl

            border
            border-white/10

            bg-black/20

            px-4 md:px-6
            py-4 md:py-6
          "
        >

          <Search className="text-cyan-300 w-6 h-6 md:w-8 md:h-8" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Rechercher un produit..."
            className="
              bg-transparent
              outline-none
              w-full

              text-lg md:text-2xl
            "
          />

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-8">

        {/* TOTAL */}
        <motion.div
          whileHover={{
            scale: 1.02,
          }}
          className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-cyan-500/10

            p-5 md:p-7
          "
        >

          <Boxes className="text-cyan-300 mb-5 md:mb-6 w-8 h-8 md:w-10 md:h-10" />

          <p className="text-cyan-200 text-sm md:text-base">
            Produits stock
          </p>

          <h2 className="text-4xl md:text-5xl font-black mt-4">

            {
              filteredProducts.length
            }

          </h2>

        </motion.div>

        {/* LOW STOCK */}
        <motion.div
          whileHover={{
            scale: 1.02,
          }}
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10

            p-5 md:p-7
          "
        >

          <Package className="text-red-300 mb-5 md:mb-6 w-8 h-8 md:w-10 md:h-10" />

          <p className="text-red-200 text-sm md:text-base">
            Stock faible
          </p>

          <h2 className="text-4xl md:text-5xl font-black mt-4">

            {lowStock.length}

          </h2>

        </motion.div>

      </div>

      {/* PRODUCT CARDS */}
      <div className="space-y-5 md:space-y-6">

        {filteredProducts.map(
          (
            item,
            index
          ) => (

            <motion.div
              key={index}
              whileHover={{
                scale: 1.01,
              }}
              className={`
                rounded-3xl
                border

                p-5 md:p-8

                ${
                  item.quantity <= 2

                    ? "border-red-500/20 bg-red-500/10"

                    : "border-white/10 bg-white/[0.04]"
                }
              `}
            >

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 md:gap-8">

                {/* INFO */}
                <div className="min-w-0">

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black break-words">

                    {
                      item.product ||
                      "Produit inconnu"
                    }

                  </h2>

                  <p className="text-gray-400 mt-3 text-sm md:text-lg break-words">

                    Fournisseur :
                    {" "}
                    {
                      item.supplier ||
                      "-"
                    }

                  </p>

                  <p className="text-gray-400 mt-2 text-sm md:text-lg break-words">

                    Lot :
                    {" "}
                    {
                      item.batch ||
                      "-"
                    }

                  </p>

                </div>

                {/* CONTROLS */}
                <div className="flex items-center justify-center gap-3 md:gap-6">

                  {/* MINUS */}
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity || 0,
                        "minus"
                      )
                    }
                    className="
                      w-14
                      h-14

                      md:w-20
                      md:h-20

                      rounded-2xl md:rounded-3xl

                      bg-red-500/20

                      flex
                      items-center
                      justify-center

                      active:scale-95

                      transition-all
                    "
                  >

                    <Minus className="w-6 h-6 md:w-10 md:h-10 text-red-300" />

                  </button>

                  {/* QTY */}
                  <div
                    className={`
                      px-5 md:px-10
                      py-4 md:py-6

                      rounded-2xl md:rounded-3xl

                      text-3xl md:text-5xl
                      font-black

                      min-w-[90px]
                      text-center

                      ${
                        item.quantity <= 2

                          ? "bg-red-500/20 text-red-300"

                          : "bg-cyan-500/20 text-cyan-300"
                      }
                    `}
                  >

                    {
                      item.quantity || 0
                    }

                  </div>

                  {/* PLUS */}
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity || 0,
                        "plus"
                      )
                    }
                    className="
                      w-14
                      h-14

                      md:w-20
                      md:h-20

                      rounded-2xl md:rounded-3xl

                      bg-green-500/20

                      flex
                      items-center
                      justify-center

                      active:scale-95

                      transition-all
                    "
                  >

                    <Plus className="w-6 h-6 md:w-10 md:h-10 text-green-300" />

                  </button>

                </div>

              </div>

            </motion.div>
          )
        )}

        {filteredProducts.length === 0 && (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center

              py-20
            "
          >

            <Package className="w-14 h-14 md:w-16 md:h-16 text-cyan-300 mb-6" />

            <h3 className="text-2xl md:text-3xl font-black mb-3">
              Aucun produit
            </h3>

            <p className="text-gray-400 text-center text-sm md:text-base">
              Aucun résultat trouvé
            </p>

          </div>

        )}

      </div>

    </main>
  );
}