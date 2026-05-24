"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Calendar,
  FileText,
  Package,
  ShieldCheck,
} from "lucide-react";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { supabase } from "@/lib/supabase";

export default function TraceabilityPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  useEffect(() => {

    fetchProducts();

  }, []);

  useEffect(() => {

    fetchProducts();

  }, [
    startDate,
    endDate,
  ]);

  const fetchProducts =
    async () => {

      let query =
        supabase
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

      if (startDate) {

        query =
          query.gte(
            "created_at",
            startDate
          );
      }

      if (endDate) {

        query =
          query.lte(
            "created_at",
            endDate
          );
      }

      const {
        data,
      } =
        await query;

      if (data) {

        setProducts(
          data
        );
      }
    };

  const exportPDF = () => {

    const doc =
      new jsPDF();

    doc.setFontSize(24);

    doc.text(
      "Rapport Traçabilité HACCP",
      14,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Période : ${
        startDate || "Début"
      } → ${
        endDate || "Aujourd'hui"
      }`,
      14,
      32
    );

    autoTable(doc, {

      startY: 45,

      head: [[
        "Produit",
        "Lot",
        "DLC",
        "Fournisseur",
      ]],

      body:
        products.map(
          (
            item
          ) => [

            item.product ||
              "-",

            item.batch ||
              "-",

            item.dlc ||
              "-",

            item.supplier ||
              "-",
          ]
        ),
    });

    doc.save(
      "rapport-tracabilite-haccp.pdf"
    );
  };

  return (

    <main className="min-h-screen p-10 text-white">

      {/* HEADER */}
      <div className="mb-12">

        <div className="flex items-center gap-4 mb-4">

          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-widest uppercase">
            TRACEABILITY SYSTEM
          </p>

        </div>

        <h1 className="text-7xl font-black">
          Traçabilité HACCP
        </h1>

        <p className="text-gray-400 mt-5 text-xl">
          Suivi produits et conformité sanitaire
        </p>

      </div>

      {/* FILTERS */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-7
          mb-10
        "
      >

        <div className="flex flex-col xl:flex-row gap-5 items-center justify-between">

          <div className="flex flex-col md:flex-row gap-5 w-full">

            {/* START DATE */}
            <div className="flex-1">

              <label className="text-sm text-gray-400 mb-2 block">
                Date début
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-3

                  rounded-2xl

                  border
                  border-white/10

                  bg-black/20

                  px-5
                  py-4
                "
              >

                <Calendar className="text-cyan-300 w-5 h-5" />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                  className="
                    bg-transparent
                    outline-none
                    w-full
                  "
                />

              </div>

            </div>

            {/* END DATE */}
            <div className="flex-1">

              <label className="text-sm text-gray-400 mb-2 block">
                Date fin
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-3

                  rounded-2xl

                  border
                  border-white/10

                  bg-black/20

                  px-5
                  py-4
                "
              >

                <Calendar className="text-cyan-300 w-5 h-5" />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                  className="
                    bg-transparent
                    outline-none
                    w-full
                  "
                />

              </div>

            </div>

          </div>

          {/* EXPORT */}
          <button
            onClick={exportPDF}
            className="
              flex
              items-center
              gap-3

              px-7
              py-4

              rounded-2xl

              bg-cyan-500

              text-black
              font-black

              hover:scale-105

              transition-all
            "
          >

            <FileText className="w-5 h-5" />

            Export PDF

          </button>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-10">

        {/* PRODUCTS */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <Package className="text-cyan-300" />

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          </div>

          <p className="text-cyan-200">
            Produits tracés
          </p>

          <h2 className="text-6xl font-black mt-4">

            {products.length}

          </h2>

        </motion.div>

        {/* SYSTEM */}
        <motion.div
          whileHover={{
            scale: 1.03,
            y: -5,
          }}
          className="
            rounded-3xl
            border
            border-green-500/20
            bg-green-500/10
            p-7
          "
        >

          <div className="flex items-center justify-between mb-8">

            <ShieldCheck className="text-green-300" />

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

          </div>

          <p className="text-green-200">
            Conformité HACCP
          </p>

          <h2 className="text-4xl font-black mt-6">
            ACTIVE
          </h2>

        </motion.div>

      </div>

      {/* TABLE */}
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-8
        "
      >

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-black">
            Historique traçabilité
          </h2>

          <div
            className="
              bg-cyan-500/10
              border
              border-cyan-500/20
              px-5
              py-2
              rounded-2xl
              text-cyan-300
              text-sm
              font-semibold
            "
          >
            LIVE TRACEABILITY
          </div>

        </div>

        <div className="space-y-5">

          {products.map(
            (
              item,
              index
            ) => (

              <motion.div
                key={index}
                whileHover={{
                  scale: 1.01,
                }}
                className="
                  flex
                  items-center
                  justify-between

                  rounded-2xl

                  border
                  border-white/10

                  bg-white/[0.03]

                  p-5
                "
              >

                <div>

                  <h3 className="text-2xl font-black">

                    {
                      item.product ||
                      "-"
                    }

                  </h3>

                  <p className="text-gray-400 mt-2">

                    Lot :
                    {" "}
                    {
                      item.batch ||
                      "-"
                    }

                  </p>

                  <p className="text-gray-400 mt-1">

                    DLC :
                    {" "}
                    {
                      item.dlc ||
                      "-"
                    }

                  </p>

                  <p className="text-gray-400 mt-1">

                    Fournisseur :
                    {" "}
                    {
                      item.supplier ||
                      "-"
                    }

                  </p>

                </div>

                <div
                  className="
                    px-5
                    py-3

                    rounded-2xl

                    bg-cyan-500/10

                    text-cyan-300
                    font-bold
                  "
                >

                  HACCP

                </div>

              </motion.div>
            )
          )}

          {products.length === 0 && (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center

                py-20
              "
            >

              <Package className="w-16 h-16 text-cyan-300 mb-6" />

              <h3 className="text-3xl font-black mb-3">
                Aucun produit
              </h3>

              <p className="text-gray-400">
                Aucun historique disponible
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}