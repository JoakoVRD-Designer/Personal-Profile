/* Publica archivos en el repositorio de GitHub directamente desde el navegador,
   usando la API de GitHub y un token personal del dueño del perfil.
   Todos los archivos van en un solo commit; GitHub Pages vuelve a publicar solo. */
(function () {
  const API = "https://api.github.com";

  /** Deduce usuario/repositorio cuando el editor se abre desde *.github.io. */
  function detectRepo() {
    const host = location.hostname;
    if (!host.endsWith(".github.io")) return { owner: "", repo: "" };
    const owner = host.slice(0, -".github.io".length);
    const seg = location.pathname.split("/").filter(Boolean)[0] || "";
    const repo = seg && !/\.html?$/i.test(seg) ? seg : host;
    return { owner, repo };
  }

  function bytesToBase64(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  const textToBase64 = (text) => bytesToBase64(new TextEncoder().encode(text));
  const fileToBase64 = async (file) => bytesToBase64(new Uint8Array(await file.arrayBuffer()));

  const MESSAGES = {
    401: "El token no es válido o expiró. Crea uno nuevo.",
    403: "El token no tiene permiso de escritura en este repositorio (Contents: Read and write).",
    404: "No se encontró el repositorio o la rama, o el token no tiene acceso a este repositorio.",
    409: "La rama cambió mientras guardabas. Vuelve a intentarlo.",
    422: "GitHub rechazó el cambio (¿archivo demasiado grande o rama incorrecta?).",
  };

  async function call(token, method, path, body) {
    const res = await fetch(API + path, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json()).message || ""; } catch (e) { /* noop */ }
      const err = new Error(MESSAGES[res.status] || `Error de GitHub (${res.status}) ${detail}`.trim());
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  /**
   * files: [{ path, text }] o [{ path, file }]
   * onStep: callback de progreso (texto)
   * Devuelve la URL del commit creado.
   */
  async function commitFiles({ owner, repo, branch, token, message, files, onStep = () => {} }) {
    const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    onStep("Conectando con GitHub…");
    const ref = await call(token, "GET", `${base}/git/ref/heads/${encodeURIComponent(branch)}`);
    const parent = await call(token, "GET", `${base}/git/commits/${ref.object.sha}`);

    const tree = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      onStep(`Subiendo ${f.path.split("/").pop()} (${i + 1}/${files.length})…`);
      const content = f.file ? await fileToBase64(f.file) : textToBase64(f.text);
      const blob = await call(token, "POST", `${base}/git/blobs`, { content, encoding: "base64" });
      tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    }

    onStep("Creando commit…");
    const newTree = await call(token, "POST", `${base}/git/trees`, { base_tree: parent.tree.sha, tree });
    const commit = await call(token, "POST", `${base}/git/commits`, { message, tree: newTree.sha, parents: [ref.object.sha] });
    await call(token, "PATCH", `${base}/git/refs/heads/${encodeURIComponent(branch)}`, { sha: commit.sha });
    return commit.html_url || `https://github.com/${owner}/${repo}/commit/${commit.sha}`;
  }

  window.GitHubPublish = { detectRepo, commitFiles };
})();
