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
    avatar: "", // foto, GIF animado o video (.mp4/.webm)
    avatarDecoration: "", // imagen PNG/GIF transparente que se superpone al avatar
    avatarShape: "circle", // circle | rounded | square
    avatarAnimation: "ring", // none | ring (anillo giratorio) | pulse | float
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
    nameColor: "", // vacío = color del texto (solo con efectos none/glow/sparkle/glitch)
    bioColor: "", // vacío = texto atenuado
    selectionColor: "", // color al seleccionar texto (vacío = acento)
    selectionTextColor: "#ffffff",
    iconColor: "#ffffff",
    cardColor: "#0a0a0f",
    cardOpacity: 0.35,
    cardBlur: 14,
    cardRadius: 22,
    cardBorder: true,
    cardBorderStyle: "animated", // solid | animated (borde degradado giratorio)
    cardGlow: true,
    tilt: true,
    tiltStrength: 12,
    usernameEffect: "sparkle", // none | glow | rainbow | gradient | glitch | sparkle | shimmer
    usernameGlow: true,
    monochromeIcons: false,
    iconGlow: true,
    iconSize: 30,
    iconStyle: "glass", // plain | glass | circle
    iconAnimation: "float", // none | float | pulse | wave | spin
    iconHover: "lift", // lift | grow | rotate | shake | flip
    iconColorOnHover: true, // con íconos monocromo, se colorean al pasar el mouse
    badgeAnimation: "shine", // none | shine | float
    buttonAnimation: "shine", // none | shine
    staggerIn: true, // íconos e insignias aparecen uno por uno
    shareButton: true, // botón para copiar el enlace del perfil
    entranceAnimation: "fade-up", // fade-up | zoom | none
  },

  background: {
    type: "gradient", // media (foto, GIF o video) | slideshow (varios) | gradient | color
    url: "", // para "media": .jpg .png .webp .gif .mp4 .webm…
    mobileUrl: "", // opcional: otra foto/GIF/video solo para celulares (ej. video vertical)
    slides: [], // para "slideshow": [{ url: "assets/media/1.jpg" }, { url: "assets/media/2.mp4" }]
    interval: 8, // segundos entre cada foto/video de la presentación
    shuffle: false, // orden aleatorio en la presentación
    kenBurns: true, // zoom lento en las fotos
    color: "#07060b",
    gradient: ["#0f0c29", "#302b63", "#24243e"],
    animatedGradient: true,
    overlay: 0.35,
    blur: 0,
    parallax: true, // el fondo se mueve un poco con el mouse
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
