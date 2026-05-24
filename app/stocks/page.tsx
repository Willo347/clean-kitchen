"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Boxes,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const categories = [
  "Tous",
  "Viande",
  "Poisson",
  "Surgelé",
  "Fruits & légumes",
  "Produits laitiers",
  "Produits secs",
];

export default function StocksPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("Tous");

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    const { data } =
      await supabase
        .from("traceability_products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (data) {

      setProducts(data);
    }
  };

  const filteredProducts =
    products.filter((item) => {

      const searchMatch =
        item.product
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const categoryMatch =
        activeFilter === "Tous"
          ? true
          : item.category ===
            activeFilter;

      return (
        searchMatch &&
        categoryMatch
      );
    });

  const totalProducts =
    products.length;

  const lowStockProducts =
    products.filter(
      (item) =>
        (item.quantity || 0) <= 2
    );

  const totalQuantity =
    products.reduce(
      (acc, item) =>
        acc +
        (item.quantity || 0),
      0
    );

  const updateQuantity =
    async (
      item: any,
      change: number
    ) => {

      const newQuantity =
        Math.max(
          0,
          (item.quantity || 0) +
            change
        );

      await supabase
        .from(
          "traceability_products"
        )
        .update({
          quantity:
            newQuantity,
        })
        .eq("id", item.id);

      fetchProducts();
    };

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            STOCK CENTER
          </p>

        </div>

        <h1 className="text-7xl font-black">
          Stocks
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Gestion intelligente des stocks restauration
        </p>

      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
          "
        >

          <div className="flex items-center justify-between mb-6">

            <p className="text-gray-400 font-semibold">
              Produits
            </p>

            <Boxes className="text-cyan-300" />

          </div>

          <h2 className="text-5xl font-black">
            {totalProducts}
          </h2>

        </div>

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
          "
        >

          <div className="flex items-center justify-between mb-6">

            <p className="text-gray-400 font-semibold">
              Quantité totale
            </p>

            <Package className="text-cyan-300" />

          </div>

          <h2 className="text-5xl font-black">
            {totalQuantity}
          </h2>

        </div>

        <div
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/10
            p-8
          "
        >

          <div className="flex items-center justify-between mb-6">

            <p className="text-red-300 font-semibold">
              Stock faible
            </p>

            <AlertTriangle className="text-red-300" />

          </div>

          <h2 className="text-5xl font-black text-red-300">
            {lowStockProducts.length}
          </h2>

        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-8">

        <div
          className="
            flex
            items-center
            gap-4

            rounded-3xl

            border
            border-white/10

            bg-white/[0.04]

            px-6
            py-5
          "
        >

          <Search className="text-cyan-300" />

          <input
            type="text"
            placeholder="Rechercher produit..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              w-full
              bg-transparent
              outline-none
            "
          />

        </div>

      </div>

      {/* FILTERS */}
      <div className="flex gap-4 overflow-x-auto mb-10 pb-2">

        {categories.map((category) => (

          <button
            key={category}
            onClick={() =>
              setActiveFilter(
                category
              )
            }
            className={`
              rounded-2xl

              px-5
              py-3

              border

              whitespace-nowrap

              transition-all

              ${
                activeFilter ===
                category

                  ? "bg-cyan-500 text-black border-cyan-400"

                  : "bg-white/[0.04] border-white/10 text-white"
              }
            `}
          >

            {category}

          </button>

        ))}

      </div>

      {/* TABLE */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          overflow-hidden
        "
      >

        {/* HEADER */}
        <div
          className="
            grid
            grid-cols-[2fr_1fr_1fr_320px]

            border-b
            border-white/10

            px-8
            py-6

            text-gray-400
            font-semibold
          "
        >

          <div>Produit</div>
          <div>Catégorie</div>
          <div>Stock</div>
          <div>Mouvements</div>

        </div>

        {/* PRODUCTS */}
        {filteredProducts.map((item, index) => (

          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              grid
              grid-cols-[2fr_1fr_1fr_320px]

              items-center

              px-8
              py-6

              border-b
              border-white/5
            "
          >

            {/* PRODUCT */}
            <div className="flex items-center gap-4">

              {item.image_url ? (

                <img
                  src={
                    item.image_url
                  }
                  className="
                    w-16
                    h-16
                    object-cover
                    rounded-2xl
                  "
                />

              ) : (

                <div className="bg-cyan-500/20 p-3 rounded-2xl">

                  <Package className="text-cyan-300" />

                </div>

              )}

              <div>

                <p className="font-bold text-lg">
                  {item.product}
                </p>

                <p className="text-gray-500 text-sm">
                  {item.supplier}
                </p>

              </div>

            </div>

            {/* CATEGORY */}
            <div>

              {item.category}

            </div>

            {/* STOCK */}
            <div>

              <div
                className={`
                  inline-flex
                  items-center
                  gap-3

                  px-4
                  py-2

                  rounded-2xl

                  font-bold

                  ${
                    (item.quantity || 0) <= 2

                      ? "bg-red-500/20 text-red-300"

                      : "bg-cyan-500/10 text-cyan-300"
                  }
                `}
              >

                {(item.quantity || 0)} {item.unit}

              </div>

            </div>

            {/* MOVEMENTS */}
            <div className="flex gap-3">

              {/* -5 */}
              <button
                onClick={() =>
                  updateQuantity(
                    item,
                    -5
                  )
                }
                className="
                  px-4
                  py-3

                  rounded-2xl

                  bg-red-500/10

                  text-red-300
                  font-bold
                "
              >

                -5

              </button>

              {/* -1 */}
              <button
                onClick={() =>
                  updateQuantity(
                    item,
                    -1
                  )
                }
                className="
                  px-4
                  py-3

                  rounded-2xl

                  bg-red-500/10

                  text-red-300
                  font-bold
                "
              >

                -1

              </button>

              {/* +1 */}
              <button
                onClick={() =>
                  updateQuantity(
                    item,
                    1
                  )
                }
                className="
                  px-4
                  py-3

                  rounded-2xl

                  bg-green-500/10

                  text-green-300
                  font-bold
                "
              >

                +1

              </button>

              {/* +5 */}
              <button
                onClick={() =>
                  updateQuantity(
                    item,
                    5
                  )
                }
                className="
                  px-4
                  py-3

                  rounded-2xl

                  bg-green-500/10

                  text-green-300
                  font-bold
                "
              >

                +5

              </button>

            </div>

          </motion.div>

        ))}

      </div>

    </main>
  );
}