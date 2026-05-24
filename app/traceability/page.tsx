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

  const [editOpen, setEditOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<any>(null);

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

  const addProduct = async () => {

    if (productName.trim() === "") {

      alert("Veuillez entrer un nom produit.");

      return;
    }

    let imageUrl = "";

    if (imageFile) {

      const fileName =
        `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } =
        await supabase.storage
          .from("traceability-images")
          .upload(fileName, imageFile);

      if (!uploadError) {

        const { data } =
          supabase.storage
            .from("traceability-images")
            .getPublicUrl(fileName);

        imageUrl =
          data.publicUrl;
      }
    }

    const newProduct = {

      product: productName,

      category: selectedCategory,

      lot,

      supplier,

      temperature,

      dlc,

      image_url: imageUrl,
    };

    const { error } =
      await supabase
        .from("traceability_products")
        .insert([newProduct]);

    if (!error) {

      fetchProducts();

      resetForm();
    }
  };

  const resetForm = () => {

    setProductName("");
    setLot("");
    setSupplier("");
    setTemperature("");
    setDlc("");

    setImagePreview("");
    setImageFile(null);

    setSelectedCategory("");

    setOpen(false);
  };

  const deleteProduct = async (
    id: string
  ) => {

    const confirmDelete =
      confirm(
        "Supprimer ce produit ?"
      );

    if (!confirmDelete) {
      return;
    }

    await supabase
      .from("traceability_products")
      .delete()
      .eq("id", id);

    fetchProducts();
  };

  const openEditModal = (
    product: any
  ) => {

    setEditingProduct(product);

    setProductName(product.product || "");
    setLot(product.lot || "");
    setSupplier(product.supplier || "");
    setTemperature(product.temperature || "");
    setDlc(product.dlc || "");
    setSelectedCategory(
      product.category || ""
    );

    setEditOpen(true);
  };

  const updateProduct = async () => {

    if (!editingProduct) return;

    await supabase
      .from("traceability_products")
      .update({
        product: productName,
        lot,
        supplier,
        temperature,
        dlc,
        category: selectedCategory,
      })
      .eq("id", editingProduct.id);

    fetchProducts();

    setEditOpen(false);
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
            grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px]

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
          <div>Actions</div>

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
              grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px]

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

            {/* ACTIONS */}
            <div className="flex items-center gap-3">

              {/* EDIT */}
              <button
                onClick={() =>
                  openEditModal(item)
                }
                className="
                  flex
                  items-center
                  justify-center

                  w-12
                  h-12

                  rounded-2xl

                  bg-cyan-500/10

                  hover:bg-cyan-500/20

                  transition-all
                "
              >

                <Pencil className="w-5 h-5 text-cyan-300" />

              </button>

              {/* DELETE */}
              <button
                onClick={() =>
                  deleteProduct(item.id)
                }
                className="
                  flex
                  items-center
                  justify-center

                  w-12
                  h-12

                  rounded-2xl

                  bg-red-500/10

                  hover:bg-red-500/20

                  transition-all
                "
              >

                <Trash2 className="w-5 h-5 text-red-400" />

              </button>

            </div>

          </motion.div>

        ))}

      </div>

      {/* ADD MODAL */}
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

              border
              border-white/10

              bg-[#071120]

              p-8
            "
          >

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-4xl font-black">
                Ajouter produit
              </h2>

              <button
                onClick={() =>
                  setOpen(false)
                }
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
                      URL.createObjectURL(file)
                    );
                  }
                }}
              />

            </label>

            {imagePreview && (

              <img
                src={imagePreview}
                alt="Preview"
                className="
                  w-full
                  h-60
                  object-cover
                  rounded-3xl
                  mb-8
                "
              />

            )}

            {/* FORM */}
            <div className="space-y-5">

              <input
                type="text"
                placeholder="Nom produit"
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
                placeholder="Lot"
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
                placeholder="Température"
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
                placeholder="DLC (jj/mm/aaaa)"
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

          </div>

        </div>

      )}

      {/* EDIT MODAL */}
      {editOpen && (

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

              border
              border-white/10

              bg-[#071120]

              p-8
            "
          >

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-4xl font-black">
                Modifier produit
              </h2>

              <button
                onClick={() =>
                  setEditOpen(false)
                }
                className="
                  rounded-2xl
                  bg-white/10
                  p-3
                "
              >

                <X />

              </button>

            </div>

            <div className="space-y-5">

              <input
                type="text"
                placeholder="Nom produit"
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
                placeholder="Lot"
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
                placeholder="Température"
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
                onClick={updateProduct}
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

                Sauvegarder

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}