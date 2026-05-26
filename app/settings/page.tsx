"use client";

import { useState } from "react";

import {
  Settings,
  Bell,
  Shield,
  Database,
  Moon,
  Save,
  UserCog,
  Globe,
} from "lucide-react";

export default function SettingsPage() {

  const [notifications, setNotifications] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(true);

  const [autoBackup, setAutoBackup] =
    useState(true);

  const [multiUsers, setMultiUsers] =
    useState(true);

  return (

    <div className="space-y-6 md:space-y-8">

      {/* HEADER */}
      <div className="space-y-3">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-cyan-400 tracking-[0.2em] md:tracking-[0.25em] uppercase font-semibold text-[10px] md:text-sm">
            SYSTEM SETTINGS
          </p>

        </div>

        <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black text-white leading-none">
          Settings
        </h1>

        <p className="text-white/50 text-base md:text-xl">
          Paramètres système HACCP
        </p>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">

        {/* NOTIFICATIONS */}
        <div
          className="
            rounded-[30px]

            border
            border-cyan-500/20

            bg-cyan-500/10

            backdrop-blur-xl

            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0">

              <div className="flex items-center gap-3 mb-4">

                <Bell className="text-cyan-300" />

                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Notifications
                </h2>

              </div>

              <p className="text-cyan-100/60 text-sm md:text-base">
                Alertes HACCP en temps réel
              </p>

            </div>

            <button
              onClick={() =>
                setNotifications(
                  !notifications
                )
              }
              className={`
                w-16
                h-9

                rounded-full

                transition

                relative

                ${
                  notifications
                    ? "bg-cyan-400"
                    : "bg-white/20"
                }
              `}
            >

              <div
                className={`
                  absolute
                  top-1

                  w-7
                  h-7

                  rounded-full
                  bg-white

                  transition-all

                  ${
                    notifications
                      ? "left-8"
                      : "left-1"
                  }
                `}
              />

            </button>

          </div>

        </div>

        {/* SECURITY */}
        <div
          className="
            rounded-[30px]

            border
            border-green-500/20

            bg-green-500/10

            backdrop-blur-xl

            p-5 md:p-6
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <Shield className="text-green-300" />

            <h2 className="text-2xl md:text-3xl font-black text-white">
              Sécurité
            </h2>

          </div>

          <p className="text-green-100/60 text-sm md:text-base">
            Niveau sécurité HACCP :
          </p>

          <h3 className="text-3xl md:text-5xl font-black text-green-300 mt-4">
            MAXIMUM
          </h3>

        </div>

        {/* DATABASE */}
        <div
          className="
            rounded-[30px]

            border
            border-orange-500/20

            bg-orange-500/10

            backdrop-blur-xl

            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0">

              <div className="flex items-center gap-3 mb-4">

                <Database className="text-orange-300" />

                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Sauvegarde
                </h2>

              </div>

              <p className="text-orange-100/60 text-sm md:text-base">
                Backup automatique cloud
              </p>

            </div>

            <button
              onClick={() =>
                setAutoBackup(
                  !autoBackup
                )
              }
              className={`
                w-16
                h-9

                rounded-full

                transition

                relative

                ${
                  autoBackup
                    ? "bg-orange-400"
                    : "bg-white/20"
                }
              `}
            >

              <div
                className={`
                  absolute
                  top-1

                  w-7
                  h-7

                  rounded-full
                  bg-white

                  transition-all

                  ${
                    autoBackup
                      ? "left-8"
                      : "left-1"
                  }
                `}
              />

            </button>

          </div>

        </div>

        {/* DARK MODE */}
        <div
          className="
            rounded-[30px]

            border
            border-blue-500/20

            bg-blue-500/10

            backdrop-blur-xl

            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0">

              <div className="flex items-center gap-3 mb-4">

                <Moon className="text-blue-300" />

                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Interface
                </h2>

              </div>

              <p className="text-blue-100/60 text-sm md:text-base">
                Mode sombre premium
              </p>

            </div>

            <button
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
              className={`
                w-16
                h-9

                rounded-full

                transition

                relative

                ${
                  darkMode
                    ? "bg-blue-400"
                    : "bg-white/20"
                }
              `}
            >

              <div
                className={`
                  absolute
                  top-1

                  w-7
                  h-7

                  rounded-full
                  bg-white

                  transition-all

                  ${
                    darkMode
                      ? "left-8"
                      : "left-1"
                  }
                `}
              />

            </button>

          </div>

        </div>

        {/* USERS */}
        <div
          className="
            rounded-[30px]

            border
            border-purple-500/20

            bg-purple-500/10

            backdrop-blur-xl

            p-5 md:p-6
          "
        >

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0">

              <div className="flex items-center gap-3 mb-4">

                <UserCog className="text-purple-300" />

                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Multi-utilisateurs
                </h2>

              </div>

              <p className="text-purple-100/60 text-sm md:text-base">
                Gestion équipe HACCP
              </p>

            </div>

            <button
              onClick={() =>
                setMultiUsers(
                  !multiUsers
                )
              }
              className={`
                w-16
                h-9

                rounded-full

                transition

                relative

                ${
                  multiUsers
                    ? "bg-purple-400"
                    : "bg-white/20"
                }
              `}
            >

              <div
                className={`
                  absolute
                  top-1

                  w-7
                  h-7

                  rounded-full
                  bg-white

                  transition-all

                  ${
                    multiUsers
                      ? "left-8"
                      : "left-1"
                  }
                `}
              />

            </button>

          </div>

        </div>

        {/* CLOUD */}
        <div
          className="
            rounded-[30px]

            border
            border-pink-500/20

            bg-pink-500/10

            backdrop-blur-xl

            p-5 md:p-6
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <Globe className="text-pink-300" />

            <h2 className="text-2xl md:text-3xl font-black text-white">
              Cloud HACCP
            </h2>

          </div>

          <p className="text-pink-100/60 text-sm md:text-base">
            Synchronisation globale sécurisée
          </p>

          <h3 className="text-3xl md:text-5xl font-black text-pink-300 mt-4">
            CONNECTED
          </h3>

        </div>

      </div>

      {/* SAVE */}
      <div
        className="
          rounded-[30px]

          border
          border-white/10

          bg-white/[0.03]

          backdrop-blur-xl

          p-5 md:p-6
        "
      >

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between

            gap-5
          "
        >

          <div>

            <div className="flex items-center gap-3 mb-3">

              <Settings className="text-cyan-300" />

              <h2 className="text-2xl md:text-3xl font-black text-white">
                Paramètres système
              </h2>

            </div>

            <p className="text-white/50 text-sm md:text-base">
              Sauvegarde des préférences HACCP
            </p>

          </div>

          <button
            className="
              w-full
              lg:w-auto

              px-8
              py-4

              rounded-2xl

              bg-cyan-400

              text-black
              font-black

              hover:scale-[1.02]

              transition

              flex
              items-center
              justify-center
              gap-3
            "
          >

            <Save size={20} />

            Sauvegarder

          </button>

        </div>

      </div>

    </div>
  );
}