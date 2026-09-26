/* Editor visual: modifica la configuración, la guarda en localStorage para la
   vista previa (index.html?preview=1) y exporta un config.js listo para subir. */
(function () {
  const STORE = "profile-editor-config";
  const MEDIA = "profile-editor-media";
  const $ = (id) => document.getElementById(id);
  const ICON_KEYS = Object.keys(window.PROFILE_ICONS || {}).sort();

  // Los blob: de archivos elegidos en una sesión anterior ya no existen.
  const media = {};
  try { localStorage.removeItem(MEDIA); } catch (e) { /* noop */ }

  let state;
  try { state = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) { state = null; }
  state = window.deepMerge(window.PROFILE_DEFAULTS, state || window.PROFILE || {});

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
      { p: "profile.avatar", label: "Avatar", type: "media", accept: "image/*" },
      { p: "profile.avatarDecoration", label: "Decoración del avatar (PNG/GIF transparente)", type: "media", accept: "image/*" },
      { p: "profile.avatarShape", label: "Forma del avatar", type: "select", options: opt(["circle", "Círculo"], ["rounded", "Redondeado"], ["square", "Cuadrado"]) },
      { p: "profile.bio", label: "Bio (una frase por línea)", type: "lines" },
      { p: "profile.bioEffect", label: "Efecto de la bio", type: "select", options: opt(["typewriter", "Máquina de escribir"], ["static", "Estático"]) },
      { p: "profile.location", label: "Ubicación", type: "text" },
    ] },
    { title: "🖼️ Fondo", fields: [
      { p: "background.type", label: "Tipo de fondo", type: "select", options: opt(["gradient", "Degradado"], ["video", "Video"], ["image", "Imagen / GIF"], ["color", "Color sólido"]) },
      { p: "background.url", label: "Archivo de video / imagen", type: "media", accept: "video/*,image/*", hint: "Para tipo Video o Imagen." },
      { p: "background.gradient", label: "Colores del degradado", type: "colors" },
      { p: "background.animatedGradient", label: "Degradado animado", type: "check" },
      { p: "background.color", label: "Color sólido", type: "color" },
      { p: "background.overlay", label: "Oscurecer fondo", type: "range", min: 0, max: 1, step: 0.05 },
      { p: "background.blur", label: "Desenfoque del fondo (px)", type: "range", min: 0, max: 30, step: 1 },
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
      { p: "appearance.cardColor", label: "Color de la tarjeta", type: "color" },
      { p: "appearance.cardOpacity", label: "Opacidad de la tarjeta", type: "range", min: 0, max: 1, step: 0.05 },
      { p: "appearance.cardBlur", label: "Desenfoque de la tarjeta (px)", type: "range", min: 0, max: 40, step: 1 },
      { p: "appearance.cardRadius", label: "Bordes redondeados (px)", type: "range", min: 0, max: 40, step: 1 },
      { p: "appearance.cardBorder", label: "Borde de la tarjeta", type: "check" },
      { p: "appearance.cardGlow", label: "Brillo de la tarjeta", type: "check" },
      { p: "appearance.tilt", label: "Inclinación 3D al pasar el mouse", type: "check" },
      { p: "appearance.tiltStrength", label: "Intensidad 3D", type: "range", min: 2, max: 30, step: 1 },
      { p: "appearance.usernameEffect", label: "Efecto del nombre", type: "select", options: opt(["none", "Ninguno"], ["sparkle", "Destellos ✨"], ["rainbow", "Arcoíris"], ["gradient", "Degradado"], ["shimmer", "Brillo que pasa"], ["glitch", "Glitch"], ["glow", "Solo brillo"]) },
      { p: "appearance.usernameGlow", label: "Brillo en el nombre", type: "check" },
      { p: "appearance.monochromeIcons", label: "Íconos monocromo (sin colores de marca)", type: "check" },
      { p: "appearance.iconGlow", label: "Brillo en los íconos", type: "check" },
      { p: "appearance.entranceAnimation", label: "Animación de entrada", type: "select", options: opt(["fade-up", "Subir"], ["zoom", "Zoom"], ["none", "Ninguna"]) },
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
      { p: "links", label: "", type: "list", add: "Añadir red social", item: (l) => (window.PROFILE_ICONS[l.platform] || {}).t || l.platform || "Enlace", fields: [
        { p: "platform", label: "Plataforma", type: "select", options: ICON_KEYS.map((k) => [k, window.PROFILE_ICONS[k].t]) },
        { p: "url", label: "URL (o texto para copiar, ej. tu usuario de Discord)", type: "text" },
        { p: "label", label: "Texto al pasar el mouse (opcional)", type: "text" },
        { p: "copy", label: "Copiar al portapapeles en vez de abrir", type: "check" },
        { p: "icon", label: "Ícono propio (opcional)", type: "media", accept: "image/*" },
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
      { p: "meta.favicon", label: "Favicon (vacío = avatar)", type: "media", accept: "image/*" },
      { p: "enter.enabled", label: "Pantalla “click to enter”", type: "check", hint: "Necesaria para que la música suene sola al entrar." },
      { p: "enter.text", label: "Texto de entrada", type: "text" },
    ] },
  ];

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
        input = document.createElement("input");
        input.type = "color";
        input.value = /^#[0-9a-f]{6}$/i.test(value || "") ? value : "#ffffff";
        input.oninput = () => commit(input.value);
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
          def.list.forEach((x) => dl.appendChild(new Option(x)));
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
    SECTIONS.forEach((sec, si) => {
      const d = document.createElement("details");
      d.open = open.length ? open[si] : !!sec.open;
      const s = document.createElement("summary");
      s.textContent = sec.title;
      const body = document.createElement("div");
      body.className = "fields";
      for (const f of sec.fields) body.appendChild(f.type === "list" ? list(f) : field(f, state, save));
      d.append(s, body);
      form.appendChild(d);
    });
  }

  /* ------------------------------------------------------------------ exportar */
  const code = () =>
    "/* Generado con editor.html — súbelo a la raíz del repositorio reemplazando config.js */\n" +
    "window.PROFILE = " + JSON.stringify(state, null, 2) + ";\n";

  function renderFiles() {
    const used = Object.keys(media).filter((p) => JSON.stringify(state).includes(JSON.stringify(p)));
    const box = $("files");
    box.hidden = !used.length;
    box.replaceChildren();
    if (!used.length) return;
    const s = document.createElement("strong");
    s.textContent = "⚠ Recuerda subir estos archivos a tu repositorio:";
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
    render();
    save();
  };

  document.querySelectorAll(".seg button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".seg button").forEach((x) => x.classList.toggle("on", x === b));
      document.querySelector(".preview").classList.toggle("mobile", b.dataset.size === "mobile");
    })
  );

  render();
  save();
})();
