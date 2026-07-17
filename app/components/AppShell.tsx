"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

// Pages publiques/autonomes qui ne doivent pas afficher la navigation
// de l'application (pas de sens à naviguer vers les modules métier
// depuis une page légale ou d'authentification).
const STANDALONE_ROUTES = ["/privacy", "/delete-account", "/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((route) => pathname?.startsWith(route));

  if (isStandalone) {
    return (
      <main className="h-screen overflow-y-auto">
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
    );
  }

  return (
    <>
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <main
        className="
          lg:ml-[270px]
          h-screen
          overflow-y-auto
          px-4
          md:px-6
          lg:px-10
          pt-[100px]
          lg:pt-10
          pb-10
        "
      >
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
    </>
  );
}
