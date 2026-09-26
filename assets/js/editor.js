/* Editor visual: modifica la configuración, la guarda en localStorage para la
   vista previa (index.html?preview=1) y exporta un config.js listo para subir. */
(function () {
  const STORE = "profile-editor-config";
  const MEDIA = "profile-editor-media";
  const $ = (id) => document.getElementById(id);
  const ICON_KEYS = Object.keys(window.PROFILE_ICONS || {}).sort();

  // Los blob: de archivos elegidos en una sesión anterior ya no existen.
  const media = {};
  const files = {}; // archivos elegidos con "Subir" que aún no están en el repositorio
  try { localStorage.removeItem(MEDIA); } catch (e) { /* noop */ }

  let state;
  try { state = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) { state = null; }
  state = window.deepMerge(window.PROFILE_DEFAULTS, state || window.PROFILE || {});
  const normalize = () => {
    // "video" e "image" son los nombres antiguos del tipo "media".
    if (state.background.type === "video" || state.background.type === "image") state.background.type = "media";
  };
  normalize();
  const iconName = (k) => {
    const key = String(k || "").toLowerCase().trim();
    const icon = window.PROFILE_ICONS[(window.PROFILE_ICON_ALIASES || {})[key] || key];
    return icon ? icon.t : k;
  };
  const ICON_OPTIONS = ICON_KEYS.map((k) => [k, window.PROFILE_ICONS[k].t]);

  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const set = (obj, path, v) => {
    const keys = path.split(".");
    const last = keys.pop();
    keys.reduce((o, k) => (o[k] = o[k] || {}), obj)[last] = v;
  };

  /* ------------------------------------------------------------------- esquema */
  const opt = (...xs) => xs.map((x) => (Array.isArray(x) ? x : [x, x]));
  const FONTS = ["Poppins", "Inter", "Montserrat", "Outfit", "Space Grotesk", "Sora", "Lexend", "Rubik", "Nunito", "Quicksand", "Comfortaa", "Orbitron", "Audiowide", "Press Start 2P", "VT323", "Silkscreen", "JetBrains Mono", "Fira Code", "Pacifico", "Dancing Script", "Satisfy", "Caveat", "Bebas Neue", "Anton", "Righteous", "Permanent Marker", "Playfair Display", "Cinzel", "UnifrakturMaguntia"];

  const SECTIONS = [
    { title: "👤 Perfil", open: true, fields: [
      { p: "profile.username", label: "Usuario", type: "text" },
      { p: "profile.displayName", label: "Nombre visible", type: "text", hint: "Si lo dejas vacío se usa el usuario." },
      { p: "profile.avatar", label: "Avatar / logo (foto, GIF o video)", type: "media", accept: "image/*,video/*", hint: "Acepta .jpg, .png, .webp, .gif animado, .mp4 o .webm." },
      { p: "profile.avatarDecoration", label: "Decoración del avatar (PNG/GIF transparente)", type: "media", accept: "image/*" },
      { p: "profile.avatarShape", label: "Forma del avatar", type: "select", options: opt(["circle", "Círculo"], ["rounded", "Redondeado"], ["square", "Cuadrado"]) },
      { p: "profile.avatarAnimation", label: "Animación del avatar", type: "select", options: opt(["ring", "Anillo giratorio"], ["pulse", "Pulso"], ["float", "Flotar"], ["none", "Ninguna"]) },
      { p: "profile.bio", label: "Bio (una frase por línea)", type: "lines" },
      { p: "profile.bioEffect", label: "Efecto de la bio", type: "select", options: opt(["typewriter", "Máquina de escribir"], ["static", "Estático"]) },
      { p: "profile.location", label: "Ubicación", type: "text" },
    ] },
    { title: "🖼️ Fondo", fields: [
      { p: "background.type", label: "Tipo de fondo", type: "select", options: opt(["gradient", "Degradado"], ["media", "Foto, GIF o video"], ["slideshow", "Presentación (varias fotos / GIF / videos)"], ["color", "Color sólido"]) },
      { p: "background.url", label: "Foto, GIF o video de fondo", type: "media", accept: "image/*,video/*", hint: "Para el tipo “Foto, GIF o video”." },
      { p: "background.mobileUrl", label: "Fondo solo para celular (opcional)", type: "media", accept: "image/*,video/*", hint: "Ideal para un video o foto vertical." },
      { p: "background.slides", label: "Presentación", type: "list", add: "Añadir foto / GIF / video", item: (x) => (x.url || "Nuevo").split("/").pop(), fields: [
        { p: "url", label: "Archivo", type: "media", accept: "image/*,video/*" },
      ], blank: { url: "" } },
      { p: "background.interval", label: "Segundos entre cada uno", type: "range", min: 2, max: 30, step: 1 },
      { p: "background.shuffle", label: "Orden aleatorio", type: "check" },
      { p: "background.kenBurns", label: "Zoom lento en las fotos", type: "check" },
      { p: "background.gradient", label: "Colores del degradado", type: "colors" },
      { p: "background.animatedGradient", label: "Degradado animado", type: "check" },
      { p: "background.color", label: "Color sólido", type: "color" },
      { p: "background.overlay", label: "Oscurecer fondo", type: "range", min: 0, max: 1, step: 0.05 },
      { p: "background.blur", label: "Desenfoque del fondo (px)", type: "range", min: 0, max: 30, step: 1 },
      { p: "background.parallax", label: "Parallax (el fondo sigue al mouse)", type: "check" },
      { p: "background.videoSound", label: "Usar el sonido del video (si no hay canciones)", type: "check" },
    ] },
    { title: "🎨 Apariencia", fields: [
      { p: "appearance.layout", label: "Diseño", type: "select", options: opt(["card", "Tarjeta"], ["minimal", "Minimal (sin tarjeta)"]) },
      { p: "appearance.font", label: "Fuente (Google Fonts)", type: "text", list: FONTS, hint: "Cualquier nombre de fonts.google.com" },
      { row: [
        { p: "appearance.accentColor", label: "Acento", type: "color" },
        { p: "appearance.secondaryColor", label: "Secundario", type: "color" },
      ] },
      { row: [
        { p: "appearance.textColor", label: "Texto", type: "color" },
        { p: "appearance.iconColor", label: "Íconos (monocromo)", type: "color" },
      ] },
      { row: [
        { p: "appearance.nameColor", label: "Nombre", type: "color", optional: true },
        { p: "appearance.bioColor", label: "Bio", type: "color", optional: true },
      ] },
      { row: [
        { p: "appearance.selectionColor", label: "Selección de texto", type: "color", optional: true },
        { p: "appearance.selectionTextColor", label: "Texto seleccionado", type: "color" },
      ] },
      { p: "appearance.cardColor", label: "Color de la tarjeta", type: "color" },
      { p: "appearance.cardOpacity", label: "Opacidad de la tarjeta", type: "range", min: 0, max: 1, step: 0.05 },
      { p: "appearance.cardBlur", label: "Desenfoque de la tarjeta (px)", type: "range", min: 0, max: 40, step: 1 },
      { p: "appearance.cardRadius", label: "Bordes redondeados (px)", type: "range", min: 0, max: 40, step: 1 },
      { p: "appearance.cardBorder", label: "Borde de la tarjeta", type: "check" },
      { p: "appearance.cardBorderStyle", label: "Estilo del borde", type: "select", options: opt(["animated", "Degradado giratorio"], ["solid", "Sólido"]) },
      { p: "appearance.cardGlow", label: "Brillo de la tarjeta", type: "check" },
      { p: "appearance.tilt", label: "Inclinación 3D al pasar el mouse", type: "check" },
      { p: "appearance.tiltStrength", label: "Intensidad 3D", type: "range", min: 2, max: 30, step: 1 },
      { p: "appearance.usernameEffect", label: "Efecto del nombre", type: "select", options: opt(["none", "Ninguno"], ["sparkle", "Destellos ✨"], ["rainbow", "Arcoíris"], ["gradient", "Degradado"], ["shimmer", "Brillo que pasa"], ["glitch", "Glitch"], ["glow", "Solo brillo"]) },
      { p: "appearance.usernameGlow", label: "Brillo en el nombre", type: "check" },
      { p: "appearance.entranceAnimation", label: "Animación de entrada", type: "select", options: opt(["fade-up", "Subir"], ["zoom", "Zoom"], ["none", "Ninguna"]) },
    ] },
    { title: "💫 Íconos y animaciones", fields: [
      { p: "appearance.iconStyle", label: "Fondo de los íconos", type: "select", options: opt(["glass", "Cristal"], ["circle", "Círculo"], ["plain", "Sin fondo"]) },
      { p: "appearance.iconAnimation", label: "Animación en reposo", type: "select", options: opt(["float", "Flotar"], ["pulse", "Pulso"], ["wave", "Saludo"], ["spin", "Girar"], ["none", "Ninguna"]) },
      { p: "appearance.iconHover", label: "Al pasar el mouse", type: "select", options: opt(["lift", "Elevar"], ["grow", "Agrandar"], ["rotate", "Rotar"], ["shake", "Sacudir"], ["flip", "Voltear"]) },
      { p: "appearance.iconSize", label: "Tamaño de los íconos (px)", type: "range", min: 18, max: 48, step: 1 },
      { p: "appearance.monochromeIcons", label: "Íconos monocromo (sin colores de marca)", type: "check" },
      { p: "appearance.iconColorOnHover", label: "Colorear al pasar el mouse", type: "check" },
      { p: "appearance.iconGlow", label: "Brillo en los íconos", type: "check" },
      { p: "appearance.badgeAnimation", label: "Animación de insignias", type: "select", options: opt(["shine", "Destello"], ["float", "Flotar"], ["none", "Ninguna"]) },
      { p: "appearance.buttonAnimation", label: "Animación de botones", type: "select", options: opt(["shine", "Brillo al pasar"], ["none", "Ninguna"]) },
      { p: "appearance.staggerIn", label: "Aparición uno por uno", type: "check" },
      { p: "appearance.shareButton", label: "Botón de compartir perfil", type: "check" },
    ] },
    { title: "✨ Efectos y cursor", fields: [
      { p: "effects.particles", label: "Partículas de fondo", type: "select", options: opt(["none", "Ninguna"], ["stars", "Estrellas"], ["snow", "Nieve"], ["rain", "Lluvia"], ["fireflies", "Luciérnagas"], ["hearts", "Corazones"], ["sakura", "Pétalos sakura"], ["bubbles", "Burbujas"], ["confetti", "Confeti"]) },
      { row: [
        { p: "effects.particleColor", label: "Color", type: "color" },
        { p: "effects.particleCount", label: "Cantidad", type: "number", min: 0, max: 400 },
      ] },
      { p: "effects.cursorTrail", label: "Rastro del cursor", type: "select", options: opt(["none", "Ninguno"], ["sparkle", "Destellos"], ["trail", "Estela"], ["glow", "Luz que sigue"], ["bubbles", "Burbujas"], ["emoji", "Emoji"]) },
      { row: [
        { p: "effects.cursorTrailColor", label: "Color del rastro", type: "color", hint: "si no lo cambias, usa el acento" },
        { p: "effects.cursorEmoji", label: "Emoji", type: "text" },
      ] },
      { p: "effects.clickEffect", label: "Efecto al hacer clic", type: "select", options: opt(["none", "Ninguno"], ["burst", "Explosión de estrellas"], ["ripple", "Onda"]) },
      { p: "effects.cursor", label: "Cursor personalizado (PNG/CUR, máx. 128×128)", type: "media", accept: "image/*,.cur" },
    ] },
    { title: "🎵 Música", fields: [
      { p: "audio.tracks", label: "Canciones", type: "list", add: "Añadir canción", item: (t) => t.title || "Canción", fields: [
        { p: "title", label: "Título", type: "text" },
        { p: "artist", label: "Artista", type: "text" },
        { p: "url", label: "Archivo de audio", type: "media", accept: "audio/*" },
        { p: "cover", label: "Portada (opcional)", type: "media", accept: "image/*" },
      ] },
      { p: "audio.volume", label: "Volumen inicial", type: "range", min: 0, max: 1, step: 0.05 },
      { p: "audio.showPlayer", label: "Mostrar reproductor", type: "check" },
      { p: "audio.shuffle", label: "Orden aleatorio", type: "check" },
      { p: "audio.loop", label: "Repetir lista", type: "check" },
    ] },
    { title: "🔗 Redes sociales", fields: [
      { p: "links", label: "", type: "list", add: "Añadir red social", item: (l) => iconName(l.platform) || "Enlace", fields: [
        { p: "platform", label: `Plataforma (${ICON_KEYS.length}+ con ícono, o escribe cualquier nombre)`, type: "text", list: ICON_OPTIONS, hint: "Escribe para buscar: instagram, kick, spotify, onlyfans, roblox… Si tu red no está, pon su nombre y sube un ícono abajo." },
        { p: "url", label: "URL (o texto para copiar, ej. tu usuario de Discord)", type: "text" },
        { p: "label", label: "Texto al pasar el mouse (opcional)", type: "text" },
        { p: "copy", label: "Copiar al portapapeles en vez de abrir", type: "check" },
        { p: "icon", label: "Ícono propio (PNG, SVG o GIF, opcional)", type: "media", accept: "image/*" },
      ], blank: { platform: "instagram", url: "" } },
    ] },
    { title: "🧷 Botones destacados", fields: [
      { p: "buttons", label: "", type: "list", add: "Añadir botón", item: (b) => b.title || "Botón", fields: [
        { p: "title", label: "Título", type: "text" },
        { p: "subtitle", label: "Subtítulo", type: "text" },
        { p: "url", label: "URL", type: "text" },
        { p: "icon", label: "Ícono (nombre de red, emoji o imagen)", type: "text", list: ICON_KEYS },
      ], blank: { title: "Nuevo botón", url: "https://", icon: "website" } },
    ] },
    { title: "🏅 Insignias", fields: [
      { p: "badges", label: "", type: "list", add: "Añadir insignia", item: (b) => `${b.icon || ""} ${b.name || "Insignia"}`, fields: [
        { p: "name", label: "Nombre", type: "text" },
        { p: "icon", label: "Ícono (emoji, nombre de red o URL de imagen)", type: "text", list: ICON_KEYS },
        { p: "color", label: "Color", type: "color" },
      ], blank: { name: "Nueva insignia", icon: "⭐", color: "#a855f7" } },
    ] },
    { title: "🟣 Discord y visitas", fields: [
      { p: "discord.userId", label: "ID de usuario de Discord", type: "text", hint: "Únete a discord.gg/lanyard para que funcione el estado en vivo." },
      { p: "discord.showPresence", label: "Mostrar actividad (juego, Spotify, estado)", type: "check" },
      { p: "discord.statusOnAvatar", label: "Punto de estado en el avatar", type: "check" },
      { p: "discord.useDiscordAvatar", label: "Usar mi avatar de Discord", type: "check" },
      { p: "views.enabled", label: "Contador de visitas", type: "check" },
      { p: "views.namespace", label: "ID único del contador", type: "text", hint: "Cualquier texto único (letras, números y guiones)." },
    ] },
    { title: "🚪 Pestaña y entrada", fields: [
      { p: "meta.title", label: "Título de la pestaña", type: "text" },
      { p: "meta.titleAnimation", label: "Animación del título", type: "select", options: opt(["typewriter", "Máquina de escribir"], ["scroll", "Desplazamiento"], ["none", "Ninguna"]) },
      { p: "meta.description", label: "Descripción (para previsualizaciones al compartir)", type: "text" },
      { p: "meta.favicon", label: "Ícono de la pestaña (PNG, ICO o GIF; vacío = avatar)", type: "media", accept: "image/*,.ico" },
      { p: "enter.enabled", label: "Pantalla “click to enter”", type: "check", hint: "Necesaria para que la música suene sola al entrar." },
      { p: "enter.text", label: "Texto de entrada", type: "text" },
    ] },
  ];

  /* ---------------------------------------------------------------- temas rápidos */
  const THEMES = [
    { name: "Neón", sw: ["#a855f7", "#ec4899"], cfg: {
      appearance: { accentColor: "#a855f7", secondaryColor: "#ec4899", textColor: "#ffffff", font: "Poppins", usernameEffect: "sparkle", usernameGlow: true, iconStyle: "glass", iconAnimation: "float", iconHover: "lift", monochromeIcons: false, cardColor: "#0a0a0f", cardOpacity: 0.35, cardBorderStyle: "animated" },
      profile: { avatarAnimation: "ring" },
      background: { type: "gradient", gradient: ["#0f0c29", "#302b63", "#24243e"] },
      effects: { particles: "stars", particleColor: "#ffffff", cursorTrail: "sparkle", clickEffect: "burst" } } },
    { name: "Hacker", sw: ["#22c55e", "#06b6d4"], cfg: {
      appearance: { accentColor: "#22c55e", secondaryColor: "#06b6d4", textColor: "#d1fae5", font: "JetBrains Mono", usernameEffect: "glitch", usernameGlow: true, iconStyle: "plain", iconAnimation: "pulse", iconHover: "shake", monochromeIcons: true, iconColor: "#22c55e", cardColor: "#000000", cardOpacity: 0.55, cardBorderStyle: "animated" },
      profile: { avatarAnimation: "pulse" },
      background: { type: "gradient", gradient: ["#020617", "#052e16", "#000000"] },
      effects: { particles: "rain", particleColor: "#22c55e", cursorTrail: "trail", clickEffect: "ripple" } } },
    { name: "Sakura", sw: ["#f472b6", "#fda4af"], cfg: {
      appearance: { accentColor: "#f472b6", secondaryColor: "#fda4af", textColor: "#fff1f5", font: "Quicksand", usernameEffect: "gradient", usernameGlow: true, iconStyle: "circle", iconAnimation: "float", iconHover: "grow", monochromeIcons: false, cardColor: "#1a0a12", cardOpacity: 0.4, cardBorderStyle: "animated" },
      profile: { avatarAnimation: "ring" },
      background: { type: "gradient", gradient: ["#2a0f1f", "#4a1d34", "#1f1022"] },
      effects: { particles: "sakura", cursorTrail: "emoji", cursorEmoji: "🌸", clickEffect: "burst" } } },
    { name: "Océano", sw: ["#38bdf8", "#818cf8"], cfg: {
      appearance: { accentColor: "#38bdf8", secondaryColor: "#818cf8", textColor: "#f0f9ff", font: "Outfit", usernameEffect: "shimmer", usernameGlow: true, iconStyle: "glass", iconAnimation: "wave", iconHover: "lift", monochromeIcons: false, cardColor: "#06131f", cardOpacity: 0.4, cardBorderStyle: "animated" },
      profile: { avatarAnimation: "float" },
      background: { type: "gradient", gradient: ["#0c1a2e", "#0b3a5b", "#07203a"] },
      effects: { particles: "bubbles", particleColor: "#7dd3fc", cursorTrail: "bubbles", clickEffect: "ripple" } } },
    { name: "Atardecer", sw: ["#fb923c", "#f43f5e"], cfg: {
      appearance: { accentColor: "#fb923c", secondaryColor: "#f43f5e", textColor: "#fff7ed", font: "Sora", usernameEffect: "gradient", usernameGlow: true, iconStyle: "glass", iconAnimation: "float", iconHover: "rotate", monochromeIcons: false, cardColor: "#1a0b0b", cardOpacity: 0.35, cardBorderStyle: "animated" },
      profile: { avatarAnimation: "ring" },
      background: { type: "gradient", gradient: ["#1a0b12", "#4a1426", "#7c2d12"] },
      effects: { particles: "fireflies", particleColor: "#fdba74", cursorTrail: "glow", clickEffect: "burst" } } },
    { name: "Retro", sw: ["#facc15", "#a855f7"], cfg: {
      appearance: { accentColor: "#facc15", secondaryColor: "#a855f7", textColor: "#ffffff", font: "Silkscreen", usernameEffect: "rainbow", usernameGlow: true, iconStyle: "glass", iconAnimation: "spin", iconHover: "flip", monochromeIcons: false, cardColor: "#120a1f", cardOpacity: 0.45, cardBorderStyle: "animated" },
      profile: { avatarAnimation: "pulse" },
      background: { type: "gradient", gradient: ["#1e1b4b", "#581c87", "#0f172a"] },
      effects: { particles: "confetti", cursorTrail: "sparkle", clickEffect: "burst" } } },
    { name: "Minimal", sw: ["#e5e5e5", "#525252"], cfg: {
      appearance: { accentColor: "#e5e5e5", secondaryColor: "#737373", textColor: "#fafafa", font: "Inter", usernameEffect: "none", usernameGlow: false, iconStyle: "plain", iconAnimation: "none", iconHover: "lift", monochromeIcons: true, iconColor: "#fafafa", iconColorOnHover: true, cardColor: "#0a0a0a", cardOpacity: 0.5, cardBorderStyle: "solid" },
      profile: { avatarAnimation: "none" },
      background: { type: "gradient", gradient: ["#0a0a0a", "#171717", "#0a0a0a"] },
      effects: { particles: "snow", particleColor: "#ffffff", cursorTrail: "none", clickEffect: "ripple" } } },
  ];

  function themes() {
    const box = document.createElement("div");
    box.className = "themes";
    for (const t of THEMES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "theme";
      b.style.setProperty("--a", t.sw[0]);
      b.style.setProperty("--b", t.sw[1]);
      b.innerHTML = "<span class='sw'></span>";
      b.append(t.name);
      b.onclick = () => {
        // Un tema solo cambia colores y efectos; tus datos, fondo de video/imagen y enlaces se mantienen.
        const keepBg = state.background.type === "media" || state.background.type === "slideshow";
        const cfg = JSON.parse(JSON.stringify(t.cfg));
        if (keepBg) delete cfg.background.type;
        state = window.deepMerge(state, cfg);
        render();
        save();
        toast("Tema “" + t.name + "” aplicado");
      };
      box.appendChild(b);
    }
    return box;
  }

  /* ------------------------------------------------------------- guardar/preview */
  const frame = $("frame");
  let timer;
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      localStorage.setItem(MEDIA, JSON.stringify(media));
    } catch (e) { toast("No se pudo guardar (almacenamiento lleno o bloqueado)"); }
    clearTimeout(timer);
    timer = setTimeout(() => frame.contentWindow.location.reload(), 350);
    renderFiles();
    updateDirty();
  }

  /* --------------------------------------------------------------------- campos */
  let uid = 0;
  function field(def, obj, onChange) {
    if (def.row) {
      const g = document.createElement("div");
      g.className = "grid2";
      def.row.forEach((d) => g.appendChild(field(d, obj, onChange)));
      return g;
    }
    const value = get(obj, def.p);
    const commit = (v) => { set(obj, def.p, v); onChange(); };
    const wrap = document.createElement(def.type === "check" ? "label" : "div");
    const id = "f" + uid++;

    if (def.type === "check") {
      wrap.className = "check";
      const i = document.createElement("input");
      i.type = "checkbox";
      i.checked = !!value;
      i.onchange = () => commit(i.checked);
      wrap.append(i, def.label);
      if (def.hint) { const s = document.createElement("small"); s.textContent = " — " + def.hint; wrap.append(s); }
      return wrap;
    }

    wrap.className = "field";
    const lab = document.createElement("span");
    const l = document.createElement("label");
    l.htmlFor = id;
    l.textContent = def.label;
    lab.appendChild(l);
    if (def.label) wrap.appendChild(lab);
    let input;

    switch (def.type) {
      case "select":
        input = document.createElement("select");
        for (const [v, t] of def.options) input.add(new Option(t, v, false, v === value));
        input.onchange = () => { commit(input.value); if (onChange.rerender) onChange.rerender(); };
        break;
      case "range": {
        input = document.createElement("input");
        Object.assign(input, { type: "range", min: def.min, max: def.max, step: def.step, value });
        const out = document.createElement("output");
        out.textContent = value;
        lab.appendChild(out);
        input.oninput = () => { out.textContent = input.value; commit(Number(input.value)); };
        break;
      }
      case "number":
        input = document.createElement("input");
        Object.assign(input, { type: "number", min: def.min, max: def.max, value });
        input.onchange = () => commit(Number(input.value));
        break;
      case "color": {
        const c = document.createElement("input");
        c.type = "color";
        c.value = /^#[0-9a-f]{6}$/i.test(value || "") ? value : "#ffffff";
        c.oninput = () => { commit(c.value); if (auto) auto.classList.remove("on"); };
        input = c;
        let auto = null;
        if (def.optional) {
          // Color opcional: vacío = el valor automático del tema.
          input = document.createElement("div");
          input.className = "row";
          auto = document.createElement("button");
          auto.type = "button";
          auto.className = "mini" + (value ? "" : " on");
          auto.textContent = "auto";
          auto.title = "Usar el color automático";
          auto.onclick = () => { commit(""); auto.classList.add("on"); };
          input.append(c, auto);
        }
        break;
      }
      case "lines":
        input = document.createElement("textarea");
        input.value = (Array.isArray(value) ? value : [value || ""]).join("\n");
        input.oninput = () => commit(input.value.split("\n").filter((x) => x.trim()));
        break;
      case "colors": {
        input = document.createElement("div");
        input.className = "row";
        const draw = () => {
          input.replaceChildren();
          const arr = get(obj, def.p) || [];
          arr.forEach((c, i) => {
            const ci = document.createElement("input");
            ci.type = "color";
            ci.value = c;
            ci.oninput = () => { arr[i] = ci.value; commit(arr); };
            input.appendChild(ci);
          });
          const add = document.createElement("button");
          add.type = "button"; add.className = "mini"; add.textContent = "+";
          add.onclick = () => { arr.push("#ffffff"); commit(arr); draw(); };
          const rm = document.createElement("button");
          rm.type = "button"; rm.className = "mini"; rm.textContent = "−";
          rm.onclick = () => { if (arr.length > 2) { arr.pop(); commit(arr); draw(); } };
          input.append(add, rm);
        };
        draw();
        break;
      }
      case "media": {
        input = document.createElement("div");
        input.className = "row";
        const t = document.createElement("input");
        t.type = "text";
        t.id = id;
        t.value = value || "";
        t.placeholder = "URL o assets/media/archivo";
        t.onchange = () => commit(t.value.trim());
        const up = document.createElement("label");
        up.className = "mini";
        up.textContent = "Subir";
        up.title = "Elegir archivo de tu equipo (vista previa)";
        const f = document.createElement("input");
        f.type = "file";
        f.hidden = true;
        f.accept = def.accept || "";
        f.onchange = () => {
          const file = f.files[0];
          if (!file) return;
          const path = "assets/media/" + file.name.replace(/[^\w.-]+/g, "-");
          media[path] = URL.createObjectURL(file);
          files[path] = file;
          t.value = path;
          commit(path);
        };
        up.appendChild(f);
        input.append(t, up);
        break;
      }
      default: {
        input = document.createElement("input");
        input.type = "text";
        input.value = value == null ? "" : value;
        input.oninput = () => commit(input.value);
        if (def.list) {
          const dl = document.createElement("datalist");
          dl.id = id + "-list";
          def.list.forEach((x) => dl.appendChild(Array.isArray(x) ? new Option(x[1], x[0]) : new Option(x)));
          wrap.appendChild(dl);
          input.setAttribute("list", dl.id);
        }
      }
    }
    if (!input.id) input.id = id;
    wrap.appendChild(input);
    if (def.hint && def.type !== "check") {
      const s = document.createElement("small");
      s.textContent = def.hint;
      wrap.appendChild(s);
    }
    return wrap;
  }

  function list(def) {
    const box = document.createElement("div");
    box.className = "list";
    const draw = () => {
      box.replaceChildren();
      const arr = get(state, def.p) || [];
      set(state, def.p, arr);
      arr.forEach((item, i) => {
        const card = document.createElement("div");
        card.className = "item";
        const head = document.createElement("div");
        head.className = "item-head";
        const title = document.createElement("strong");
        title.textContent = def.item(item);
        const tools = document.createElement("div");
        tools.className = "item-tools";
        const btn = (txt, label, fn) => { const b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.title = label; b.setAttribute("aria-label", label); b.onclick = fn; tools.appendChild(b); };
        btn("↑", "Subir", () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; save(); draw(); } });
        btn("↓", "Bajar", () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; save(); draw(); } });
        btn("✕", "Eliminar", () => { arr.splice(i, 1); save(); draw(); });
        head.append(title, tools);
        card.appendChild(head);
        const onChange = () => { title.textContent = def.item(item); save(); };
        def.fields.forEach((f) => card.appendChild(field(f, item, onChange)));
        box.appendChild(card);
      });
      const add = document.createElement("button");
      add.type = "button";
      add.className = "add";
      add.textContent = "+ " + def.add;
      add.onclick = () => { arr.push(JSON.parse(JSON.stringify(def.blank || {}))); save(); draw(); };
      box.appendChild(add);
    };
    draw();
    return box;
  }

  function render() {
    const form = $("form");
    const open = [...form.querySelectorAll("details")].map((d) => d.open);
    form.replaceChildren();
    const th = document.createElement("div");
    th.className = "themes-wrap";
    const tl = document.createElement("span");
    tl.textContent = "🎭 Temas rápidos";
    th.append(tl, themes());
    form.appendChild(th);
    SECTIONS.forEach((sec, si) => {
      const d = document.createElement("details");
      d.open = open.length ? open[si] : !!sec.open;
      const s = document.createElement("summary");
      s.textContent = sec.title;
      const body = document.createElement("div");
      body.className = "fields";
      for (const f of sec.fields) {
        if (f.type === "list" && f.label) {
          const t = document.createElement("span");
          t.className = "list-label";
          t.textContent = f.label;
          body.appendChild(t);
        }
        body.appendChild(f.type === "list" ? list(f) : field(f, state, save));
      }
      d.append(s, body);
      form.appendChild(d);
    });
  }

  /* ------------------------------------------------------------------ exportar */
  const code = () =>
    "/* Generado con editor.html — súbelo a la raíz del repositorio reemplazando config.js */\n" +
    "window.PROFILE = " + JSON.stringify(state, null, 2) + ";\n";

  const pendingFiles = () => Object.keys(files).filter((p) => JSON.stringify(state).includes(JSON.stringify(p)));

  function renderFiles() {
    const used = pendingFiles();
    const box = $("files");
    box.hidden = !used.length;
    box.replaceChildren();
    if (!used.length) return;
    const s = document.createElement("strong");
    s.textContent = "📁 Se subirán a tu repositorio al pulsar Guardar:";
    box.appendChild(s);
    for (const p of used) {
      const d = document.createElement("div");
      const c = document.createElement("code");
      c.textContent = p;
      d.appendChild(c);
      box.appendChild(d);
    }
  }

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  $("download").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([code()], { type: "text/javascript" }));
    a.download = "config.js";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("config.js descargado");
  };
  $("copy").onclick = () => navigator.clipboard.writeText(code()).then(() => toast("Copiado al portapapeles"), () => toast("No se pudo copiar"));
  $("import").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      let data;
      if (file.name.endsWith(".json")) data = JSON.parse(text);
      else { const w = {}; new Function("window", text)(w); data = w.PROFILE; }
      if (!data || typeof data !== "object") throw new Error();
      state = window.deepMerge(window.PROFILE_DEFAULTS, data);
      normalize();
      render();
      save();
      toast("Configuración importada");
    } catch (err) {
      toast("Archivo no válido");
    }
    e.target.value = "";
  };
  $("reset").onclick = () => {
    if (!confirm("¿Descartar los cambios del editor y volver a config.js?")) return;
    state = window.deepMerge(window.PROFILE_DEFAULTS, window.PROFILE || {});
    normalize();
    render();
    save();
  };

  /* ---------------------------------------------------- guardar y publicar en GitHub */
  const CONN = "profile-editor-github";
  const TOKEN = "profile-editor-token";
  const store = (fn) => { try { return fn(); } catch (e) { return null; } };
  // Lo publicado es lo que trae config.js; si el estado difiere, hay cambios sin guardar.
  let published = (() => {
    const s = state;
    state = window.deepMerge(window.PROFILE_DEFAULTS, window.PROFILE || {});
    normalize();
    const json = JSON.stringify(state);
    state = s;
    return json;
  })();

  function updateDirty() {
    const dirty = JSON.stringify(state) !== published || pendingFiles().length > 0;
    $("dirty").hidden = !dirty;
  }

  function loadConn() {
    const saved = store(() => JSON.parse(localStorage.getItem(CONN) || "null")) || {};
    const guess = window.GitHubPublish.detectRepo();
    return {
      owner: saved.owner || guess.owner,
      repo: saved.repo || guess.repo,
      branch: saved.branch || "main",
      token: store(() => sessionStorage.getItem(TOKEN)) || store(() => localStorage.getItem(TOKEN)) || "",
    };
  }
  function forgetToken() {
    store(() => localStorage.removeItem(TOKEN));
    store(() => sessionStorage.removeItem(TOKEN));
  }

  const dialog = $("gh-dialog");
  function openConnection() {
    const c = loadConn();
    $("gh-owner").value = c.owner;
    $("gh-repo").value = c.repo;
    $("gh-branch").value = c.branch;
    $("gh-token").value = c.token;
    dialog.returnValue = "";
    dialog.showModal();
    return new Promise((resolve) => {
      dialog.addEventListener("close", () => {
        if (dialog.returnValue !== "ok") return resolve(false);
        const conn = { owner: $("gh-owner").value.trim(), repo: $("gh-repo").value.trim(), branch: $("gh-branch").value.trim() || "main" };
        const token = $("gh-token").value.trim();
        store(() => localStorage.setItem(CONN, JSON.stringify(conn)));
        forgetToken();
        store(() => ($("gh-remember").checked ? localStorage : sessionStorage).setItem(TOKEN, token));
        toast("Conexión guardada");
        resolve(true);
      }, { once: true });
    });
  }
  $("gh-forget").onclick = () => {
    forgetToken();
    $("gh-token").value = "";
    toast("Token olvidado en este navegador");
  };
  $("gh-settings").onclick = () => openConnection();

  function status(msg, kind, link) {
    const box = $("publish-status");
    box.hidden = false;
    box.className = "publish-status" + (kind ? " " + kind : "");
    box.textContent = msg;
    if (link) {
      const a = document.createElement("a");
      a.href = link; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Ver cambio ↗";
      box.append(" ", a);
    }
  }

  const MAX_FILE = 95 * 1024 * 1024; // GitHub no acepta archivos de más de 100 MB
  let busy = false;
  async function publish() {
    if (busy) return;
    let conn = loadConn();
    if (!conn.token || !conn.owner || !conn.repo) {
      if (!(await openConnection())) return;
      conn = loadConn();
    }
    const pending = pendingFiles();
    const big = pending.find((p) => files[p].size > MAX_FILE);
    if (big) return status(`“${big.split("/").pop()}” pesa más de 95 MB; GitHub no lo acepta. Comprímelo e inténtalo de nuevo.`, "err");

    busy = true;
    $("publish").disabled = true;
    try {
      const url = await window.GitHubPublish.commitFiles({
        ...conn,
        message: "Actualizar perfil desde el editor",
        files: [{ path: "config.js", text: code() }, ...pending.map((p) => ({ path: p, file: files[p] }))],
        onStep: (m) => status(m),
      });
      published = JSON.stringify(state);
      pending.forEach((p) => delete files[p]);
      status("✓ Guardado. Tu perfil se actualiza en 1–2 minutos.", "ok", url);
      toast("Guardado y publicado");
    } catch (err) {
      if (err.status === 401) forgetToken();
      status("✕ " + (err.message || "No se pudo conectar con GitHub."), "err");
    } finally {
      busy = false;
      $("publish").disabled = false;
      renderFiles();
      updateDirty();
    }
  }
  $("publish").onclick = publish;
  addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); publish(); }
  });
  addEventListener("beforeunload", (e) => {
    if (pendingFiles().length) { e.preventDefault(); e.returnValue = ""; } // los archivos elegidos se pierden al salir
  });

  document.querySelectorAll(".seg button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".seg button").forEach((x) => x.classList.toggle("on", x === b));
      document.querySelector(".preview").classList.toggle("mobile", b.dataset.size === "mobile");
    })
  );

  render();
  save();
})();
