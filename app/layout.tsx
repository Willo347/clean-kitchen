import "./globals.css";

import type { Metadata } from "next";

<<<<<<< HEAD
import Sidebar from "@/app/components/Sidebar";
=======
import { Toaster } from "sonner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
>>>>>>> ultimate-haccp-version

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
<<<<<<< HEAD
=======
    <html
      lang="fr"
      className={cn("font-sans", geist.variable)}
    >
>>>>>>> ultimate-haccp-version

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
<<<<<<< HEAD
        <div
          className="
            relative
            z-10

            flex

            h-screen
          "
        >
=======
        <div className="relative z-10 h-screen">
>>>>>>> ultimate-haccp-version

          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTENT */}
          <main
            className="
<<<<<<< HEAD
              flex-1
=======
              ml-[270px]

              h-screen
              overflow-y-auto

              px-10
              py-10
            "
          >
>>>>>>> ultimate-haccp-version

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