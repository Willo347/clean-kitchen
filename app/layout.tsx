import "./globals.css";

import type { Metadata } from "next";

import Sidebar from "@/app/components/Sidebar";

export const metadata: Metadata = {
  title: "Clean Kitchen",
  description: "Premium HACCP Tablet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <html lang="fr">

      <body
        className="
          bg-[#020617]

          text-white

          overflow-hidden
        "
      >

        {/* GLOBAL BACKGROUND */}
        <div
          className="
            fixed
            inset-0

            overflow-hidden
          "
        >

          {/* MAIN */}
          <div
            className="
              absolute
              inset-0

              bg-[#020617]
            "
          />

          {/* TOP LIGHT */}
          <div
            className="
              absolute

              top-[-300px]
              left-1/2

              -translate-x-1/2

              w-[1200px]
              h-[700px]

              rounded-full

              bg-cyan-400/10

              blur-[180px]
            "
          />

          {/* LEFT GLOW */}
          <div
            className="
              absolute

              left-[-300px]
              top-[20%]

              w-[700px]
              h-[700px]

              rounded-full

              bg-blue-500/10

              blur-[180px]
            "
          />

          {/* RIGHT GLOW */}
          <div
            className="
              absolute

              right-[-300px]
              bottom-[10%]

              w-[700px]
              h-[700px]

              rounded-full

              bg-cyan-300/10

              blur-[180px]
            "
          />

          {/* GRID */}
          <div
            className="
              absolute
              inset-0

              opacity-[0.03]

              bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]

              bg-[size:80px_80px]
            "
          />

        </div>

        {/* APP */}
        <div
          className="
            relative
            z-10

            flex

            h-screen
          "
        >

          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTENT */}
          <main
            className="
              flex-1

              overflow-y-auto

              px-6
              py-4
            "
          >

            {children}

          </main>

        </div>

      </body>

    </html>
  );
}