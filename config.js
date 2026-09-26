/* =========================================================================
   CONFIGURACIÓN DE TU PERFIL
   Edítalo desde /editor.html (botón "Guardar y publicar") o aquí a mano.
   Todas las opciones posibles están documentadas en assets/js/defaults.js
   ========================================================================= */
window.PROFILE = {
  meta: {
    title: "@joakovrd · dev",
    titleAnimation: "typewriter",
    description: "JoakoVRD — developer & designer. Proyectos, stack y contacto.",
  },

  enter: {
    enabled: true,
    text: "> click to enter_",
  },

  profile: {
    username: "joakovrd",
    displayName: "JoakoVRD",
    avatar: "https://github.com/JoakoVRD-Designer.png",
    avatarAnimation: "ring",
    bioPrefix: "> ",
    bio: ["developer & designer", "construyendo cosas para la web", "open source ✦ siempre aprendiendo"],
    bioEffect: "typewriter",
    location: "",
  },

  appearance: {
    layout: "card",
    font: "JetBrains Mono",
    accentColor: "#22d3ee",
    secondaryColor: "#a78bfa",
    textColor: "#e6edf3",
    iconColor: "#e6edf3",
    cardColor: "#0b1017",
    cardOpacity: 0.6,
    cardBlur: 14,
    cardBorderStyle: "animated",
    usernameEffect: "shimmer",
    usernameGlow: true,
    monochromeIcons: true,
    iconColorOnHover: true,
    iconStyle: "glass",
    iconAnimation: "none",
    iconHover: "lift",
    tilt: true,
    tiltStrength: 6,
  },

  background: {
    type: "gradient",
    gradient: ["#05070a", "#0b1220", "#05070a"],
    overlay: 0.2,
  },

  effects: {
    particles: "matrix",
    particleColor: "#22d3ee",
    particleCount: 60,
    cursorTrail: "trail",
    clickEffect: "ripple",
  },

  audio: {
    // { title: "Nombre", artist: "Artista", url: "assets/media/cancion.mp3" }
    tracks: [],
    volume: 0.4,
  },

  discord: {
    // Tu ID de usuario de Discord + unirte a https://discord.gg/lanyard para mostrar tu estado en vivo.
    userId: "",
  },

  views: {
    enabled: true,
    namespace: "joakovrd-profile",
  },

  badges: [
    { name: "Developer", icon: "💻", color: "#22d3ee" },
    { name: "Designer", icon: "🎨", color: "#a78bfa" },
    { name: "Open Source", icon: "github", color: "#e6edf3" },
  ],

  // Añade o quita tecnologías desde el editor (sección "Desarrollador").
  stackTitle: "Stack",
  stack: [
    { name: "HTML", icon: "html5" },
    { name: "CSS", icon: "css" },
    { name: "JavaScript", icon: "javascript" },
    { name: "Git", icon: "git" },
    { name: "GitHub", icon: "github" },
  ],

  github: {
    username: "JoakoVRD-Designer",
    title: "Proyectos",
    stats: true,
    repos: 4,
    sort: "updated",
  },

  links: [
    { platform: "github", url: "https://github.com/JoakoVRD-Designer" },
    { platform: "discord", url: "joakovrd", copy: true, label: "Copiar usuario de Discord" },
    { platform: "instagram", url: "https://instagram.com/" },
    { platform: "tiktok", url: "https://tiktok.com/" },
  ],

  buttons: [
    { title: "Código de este perfil", subtitle: "Hecho desde cero con HTML, CSS y JavaScript", url: "https://github.com/JoakoVRD-Designer/Personal-Profile", icon: "github" },
  ],
};
