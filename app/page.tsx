{/* STATS */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mb-10">

  {/* RELEVÉS */}
  <motion.div
    whileHover={{
      scale: 1.04,
      y: -8,
    }}
    transition={{
      type: "spring",
      stiffness: 300,
    }}
    className="
      group
      relative
      overflow-hidden

      rounded-3xl

      border
      border-white/10

      bg-white/[0.04]

      p-7

      backdrop-blur-2xl
    "
  >

    {/* LIGHT EFFECT */}
    <div
      className="
        absolute
        inset-0

        opacity-0
        group-hover:opacity-100

        transition-all
        duration-700

        bg-gradient-to-br
        from-blue-500/20
        via-cyan-500/10
        to-transparent
      "
    />

    {/* BORDER GLOW */}
    <div
      className="
        absolute
        inset-0

        rounded-3xl

        border
        border-blue-400/0

        group-hover:border-blue-400/30

        transition-all
        duration-500
      "
    />

    {/* SHINE */}
    <div
      className="
        absolute
        top-0
        left-[-100%]

        w-[120%]
        h-full

        bg-gradient-to-r
        from-transparent
        via-white/10
        to-transparent

        group-hover:left-[120%]

        transition-all
        duration-1000
      "
    />

    <div className="relative z-10">

      <div className="flex items-center justify-between mb-6">

        <div className="bg-blue-500/20 p-4 rounded-2xl">
          <Thermometer className="text-blue-400" />
        </div>

        <span className="text-green-400 text-sm font-bold">
          LIVE
        </span>

      </div>

      <p className="text-gray-400 text-sm">
        Relevés enregistrés
      </p>

      <h2 className="text-6xl font-black mt-4">
        <CountUp end={logsCount} duration={1} />
      </h2>

    </div>

  </motion.div>

  {/* ALERTES */}
  <motion.div
    whileHover={{
      scale: 1.04,
      y: -8,
    }}
    transition={{
      type: "spring",
      stiffness: 300,
    }}
    className="
      group
      relative
      overflow-hidden

      rounded-3xl

      border
      border-red-500/20

      bg-red-500/10

      p-7

      backdrop-blur-2xl
    "
  >

    <div
      className="
        absolute
        inset-0

        opacity-0
        group-hover:opacity-100

        transition-all
        duration-700

        bg-gradient-to-br
        from-red-500/20
        via-orange-500/10
        to-transparent
      "
    />

    <div
      className="
        absolute
        inset-0

        rounded-3xl

        border
        border-red-400/0

        group-hover:border-red-400/30

        transition-all
        duration-500
      "
    />

    <div
      className="
        absolute
        top-0
        left-[-100%]

        w-[120%]
        h-full

        bg-gradient-to-r
        from-transparent
        via-white/10
        to-transparent

        group-hover:left-[120%]

        transition-all
        duration-1000
      "
    />

    <div className="relative z-10">

      <div className="flex items-center justify-between mb-6">

        <div className="bg-red-500/20 p-4 rounded-2xl">
          <AlertTriangle className="text-red-400" />
        </div>

        <span className="text-red-300 text-sm font-bold">
          HACCP
        </span>

      </div>

      <p className="text-gray-400 text-sm">
        Alertes détectées
      </p>

      <h2 className="text-6xl font-black mt-4">
        <CountUp end={alertsCount} duration={1} />
      </h2>

    </div>

  </motion.div>

  {/* ÉQUIPEMENTS */}
  <motion.div
    whileHover={{
      scale: 1.04,
      y: -8,
    }}
    transition={{
      type: "spring",
      stiffness: 300,
    }}
    className="
      group
      relative
      overflow-hidden

      rounded-3xl

      border
      border-cyan-500/20

      bg-cyan-500/10

      p-7

      backdrop-blur-2xl
    "
  >

    <div
      className="
        absolute
        inset-0

        opacity-0
        group-hover:opacity-100

        transition-all
        duration-700

        bg-gradient-to-br
        from-cyan-500/20
        via-blue-500/10
        to-transparent
      "
    />

    <div
      className="
        absolute
        inset-0

        rounded-3xl

        border
        border-cyan-400/0

        group-hover:border-cyan-400/30

        transition-all
        duration-500
      "
    />

    <div
      className="
        absolute
        top-0
        left-[-100%]

        w-[120%]
        h-full

        bg-gradient-to-r
        from-transparent
        via-white/10
        to-transparent

        group-hover:left-[120%]

        transition-all
        duration-1000
      "
    />

    <div className="relative z-10">

      <div className="flex items-center justify-between mb-6">

        <div className="bg-cyan-500/20 p-4 rounded-2xl">
          <Refrigerator className="text-cyan-400" />
        </div>

        <span className="text-cyan-300 text-sm font-bold">
          Actifs
        </span>

      </div>

      <p className="text-gray-400 text-sm">
        Équipements
      </p>

      <h2 className="text-6xl font-black mt-4">
        <CountUp end={equipmentsCount} duration={1} />
      </h2>

    </div>

  </motion.div>

  {/* CONFORMITÉ */}
  <motion.div
    whileHover={{
      scale: 1.04,
      y: -8,
    }}
    transition={{
      type: "spring",
      stiffness: 300,
    }}
    className="
      group
      relative
      overflow-hidden

      rounded-3xl

      border
      border-green-500/20

      bg-green-500/10

      p-7

      backdrop-blur-2xl
    "
  >

    <div
      className="
        absolute
        inset-0

        opacity-0
        group-hover:opacity-100

        transition-all
        duration-700

        bg-gradient-to-br
        from-green-500/20
        via-emerald-500/10
        to-transparent
      "
    />

    <div
      className="
        absolute
        inset-0

        rounded-3xl

        border
        border-green-400/0

        group-hover:border-green-400/30

        transition-all
        duration-500
      "
    />

    <div
      className="
        absolute
        top-0
        left-[-100%]

        w-[120%]
        h-full

        bg-gradient-to-r
        from-transparent
        via-white/10
        to-transparent

        group-hover:left-[120%]

        transition-all
        duration-1000
      "
    />

    <div className="relative z-10">

      <div className="flex items-center justify-between mb-6">

        <div className="bg-green-500/20 p-4 rounded-2xl">
          <ShieldCheck className="text-green-400" />
        </div>

        <span className="text-green-300 text-sm font-bold">
          Conforme
        </span>

      </div>

      <p className="text-gray-400 text-sm">
        Score conformité
      </p>

      <h2 className="text-6xl font-black mt-4">
        98%
      </h2>

    </div>

  </motion.div>

</div>