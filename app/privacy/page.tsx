import { Database, Lock, Mail, Share2, ShieldCheck, Trash2 } from "lucide-react";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/20 shrink-0">
          <Icon size={16} className="text-cyan-300" />
        </div>
        <h2 className="text-base font-black text-white">{title}</h2>
      </div>
      <div className="text-white/50 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-white p-3 sm:p-5 overflow-x-hidden flex items-start justify-center">
      <div className="w-full max-w-2xl rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#030b1d] p-5 sm:p-8 shadow-[0_0_80px_rgba(0,150,255,0.08)] space-y-6 mt-6 mb-10">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold text-xs">CLEAN KITCHEN</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-[0.95] tracking-[-0.03em] text-white">
            Politique de confidentialité
          </h1>
          <p className="text-white/30 text-xs mt-3">Dernière mise à jour : juillet 2026</p>
          <p className="text-white/40 text-sm mt-3 leading-relaxed">
            Clean Kitchen est une application de gestion HACCP destinée aux professionnels de la restauration (contrôle des températures, maintenance, traçabilité, gestion des équipes). Cette page explique quelles données sont collectées lorsque vous utilisez l'application (web et Android), pourquoi, et comment elles sont protégées.
          </p>
        </div>

        <Section icon={Mail} title="Éditeur et contact">
          <p>
            Clean Kitchen est édité par Wilfried Madouche. Pour toute question relative à vos données personnelles, ou pour exercer vos droits, contactez :
          </p>
          <a
            href="mailto:contact@cleankitchen.fr"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-black font-black text-sm"
          >
            <Mail size={14} /> contact@cleankitchen.fr
          </a>
        </Section>

        <Section icon={Database} title="Données collectées">
          <p>Selon l'usage que vous faites de l'application, nous collectons :</p>
          <ul className="space-y-1.5 mt-2">
            {[
              "Identifiants de connexion : adresse email et mot de passe (le mot de passe est stocké de façon chiffrée, jamais en clair)",
              "Nom du restaurant, ville et paramètres associés",
              "Relevés de température et informations sur les équipements (frigos, congélateurs...)",
              "Pannes signalées, certificats de maintenance et documents/photos associés",
              "Photos d'étiquettes produits et de bons de livraison, ainsi que les informations de traçabilité qui en sont extraites (produit, fournisseur, lot, date limite de consommation)",
              "Noms des employés, heures travaillées et plannings saisis par le restaurant",
              "Journaux de production et tâches d'entretien (PMS)",
              "Le jeton technique de votre appareil (token de notification push), pour vous envoyer des alertes",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-cyan-400 shrink-0">•</span> {item}
              </li>
            ))}
          </ul>
          <p className="pt-2">
            Ces données sont utilisées uniquement pour faire fonctionner les fonctionnalités de suivi HACCP de l'application (contrôle des températures, traçabilité, maintenance, gestion du personnel) et pour vous envoyer des notifications liées à votre activité (dépassement de température, panne signalée). Nous ne vendons aucune donnée et ne les utilisons pas à des fins publicitaires.
          </p>
        </Section>

        <Section icon={Share2} title="Partage avec des tiers">
          <p>Certaines données transitent par des prestataires techniques, uniquement pour faire fonctionner le service :</p>
          <ul className="space-y-1.5 mt-2">
            <li className="flex items-start gap-2"><span className="text-cyan-400 shrink-0">•</span> <strong className="text-white/70">Supabase</strong> — hébergement de la base de données, de l'authentification et des fichiers/photos</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 shrink-0">•</span> <strong className="text-white/70">Google Firebase Cloud Messaging</strong> — envoi des notifications push sur Android</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 shrink-0">•</span> <strong className="text-white/70">Anthropic (Claude)</strong> — analyse automatique des photos d'étiquettes produits pour en extraire les informations (fournisseur, lot, date...) lors de la saisie d'une livraison</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 shrink-0">•</span> <strong className="text-white/70">Resend</strong> — envoi de l'email de bienvenue lors de la création du compte restaurant</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 shrink-0">•</span> <strong className="text-white/70">Netlify</strong> — hébergement de l'application web</li>
          </ul>
          <p className="pt-2">Aucun de ces prestataires n'est autorisé à revendre vos données. Elles ne sont partagées que dans la stricte mesure nécessaire au fonctionnement du service.</p>
        </Section>

        <Section icon={Lock} title="Sécurité">
          <p>
            Toutes les données transitent de façon chiffrée (HTTPS/TLS). L'accès aux données de chaque restaurant est isolé : un compte ne peut voir ou modifier que les données de son propre restaurant.
          </p>
        </Section>

        <Section icon={Trash2} title="Conservation et suppression">
          <p>
            Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression complète et définitive de votre compte et de toutes les données associées à tout moment, directement depuis l'application (Paramètres → Zone dangereuse) ou en nous contactant par email.
          </p>
          <a
            href="/delete-account"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition text-white/70 hover:text-white font-bold text-sm"
          >
            Voir la procédure de suppression de compte
          </a>
        </Section>

        <Section icon={ShieldCheck} title="Vos droits">
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à contact@cleankitchen.fr.
          </p>
        </Section>

        <p className="text-white/20 text-xs text-center pt-2">
          Clean Kitchen — contact@cleankitchen.fr
        </p>
      </div>
    </div>
  );
}
