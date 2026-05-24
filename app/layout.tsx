import "./globals.css";

import type { Metadata } from "next";

import Sidebar from "@/app/components/Sidebar";

export const metadata: Metadata = {
  title: "Clean Kitchen",

  description:
    "Système HACCP premium",
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

        {/* BACKGROUND */}
        <div
          className="
            fixed
            inset-0

            bg-[radial-gradient(circle_at_top,#0f172a,#020617_65%)]

            pointer-events-none
          "
        />

        {/* CYAN GLOW */}
        <div
          className="
            fixed

            top-[-250px]
            right-[-250px]

            w-[600px]
            h-[600px]

            rounded-full

            bg-cyan-500/10

            blur-3xl

            pointer-events-none
          "
        />

        {/* PURPLE GLOW */}
        <div
          className="
            fixed

            bottom-[-250px]
            left-[-250px]

            w-[600px]
            h-[600px]

            rounded-full

            bg-purple-500/10

            blur-3xl

            pointer-events-none
          "
        />

        {/* MAIN LAYOUT */}
        <div
          className="
            relative
            z-10

            flex

            h-screen

            overflow-hidden
          "
        >

          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTENT */}
          <main
            className="
              flex-1

              overflow-y-auto

              p-3
              md:p-5
            "
          >

            {children}

          </main>

        </div>

      </body>

    </html>
  );
}