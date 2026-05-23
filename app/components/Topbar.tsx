"use client";

import { motion } from "framer-motion";

import {
  Bell,
  Search,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function Topbar() {

  return (
    <div className="mb-10">

      <div
        className="
          relative
          overflow-hidden

          rounded-3xl

          border
          border-white/10

          bg-white/[0.04]

          backdrop-blur-2xl

          px-8
          py-5
        "
      >

        {/* SHINE */}
        <div
          className="
            absolute
            top-0
            left-[-100%]

            w-[120%]
            h-full

            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent

            animate-[shine_8s_linear_infinite]
          "
        />

        <div className="relative z-10 flex items-center justify-between">

          {/* LEFT */}
          <div>

            <p className="text-gray-400 text-sm mb-2">
              Monitoring HACCP
            </p>

            <h2 className="text-3xl font-black tracking-tight">
              Clean Kitchen
            </h2>

          </div>

          {/* CENTER */}
          <div className="hidden xl:flex items-center gap-4">

            {/* LIVE */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="
                flex
                items-center
                gap-3

                bg-green-500/10
                border
                border-green-500/20

                px-5
                py-3

                rounded-2xl
              "
            >

              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

              <span className="text-green-300 font-semibold text-sm">
                SYSTEM LIVE
              </span>

            </motion.div>

            {/* SECURITY */}
            <div
              className="
                flex
                items-center
                gap-3

                bg-blue-500/10
                border
                border-blue-500/20

                px-5
                py-3

                rounded-2xl
              "
            >

              <ShieldCheck className="text-blue-400 w-5 h-5" />

              <span className="text-blue-300 font-semibold text-sm">
                HACCP Secure
              </span>

            </div>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* SEARCH */}
            <button
              className="
                flex
                items-center
                justify-center

                w-14
                h-14

                rounded-2xl

                border
                border-white/10

                bg-white/[0.03]

                hover:bg-white/[0.08]

                transition-all
              "
            >

              <Search className="w-5 h-5 text-gray-300" />

            </button>

            {/* ACTIVITY */}
            <button
              className="
                relative

                flex
                items-center
                justify-center

                w-14
                h-14

                rounded-2xl

                border
                border-white/10

                bg-white/[0.03]

                hover:bg-white/[0.08]

                transition-all
              "
            >

              <Activity className="w-5 h-5 text-cyan-300" />

              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="
                  absolute
                  top-3
                  right-3

                  w-2
                  h-2

                  rounded-full
                  bg-cyan-400
                "
              />

            </button>

            {/* NOTIFICATIONS */}
            <button
              className="
                relative

                flex
                items-center
                justify-center

                w-14
                h-14

                rounded-2xl

                border
                border-white/10

                bg-white/[0.03]

                hover:bg-white/[0.08]

                transition-all
              "
            >

              <Bell className="w-5 h-5 text-white" />

              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="
                  absolute
                  top-3
                  right-3

                  w-3
                  h-3

                  rounded-full
                  bg-red-400
                "
              />

            </button>

            {/* USER */}
            <div
              className="
                flex
                items-center
                gap-4

                rounded-2xl

                border
                border-white/10

                bg-white/[0.03]

                px-5
                py-3
              "
            >

              <div
                className="
                  w-12
                  h-12

                  rounded-2xl

                  bg-gradient-to-br
                  from-blue-500
                  to-cyan-400

                  flex
                  items-center
                  justify-center

                  font-black
                "
              >
                CK
              </div>

              <div className="hidden md:block">

                <p className="font-semibold">
                  Admin
                </p>

                <p className="text-gray-400 text-sm">
                  Online
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}