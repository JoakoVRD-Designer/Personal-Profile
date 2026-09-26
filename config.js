/* =========================================================================
   CONFIGURACIÓN DE TU PERFIL
   Edita este archivo (o usa /editor.html y descarga el config.js generado).
   Todas las opciones posibles están documentadas en assets/js/defaults.js
   ========================================================================= */
window.PROFILE = {
  meta: {
    title: "@joakovrd",
    titleAnimation: "typewriter",
    description: "JoakoVRD — Designer",
  },

  enter: {
    enabled: true,
    text: "click to enter...",
  },

  profile: {
    username: "joakovrd",
    displayName: "JoakoVRD",
    avatar: "https://github.com/JoakoVRD-Designer.png", // también sirve un GIF o un video .mp4
    bio: ["designer ✦ creator", "bienvenido a mi perfil", "hecho a mano, sin pagar nada :)"],
    bioEffect: "typewriter",
    location: "",
  },

  appearance: {
    font: "Poppins",
    accentColor: "#a855f7",
    secondaryColor: "#ec4899",
    usernameEffect: "sparkle",
    tilt: true,
  },

  background: {
    // Foto, GIF o video:  type: "media", url: "assets/media/fondo.mp4"  (o .gif / .jpg)
    // Varios que se turnan: type: "slideshow", slides: [{ url: "assets/media/1.jpg" }, { url: "assets/media/2.gif" }]
    type: "gradient",
    gradient: ["#0f0c29", "#302b63", "#24243e"],
    overlay: 0.3,
  },

  effects: {
    particles: "stars",
    cursorTrail: "sparkle",
    clickEffect: "burst",
  },

  audio: {
    // Coloca tus canciones en assets/media/ y añádelas aquí:
    // { title: "Nombre", artist: "Artista", url: "assets/media/cancion.mp3" }
    tracks: [],
    volume: 0.4,
  },

  discord: {
    // Tu ID de usuario de Discord (Ajustes → Avanzado → Modo desarrollador → clic derecho en tu perfil → Copiar ID)
    // y únete a https://discord.gg/lanyard para mostrar tu estado en vivo.
    userId: "",
  },

  views: {
    enabled: true,
    namespace: "joakovrd-profile",
  },

  badges: [
    { name: "Designer", icon: "🎨", color: "#a855f7" },
    { name: "Premium (gratis)", icon: "💎", color: "#38bdf8" },
    { name: "Early Supporter", icon: "⭐", color: "#facc15" },
  ],

  links: [
    { platform: "github", url: "https://github.com/JoakoVRD-Designer" },
    { platform: "discord", url: "joakovrd", copy: true, label: "Copiar usuario de Discord" },
    { platform: "instagram", url: "https://instagram.com/" },
    { platform: "tiktok", url: "https://tiktok.com/" },
    // { platform: "email", url: "mailto:tu-correo@ejemplo.com" },
  ],

  buttons: [
    // { title: "Mi portafolio", subtitle: "Mira mis trabajos", url: "https://...", icon: "behance" },
  ],
};
