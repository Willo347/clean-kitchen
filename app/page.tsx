"use client";

import {
  Thermometer,
  AlertTriangle,
  Refrigerator,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {

  return (
    <main className="min-h-screen bg-[#070B14] text-white p-8">

      {/* HEADER */}
      <div className="mb-12">

        <p className="text-blue-400 font-semibold tracking-widest uppercase mb-3">
          Clean Kitchen
        </p>

        <h1 className="text-6xl font-black tracking-tight">
          Dashboard HACCP
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Surveillance globale de votre établissement
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* relevés */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">
            <div className="bg-blue-500/20 p-3 rounded-2xl">
              <Thermometer className="text-blue-400" />
            </div>

            <span className="text-green-400 text-sm font-bold">
              +12%
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Relevés aujourd’hui
          </p>

          <h2 className="text-5xl font-black mt-3">
            42
          </h2>

        </div>

        {/* alertes */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="bg-red-500/20 p-3 rounded-2xl">
              <AlertTriangle className="text-red-400" />
            </div>

            <span className="text-red-300 text-sm font-bold">
              Critique
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Alertes HACCP
          </p>

          <h2 className="text-5xl font-black mt-3">
            3
          </h2>

        </div>

        {/* équipements */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="bg-cyan-500/20 p-3 rounded-2xl">
              <Refrigerator className="text-cyan-400" />
            </div>

            <span className="text-cyan-300 text-sm font-bold">
              Actifs
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Équipements
          </p>

          <h2 className="text-5xl font-black mt-3">
            12
          </h2>

        </div>

        {/* conformité */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div className="bg-green-500/20 p-3 rounded-2xl">
              <ShieldCheck className="text-green-400" />
            </div>

            <span className="text-green-300 text-sm font-bold">
              Conforme
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            Score conformité
          </p>

          <h2 className="text-5xl font-black mt-3">
            98%
          </h2>

        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* activité récente */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-3xl font-bold">
              Activité récente
            </h2>

            <button className="bg-blue-600 hover:bg-blue-500 transition px-5 py-2 rounded-2xl font-semibold">
              Voir tout
            </button>

          </div>

          <div className="space-y-5">

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <p className="font-bold text-lg">
                Température enregistrée
              </p>

              <p className="text-gray-400 mt-1">
                Frigo réserve — 3°C
              </p>
            </div>

            <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20">
              <p className="font-bold text-lg text-red-300">
                Alerte HACCP détectée
              </p>

              <p className="text-gray-300 mt-1">
                Chambre froide — 11°C
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <p className="font-bold text-lg">
                Nettoyage validé
              </p>

              <p className="text-gray-400 mt-1">
                Cuisine principale
              </p>
            </div>

          </div>
        </div>

        {/* état système */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-8">
            État système
          </h2>

          <div className="space-y-5">

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
              <p className="font-bold text-green-300">
                Serveur opérationnel
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
              <p className="font-bold text-green-300">
                Base de données connectée
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
              <p className="font-bold text-yellow-300">
                1 maintenance prévue
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}