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
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const categories = [
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

  const [selectedCategory, setSelectedCategory] =
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

  const addProduct = async () => {

    if (productName.trim() === "") {

      alert("Veuillez entrer un nom produit.");

      return;
    }

    const newProduct = {

      product: productName,

      category: selectedCategory,

      lot:
        lot.trim() === ""
          ? "Non renseigné"
          : lot,

      supplier:
        supplier.trim() === ""
          ? "Non renseigné"
          : supplier,

      temperature:
        temperature.trim() === ""
          ? "--"
          : temperature.includes("°C")
            ? temperature
            : `${temperature}°C`,

      dlc:
        dlc.trim() === ""
          ? "--"
          : dlc,

      image_url: imagePreview,
    };

    const { error } =
      await supabase
        .from("traceability_products")
        .insert([newProduct]);

    if (!error) {

      fetchProducts();

      setProductName("");
      setLot("");
      setSupplier("");
      setTemperature("");
      setDlc("");

      setImagePreview("");

      setSelectedCategory("");

      setOpen(false);
    }
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

        <button
          onClick={() => setOpen(true)}
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
            text-lg
          "
        >

          <Plus className="w-6 h-6" />

          Ajouter produit

        </button>

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

        {/* HEADER */}
        <div
          className="
            grid
            grid-cols-6
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

        {/* PRODUCTS */}
        {products.map((item, index) => (

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
              grid-cols-6
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
                  src={item.image_url}
                  alt={item.product}
                  className="
                    w-16
                    h-16
                    object-cover
                    rounded-2xl
                    border
                    border-white/10
                  "
                />

              ) : (

                <div className="bg-cyan-500/20 p-3 rounded-2xl">

                  <Package className="w-5 h-5 text-cyan-300" />

                </div>

              )}

              <div>

                <p className="font-bold text-lg">
                  {item.product}
                </p>

                <p className="text-gray-500 text-sm">
                  {item.category || "Produit alimentaire"}
                </p>

              </div>

            </div>

            {/* LOT */}
            <div>
              {item.lot}
            </div>

            {/* SUPPLIER */}
            <div className="flex items-center gap-3">

              <Truck className="w-5 h-5 text-cyan-300" />

              <span>
                {item.supplier}
              </span>

            </div>

            {/* TEMP */}
            <div className="flex items-center gap-3">

              <Thermometer className="w-5 h-5 text-cyan-300" />

              <span>
                {item.temperature}
              </span>

            </div>

            {/* DLC */}
            <div>
              {item.dlc}
            </div>

            {/* STATUS */}
            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2

                  bg-green-500/20

                  px-4
                  py-2

                  rounded-full

                  text-green-300
                  font-semibold
                "
              >

                <CheckCircle2 className="w-4 h-4" />

                Conforme

              </div>

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

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              w-full
              max-w-3xl

              max-h-[90vh]
              overflow-y-auto

              rounded-3xl

              border
              border-white/10

              bg-[#071120]

              p-8
            "
          >

            {/* TOP */}
            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-4xl font-black">
                  Ajouter produit
                </h2>

                <p className="text-gray-400 mt-2">
                  Sélection rapide catégorie produit
                </p>

              </div>

              <button
                onClick={() => setOpen(false)}
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

              <p className="text-lg font-bold">
                Importer une photo
              </p>

              <p className="text-gray-400 mt-2 text-sm">
                JPG, PNG ou photo téléphone
              </p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {

                  const file =
                    e.target.files?.[0];

                  if (file) {

                    setImagePreview(
                      URL.createObjectURL(file)
                    );
                  }
                }}
              />

            </label>

            {/* PREVIEW */}
            {imagePreview && (

              <div className="mb-8">

                <img
                  src={imagePreview}
                  alt="Preview"
                  className="
                    w-full
                    max-h-72
                    object-cover

                    rounded-3xl

                    border
                    border-white/10
                  "
                />

              </div>

            )}

            {/* CATEGORIES */}
            <div className="grid grid-cols-2 gap-4 mb-8">

              {categories.map((category) => (

                <button
                  key={category.name}
                  onClick={() =>
                    setSelectedCategory(
                      category.name
                    )
                  }
                  className={`
                    rounded-2xl
                    border
                    p-6
                    text-left
                    transition-all

                    ${
                      selectedCategory ===
                      category.name

                        ? "border-cyan-400 bg-cyan-500/20"

                        : "border-white/10 bg-white/[0.03]"
                    }
                  `}
                >

                  <div className="text-4xl mb-4">
                    {category.emoji}
                  </div>

                  <p className="text-xl font-bold">
                    {category.name}
                  </p>

                </button>

              ))}

            </div>

            {/* FORM */}
            {selectedCategory && (

              <div className="space-y-5">

                <input
                  type="text"
                  placeholder="Nom produit *"
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                  className="
                    w-full
                    rounded-2xl
                    bg-white/[0.05]
                    border
                    border-white/10
                    px-5
                    py-4
                    outline-none
                  "
                />

                <input
                  type="text"
                  placeholder="Numéro lot"
                  value={lot}
                  onChange={(e) =>
                    setLot(e.target.value)
                  }
                  className="
                    w-full
                    rounded-2xl
                    bg-white/[0.05]
                    border
                    border-white/10
                    px-5
                    py-4
                    outline-none
                  "
                />

                <input
                  type="text"
                  placeholder="Fournisseur"
                  value={supplier}
                  onChange={(e) =>
                    setSupplier(e.target.value)
                  }
                  className="
                    w-full
                    rounded-2xl
                    bg-white/[0.05]
                    border
                    border-white/10
                    px-5
                    py-4
                    outline-none
                  "
                />

                <input
                  type="text"
                  placeholder="Température réception"
                  value={temperature}
                  onChange={(e) =>
                    setTemperature(e.target.value)
                  }
                  className="
                    w-full
                    rounded-2xl
                    bg-white/[0.05]
                    border
                    border-white/10
                    px-5
                    py-4
                    outline-none
                  "
                />

                <input
                  type="text"
                  placeholder="DLC"
                  value={dlc}
                  onChange={(e) =>
                    setDlc(e.target.value)
                  }
                  className="
                    w-full
                    rounded-2xl
                    bg-white/[0.05]
                    border
                    border-white/10
                    px-5
                    py-4
                    outline-none
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
                    text-lg
                  "
                >

                  Ajouter produit

                </button>

              </div>

            )}

          </motion.div>

        </div>

      )}

    </main>
  );
}