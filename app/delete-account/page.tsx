import { CheckCircle2, Mail, Settings, ShieldCheck } from "lucide-react";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5 overflow-x-hidden flex items-start justify-center">
      <div className="w-full max-w-2xl rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-5 sm:p-8 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-6 mt-6 mb-10">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold text-xs">CLEAN KITCHEN</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-[0.95] tracking-[-0.03em] text-white">
            Suppression de compte
          </h1>
          <p className="text-white/40 text-sm mt-3 leading-relaxed">
            Vous pouvez demander la suppression définitive de votre compte Clean Kitchen et de toutes les données associées, à tout moment.
          </p>
        </div>

        {/* Méthode 1 : depuis l'app */}
        <div className="rounded-[24px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] to-blue-900/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0">
              <Settings size={16} className="text-cyan-300" />
            </div>
            <h2 className="text-base font-black text-white">Depuis l'application</h2>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Connectez-vous à l'application Clean Kitchen, rendez-vous dans <span className="text-cyan-300 font-bold">Paramètres</span>, puis dans la section <span className="text-red-300 font-bold">« Zone dangereuse »</span> en bas de page. Cliquez sur « Supprimer mon compte » et suivez les instructions de confirmation.
          </p>
        </div>

        {/* Méthode 2 : par email */}
        <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shrink-0">
              <Mail size={16} className="text-cyan-400" />
            </div>
            <h2 className="text-base font-black text-white">Par email</h2>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Si vous n'avez plus accès à l'application, envoyez une demande de suppression de compte à :
          </p>
          <a
            href="mailto:contact@cleankitchen.fr?subject=Demande%20de%20suppression%20de%20compte"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black font-black text-sm"
          >
            <Mail size={15} /> contact@cleankitchen.fr
          </a>
          <p className="text-white/30 text-xs leading-relaxed">
            Merci d'indiquer le nom du restaurant et l'adresse email associée au compte. La demande est traitée sous 30 jours maximum.
          </p>
        </div>

        {/* Données supprimées */}
        <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shrink-0">
              <ShieldCheck size={16} className="text-cyan-400" />
            </div>
            <h2 className="text-base font-black text-white">Ce qui est supprimé</h2>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            La suppression du compte est définitive et irréversible. Elle efface :
          </p>
          <ul className="space-y-1.5">
            {[
              "Le compte de connexion (email et mot de passe)",
              "Les relevés de température et les équipements",
              "Les pannes signalées et les certificats de maintenance (documents inclus)",
              "Les produits, photos et bons de livraison de traçabilité",
              "Les données employés, heures et plannings",
              "Les logs de production et les tâches PMS",
              "Les paramètres du restaurant et l'abonnement aux notifications push",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-white/40 text-sm">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/20 text-xs text-center pt-2">
          Clean Kitchen — Pour toute question, contactez-nous à contact@cleankitchen.fr
        </p>
      </div>
    </div>
  );
}
