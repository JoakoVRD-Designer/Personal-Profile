/* =========================================================================
   CONFIGURACIÓN DE TU PERFIL
   Edítalo desde /editor.html (botón "Guardar y publicar") o aquí a mano.
   Todas las opciones posibles están documentadas en assets/js/defaults.js
   ========================================================================= */
window.PROFILE = {
  meta: {
    title: "JoakoVRD",
    titleAnimation: "none",
    description: "JoakoVRD — Developer & Designer.",
  },

  enter: {
    enabled: false,
  },

  profile: {
    username: "joakovrd",
    displayName: "JoakoVRD",
    avatar: "", // sube tu foto desde el editor (vacío = tu inicial)
    avatarAnimation: "none",
    bio: ["Developer & Designer."],
    bioEffect: "static",
    location: "",
  },

  appearance: {
    style: "clean",
    layout: "minimal",
    font: "system",
    accentColor: "#f5f5f7",
    secondaryColor: "#86868b",
    textColor: "#f5f5f7",
    bioColor: "#86868b",
    iconColor: "#86868b",
    iconSize: 26,
    iconStyle: "plain",
    iconAnimation: "none",
    iconHover: "lift",
    iconGlow: false,
    monochromeIcons: true,
    iconColorOnHover: false,
    usernameEffect: "none",
    usernameGlow: false,
    cardBorder: false,
    cardGlow: false,
    tilt: false,
    shareButton: false,
    entranceAnimation: "fade-up",
  },

  background: {
    type: "color",
    color: "#000000",
    overlay: 0,
    parallax: false,
  },

  effects: {
    particles: "none",
    cursorTrail: "none",
    clickEffect: "none",
  },

  audio: {
    tracks: [],
  },

  discord: {
    userId: "",
  },

  views: {
    enabled: false,
  },

  links: [
    { platform: "discord", url: "joakovrd", copy: true, label: "Copiar usuario de Discord" },
    { platform: "instagram", url: "https://instagram.com/" },
    { platform: "tiktok", url: "https://tiktok.com/" },
  ],
};
