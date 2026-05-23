"use client";

import {
  Bell,
  Search,
} from "lucide-react";

export default function Topbar() {

  const now = new Date();

  return (
    <header className="mb-10">

      <div
        className="
          flex
          items-center
          justify-between
          gap-6

          bg-white/[0.04]
          border
          border-white/10

          rounded-3xl

          px-8
          py-5

          backdrop-blur-2xl
        "
      >

        {/* SEARCH */}
        <div className="flex-1 max-w-xl">

          <div
            className="
              flex
              items-center
              gap-4

              bg-black/20
              border
              border-white/5

              rounded-2xl

              px-5
              py-4
            "
          >

            <Search
              size={20}
              className="text-gray-500"
            />

            <input
              type="text"
              placeholder="Rechercher..."
              className="
                bg-transparent
                outline-none
                w-full
                text-white
                placeholder:text-gray-500
              "
            />

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          {/* TIME */}
          <div
            className="
              hidden
              md:flex
              flex-col
              items-end
            "
          >

            <p className="text-sm text-gray-400">
              Heure système
            </p>

            <p className="font-bold text-lg">
              {now.toLocaleTimeString()}
            </p>

          </div>

          {/* NOTIF */}
          <button
            className="
              relative

              w-14
              h-14

              rounded-2xl

              bg-blue-500/10
              border
              border-blue-500/20

              flex
              items-center
              justify-center

              hover:scale-105
              transition-all
            "
          >

            <Bell className="text-blue-400" />

            <div
              className="
                absolute
                top-3
                right-3

                w-2
                h-2

                rounded-full
                bg-red-400
                animate-pulse
              "
            />

          </button>

          {/* PROFILE */}
          <div
            className="
              flex
              items-center
              gap-4

              bg-white/[0.03]
              border
              border-white/10

              rounded-2xl

              px-4
              py-3
            "
          >

            <div
              className="
                w-12
                h-12

                rounded-2xl

                bg-gradient-to-br
                from-cyan-400
                to-blue-600

                flex
                items-center
                justify-center

                font-black
                text-white
              "
            >

              CK

            </div>

            <div className="hidden md:block">

              <p className="font-bold">
                Admin
              </p>

              <p className="text-sm text-gray-400">
                Clean Kitchen
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}