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
        "Statut",
      ]],

      body:
        products.map(
          (
            item
          ) => {

            const dlcDate =
              item.dlc
                ? new Date(item.dlc)
                : null;

            const today =
              new Date();

            const diffTime =
              dlcDate
                ? dlcDate.getTime() -
                  today.getTime()
                : 0;

            const diffDays =
              Math.ceil(
                diffTime /
                (1000 * 60 * 60 * 24)
              );

            let status =
              "OK";

            if (
              diffDays <= 3
            ) {

              status =
                "Bientôt périmé";
            }

            if (
              diffDays < 0
            ) {

              status =
                "PÉRIMÉ";
            }

            return [

              item.product ||
                "-",

              item.batch ||
                "-",

              item.dlc ||
                "-",

              item.supplier ||
                "-",

              status,
            ];
          }
        ),
    });

    doc.save(
      "rapport-tracabilite-haccp.pdf"
    );
  };

  return (

    <main className="min-h-screen text-white">

      {/* HEADER */}
      <div className="mb-8 md:mb-12">

        <div className="flex items-center gap-3 md:gap-4 mb-4">

          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 font-semibold tracking-[0.2em] md:tracking-widest uppercase text-xs md:text-sm">
            TRACEABILITY SYSTEM
          </p>

        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-none">
          Traçabilité HACCP
        </h1>

        <p className="text-gray-400 mt-4 md:mt-5 text-base md:text-xl">
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

          p-5 md:p-7

          mb-8 md:mb-10
        "
      >

        <div className="flex flex-col xl:flex-row gap-5 xl:items-end xl:justify-between">

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

                  px-4 md:px-5
                  py-4
                "
              >

                <Calendar className="text-cyan-300 w-5 h-5 shrink-0" />

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

                    text-sm md:text-base
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

                  px-4 md:px-5
                  py-4
                "
              >

                <Calendar className="text-cyan-300 w-5 h-5 shrink-0" />

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

                    text-sm md:text-base
                  "
                />

              </div>

            </div>

          </div>

          {/* EXPORT */}
          <button
            onClick={exportPDF}
            className="
              w-full
              xl:w-auto

              flex
              items-center
              justify-center
              gap-3

              px-6 md:px-7
              py-4

              rounded-2xl

              bg-cyan-500

              text-black
              font-black

              text-sm md:text-base

              hover:scale-[1.02]

              transition-all
            "
          >

            <FileText className="w-5 h-5" />

            Export PDF

          </button>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 mb-8 md:mb-10">

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

            p-5 md:p-7
          "
        >

          <div className="flex items-center justify-between mb-6 md:mb-8">

            <Package className="text-cyan-300 w-8 h-8 md:w-10 md:h-10" />

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          </div>

          <p className="text-cyan-200 text-sm md:text-base">
            Produits tracés
          </p>

          <h2 className="text-4xl md:text-6xl font-black mt-4">

            {products.length}

          </h2>

        </motion.div>

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

            p-5 md:p-7
          "
        >

          <div className="flex items-center justify-between mb-6 md:mb-8">

            <ShieldCheck className="text-green-300 w-8 h-8 md:w-10 md:h-10" />

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

          </div>

          <p className="text-green-200 text-sm md:text-base">
            Conformité HACCP
          </p>

          <h2 className="text-3xl md:text-4xl font-black mt-6">
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

          p-5 md:p-8
        "
      >

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between

            gap-4

            mb-8
          "
        >

          <h2 className="text-2xl md:text-3xl font-black">
            Historique traçabilité
          </h2>

          <div
            className="
              w-fit

              bg-cyan-500/10

              border
              border-cyan-500/20

              px-4 md:px-5
              py-2

              rounded-2xl

              text-cyan-300
              text-xs md:text-sm
              font-semibold
            "
          >
            LIVE TRACEABILITY
          </div>

        </div>

        <div className="space-y-4 md:space-y-5">

          {products.map(
            (
              item,
              index
            ) => {

              const dlcDate =
                item.dlc
                  ? new Date(item.dlc)
                  : null;

              const today =
                new Date();

              const diffTime =
                dlcDate
                  ? dlcDate.getTime() -
                    today.getTime()
                  : 0;

              const diffDays =
                Math.ceil(
                  diffTime /
                  (1000 * 60 * 60 * 24)
                );

              let status =
                "OK";

              let statusColor =
                "bg-green-500/20 text-green-300";

              if (
                diffDays <= 3
              ) {

                status =
                  "Bientôt périmé";

                statusColor =
                  "bg-orange-500/20 text-orange-300";
              }

              if (
                diffDays < 0
              ) {

                status =
                  "PÉRIMÉ";

                statusColor =
                  "bg-red-500/20 text-red-300";
              }

              return (

                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.01,
                  }}
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between

                    gap-5

                    rounded-2xl

                    border
                    border-white/10

                    bg-white/[0.03]

                    p-5
                  "
                >

                  <div className="min-w-0">

                    <h3 className="text-2xl md:text-3xl font-black break-words">

                      {
                        item.product ||
                        "-"
                      }

                    </h3>

                    <p className="text-gray-400 mt-2 text-sm md:text-base break-words">

                      Lot :
                      {" "}
                      {
                        item.batch ||
                        "-"
                      }

                    </p>

                    <p className="text-gray-400 mt-1 text-sm md:text-base break-words">

                      DLC :
                      {" "}
                      {
                        item.dlc ||
                        "-"
                      }

                    </p>

                    <p className="text-gray-400 mt-1 text-sm md:text-base break-words">

                      Fournisseur :
                      {" "}
                      {
                        item.supplier ||
                        "-"
                      }

                    </p>

                  </div>

                  <div
                    className={`
                      w-fit

                      px-4 md:px-5
                      py-3

                      rounded-2xl

                      text-sm md:text-base
                      font-bold

                      ${statusColor}
                    `}
                  >

                    {status}

                  </div>

                </motion.div>
              );
            }
          )}

          {products.length === 0 && (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center

                py-16 md:py-20
              "
            >

              <Package className="w-14 h-14 md:w-16 md:h-16 text-cyan-300 mb-6" />

              <h3 className="text-2xl md:text-3xl font-black mb-3">
                Aucun produit
              </h3>

              <p className="text-gray-400 text-center text-sm md:text-base">
                Aucun historique disponible
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}