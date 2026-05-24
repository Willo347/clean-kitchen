"use client";

import {
  Thermometer,
  Snowflake,
  AlertTriangle,
  Plus,
  Minus,
} from "lucide-react";

export default function DashboardPage() {

  return (

    <div
      className="
        relative

        min-h-screen

        text-white

        overflow-hidden
      "
    >

      {/* BACKGROUND GLOW */}
      <div
        className="
          absolute

          inset-0

          bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_45%)]

          pointer-events-none
        "
      />

      {/* CONTENT */}
      <div
        className="
          relative
          z-10

          px-6
          md:px-10

          pt-4
          pb-20
        "
      >

        {/* TOP */}
        <div className="mb-10">

          <p
            className="
              text-cyan-300

              uppercase

              tracking-[0.3em]

              text-sm

              mb-4
            "
          >

            TABLET MODE

          </p>

          <h1
            className="
              text-6xl
              xl:text-8xl

              font-black

              tracking-tight

              leading-none
            "
          >

            Dashboard HACCP

          </h1>

          <p
            className="
              text-gray-400

              text-2xl

              mt-5
            "
          >

            Supervision temps réel du système

          </p>

        </div>

        {/* FILTER BAR */}
        <div
          className="
            grid

            grid-cols-1
            xl:grid-cols-[1fr_1fr_220px]

            gap-5

            rounded-[34px]

            border
            border-white/10

            bg-white/[0.04]

            backdrop-blur-xl

            p-6

            mb-8
          "
        >

          {/* LEFT */}
          <div>

            <p className="text-gray-500 mb-3">

              État système

            </p>

            <div
              className="
                h-[90px]

                rounded-3xl

                border
                border-white/10

                bg-black/20

                px-6

                flex
                items-center

                text-2xl

                font-semibold
              "
            >

              Tous les systèmes opérationnels

            </div>

          </div>

          {/* CENTER */}
          <div>

            <p className="text-gray-500 mb-3">

              Dernière analyse

            </p>

            <div
              className="
                h-[90px]

                rounded-3xl

                border
                border-white/10

                bg-black/20

                px-6

                flex
                items-center

                text-2xl

                font-semibold
              "
            >

              Aujourd’hui • 00:24

            </div>

          </div>

          {/* BUTTON */}
          <button
            className="
              rounded-3xl

              bg-cyan-400

              text-black

              font-black

              text-2xl

              hover:scale-[1.02]

              transition-all
            "
          >

            Analyse

          </button>

        </div>

        {/* CARDS */}
        <div
          className="
            grid

            grid-cols-1
            md:grid-cols-3

            gap-6

            mb-8
          "
        >

          {/* CARD */}
          <div
            className="
              rounded-[36px]

              p-8

              bg-gradient-to-br
              from-cyan-500/10
              to-blue-500/10

              border
              border-cyan-500/10

              backdrop-blur-xl
            "
          >

            <Thermometer className="w-10 h-10 text-cyan-300 mb-8" />

            <p className="text-2xl text-gray-300 mb-4">

              Relevés

            </p>

            <h2 className="text-7xl font-black">

              17

            </h2>

          </div>

          {/* CARD */}
          <div
            className="
              rounded-[36px]

              p-8

              bg-gradient-to-br
              from-green-500/10
              to-cyan-500/10

              border
              border-green-500/10

              backdrop-blur-xl
            "
          >

            <Snowflake className="w-10 h-10 text-green-300 mb-8" />

            <p className="text-2xl text-gray-300 mb-4">

              Moyenne

            </p>

            <h2 className="text-7xl font-black">

              4.6°C

            </h2>

          </div>

          {/* CARD */}
          <div
            className="
              rounded-[36px]

              p-8

              bg-gradient-to-br
              from-red-500/10
              to-pink-500/10

              border
              border-red-500/10

              backdrop-blur-xl
            "
          >

            <AlertTriangle className="w-10 h-10 text-red-300 mb-8" />

            <p className="text-2xl text-gray-300 mb-4">

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
            rounded-[40px]

            border
            border-red-500/10

            bg-gradient-to-br
            from-red-500/10
            to-pink-500/5

            backdrop-blur-xl

            p-8
          "
        >

          <div
            className="
              flex
              items-center
              justify-between

              mb-10
            "
          >

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
                  text-5xl

                  font-black
                "
              >

                Chambre froide

              </h2>

            </div>

            <div
              className="
                text-8xl

                font-black

                text-pink-300
              "
            >

              15°C

            </div>

          </div>

          {/* CONTROLS */}
          <div
            className="
              flex
              items-center
              justify-end

              gap-6
            "
          >

            <button
              className="
                w-24
                h-24

                rounded-3xl

                bg-red-500/20

                border
                border-red-500/20

                flex
                items-center
                justify-center
              "
            >

              <Minus className="w-10 h-10" />

            </button>

            <button
              className="
                w-24
                h-24

                rounded-3xl

                bg-green-500/20

                border
                border-green-500/20

                flex
                items-center
                justify-center
              "
            >

              <Plus className="w-10 h-10" />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}