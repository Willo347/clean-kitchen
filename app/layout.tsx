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

        <div className="flex h-screen">

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