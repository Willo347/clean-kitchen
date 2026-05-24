"use client";

import {
  Thermometer,
  Snowflake,
  AlertTriangle,
  Minus,
  Plus,
  FileText,
} from "lucide-react";

export default function TemperaturesPage() {

  return (

    <div
      className="
        relative

        min-h-screen

        overflow-hidden

        text-white
      "
    >

      {/* PAGE GLOW */}
      <div
        className="
          absolute

          inset-0

          bg-[radial-gradient(circle_at_top_right,rgba(0,255,255,0.10),transparent_40%)]

          pointer-events-none
        "
      />

      {/* CONTENT */}
      <div
        className="
          relative
          z-10

          px-6
          py-5
        "
      >

        {/* HERO */}
        <div
          className="
            relative

            overflow-hidden

            rounded-[48px]

            border
            border-white/10

            bg-white/[0.03]

            backdrop-blur-2xl

            px-10
            py-12

            mb-8
          "
        >

          {/* HERO GLOW */}
          <div
            className="
              absolute

              top-[-120px]
              right-[-120px]

              w-[500px]
              h-[500px]

              rounded-full

              bg-cyan-400/10

              blur-[140px]
            "
          />

          {/* HERO CONTENT */}
          <div className="relative z-10">

            {/* BADGE */}
            <div
              className="
                inline-flex
                items-center

                gap-3

                rounded-full

                border
                border-cyan-400/20

                bg-cyan-400/10

                px-5
                py-3

                mb-8
              "
            >

              <div className="w-3 h-3 rounded-full bg-cyan-300" />

              <span
                className="
                  text-cyan-200

                  text-sm

                  font-semibold

                  tracking-[0.25em]
                "
              >

                TABLET MODE

              </span>

            </div>

            {/* TITLE */}
            <h1
              className="
                text-[88px]
                xl:text-[110px]

                font-black

                tracking-tight

                leading-[0.9]
              "
            >

              Températures
              <br />

              HACCP

            </h1>

            {/* SUBTITLE */}
            <p
              className="
                text-white/50

                text-2xl

                leading-relaxed

                mt-8

                max-w-3xl
              "
            >

              Supervision intelligente
              de la chaîne du froid,
              contrôle des équipements
              et surveillance temps réel.

            </p>

          </div>

        </div>

        {/* FILTER BAR */}
        <div
          className="
            rounded-[40px]

            border
            border-white/10

            bg-white/[0.03]

            backdrop-blur-2xl

            p-6

            mb-8
          "
        >

          <div className="grid grid-cols-3 gap-6">

            {/* DATE START */}
            <div
              className="
                rounded-[30px]

                bg-black/20

                border
                border-white/5

                p-6
              "
            >

              <p className="text-white/40 text-lg mb-3">

                Date début

              </p>

              <div className="text-2xl font-semibold">

                24/05/2026

              </div>

            </div>

            {/* DATE END */}
            <div
              className="
                rounded-[30px]

                bg-black/20

                border
                border-white/5

                p-6
              "
            >

              <p className="text-white/40 text-lg mb-3">

                Date fin

              </p>

              <div className="text-2xl font-semibold">

                24/05/2026

              </div>

            </div>

            {/* EXPORT */}
            <button
              className="
                rounded-[30px]

                bg-cyan-400

                text-black

                font-black

                text-2xl

                flex
                items-center
                justify-center

                gap-4

                transition-all

                hover:scale-[1.02]
              "
            >

              <FileText className="w-7 h-7" />

              Export PDF

            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mb-8">

          {/* CARD */}
          <div
            className="
              rounded-[40px]

              p-8

              border
              border-cyan-500/20

              bg-gradient-to-br
              from-cyan-500/10
              to-blue-500/10

              backdrop-blur-2xl
            "
          >

            <Thermometer className="w-10 h-10 text-cyan-300 mb-8" />

            <p className="text-xl text-white/60 mb-4">

              Relevés

            </p>

            <h2 className="text-7xl font-black">

              17

            </h2>

          </div>

          {/* CARD */}
          <div
            className="
              rounded-[40px]

              p-8

              border
              border-green-500/20

              bg-gradient-to-br
              from-green-500/10
              to-cyan-500/10

              backdrop-blur-2xl
            "
          >

            <Snowflake className="w-10 h-10 text-green-300 mb-8" />

            <p className="text-xl text-white/60 mb-4">

              Moyenne

            </p>

            <h2 className="text-7xl font-black">

              4.6°C

            </h2>

          </div>

          {/* CARD */}
          <div
            className="
              rounded-[40px]

              p-8

              border
              border-red-500/20

              bg-gradient-to-br
              from-red-500/10
              to-pink-500/10

              backdrop-blur-2xl
            "
          >

            <AlertTriangle className="w-10 h-10 text-red-300 mb-8" />

            <p className="text-xl text-white/60 mb-4">

              Critiques

            </p>

            <h2 className="text-7xl font-black">

              3

            </h2>

          </div>

        </div>

        {/* EQUIPMENT */}
        <div
          className="
            rounded-[48px]

            border
            border-red-500/20

            bg-gradient-to-br
            from-red-500/10
            to-pink-500/5

            backdrop-blur-2xl

            p-10
          "
        >

          <div className="flex items-center justify-between">

            {/* LEFT */}
            <div>

              <p
                className="
                  text-red-300

                  uppercase

                  tracking-[0.2em]

                  text-sm

                  mb-4
                "
              >

                ÉQUIPEMENT

              </p>

              <h2
                className="
                  text-6xl

                  font-black

                  mb-5
                "
              >

                Chambre froide

              </h2>

              <p className="text-white/40 text-2xl">

                23/05/2026 18:45:28

              </p>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6">

              <button
                className="
                  w-28
                  h-28

                  rounded-[32px]

                  bg-red-500/20

                  border
                  border-red-500/20

                  flex
                  items-center
                  justify-center
                "
              >

                <Minus className="w-12 h-12" />

              </button>

              <div
                className="
                  px-14
                  py-8

                  rounded-[32px]

                  bg-red-400/20

                  border
                  border-red-500/20

                  text-7xl

                  font-black
                "
              >

                15°C

              </div>

              <button
                className="
                  w-28
                  h-28

                  rounded-[32px]

                  bg-green-500/20

                  border
                  border-green-500/20

                  flex
                  items-center
                  justify-center
                "
              >

                <Plus className="w-12 h-12" />

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}