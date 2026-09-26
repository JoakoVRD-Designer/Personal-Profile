/* Efectos visuales: partículas de fondo, rastro del cursor, efecto de clic,
   destellos en el nombre y animación del título de la pestaña. */
(function () {
  const rand = (a, b) => Math.random() * (b - a) + a;
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const isTouch = () => window.matchMedia("(pointer: coarse)").matches;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fitCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const resize = () => {
      const r = DPR();
      canvas.width = innerWidth * r;
      canvas.height = innerHeight * r;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.setTransform(r, 0, 0, r, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
    return ctx;
  }

  function hexToRgb(hex) {
    const h = (hex || "#ffffff").replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function drawStar(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const rad = i % 2 === 0 ? r : r * 0.4;
      const a = rot + (i * Math.PI) / 4;
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawHeart(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
    ctx.fill();
  }

  /* ---------------------------------------------------------------- partículas */
  const PARTICLES = {
    snow: {
      spawn: (w, h, init) => ({ x: rand(0, w), y: init ? rand(0, h) : -10, r: rand(1, 3.2), vy: rand(0.4, 1.3), vx: rand(-0.3, 0.3), ph: rand(0, 6.28), a: rand(0.4, 0.95) }),
      step: (p) => { p.ph += 0.01; p.x += p.vx + Math.sin(p.ph) * 0.3; p.y += p.vy; },
      draw: (ctx, p, rgb) => { ctx.fillStyle = `rgba(${rgb},${p.a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); },
    },
    rain: {
      spawn: (w, h, init) => ({ x: rand(0, w + 100), y: init ? rand(0, h) : -30, l: rand(10, 22), vy: rand(9, 15), a: rand(0.15, 0.45) }),
      step: (p) => { p.y += p.vy; p.x -= p.vy * 0.15; },
      draw: (ctx, p, rgb) => { ctx.strokeStyle = `rgba(${rgb},${p.a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.l * 0.15, p.y - p.l); ctx.stroke(); },
    },
    stars: {
      spawn: (w, h) => ({ x: rand(0, w), y: rand(0, h), r: rand(0.4, 1.8), tw: rand(0, 6.28), ts: rand(0.01, 0.04), vy: rand(0.02, 0.12), shoot: 0 }),
      step: (p, w, h) => {
        p.tw += p.ts; p.y -= p.vy;
        if (p.y < -5) { p.y = h + 5; p.x = rand(0, w); }
        if (!p.shoot && Math.random() < 0.00008) p.shoot = { x: p.x, y: p.y, life: 1 };
        if (p.shoot) { p.shoot.x += 9; p.shoot.y += 4; p.shoot.life -= 0.02; if (p.shoot.life <= 0) p.shoot = 0; }
      },
      draw: (ctx, p, rgb) => {
        const a = 0.35 + Math.abs(Math.sin(p.tw)) * 0.65;
        ctx.fillStyle = `rgba(${rgb},${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        if (p.shoot) {
          const g = ctx.createLinearGradient(p.shoot.x, p.shoot.y, p.shoot.x - 90, p.shoot.y - 40);
          g.addColorStop(0, `rgba(${rgb},${p.shoot.life})`); g.addColorStop(1, `rgba(${rgb},0)`);
          ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.shoot.x, p.shoot.y); ctx.lineTo(p.shoot.x - 90, p.shoot.y - 40); ctx.stroke();
        }
      },
      keep: true,
    },
    fireflies: {
      spawn: (w, h) => ({ x: rand(0, w), y: rand(0, h), r: rand(1, 2.6), a: rand(0, 6.28), s: rand(0.2, 0.7), tw: rand(0, 6.28) }),
      step: (p, w, h) => {
        p.a += rand(-0.15, 0.15); p.tw += 0.03;
        p.x += Math.cos(p.a) * p.s; p.y += Math.sin(p.a) * p.s;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      },
      draw: (ctx, p, rgb) => {
        const a = 0.3 + Math.abs(Math.sin(p.tw)) * 0.7;
        ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${rgb},${a})`;
        ctx.fillStyle = `rgba(${rgb},${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        ctx.shadowBlur = 0;
      },
      keep: true,
    },
    hearts: {
      spawn: (w, h, init) => ({ x: rand(0, w), y: init ? rand(0, h) : h + 20, s: rand(8, 18), vy: rand(0.4, 1.1), ph: rand(0, 6.28), a: rand(0.3, 0.8) }),
      step: (p) => { p.ph += 0.02; p.y -= p.vy; p.x += Math.sin(p.ph) * 0.5; },
      draw: (ctx, p, rgb) => { ctx.fillStyle = `rgba(${rgb},${p.a})`; drawHeart(ctx, p.x, p.y, p.s); },
      up: true,
    },
    confetti: {
      spawn: (w, h, init) => ({ x: rand(0, w), y: init ? rand(0, h) : -10, w: rand(4, 9), h: rand(6, 12), vy: rand(1, 2.5), vx: rand(-0.6, 0.6), rot: rand(0, 6.28), vr: rand(-0.1, 0.1), hue: rand(0, 360) }),
      step: (p) => { p.y += p.vy; p.x += p.vx; p.rot += p.vr; },
      draw: (ctx, p) => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = `hsla(${p.hue},90%,65%,0.85)`; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot)));
        ctx.restore();
      },
    },
    bubbles: {
      spawn: (w, h, init) => ({ x: rand(0, w), y: init ? rand(0, h) : h + 20, r: rand(3, 14), vy: rand(0.3, 1), ph: rand(0, 6.28), a: rand(0.15, 0.5) }),
      step: (p) => { p.ph += 0.02; p.y -= p.vy; p.x += Math.sin(p.ph) * 0.4; },
      draw: (ctx, p, rgb) => { ctx.strokeStyle = `rgba(${rgb},${p.a})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.stroke(); },
      up: true,
    },
    sakura: {
      spawn: (w, h, init) => ({ x: rand(-50, w), y: init ? rand(0, h) : -15, s: rand(5, 10), vy: rand(0.6, 1.5), vx: rand(0.3, 1.1), rot: rand(0, 6.28), vr: rand(-0.03, 0.03), a: rand(0.5, 0.9) }),
      step: (p) => { p.y += p.vy; p.x += p.vx; p.rot += p.vr; },
      draw: (ctx, p) => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(255,183,207,${p.a})`; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.28); ctx.fill();
        ctx.restore();
      },
    },
  };

  function startParticles(canvas, type, opts) {
    const def = PARTICLES[type];
    if (!def || reducedMotion()) return;
    const ctx = fitCanvas(canvas);
    const rgb = hexToRgb(opts.color).join(",");
    const count = Math.max(0, Math.min(400, opts.count | 0)) * (isTouch() ? 0.6 : 1);
    let list = Array.from({ length: count }, () => def.spawn(innerWidth, innerHeight, true));
    (function loop() {
      const w = innerWidth, h = innerHeight;
      ctx.clearRect(0, 0, w, h);
      list = list.map((p) => {
        def.step(p, w, h);
        const out = def.up ? p.y < -30 : p.y > h + 30 || p.x > w + 60 || p.x < -60;
        return !def.keep && out ? def.spawn(w, h, false) : p;
      });
      for (const p of list) def.draw(ctx, p, rgb);
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------------------------------------------------- rastro del cursor */
  function startCursorFx(canvas, opts) {
    const trail = opts.trail, click = opts.click;
    if ((trail === "none" || !trail) && (click === "none" || !click)) return;
    if (reducedMotion()) return;
    const ctx = fitCanvas(canvas);
    const rgb = hexToRgb(opts.color).join(",");
    const bits = [];
    const points = [];
    const mouse = { x: -100, y: -100, gx: -100, gy: -100, moved: false };
    const touch = isTouch();

    addEventListener("pointermove", (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true;
      if (touch && e.pointerType !== "mouse") return;
      if (trail === "sparkle" && Math.random() < 0.55) bits.push({ k: "star", x: e.clientX + rand(-6, 6), y: e.clientY + rand(-6, 6), vx: rand(-0.6, 0.6), vy: rand(-0.2, 1.2), r: rand(2, 5), rot: rand(0, 6.28), life: 1 });
      if (trail === "bubbles" && Math.random() < 0.35) bits.push({ k: "bubble", x: e.clientX, y: e.clientY, vx: rand(-0.4, 0.4), vy: rand(-1.4, -0.4), r: rand(3, 9), life: 1 });
      if (trail === "emoji" && Math.random() < 0.18) bits.push({ k: "emoji", x: e.clientX, y: e.clientY, vx: rand(-0.8, 0.8), vy: rand(0.3, 1.6), r: rand(12, 20), life: 1 });
      if (trail === "trail") points.push({ x: e.clientX, y: e.clientY, life: 1 });
    }, { passive: true });

    addEventListener("pointerdown", (e) => {
      if (click === "burst") for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.28; bits.push({ k: "star", x: e.clientX, y: e.clientY, vx: Math.cos(a) * rand(1.5, 3.5), vy: Math.sin(a) * rand(1.5, 3.5), r: rand(2, 4.5), rot: rand(0, 6.28), life: 1 }); }
      if (click === "ripple") bits.push({ k: "ring", x: e.clientX, y: e.clientY, r: 4, life: 1 });
    });

    (function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (trail === "glow" && mouse.moved) {
        mouse.gx += (mouse.x - mouse.gx) * 0.18; mouse.gy += (mouse.y - mouse.gy) * 0.18;
        const g = ctx.createRadialGradient(mouse.gx, mouse.gy, 0, mouse.gx, mouse.gy, 36);
        g.addColorStop(0, `rgba(${rgb},0.55)`); g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mouse.gx, mouse.gy, 36, 0, 6.28); ctx.fill();
      }
      if (points.length) {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        for (let i = 1; i < points.length; i++) {
          const p = points[i], q = points[i - 1];
          ctx.strokeStyle = `rgba(${rgb},${p.life * 0.8})`; ctx.lineWidth = 4 * p.life;
          ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
        points.forEach((p) => (p.life -= 0.045));
        while (points.length && points[0].life <= 0) points.shift();
      }
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.life -= b.k === "ring" ? 0.03 : 0.022;
        if (b.life <= 0) { bits.splice(i, 1); continue; }
        if (b.k === "ring") {
          b.r += 2.2; ctx.strokeStyle = `rgba(${rgb},${b.life})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.28); ctx.stroke(); continue;
        }
        b.x += b.vx; b.y += b.vy;
        if (b.k === "star") { b.vy += 0.03; b.rot += 0.08; ctx.fillStyle = `rgba(${rgb},${b.life})`; drawStar(ctx, b.x, b.y, b.r * b.life + 0.5, b.rot); }
        if (b.k === "bubble") { ctx.strokeStyle = `rgba(${rgb},${b.life * 0.7})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.28); ctx.stroke(); }
        if (b.k === "emoji") { ctx.globalAlpha = b.life; ctx.font = `${b.r}px serif`; ctx.fillText(opts.emoji || "✨", b.x, b.y); ctx.globalAlpha = 1; }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------ destellos en el nombre */
  function sparkleText(el) {
    if (reducedMotion()) return;
    const colors = ["#fff", "var(--accent)", "var(--secondary)"];
    setInterval(() => {
      if (document.hidden) return;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = rand(0, 100) + "%";
      s.style.top = rand(-10, 90) + "%";
      s.style.setProperty("--size", rand(8, 15) + "px");
      s.style.color = colors[(Math.random() * colors.length) | 0];
      s.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></svg>';
      el.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }, 260);
  }

  /* ------------------------------------------------ animación del título de pestaña */
  function animateTitle(text, mode) {
    document.title = text;
    if (mode === "typewriter") {
      let i = 0, dir = 1;
      setInterval(() => {
        i += dir;
        if (i >= text.length) { dir = -1; i = text.length; }
        if (i <= 1) { dir = 1; i = 1; }
        document.title = text.slice(0, i) + (i < text.length ? "|" : "");
      }, 300);
    } else if (mode === "scroll") {
      let s = text + "  •  ";
      setInterval(() => { s = s.slice(1) + s[0]; document.title = s; }, 250);
    }
  }

  /* --------------------------------------------------------- texto máquina de escribir */
  function typewriter(el, lines, opts = {}) {
    const list = lines.filter(Boolean);
    if (!list.length) return;
    if (list.length === 1 && opts.once !== false && reducedMotion()) { el.textContent = list[0]; return; }
    const text = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.textContent = "|";
    el.replaceChildren(text, caret);
    let li = 0, ci = 0, deleting = false;
    (function tick() {
      const line = [...list[li]];
      if (!deleting) {
        ci++;
        text.textContent = line.slice(0, ci).join("");
        if (ci >= line.length) {
          if (list.length === 1) return; // una sola frase: se queda escrita
          deleting = true;
          return setTimeout(tick, 1800);
        }
        return setTimeout(tick, rand(55, 110));
      }
      ci--;
      text.textContent = line.slice(0, ci).join("");
      if (ci <= 0) { deleting = false; li = (li + 1) % list.length; return setTimeout(tick, 400); }
      setTimeout(tick, 35);
    })();
  }

  window.ProfileFX = { startParticles, startCursorFx, sparkleText, animateTitle, typewriter, isTouch, reducedMotion };
})();
