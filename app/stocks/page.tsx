"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import {
  Package,
  Search,
  AlertTriangle,
  Boxes,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
} from "lucide-react";

import { motion } from "framer-motion";

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

  const [selectedProduct, setSelectedProduct] =
    useState<any>(null);

  const [movementType, setMovementType] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

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

  const openMovementModal = (
    item: any,
    type: string
  ) => {

    setSelectedProduct(item);

    setMovementType(type);

    setQuantity(1);
  };

  const closeModal = () => {

    setSelectedProduct(null);

    setMovementType("");

    setQuantity(1);
  };

  const validateMovement =
    async () => {

      if (!selectedProduct)
        return;

      let newQuantity =
        selectedProduct.quantity || 0;

      if (
        movementType === "entry"
      ) {

        newQuantity += quantity;
      }

      if (
        movementType === "exit"
      ) {

        newQuantity =
          Math.max(
            0,
            newQuantity -
              quantity
          );
      }

      await supabase
        .from(
          "traceability_products"
        )
        .update({
          quantity:
            newQuantity,
        })
        .eq(
          "id",
          selectedProduct.id
        );

      await supabase
        .from(
          "stock_movements"
        )
        .insert([
          {
            product:
              selectedProduct.product,

            movement_type:
              movementType ===
              "entry"

                ? "Entrée"

                : "Sortie",

            quantity:
              quantity,

            unit:
              selectedProduct.unit,
          },
        ]);

      fetchProducts();

      closeModal();
    };

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            MERCHANDISE CENTER
          </p>

        </div>

        <h1 className="text-7xl font-black">
          Marchandises
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Réception, traçabilité et gestion des stocks
        </p>

      </div>

      {/* HUB CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

        {/* NEW DELIVERY */}
        <Link href="/deliveries/new">

          <div
            className="
              rounded-3xl
              border
              border-cyan-500/20
              bg-cyan-500/10
              p-7
              hover:scale-[1.02]
              transition-all
              cursor-pointer
              h-full
            "
          >

            <p className="text-5xl mb-5">
              🚚
            </p>

            <h2 className="text-2xl font-black mb-3">
              Nouvelle livraison
            </h2>

            <p className="text-cyan-100/70">
              Ajouter réception fournisseur
            </p>

          </div>

        </Link>

        {/* STOCK */}
        <a href="#stock-section">

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
              hover:scale-[1.02]
              transition-all
              cursor-pointer
              h-full
            "
          >

            <p className="text-5xl mb-5">
              📦
            </p>

            <h2 className="text-2xl font-black mb-3">
              Stock actuel
            </h2>

            <p className="text-gray-400">
              Consulter les stocks
            </p>

          </div>

        </a>

        {/* TRACEABILITY */}
        <Link href="/traceability">

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
              hover:scale-[1.02]
              transition-all
              cursor-pointer
              h-full
            "
          >

            <p className="text-5xl mb-5">
              🧾
            </p>

            <h2 className="text-2xl font-black mb-3">
              Traçabilité
            </h2>

            <p className="text-gray-400">
              DLC, lots, fournisseurs
            </p>

          </div>

        </Link>

        {/* HISTORY */}
        <Link href="/history">

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
              hover:scale-[1.02]
              transition-all
              cursor-pointer
              h-full
            "
          >

            <p className="text-5xl mb-5">
              📜
            </p>

            <h2 className="text-2xl font-black mb-3">
              Historique
            </h2>

            <p className="text-gray-400">
              Mouvements et activités
            </p>

          </div>

        </Link>

      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

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

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

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

        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">

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

        <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5">

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
            className="w-full bg-transparent outline-none"
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

      {/* STOCK SECTION */}
      <div id="stock-section" />

      {/* TABLE */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">

        <div className="grid grid-cols-[2fr_1fr_1fr_240px] border-b border-white/10 px-8 py-6 text-gray-400 font-semibold">

          <div>Produit</div>
          <div>Catégorie</div>
          <div>Stock</div>
          <div>Actions</div>

        </div>

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
            className="grid grid-cols-[2fr_1fr_1fr_240px] items-center px-8 py-6 border-b border-white/5"
          >

            <div className="flex items-center gap-4">

              <div className="bg-cyan-500/20 p-3 rounded-2xl">

                <Package className="text-cyan-300" />

              </div>

              <div>

                <p className="font-bold text-lg">
                  {item.product}
                </p>

                <p className="text-gray-500 text-sm">
                  {item.supplier}
                </p>

              </div>

            </div>

            <div>
              {item.category}
            </div>

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

            <div className="flex gap-3">

              <button
                onClick={() =>
                  openMovementModal(
                    item,
                    "exit"
                  )
                }
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 text-red-300 font-bold"
              >

                <ArrowUpCircle className="w-5 h-5" />

                Sortie

              </button>

              <button
                onClick={() =>
                  openMovementModal(
                    item,
                    "entry"
                  )
                }
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-green-500/10 text-green-300 font-bold"
              >

                <ArrowDownCircle className="w-5 h-5" />

                Entrée

              </button>

            </div>

          </motion.div>

        ))}

      </div>

      {/* MODAL */}
      {selectedProduct && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md rounded-3xl bg-[#071120] border border-white/10 p-8">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-3xl font-black">

                {movementType ===
                "entry"

                  ? "Entrée stock"

                  : "Sortie stock"}

              </h2>

              <button
                onClick={closeModal}
                className="rounded-2xl bg-white/10 p-3"
              >

                <X />

              </button>

            </div>

            <div className="mb-8">

              <p className="text-xl font-bold mb-2">

                {selectedProduct.product}

              </p>

              <p className="text-gray-400">

                Stock actuel :
                {" "}
                {selectedProduct.quantity}
                {" "}
                {selectedProduct.unit}

              </p>

            </div>

            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) =>
                setQuantity(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-5 py-4 mb-6"
            />

            <button
              onClick={
                validateMovement
              }
              className={`
                w-full
                rounded-2xl
                py-4
                font-bold

                ${
                  movementType ===
                  "entry"

                    ? "bg-green-500 text-black"

                    : "bg-red-500 text-white"
                }
              `}
            >

              Valider

            </button>

          </div>

        </div>

      )}

    </main>
  );
}