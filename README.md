# ✦ Personal Profile

Página de perfil al estilo **guns.lol**, con **todas las funciones premium gratis**, sin anuncios ni marcas de agua, y 100 % tuya: es un sitio estático (HTML + CSS + JS, sin compilar nada) que puedes publicar gratis en GitHub Pages.

## Funciones

| | |
|---|---|
| 🚪 Pantalla “click to enter” | Texto personalizable; permite que la música suene al entrar |
| 🖼️ Fondo | **Foto, GIF o video**, o una **presentación** de varios que se turnan con transición y zoom lento; fondo distinto para celular; degradado animado o color; oscurecido y desenfoque |
| 🎵 Música | **Varias canciones**, reproductor con portada, ecualizador animado, barra de progreso, anterior/siguiente, aleatorio, repetir y control de volumen (recuerda tu volumen) |
| ⌨️ Atajos | `Espacio`/`K` reproducir-pausar, `N` siguiente, `B` anterior, `M` silenciar |
| ✨ Efectos del nombre | Destellos, arcoíris, degradado, brillo que pasa, glitch, glow |
| ⌨️ Bio | Efecto máquina de escribir con varias frases que rotan |
| 🖱️ Cursor | Cursor personalizado + rastros: destellos, estela, luz, burbujas, emoji. Efecto al hacer clic |
| 🌌 Partículas | Estrellas (con estrellas fugaces), nieve, lluvia, luciérnagas, corazones, sakura, burbujas, confeti |
| 🪟 Tarjeta | Opacidad, desenfoque, color, **borde degradado giratorio**, brillo, **inclinación 3D**, diseño tarjeta o minimal |
| 👤 Avatar / logo | **Foto, GIF animado o video**; anillo degradado giratorio, pulso o flotar; decoración superpuesta; forma círculo/redondeada/cuadrada |
| 💫 Íconos animados | Estilo cristal/círculo/sin fondo; animación en reposo (flotar, pulso, saludo, girar); al pasar el mouse (elevar, agrandar, rotar, sacudir, voltear); aparición uno por uno; onda al hacer clic; se colorean con su color de marca |
| 🖍️ Colores de texto | Color del nombre, de la bio y **de la selección de texto**; barra de scroll a juego |
| 💻 Perfil de desarrollador | **Stack** con 80+ íconos de tecnologías (JavaScript, Python, React, Node, Figma…), **proyectos y estadísticas de GitHub en vivo** (repos, seguidores, estrellas, lenguaje de cada proyecto), bio estilo terminal (`> `) y fondo **Matrix** |
| ◻️ Estilo sobrio | Modo `clean` sin brillos ni colores, con la fuente del sistema (`font: "system"`, San Francisco en iPhone/Mac) |
| 🎭 Temas rápidos | Simple, Developer, Neón, Hacker, Sakura, Océano, Atardecer, Retro y Minimal con un clic en el editor |
| 🌠 Parallax | El fondo se mueve suavemente con el mouse |
| 📤 Compartir | Botón para copiar el enlace del perfil (o compartir en móvil) |
| 🔤 Fuentes | Cualquier fuente de Google Fonts |
| 🏅 Insignias | Ilimitadas y personalizadas (emoji, ícono o imagen) con tooltip, destello animado y giro al pasar el mouse |
| 🔗 Redes | **Ilimitadas**: 170+ íconos incluidos (Instagram, TikTok, Kick, OnlyFans, Roblox, Steam, Spotify, Twitch…) con buscador en el editor, o cualquier red con tu propio ícono (PNG/SVG/GIF); colores de marca o monocromo; copiar al portapapeles |
| 🧷 Botones | Enlaces grandes estilo Linktree con título, subtítulo e ícono |
| 🟣 Discord en vivo | Estado, juego, Spotify con barra de progreso y avatar (vía [Lanyard](https://github.com/Phineas/lanyard)) |
| 👁️ Visitas | Contador de visitas gratuito |
| 🏷️ Pestaña | Título animado (máquina de escribir o desplazamiento), favicon, vista previa al compartir |
| 🛠️ Editor visual | `editor.html`: edita todo con vista previa en vivo y **guarda y publica con un botón** (o descarga tu `config.js`) |

## Cómo personalizarlo

**Opción A — Editor visual (recomendada):** abre `https://<tu-usuario>.github.io/Personal-Profile/editor.html`, cambia lo que quieras y pulsa **💾 Guardar y publicar** (o `Ctrl + S`). Tu perfil se actualiza solo en 1–2 minutos.
- La primera vez te pedirá un **token de GitHub** (se crea una sola vez, el editor explica los pasos): en [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) → *Only select repositories* → este repo → *Contents: Read and write*.
- Los archivos que elijas con **Subir** (fotos, GIF, videos, canciones) se suben a `assets/media/` en el mismo guardado.
- El token queda solo en tu navegador y solo se envía a `api.github.com`; el botón ⚙ permite cambiarlo u olvidarlo.
- El punto amarillo en el botón indica cambios sin guardar.

**Opción B — A mano:** edita `config.js`. Todas las opciones posibles están explicadas en `assets/js/defaults.js`.

Tus videos, canciones e imágenes van en `assets/media/`.

### Fotos, GIF y videos
- **Fondo:** `background.type: "media"` y `url` con un `.jpg`, `.png`, `.webp`, `.gif`, `.mp4` o `.webm`. Con `mobileUrl` puedes poner otro (por ejemplo, un video vertical) solo para celulares.
- **Varios fondos:** `background.type: "slideshow"` y `slides: [{ url: "..." }, { url: "..." }]`, que se turnan cada `interval` segundos.
- **Avatar / logo:** `profile.avatar` acepta foto, GIF animado o video `.mp4`/`.webm`.
- Para que los videos carguen rápido, usa archivos de menos de ~15 MB. `.mp4` (H.264) funciona en todos los navegadores.

### Redes sociales
En `links` pon la `platform` (ej. `"kick"`, `"onlyfans"`, `"roblox"`, `"twitter"`…); la lista completa está en el editor. Si tu red no tiene ícono, escribe cualquier nombre y añade `icon: "assets/media/mi-icono.png"`.

### Estado de Discord en vivo
1. Únete al servidor de Lanyard: https://discord.gg/lanyard
2. En Discord: Ajustes → Avanzado → activa *Modo desarrollador*. Luego clic derecho en tu perfil → *Copiar ID de usuario*.
3. Pega el ID en `discord.userId`.

## Publicarlo gratis (GitHub Pages)

1. Sube los cambios a la rama `main` del repositorio.
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En 1–2 minutos tu perfil estará en `https://<tu-usuario>.github.io/Personal-Profile/`.
4. Pon ese enlace en la bio de Discord, TikTok, Instagram, etc. (Opcional: un dominio propio en *Settings → Pages → Custom domain*).

> ¿Quieres una URL más corta como `joakovrd.github.io`? Crea un repositorio llamado exactamente `<tu-usuario>.github.io` y sube estos archivos ahí.

## ¿Es permanente?

Sí. GitHub Pages es gratis y no vence: el perfil queda en línea mientras exista el repositorio, sin anuncios ni pagos.

¿Quieres una dirección más corta? Opcional:
- **`https://joakovrd-designer.github.io/`** (sin `/Personal-Profile`): en *Settings → General*, cambia el nombre del repositorio a `JoakoVRD-Designer.github.io`. El editor se adapta solo a la nueva dirección; solo tendrás que actualizar el enlace en tus redes.
- **Dominio propio** (ej. `joakovrd.com`, de pago en cualquier registrador): *Settings → Pages → Custom domain*.

## Probarlo en tu computadora

Por las rutas relativas y el editor, usa un servidor local en vez de abrir el archivo con doble clic:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000 y http://localhost:8000/editor.html
```

## Estructura

```
index.html            página del perfil
editor.html           editor visual con vista previa
config.js             ← TU configuración
assets/js/defaults.js todas las opciones y sus valores por defecto
assets/js/profile.js  lógica del perfil (música, Discord, visitas, tilt…)
assets/js/effects.js  partículas, cursor, destellos, título animado
assets/js/icons.js    íconos de marcas (Simple Icons, CC0)
assets/css/           estilos
assets/media/         tus videos, canciones e imágenes
```

## Créditos
Íconos de marcas: [Simple Icons](https://simpleicons.org) (CC0). Presencia de Discord: [Lanyard](https://github.com/Phineas/lanyard). Contador: [CounterAPI](https://counterapi.dev).
