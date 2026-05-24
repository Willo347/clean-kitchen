"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import {
  CheckCircle2,
  Package,
  Thermometer,
  Truck,
  Plus,
  X,
  Camera,
  Trash2,
  Pencil,
  AlertTriangle,
  Search,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const categories = [
  { name: "Tous", emoji: "📦" },
  { name: "Viande", emoji: "🥩" },
  { name: "Poisson", emoji: "🐟" },
  { name: "Surgelé", emoji: "🥶" },
  { name: "Fruits & légumes", emoji: "🥬" },
  { name: "Produits laitiers", emoji: "🧀" },
  { name: "Produits secs", emoji: "🥫" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Boulangerie", emoji: "🍞" },
];

export default function TraceabilityPage() {

  const [open, setOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<any>(null);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("Tous");

  const [search, setSearch] =
    useState("");

  const [productName, setProductName] =
    useState("");

  const [lot, setLot] =
    useState("");

  const [supplier, setSupplier] =
    useState("");

  const [temperature, setTemperature] =
    useState("");

  const [dlc, setDlc] =
    useState("");

  const [imagePreview, setImagePreview] =
    useState("");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [products, setProducts] =
    useState<any[]>([]);

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    const { data, error } =
      await supabase
        .from("traceability_products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (!error && data) {

      setProducts(data);
    }
  };

  const filteredProducts =
    products.filter((item) => {

      const matchesSearch =
        item.product
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        activeFilter === "Tous"
          ? true
          : item.category ===
            activeFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  const getStatus = (
    dlc: string
  ) => {

    if (!dlc) {

      return {
        label: "Sans DLC",
        color:
          "bg-gray-500/20 text-gray-300",
      };
    }

    const parts =
      dlc.split("/");

    if (parts.length !== 3) {

      return {
        label: "Invalide",
        color:
          "bg-gray-500/20 text-gray-300",
      };
    }

    const date =
      new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
      );

    const today =
      new Date();

    const diffTime =
      date.getTime() -
      today.getTime();

    const diffDays =
      Math.ceil(
        diffTime /
        (1000 * 60 * 60 * 24)
      );

    if (diffDays < 0) {

      return {
        label: "Expiré",
        color:
          "bg-red-500/20 text-red-300",
      };
    }

    if (diffDays <= 3) {

      return {
        label: "Attention",
        color:
          "bg-orange-500/20 text-orange-300",
      };
    }

    return {
      label: "Conforme",
      color:
        "bg-green-500/20 text-green-300",
    };
  };

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">

        <div>

          <div className="flex items-center gap-4 mb-4">

            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

            <p className="text-cyan-400 font-semibold tracking-widest uppercase">
              TRACEABILITY CENTER
            </p>

          </div>

          <h1 className="text-7xl font-black tracking-tight">
            Traçabilité
          </h1>

          <p className="text-gray-400 mt-5 text-xl">
            Gestion intelligente des produits, lots et DLC
          </p>

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

          <Search className="w-6 h-6 text-cyan-300" />

          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              bg-transparent
              outline-none
              text-lg
            "
          />

        </div>

      </div>

      {/* FILTERS */}
      <div className="flex gap-4 overflow-x-auto mb-10 pb-2">

        {categories.map((category) => (

          <button
            key={category.name}
            onClick={() =>
              setActiveFilter(
                category.name
              )
            }
            className={`
              flex
              items-center
              gap-3

              whitespace-nowrap

              rounded-2xl

              px-5
              py-3

              border

              transition-all

              ${
                activeFilter ===
                category.name

                  ? "bg-cyan-500 text-black border-cyan-400"

                  : "bg-white/[0.04] border-white/10 text-white"
              }
            `}
          >

            <span className="text-xl">
              {category.emoji}
            </span>

            <span className="font-semibold">
              {category.name}
            </span>

          </button>

        ))}

      </div>

      {/* COUNTER */}
      <div className="mb-6 text-gray-400">

        {filteredProducts.length} produit(s)

      </div>

      {/* TABLE */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-2xl
          overflow-hidden
        "
      >

        <div
          className="
            grid
            grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]

            border-b
            border-white/10

            px-8
            py-6

            text-gray-400
            font-semibold
          "
        >

          <div>Produit</div>
          <div>Lot</div>
          <div>Fournisseur</div>
          <div>Température</div>
          <div>DLC</div>
          <div>Statut</div>

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
            className="
              grid
              grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]

              items-center

              px-8
              py-6

              border-b
              border-white/5
            "
          >

            {/* PRODUCT */}
            <div className="flex items-center gap-4 min-w-0">

              {item.image_url ? (

                <img
                  src={item.image_url}
                  alt={item.product}
                  className="
                    w-16
                    h-16
                    object-cover
                    rounded-2xl
                    border
                    border-white/10
                    flex-shrink-0
                  "
                />

              ) : (

                <div className="bg-cyan-500/20 p-3 rounded-2xl">

                  <Package className="w-5 h-5 text-cyan-300" />

                </div>

              )}

              <div className="min-w-0">

                <p className="font-bold text-lg truncate">
                  {item.product}
                </p>

                <p className="text-gray-500 text-sm truncate">
                  {item.category}
                </p>

              </div>

            </div>

            <div>{item.lot}</div>

            <div className="flex items-center gap-3">

              <Truck className="w-5 h-5 text-cyan-300" />

              <span>
                {item.supplier}
              </span>

            </div>

            <div className="flex items-center gap-3">

              <Thermometer className="w-5 h-5 text-cyan-300" />

              <span>
                {item.temperature}
              </span>

            </div>

            <div>{item.dlc}</div>

            {/* STATUS */}
            <div>

              {(() => {

                const status =
                  getStatus(item.dlc);

                return (

                  <div
                    className={`
                      inline-flex
                      items-center
                      gap-2

                      px-4
                      py-2

                      rounded-full

                      font-semibold

                      ${status.color}
                    `}
                  >

                    <AlertTriangle className="w-4 h-4" />

                    {status.label}

                  </div>

                );
              })()}

            </div>

          </motion.div>

        ))}

      </div>

    </main>
  );
}