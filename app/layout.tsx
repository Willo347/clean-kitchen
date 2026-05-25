import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "./components/Sidebar";

import { Toaster } from "sonner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Clean Kitchen",
  description: "Plateforme HACCP premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="fr"
      className={cn("font-sans", geist.variable)}
    >

      <body className="bg-[#070B14] text-white overflow-hidden">

        {/* GLOBAL BACKGROUND */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">

          {/* GRID */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.03]

              [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]

              [background-size:60px_60px]
            "
          />

          {/* BLUE GLOW */}
          <div
            className="
              absolute
              top-[-250px]
              left-[-150px]

              w-[600px]
              h-[600px]

              bg-blue-500/20

              rounded-full
              blur-3xl

              animate-pulse
            "
          />

          {/* CYAN GLOW */}
          <div
            className="
              absolute
              bottom-[-250px]
              right-[-150px]

              w-[600px]
              h-[600px]

              bg-cyan-500/20

              rounded-full
              blur-3xl

              animate-pulse
            "
          />

          {/* CENTER LIGHT */}
          <div
            className="
              absolute
              top-[30%]
              left-[40%]

              w-[400px]
              h-[400px]

              bg-white/5

              rounded-full
              blur-3xl
            "
          />

          {/* FLOATING BALL 1 */}
          <div
            className="
              absolute
              top-[20%]
              left-[15%]

              w-32
              h-32

              rounded-full
              bg-blue-400/10

              blur-2xl

              animate-bounce
            "
          />

          {/* FLOATING BALL 2 */}
          <div
            className="
              absolute
              bottom-[15%]
              right-[20%]

              w-40
              h-40

              rounded-full
              bg-cyan-400/10

              blur-2xl

              animate-pulse
            "
          />

        </div>

        {/* APP */}
        <div className="relative z-10 h-screen">

          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTENT */}
          <main
            className="
              ml-[270px]

              h-screen
              overflow-y-auto

              px-10
              py-10
            "
          >

            <div
              className="
                animate-in
                fade-in
                duration-500
                slide-in-from-bottom-4
              "
            >

              {children}

            </div>

          </main>

        </div>

        {/* TOASTER */}
        <Toaster
          position="top-right"
          richColors
          theme="dark"
        />

      </body>

    </html>
  );
}