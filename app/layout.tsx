import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "./components/Sidebar";

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
    <html lang="fr">

      <body className="bg-[#070B14] text-white overflow-hidden">

        {/* GLOBAL BACKGROUND */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">

          {/* BLUE GLOW */}
          <div
            className="
              absolute
              top-[-200px]
              left-[-150px]
              w-[500px]
              h-[500px]
              bg-blue-500/20
              blur-3xl
              rounded-full
            "
          />

          {/* CYAN GLOW */}
          <div
            className="
              absolute
              bottom-[-250px]
              right-[-150px]
              w-[500px]
              h-[500px]
              bg-cyan-500/20
              blur-3xl
              rounded-full
            "
          />

          {/* CENTER LIGHT */}
          <div
            className="
              absolute
              top-[30%]
              left-[40%]
              w-[350px]
              h-[350px]
              bg-white/5
              blur-3xl
              rounded-full
            "
          />

        </div>

        {/* APP */}
        <div className="relative z-10 flex h-screen">

          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTENT */}
          <main className="flex-1 overflow-y-auto">

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

      </body>

    </html>
  );
}