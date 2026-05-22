import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Clean Kitchen",
  description: "Dashboard HACCP Premium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#050816] text-white">
        <div className="flex min-h-screen">
          
          <Sidebar />

          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}