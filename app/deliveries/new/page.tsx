"use client";

import { useState } from "react";

import {
  Truck,
  Package,
  Calendar,
  Thermometer,
  Save,
  Camera,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function NewDeliveryPage() {

  const [loading, setLoading] =
    useState(false);

  const [imageFile, setImageFile] =
    useState<any>(null);

  const [preview, setPreview] =
    useState("");

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

  const handleImage = (
    e: any
  ) => {

    const file =
      e.target.files?.[0];

    if (!file)
      return;

    setImageFile(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  const handleSubmit =
    async () => {

      try {

        setLoading(true);

        let imageUrl = "";

        /* IMAGE UPLOAD */
        if (imageFile) {

          const fileName =
            `${Date.now()}-${imageFile.name}`;

          const {
            error: uploadError,
          } =
            await supabase
              .storage
              .from("products")
              .upload(
                fileName,
                imageFile
              );

          if (!uploadError) {

            const {
              data,
            } = supabase
              .storage
              .from("products")
              .getPublicUrl(
                fileName
              );

            imageUrl =
              data.publicUrl;
          }
        }

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

              image_url:
                imageUrl,
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
          "Livraison ajoutée 🚚"
        );

        setPreview("");

        setImageFile(null);

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
          "Erreur ajout livraison"
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

        {/* PHOTO */}
        <div className="mb-10">

          <label className="text-gray-400 mb-4 block">
            Photo produit
          </label>

          <label
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-4

              border-2
              border-dashed
              border-cyan-500/30

              rounded-3xl

              p-10

              bg-cyan-500/5

              cursor-pointer
            "
          >

            {preview ? (

              <img
                src={preview}
                className="w-64 h-64 object-cover rounded-3xl"
              />

            ) : (

              <>

                <Camera className="w-16 h-16 text-cyan-300" />

                <p className="text-cyan-200">
                  Ajouter une photo
                </p>

              </>

            )}

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={
                handleImage
              }
              className="hidden"
            />

          </label>

        </div>

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

          {
            loading

              ? "Ajout..."

              : "Valider la livraison"
          }

        </button>

      </div>

    </main>
  );
}