"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import {
  Package,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Search,
  AlertTriangle,
  X,
  Camera,
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
];

export default function TraceabilityPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("Tous");

  const [open, setOpen] =
    useState(false);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [formData, setFormData] =
    useState({
      product: "",
      category: "",
      lot: "",
      supplier: "",
      dlc: "",
      quantity: 0,
      unit: "pièce",
    });

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

    const diffDays =
      Math.ceil(
        (
          date.getTime() -
          today.getTime()
        ) /
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

  const handleChange = (
    field: string,
    value: any
  ) => {

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const resetForm = () => {

    setFormData({
      product: "",
      category: "",
      lot: "",
      supplier: "",
      dlc: "",
      quantity: 0,
      unit: "pièce",
    });

    setImageFile(null);

    setImagePreview("");

    setOpen(false);
  };

  const addProduct = async () => {

    if (
      formData.product.trim() === ""
    ) {

      alert(
        "Nom produit requis"
      );

      return;
    }

    let imageUrl = "";

    if (imageFile) {

      const fileName =
        `${Date.now()}-${imageFile.name}`;

      await supabase.storage
        .from(
          "traceability-images"
        )
        .upload(fileName, imageFile);

      const { data } =
        supabase.storage
          .from(
            "traceability-images"
          )
          .getPublicUrl(fileName);

      imageUrl =
        data.publicUrl;
    }

    await supabase
      .from(
        "traceability_products"
      )
      .insert([
        {
          ...formData,
          image_url: imageUrl,
        },
      ]);

    fetchProducts();

    resetForm();
  };

  const deleteProduct = async (
    id: string
  ) => {

    await supabase
      .from(
        "traceability_products"
      )
      .delete()
      .eq("id", id);

    fetchProducts();
  };

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
      <div className="flex items-center justify-between mb-12">

        <div>

          <div className="flex items-center gap-4 mb-4">

            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

            <p className="text-cyan-400 font-semibold tracking-widest uppercase">
              STOCK CENTER
            </p>

          </div>

          <h1 className="text-7xl font-black">
            Stocks
          </h1>

        </div>

        <button
          onClick={() =>
            setOpen(true)
          }
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-cyan-500
            px-6
            py-4
            text-black
            font-bold
          "
        >

          <Plus />

          Ajouter produit

        </button>

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
            placeholder="Rechercher..."
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
      <div className="flex gap-4 overflow-x-auto mb-8 pb-2">

        {categories.map((cat) => (

          <button
            key={cat.name}
            onClick={() =>
              setActiveFilter(
                cat.name
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

              ${
                activeFilter ===
                cat.name

                  ? "bg-cyan-500 text-black border-cyan-400"

                  : "bg-white/[0.04] border-white/10 text-white"
              }
            `}
          >

            <span>
              {cat.emoji}
            </span>

            {cat.name}

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
          overflow-hidden
        "
      >

        <div
          className="
            grid
            grid-cols-[2fr_1fr_1fr_1fr_1fr_180px]

            border-b
            border-white/10

            px-8
            py-6

            text-gray-400
            font-semibold
          "
        >

          <div>Produit</div>
          <div>Stock</div>
          <div>Lot</div>
          <div>DLC</div>
          <div>Statut</div>
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
            className="
              grid
              grid-cols-[2fr_1fr_1fr_1fr_1fr_180px]

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
                  {item.category}
                </p>

              </div>

            </div>

            {/* STOCK */}
            <div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    updateQuantity(
                      item,
                      -1
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-red-500/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Minus className="w-4 h-4 text-red-400" />

                </button>

                <div className="font-bold text-lg min-w-[70px] text-center">

                  {item.quantity || 0} {item.unit}

                </div>

                <button
                  onClick={() =>
                    updateQuantity(
                      item,
                      1
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-green-500/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Plus className="w-4 h-4 text-green-400" />

                </button>

              </div>

            </div>

            <div>{item.lot}</div>

            <div>{item.dlc}</div>

            {/* STATUS */}
            <div>

              {(() => {

                const status =
                  getStatus(
                    item.dlc
                  );

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

            {/* ACTIONS */}
            <div className="flex gap-3">

              <button
                onClick={() =>
                  deleteProduct(
                    item.id
                  )
                }
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-red-500/10
                  flex
                  items-center
                  justify-center
                "
              >

                <Trash2 className="w-5 h-5 text-red-400" />

              </button>

            </div>

          </motion.div>

        ))}

      </div>

      {/* MODAL */}
      {open && (

        <div
          className="
            fixed
            inset-0
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            p-4
          "
        >

          <div
            className="
              w-full
              max-w-2xl
              rounded-3xl
              bg-[#071120]
              border
              border-white/10
              p-8
            "
          >

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-4xl font-black">
                Ajouter produit
              </h2>

              <button
                onClick={resetForm}
                className="
                  rounded-2xl
                  bg-white/10
                  p-3
                "
              >

                <X />

              </button>

            </div>

            {/* PHOTO */}
            <label
              className="
                flex
                flex-col
                items-center
                justify-center

                border-2
                border-dashed
                border-white/10

                rounded-3xl

                p-10

                cursor-pointer

                hover:border-cyan-400

                transition-all

                mb-8
              "
            >

              <Camera className="w-12 h-12 text-cyan-300 mb-4" />

              <p className="font-bold">
                Importer photo
              </p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {

                  const file =
                    e.target.files?.[0];

                  if (file) {

                    setImageFile(file);

                    setImagePreview(
                      URL.createObjectURL(
                        file
                      )
                    );
                  }
                }}
              />

            </label>

            {imagePreview && (

              <img
                src={imagePreview}
                className="
                  w-full
                  h-60
                  object-cover
                  rounded-3xl
                  mb-6
                "
              />

            )}

            <div className="space-y-5">

              <input
                type="text"
                placeholder="Nom produit"
                value={formData.product}
                onChange={(e) =>
                  handleChange(
                    "product",
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  bg-white/[0.05]
                  border
                  border-white/10
                  px-5
                  py-4
                "
              />

              <select
                value={
                  formData.category
                }
                onChange={(e) =>
                  handleChange(
                    "category",
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  bg-white/[0.05]
                  border
                  border-white/10
                  px-5
                  py-4
                "
              >

                <option value="">
                  Catégorie
                </option>

                {categories
                  .filter(
                    (c) =>
                      c.name !==
                      "Tous"
                  )
                  .map((c) => (

                    <option
                      key={c.name}
                      value={c.name}
                    >

                      {c.emoji} {c.name}

                    </option>

                  ))}

              </select>

              <input
                type="number"
                placeholder="Quantité"
                value={
                  formData.quantity
                }
                onChange={(e) =>
                  handleChange(
                    "quantity",
                    Number(
                      e.target.value
                    )
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  bg-white/[0.05]
                  border
                  border-white/10
                  px-5
                  py-4
                "
              />

              <select
                value={formData.unit}
                onChange={(e) =>
                  handleChange(
                    "unit",
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  bg-white/[0.05]
                  border
                  border-white/10
                  px-5
                  py-4
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

              <input
                type="text"
                placeholder="Lot"
                value={formData.lot}
                onChange={(e) =>
                  handleChange(
                    "lot",
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  bg-white/[0.05]
                  border
                  border-white/10
                  px-5
                  py-4
                "
              />

              <input
                type="text"
                placeholder="DLC jj/mm/aaaa"
                value={formData.dlc}
                onChange={(e) =>
                  handleChange(
                    "dlc",
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  bg-white/[0.05]
                  border
                  border-white/10
                  px-5
                  py-4
                "
              />

              <button
                onClick={addProduct}
                className="
                  w-full
                  rounded-2xl
                  bg-cyan-500
                  py-4
                  text-black
                  font-bold
                "
              >

                Ajouter produit

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}