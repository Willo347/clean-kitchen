"use client";

import { useEffect, useState } from "react";

import {
  Package,
  Calendar,
  Thermometer,
  Truck,
  Archive,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function ProductDetailsPage() {

  const params = useParams();

  const [product, setProduct] =
    useState<any>(null);

  const [movements, setMovements] =
    useState<any[]>([]);

  useEffect(() => {

    fetchProduct();

  }, []);

  const fetchProduct =
    async () => {

      const { data } =
        await supabase
          .from(
            "traceability_products"
          )
          .select("*")
          .eq(
            "id",
            params.id
          )
          .single();

      if (data) {

        setProduct(data);

        fetchMovements(
          data.product
        );
      }
    };

  const fetchMovements =
    async (
      productName: string
    ) => {

      const { data } =
        await supabase
          .from(
            "stock_movements"
          )
          .select("*")
          .eq(
            "product",
            productName
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (data) {

        setMovements(data);
      }
    };

  if (!product) {

    return (

      <main className="min-h-screen flex items-center justify-center text-white">

        Chargement...

      </main>
    );
  }

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            PRODUCT DETAILS
          </p>

        </div>

        <h1 className="text-7xl font-black">

          {product.product}

        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Fiche produit détaillée
        </p>

      </div>

      {/* TOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

        {/* PHOTO */}
        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
          "
        >

          {product.image_url ? (

            <img
              src={product.image_url}
              className="
                w-full
                h-[500px]
                object-cover
                rounded-3xl
              "
            />

          ) : (

            <div
              className="
                h-[500px]

                rounded-3xl

                bg-cyan-500/10

                flex
                items-center
                justify-center
              "
            >

              <Package className="w-32 h-32 text-cyan-300" />

            </div>

          )}

        </div>

        {/* INFOS */}
        <div className="space-y-6">

          {/* STOCK */}
          <div
            className="
              rounded-3xl
              border
              border-cyan-500/20
              bg-cyan-500/10
              p-7
            "
          >

            <div className="flex items-center gap-4 mb-4">

              <Archive className="text-cyan-300" />

              <p className="text-cyan-200 font-semibold">
                Stock actuel
              </p>

            </div>

            <h2 className="text-6xl font-black">

              {product.quantity}
              {" "}
              {product.unit}

            </h2>

          </div>

          {/* SUPPLIER */}
          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
            "
          >

            <div className="flex items-center gap-4 mb-4">

              <Truck className="text-cyan-300" />

              <p className="text-gray-300 font-semibold">
                Fournisseur
              </p>

            </div>

            <h2 className="text-3xl font-black">

              {product.supplier}

            </h2>

          </div>

          {/* LOT */}
          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
            "
          >

            <div className="flex items-center gap-4 mb-4">

              <Package className="text-cyan-300" />

              <p className="text-gray-300 font-semibold">
                Numéro lot
              </p>

            </div>

            <h2 className="text-3xl font-black">

              {product.lot}

            </h2>

          </div>

          {/* DLC */}
          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
            "
          >

            <div className="flex items-center gap-4 mb-4">

              <Calendar className="text-cyan-300" />

              <p className="text-gray-300 font-semibold">
                DLC
              </p>

            </div>

            <h2 className="text-3xl font-black">

              {product.dlc}

            </h2>

          </div>

          {/* TEMPERATURE */}
          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
            "
          >

            <div className="flex items-center gap-4 mb-4">

              <Thermometer className="text-cyan-300" />

              <p className="text-gray-300 font-semibold">
                Température réception
              </p>

            </div>

            <h2 className="text-3xl font-black">

              {product.temperature}

            </h2>

          </div>

        </div>

      </div>

      {/* HISTORY */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          overflow-hidden
        "
      >

        <div className="px-8 py-6 border-b border-white/10">

          <h2 className="text-3xl font-black">
            Historique mouvements
          </h2>

        </div>

        {movements.map(
          (movement, index) => (

            <div
              key={index}
              className="
                flex
                items-center
                justify-between

                px-8
                py-6

                border-b
                border-white/5
              "
            >

              <div className="flex items-center gap-4">

                {
                  movement.movement_type ===
                  "Entrée"

                    ? (

                      <ArrowDownCircle className="text-green-400" />

                    )

                    : (

                      <ArrowUpCircle className="text-red-400" />

                    )
                }

                <div>

                  <p className="font-bold text-lg">

                    {
                      movement.movement_type
                    }

                  </p>

                  <p className="text-gray-500 text-sm">

                    {
                      new Date(
                        movement.created_at
                      ).toLocaleString(
                        "fr-FR"
                      )
                    }

                  </p>

                </div>

              </div>

              <div
                className={`
                  px-5
                  py-3
                  rounded-2xl
                  font-bold

                  ${
                    movement.movement_type ===
                    "Entrée"

                      ? "bg-green-500/10 text-green-300"

                      : "bg-red-500/10 text-red-300"
                  }
                `}
              >

                {
                  movement.movement_type ===
                  "Entrée"

                    ? "+"

                    : "-"
                }

                {movement.quantity}
                {" "}
                {movement.unit}

              </div>

            </div>
          )
        )}

      </div>

    </main>
  );
}