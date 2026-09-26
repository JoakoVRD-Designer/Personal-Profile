/* Renderiza el perfil a partir de config.js (o del editor, en modo vista previa). */
(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const PREVIEW = params.has("preview");
  const FX = window.ProfileFX;
  const ICONS = window.PROFILE_ICONS || {};

  /* ------------------------------------------------------------ configuración */
  let user = window.PROFILE || {};
  let media = {};
  if (PREVIEW) {
    try {
      const saved = localStorage.getItem("profile-editor-config");
      if (saved) user = JSON.parse(saved);
      media = JSON.parse(localStorage.getItem("profile-editor-media") || "{}");
    } catch (e) { /* sin almacenamiento: usamos config.js */ }
  }
  const cfg = window.deepMerge(window.PROFILE_DEFAULTS, user);
  const P = cfg.profile, A = cfg.appearance, B = cfg.background, E = cfg.effects;

  /** Resuelve rutas de archivos elegidos en el editor y bloquea esquemas peligrosos. */
  function src(url) {
    if (!url) return "";
    url = String(url).trim();
    if (media[url]) return media[url];
    return /^\s*(javascript|vbscript|data:text\/html)/i.test(url) ? "" : url;
  }
  function href(url) {
    const u = src(url);
    if (!u) return "#";
    if (/^(https?:|mailto:|tel:|\/|\.|#)/i.test(u)) return u;
    if (/^[\w-]+(\.[\w-]+)+/.test(u)) return "https://" + u; // "misitio.com" → https://misitio.com
    return /^[a-z][\w+.-]*:/i.test(u) ? "#" : u;
  }
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function copyText(text, msg) {
    const done = () => toast(msg || `Copiado: ${text}`);
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(done, () => {
      const t = el("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast(text); }
      t.remove();
    });
  }
  /** Onda al hacer clic en íconos, insignias y botones. */
  function ripple(node) {
    node.addEventListener("pointerdown", () => {
      const r = el("span", "ripple");
      node.appendChild(r);
      setTimeout(() => r.remove(), 650);
    });
  }
  const svgMask = (path) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${path}'/></svg>`)}")`;

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }
  /** Avatar de respaldo con la inicial, por si la imagen no carga. */
  function initialsAvatar(text) {
    const ch = ([...text][0] || "?").replace(/[<>&'"]/g, "?");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${A.accentColor}'/><stop offset='1' stop-color='${A.secondaryColor}'/></linearGradient></defs><rect width='100' height='100' fill='url(#g)'/><text x='50' y='50' dy='.35em' text-anchor='middle' font-family='sans-serif' font-weight='700' font-size='46' fill='white'>${ch}</text></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  /** Icono: nombre de la lista (discord, github…), URL de imagen o emoji. */
  const iconKey = (name) => {
    const k = String(name || "").toLowerCase().trim();
    return (window.PROFILE_ICON_ALIASES || {})[k] || k;
  };
  const isVideo = (url) => /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(String(url || ""));
  /** Crea un <video> silencioso en bucle (para fondos y avatares animados). */
  function mutedVideo(url, cls) {
    const v = el("video", cls);
    Object.assign(v, { src: src(url), loop: true, muted: true, autoplay: true, playsInline: true, preload: "auto" });
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    return v;
  }

  function icon(name, { brand = false, fallback = "link" } = {}) {
    const key = iconKey(name);
    const data = ICONS[key] || (!/[./]/.test(key) && !/\p{Extended_Pictographic}/u.test(key) ? ICONS[fallback] : null);
    if (data) {
      const i = el("i", "si");
      i.style.setProperty("--mask", svgMask(data.p));
      // Los colores de marca casi negros (GitHub, TikTok, X…) no se verían sobre fondo oscuro.
      if (luminance(data.c) > 0.12) {
        i.style.setProperty("--brand", data.c);
        if (brand) i.style.setProperty("--c", data.c);
      }
      return i;
    }
    if (/[./]/.test(key)) {
      const img = el("img");
      img.src = src(name);
      img.alt = "";
      img.loading = "lazy";
      return img;
    }
    return el("span", "emoji", name);
  }

  /* ---------------------------------------------------------------- apariencia */
  const root = document.documentElement.style;
  root.setProperty("--accent", A.accentColor);
  root.setProperty("--secondary", A.secondaryColor);
  root.setProperty("--text", A.textColor);
  root.setProperty("--icon", A.iconColor);
  root.setProperty("--icon-size", (Number(A.iconSize) || 30) + "px");
  if (A.nameColor) root.setProperty("--name", A.nameColor);
  if (A.bioColor) root.setProperty("--bio", A.bioColor);
  if (A.selectionColor) root.setProperty("--sel-bg", A.selectionColor);
  root.setProperty("--sel-fg", A.selectionTextColor || "#ffffff");
  root.setProperty("--card-blur", A.cardBlur + "px");
  root.setProperty("--radius", A.cardRadius + "px");
  {
    const h = A.cardColor.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16) || 0;
    root.setProperty("--card-bg", `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${A.cardOpacity})`);
  }
  if (A.font) {
    const fam = encodeURIComponent(A.font).replace(/%20/g, "+");
    for (const q of ["", ":wght@600;700"]) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = `https://fonts.googleapis.com/css2?family=${fam}${q}&display=swap`;
      document.head.appendChild(l);
    }
    root.setProperty("--font", `"${A.font}", system-ui, -apple-system, "Segoe UI", sans-serif`);
  }
  if (E.cursor) document.body.style.cursor = `url("${src(E.cursor)}"), auto`;

  const app = $("app"), card = $("card");
  app.classList.add("layout-" + A.layout);
  if (A.entranceAnimation !== "none") app.classList.add("enter-anim-" + A.entranceAnimation);
  card.classList.toggle("bordered", !!A.cardBorder);
  card.classList.toggle("border-animated", !!A.cardBorder && A.cardBorderStyle === "animated");
  card.classList.toggle("glow", !!A.cardGlow);
  card.addEventListener("animationend", (e) => { if (e.target === card) app.classList.remove("enter-anim-" + A.entranceAnimation); });

  /* -------------------------------------------------------------- meta/pestaña */
  const title = cfg.meta.title || "@" + P.username;
  FX.animateTitle(title, cfg.meta.titleAnimation);
  const setMeta = (sel, v) => { const m = document.querySelector(sel); if (m) m.setAttribute("content", v); };
  const desc = cfg.meta.description || (P.bio[0] || "");
  setMeta('meta[name="description"]', desc);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', desc);
  if (!isVideo(P.avatar)) setMeta('meta[property="og:image"]', src(P.avatar));
  setMeta('meta[name="theme-color"]', A.accentColor);
  const fav = cfg.meta.favicon || (isVideo(P.avatar) ? "" : P.avatar);
  if (fav) $("favicon").href = src(fav);

  /* --------------------------------------------------------------------- fondo */
  const bg = $("bg");
  let bgVideo = null;
  // Foto, GIF o video (uno solo, con versión opcional para móvil) o presentación de varios.
  let slides = [];
  if (B.type === "media" || B.type === "video" || B.type === "image") {
    const u = (innerWidth < 768 && B.mobileUrl) || B.url;
    if (u) slides = [u];
  } else if (B.type === "slideshow") {
    slides = (B.slides || []).map((x) => (typeof x === "string" ? x : x && x.url)).filter(Boolean);
    if (B.shuffle) slides.sort(() => Math.random() - 0.5);
  }
  const layers = slides.map((u) => {
    const layer = el("div", "slide");
    if (isVideo(u)) layer.appendChild(mutedVideo(u));
    else { const img = el("img"); img.src = src(u); img.alt = ""; img.decoding = "async"; layer.appendChild(img); }
    bg.appendChild(layer);
    return layer;
  });
  let slide = 0;
  function showSlide(i) {
    layers.forEach((l, k) => {
      const on = k === i, m = l.firstChild;
      l.classList.toggle("on", on);
      if (m.tagName === "VIDEO") { if (on) { if (layers.length > 1) m.currentTime = 0; m.play().catch(() => {}); } else m.pause(); }
      else if (on) { m.style.animation = "none"; void m.offsetWidth; m.style.animation = ""; } // reinicia el zoom lento
    });
  }
  if (layers.length) {
    bg.classList.toggle("kenburns", !!B.kenBurns);
    if (layers.length === 1 && layers[0].firstChild.tagName === "VIDEO") bgVideo = layers[0].firstChild;
    showSlide(0);
    if (layers.length > 1) {
      setInterval(() => {
        if (document.hidden) return;
        slide = (slide + 1) % layers.length;
        showSlide(slide);
      }, Math.max(2, Number(B.interval) || 8) * 1000);
    }
  } else if (B.type === "color") {
    bg.style.background = B.color;
  } else {
    const g = (B.gradient && B.gradient.length ? B.gradient : ["#0f0c29", "#302b63"]).join(", ");
    bg.style.background = `linear-gradient(135deg, ${g})`;
    bg.classList.toggle("animated", !!B.animatedGradient);
  }
  if (B.blur) bg.style.filter = `blur(${B.blur}px)`, bg.style.inset = `-${B.blur * 2}px`;
  $("bg-overlay").style.opacity = B.overlay;
  document.body.style.background = B.type === "color" ? B.color : "#07060b";

  /* ---------------------------------------------------------------- avatar/nombre */
  const avatarImg = $("avatar");
  let avatar = avatarImg;
  // Avatar en video (mp4/webm); los GIF y fotos funcionan directamente como imagen.
  if (isVideo(P.avatar) && !cfg.discord.useDiscordAvatar) {
    const v = mutedVideo(P.avatar, "avatar");
    avatar.replaceWith(v);
    avatar = v;
  }
  const fallbackAvatar = () => initialsAvatar((P.displayName || P.username).toUpperCase());
  avatarImg.addEventListener("error", () => { if (!avatarImg.src.startsWith("data:")) avatarImg.src = fallbackAvatar(); });
  if (avatar !== avatarImg) avatar.addEventListener("error", () => { avatar.replaceWith(avatarImg); avatar = avatarImg; avatarImg.src = fallbackAvatar(); });
  if (P.avatar) { if (avatar.tagName === "IMG") avatar.src = src(P.avatar); }
  else $("avatar-wrap").hidden = true;
  if (avatar.tagName !== "IMG") avatar.setAttribute("aria-label", "Avatar de " + (P.displayName || P.username));
  avatar.alt = "Avatar de " + (P.displayName || P.username);
  $("avatar-wrap").classList.add("avatar-" + P.avatarShape, "avatar-anim-" + (P.avatarAnimation || "none"));
  if (P.avatarDecoration) { $("avatar-deco").src = src(P.avatarDecoration); $("avatar-deco").hidden = false; }

  const name = $("name"), nameText = $("name-text");
  const shown = P.displayName || P.username;
  nameText.textContent = shown;
  nameText.dataset.text = shown;
  if (A.usernameEffect && A.usernameEffect !== "none") name.classList.add("fx-" + A.usernameEffect);
  if (A.usernameGlow || A.usernameEffect === "glow") name.classList.add("glow");
  name.title = "@" + P.username;

  /* ------------------------------------------------------------------ insignias */
  const badges = $("badges");
  badges.classList.add("badge-anim-" + (A.badgeAnimation || "none"));
  cfg.badges.forEach((b, i) => {
    const d = el("span", "badge");
    d.tabIndex = 0;
    d.style.setProperty("--i", i);
    if (b.color) d.style.setProperty("--badge", b.color);
    const ic = icon(b.icon || "⭐", { fallback: null });
    if (ic.classList.contains("si")) ic.className = "bi";
    d.append(ic, el("span", "tip", b.name || ""));
    d.setAttribute("aria-label", b.name || "insignia");
    ripple(d);
    badges.appendChild(d);
  });

  /* ------------------------------------------------------------------------ bio */
  const bio = $("bio");
  const lines = (Array.isArray(P.bio) ? P.bio : String(P.bio || "").split("\n")).filter((l) => String(l).trim());
  const typed = P.bioEffect === "typewriter" && lines.length > 0;
  bio.textContent = typed ? " " : lines.join("\n");

  /* ------------------------------------------------------------------ meta info */
  const meta = $("meta");
  if (P.location) {
    const s = el("span");
    s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
    s.append(document.createTextNode(P.location));
    meta.appendChild(s);
  }
  if (cfg.views.enabled) {
    const s = el("span");
    s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5C6.5 5 2.7 9.4 1.5 12c1.2 2.6 5 7 10.5 7s9.3-4.4 10.5-7C21.3 9.4 17.5 5 12 5zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>';
    const n = el("span", "", "—");
    s.append(n);
    s.title = "Visitas";
    meta.appendChild(s);
    countViews(n, s);
  }

  function countViews(target, wrap) {
    const ns = (cfg.views.namespace || P.username + "-profile").toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const base = `https://api.counterapi.dev/v1/${ns}/views`;
    const seenKey = "profile-viewed:" + ns;
    let seen = PREVIEW;
    try { seen = seen || !!sessionStorage.getItem(seenKey); } catch (e) { /* noop */ }
    fetch(seen ? base + "/" : base + "/up")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (typeof d.count !== "number") throw 0;
        target.textContent = d.count.toLocaleString("es");
        try { sessionStorage.setItem(seenKey, "1"); } catch (e) { /* noop */ }
      })
      .catch(() => { if (!PREVIEW) wrap.remove(); });
  }

  /* ------------------------------------------------------------- botones grandes */
  const arrow = '<svg class="arrow" viewBox="0 0 24 24"><path d="M9.3 6.7a1 1 0 0 1 1.4-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 1 1-1.4-1.4L14.6 12z"/></svg>';
  $("buttons").classList.toggle("btn-shine", A.buttonAnimation === "shine");
  cfg.buttons.forEach((b, i) => {
    const a = el("a", "btn");
    a.style.setProperty("--i", i);
    a.href = href(b.url);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const ic = el("span", "ico");
    ic.appendChild(icon(b.icon || "link", { brand: !A.monochromeIcons }));
    const txt = el("div");
    txt.append(el("strong", "", b.title || b.url), ...(b.subtitle ? [el("small", "", b.subtitle)] : []));
    a.append(ic, txt);
    a.insertAdjacentHTML("beforeend", arrow);
    ripple(a);
    $("buttons").appendChild(a);
  });

  /* ------------------------------------------------------------- redes sociales */
  const links = $("links");
  links.classList.toggle("icon-glow", !!A.iconGlow);
  links.classList.toggle("icon-colorhover", !!A.iconColorOnHover);
  links.classList.add("icon-style-" + A.iconStyle, "icon-anim-" + A.iconAnimation, "icon-hover-" + A.iconHover);
  cfg.links.forEach((l, i) => {
    const platform = iconKey(l.platform || "link");
    const isUrl = /^(https?:|mailto:|tel:)/i.test(l.url || "") || /^[\w-]+(\.[\w-]+)+\//.test(l.url || "");
    const copy = l.copy || !isUrl;
    const node = copy ? el("button", "link") : el("a", "link");
    node.style.setProperty("--i", i);
    if (copy) {
      node.type = "button";
      node.addEventListener("click", () => copyText(l.url));
    } else {
      node.href = href(l.url);
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    }
    const label = l.label || (ICONS[platform] ? ICONS[platform].t : l.platform || "Enlace");
    node.setAttribute("aria-label", label);
    node.append(icon(l.icon || platform, { brand: !A.monochromeIcons }), el("span", "tip", label));
    ripple(node);
    links.appendChild(node);
  });

  /* ------------------------------------------------------ botón de compartir */
  if (A.shareButton && !PREVIEW) {
    const share = $("share");
    share.hidden = false;
    share.addEventListener("click", () => {
      const url = location.href.split("#")[0];
      if (navigator.share && FX.isTouch()) navigator.share({ title: document.title, url }).catch(() => {});
      else copyText(url, "Enlace del perfil copiado");
    });
  }

  /* ---------------------------------------------------------- parallax del fondo */
  if (B.parallax && !FX.isTouch() && !FX.reducedMotion()) {
    bg.classList.add("parallax");
    addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      bg.style.transform = `translate(${x * -18}px, ${y * -18}px) scale(1.06)`;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------- tilt 3D */
  if (A.tilt && !FX.isTouch() && !FX.reducedMotion()) {
    const s = Number(A.tiltStrength) || 12;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateX(${(0.5 - y) * s}deg) rotateY(${(x - 0.5) * s}deg)`;
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  }

  /* -------------------------------------------------------- discord (Lanyard) */
  const D = cfg.discord;
  if (D.userId && /^\d{15,21}$/.test(String(D.userId))) {
    let presence = null;
    const box = $("discord");
    const TYPES = { 0: "Jugando a", 1: "Transmitiendo", 2: "Escuchando", 3: "Viendo", 5: "Compitiendo en" };
    const STATUS = { online: "En línea", idle: "Ausente", dnd: "No molestar", offline: "Desconectado" };
    const asset = (app, img) => {
      if (!img) return "";
      if (img.startsWith("mp:external/")) return "https://media.discordapp.net/external/" + img.slice(12);
      if (img.startsWith("spotify:")) return "https://i.scdn.co/image/" + img.slice(8);
      return app ? `https://cdn.discordapp.com/app-assets/${app}/${img}.png` : "";
    };
    const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

    const render = () => {
      const d = presence;
      if (!d) return;
      const u = d.discord_user;
      const av = u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith("a_") ? "gif" : "png"}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(u.id) >> 22n) % 6n)}.png`;
      if (D.useDiscordAvatar) { avatar.src = av; $("avatar-wrap").hidden = false; }
      const status = d.discord_status || "offline";
      if (D.statusOnAvatar) { const dot = $("status-dot"); dot.hidden = false; dot.className = "status-dot status-" + status; dot.title = STATUS[status]; }
      if (!D.showPresence) return;

      const custom = (d.activities || []).find((a) => a.type === 4);
      const act = (d.activities || []).find((a) => a.type !== 4);
      let img = av, small = "", l1 = "", l2 = "", bar = null;
      if (d.listening_to_spotify && d.spotify) {
        img = d.spotify.album_art_url || av;
        l1 = d.spotify.song;
        l2 = "de " + d.spotify.artist;
        const t = d.spotify.timestamps || {};
        if (t.start && t.end) bar = { p: Math.min(1, (Date.now() - t.start) / (t.end - t.start)), txt: `${fmt(Date.now() - t.start)} / ${fmt(t.end - t.start)}` };
      } else if (act) {
        img = asset(act.application_id, act.assets && act.assets.large_image) || av;
        small = asset(act.application_id, act.assets && act.assets.small_image);
        l1 = `${TYPES[act.type] || ""} ${act.name}`.trim();
        l2 = [act.details, act.state].filter(Boolean).join(" · ");
        if (!l2 && act.timestamps && act.timestamps.start) l2 = fmt(Date.now() - act.timestamps.start) + " transcurrido";
      } else {
        l1 = custom ? [custom.emoji && !custom.emoji.id ? custom.emoji.name : "", custom.state].filter(Boolean).join(" ") : "";
        l2 = STATUS[status];
      }

      const wrap = el("div", "discord-av");
      const main = el("img", "main"); main.src = img; main.alt = ""; main.referrerPolicy = "no-referrer";
      wrap.appendChild(main);
      if (small) { const s = el("img", "small"); s.src = small; s.alt = ""; wrap.appendChild(s); }
      else { const dot = el("span", "status-dot status-" + status); wrap.appendChild(dot); }
      const txt = el("div", "discord-txt");
      txt.append(el("strong", "", u.global_name || u.display_name || u.username));
      if (l1) txt.append(el("span", "", l1));
      if (l2) txt.append(el("span", "", l2));
      if (bar) {
        const b = el("div", "discord-bar"), f = el("div");
        f.style.width = bar.p * 100 + "%";
        b.appendChild(f);
        txt.append(b);
        txt.title = bar.txt;
      }
      box.replaceChildren(wrap, txt);
      box.hidden = false;
    };

    const poll = () =>
      fetch(`https://api.lanyard.rest/v1/users/${D.userId}`)
        .then((r) => r.json())
        .then((j) => { if (j.success) { presence = j.data; render(); } })
        .catch(() => {});
    poll();
    setInterval(poll, 30000);
    setInterval(() => presence && presence.listening_to_spotify && render(), 1000);
  }

  /* ----------------------------------------------------------------------- audio */
  const AU = cfg.audio;
  const tracks = (AU.tracks || []).filter((t) => t && t.url);
  const audio = new Audio();
  audio.preload = "metadata";
  let order = tracks.map((_, i) => i), pos = 0;
  if (AU.shuffle) order.sort(() => Math.random() - 0.5);
  const soundFromVideo = !tracks.length && bgVideo && B.videoSound;
  let volume = Math.max(0, Math.min(1, Number(AU.volume)));
  let muted = false;
  try {
    const v = localStorage.getItem("profile-volume");
    if (v !== null && !PREVIEW) volume = Number(v);
  } catch (e) { /* noop */ }

  const PLAY = "M8 5v14l11-7z", PAUSE = "M6 5h4v14H6zm8 0h4v14h-4z";
  const VOL_ON = "M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z";
  const VOL_OFF = "M3 10v4h4l5 5V5L7 10H3zm13.6 2 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z";
  const fmtTime = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

  function applyVolume() {
    const v = muted ? 0 : volume;
    audio.volume = v;
    if (bgVideo && soundFromVideo) { bgVideo.volume = v; bgVideo.muted = muted || v === 0; }
    $("volume-icon").setAttribute("d", muted || volume === 0 ? VOL_OFF : VOL_ON);
    $("volume-range").value = muted ? 0 : volume;
  }
  function loadTrack(i) {
    pos = (i + order.length) % order.length;
    const t = tracks[order[pos]];
    audio.src = src(t.url);
    $("player-title").textContent = t.title || t.url.split("/").pop();
    $("player-artist").textContent = t.artist || "";
    const cover = $("player-cover");
    cover.hidden = !t.cover;
    if (t.cover) cover.src = src(t.cover);
  }
  const playAudio = () => audio.play().catch(() => {});

  if (tracks.length || soundFromVideo) {
    $("volume").hidden = false;
    $("volume-btn").addEventListener("click", () => {
      muted = !muted;
      if (!muted && volume === 0) volume = 0.4;
      applyVolume();
    });
    $("volume-range").addEventListener("input", (e) => {
      volume = Number(e.target.value);
      muted = false;
      applyVolume();
      try { localStorage.setItem("profile-volume", volume); } catch (err) { /* noop */ }
    });
    applyVolume();
  }

  if (tracks.length) {
    loadTrack(0);
    $("player").hidden = !AU.showPlayer;
    audio.addEventListener("play", () => { $("player-play-icon").setAttribute("d", PAUSE); $("player").classList.add("playing"); });
    audio.addEventListener("pause", () => { $("player-play-icon").setAttribute("d", PLAY); $("player").classList.remove("playing"); });
    audio.addEventListener("loadedmetadata", () => ($("player-dur").textContent = fmtTime(audio.duration)));
    audio.addEventListener("timeupdate", () => {
      $("player-cur").textContent = fmtTime(audio.currentTime);
      $("player-fill").style.width = (audio.duration ? (audio.currentTime / audio.duration) * 100 : 0) + "%";
    });
    audio.addEventListener("ended", () => {
      if (tracks.length === 1) { if (AU.loop) { audio.currentTime = 0; playAudio(); } return; }
      if (pos === order.length - 1 && !AU.loop) return;
      loadTrack(pos + 1);
      playAudio();
    });
    $("player-play").addEventListener("click", () => (audio.paused ? playAudio() : audio.pause()));
    $("player-next").addEventListener("click", () => { loadTrack(pos + 1); playAudio(); });
    $("player-prev").addEventListener("click", () => {
      if (audio.currentTime > 3) audio.currentTime = 0;
      else loadTrack(pos - 1);
      playAudio();
    });
    const bar = $("player-progress");
    const seek = (e) => {
      const r = bar.getBoundingClientRect();
      if (audio.duration) audio.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * audio.duration;
    };
    bar.addEventListener("pointerdown", (e) => { seek(e); bar.setPointerCapture(e.pointerId); bar.onpointermove = seek; });
    bar.addEventListener("pointerup", () => (bar.onpointermove = null));
    bar.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
      if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
    });
  }

  /* -------------------------------------------------------- entrada y efectos */
  /* Atajos: espacio/K reproducir-pausar, N siguiente, B anterior, M silenciar. */
  addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName)) return;
    if (app.hidden) return; // aún en la pantalla de entrada
    const k = e.key.toLowerCase();
    if (tracks.length && (k === " " || k === "k")) { e.preventDefault(); audio.paused ? playAudio() : audio.pause(); }
    else if (tracks.length > 1 && k === "n") $("player-next").click();
    else if (tracks.length > 1 && k === "b") $("player-prev").click();
    else if (k === "m" && !$("volume").hidden) $("volume-btn").click();
  });

  function start() {
    app.hidden = false;
    if (A.staggerIn && !FX.reducedMotion()) {
      app.classList.add("stagger");
      const n = Math.max(cfg.links.length, cfg.badges.length, cfg.buttons.length);
      setTimeout(() => app.classList.remove("stagger"), 900 + n * 90);
    }
    if (typed) FX.typewriter(bio, lines);
    if (A.usernameEffect === "sparkle") FX.sparkleText(name);
    if (tracks.length) playAudio();
    if (soundFromVideo) applyVolume();
    if (layers.length) showSlide(slide);
  }

  const enter = $("enter");
  if (cfg.enter.enabled && !PREVIEW) {
    $("enter-text").textContent = cfg.enter.text || "click to enter...";
    enter.hidden = false;
    enter.focus();
    enter.addEventListener("click", () => {
      enter.classList.add("gone");
      setTimeout(() => enter.remove(), 800);
      start();
    }, { once: true });
  } else {
    start();
  }

  FX.startParticles($("particles"), E.particles, { color: E.particleColor, count: E.particleCount });
  FX.startCursorFx($("cursor-fx"), {
    trail: E.cursorTrail,
    click: E.clickEffect,
    color: E.cursorTrailColor || A.accentColor,
    emoji: E.cursorEmoji,
  });
})();
