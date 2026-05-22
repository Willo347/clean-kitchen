"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen text-white p-8 bg-[#0f172a]">
      <h1 className="text-5xl font-bold mb-8">
        Clean Kitchen
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Link
          href="/temperatures"
          className="bg-[#1e293b] p-6 rounded-2xl hover:bg-blue-600 transition"
        >
          <h2 className="text-2xl font-bold mb-2">
            🌡 Températures
          </h2>

          <p className="text-gray-300">
            Relevés HACCP et alertes
          </p>
        </Link>

        <div className="bg-[#1e293b] p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-2">
            📦 Stocks
          </h2>

          <p className="text-gray-300">
            Gestion des produits
          </p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-2">
            🧼 Nettoyage
          </h2>

          <p className="text-gray-300">
            Planning HACCP
          </p>
        </div>

      </div>
    </main>
  );
}