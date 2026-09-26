/* Valores por defecto de todas las opciones.
   No edites este archivo: sobrescribe lo que quieras en /config.js
   (o usa el editor visual en /editor.html). */
window.PROFILE_DEFAULTS = {
  meta: {
    title: "mi perfil",
    titleAnimation: "typewriter", // typewriter | scroll | none
    description: "",
    favicon: "",
  },

  enter: {
    enabled: true,
    text: "click to enter...",
  },

  profile: {
    username: "usuario",
    displayName: "",
    avatar: "",
    avatarDecoration: "", // imagen PNG/GIF transparente que se superpone al avatar
    avatarShape: "circle", // circle | rounded | square
    bio: [],
    bioEffect: "typewriter", // typewriter | static
    location: "",
  },

  appearance: {
    layout: "card", // card | minimal
    font: "Poppins", // cualquier fuente de Google Fonts
    accentColor: "#a855f7",
    secondaryColor: "#ec4899",
    textColor: "#ffffff",
    iconColor: "#ffffff",
    cardColor: "#0a0a0f",
    cardOpacity: 0.35,
    cardBlur: 14,
    cardRadius: 22,
    cardBorder: true,
    cardGlow: true,
    tilt: true,
    tiltStrength: 12,
    usernameEffect: "sparkle", // none | glow | rainbow | gradient | glitch | sparkle | shimmer
    usernameGlow: true,
    monochromeIcons: false,
    iconGlow: true,
    entranceAnimation: "fade-up", // fade-up | zoom | none
  },

  background: {
    type: "gradient", // video | image | gradient | color
    url: "",
    color: "#07060b",
    gradient: ["#0f0c29", "#302b63", "#24243e"],
    animatedGradient: true,
    overlay: 0.35,
    blur: 0,
    videoSound: false, // usa el audio del video (si no hay canciones)
  },

  effects: {
    particles: "stars", // none | snow | rain | stars | fireflies | hearts | confetti | bubbles | sakura
    particleColor: "#ffffff",
    particleCount: 90,
    cursor: "", // URL de imagen (.png/.cur, máx. 128×128) para el cursor
    cursorTrail: "sparkle", // none | sparkle | trail | glow | bubbles | emoji
    cursorTrailColor: "",
    cursorEmoji: "✨",
    clickEffect: "burst", // none | burst | ripple
  },

  audio: {
    tracks: [], // [{ title: "Canción", artist: "Artista", url: "assets/media/song.mp3", cover: "" }]
    volume: 0.4,
    shuffle: false,
    loop: true,
    showPlayer: true,
  },

  discord: {
    userId: "", // requiere unirse a discord.gg/lanyard
    showPresence: true,
    useDiscordAvatar: false,
    statusOnAvatar: true,
  },

  views: {
    enabled: true,
    namespace: "",
  },

  badges: [], // [{ name: "Developer", icon: "💻", color: "#a855f7" }]
  links: [], // [{ platform: "discord", url: "...", label: "", copy: false, icon: "" }]
  buttons: [], // [{ title: "Mi portafolio", subtitle: "", url: "...", icon: "website" }]
};

/* Mezcla profunda: los arrays del usuario reemplazan a los por defecto. */
window.deepMerge = function deepMerge(base, over) {
  if (Array.isArray(over)) return over.slice();
  if (over === null || typeof over !== "object") return over === undefined ? base : over;
  const out = Array.isArray(base) ? [] : { ...(base || {}) };
  for (const key of Object.keys(over)) {
    const b = base ? base[key] : undefined;
    out[key] = b && typeof b === "object" && !Array.isArray(b) ? deepMerge(b, over[key]) : deepMerge(undefined, over[key]);
  }
  return out;
};
