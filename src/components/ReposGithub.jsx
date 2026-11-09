import { useEffect, useState } from 'react';

// ↓↓↓ Poné acá el usuario u organización de GitHub del equipo (por ejemplo 'orvan-studio').
// Si queda vacío, esta sección no se muestra.
const GITHUB_USUARIO = 'nattlb';

const esLinkDeGithub = (u) => typeof u === 'string' && u.startsWith('https://github.com/');

// Repositorios públicos reales, traídos de la API de GitHub (gratis, sin clave)
export default function ReposGithub() {
  const [repos, setRepos] = useState([]);
  const [estado, setEstado] = useState('inicial'); // inicial | cargando | listo | error
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!GITHUB_USUARIO) return undefined;

    // GitHub permite 60 consultas por hora sin clave: guardamos el resultado mientras dure la sesión
    const clave = `orvan_gh_${GITHUB_USUARIO}`;
    try {
      const guardado = sessionStorage.getItem(clave);
      if (guardado) { setRepos(JSON.parse(guardado)); setEstado('listo'); return undefined; }
    } catch { /* si el almacenamiento falla, se consulta igual */ }

    const ctrl = new AbortController();
    setEstado('cargando');
    fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_USUARIO)}/repos?sort=updated&per_page=12`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error(r.status === 403
            ? 'GitHub limitó las consultas por un rato. Probá más tarde.'
            : 'No se pudieron cargar los repositorios.');
        }
        return r.json();
      })
      .then((lista) => {
        const limpia = lista
          .filter((r) => !r.fork)
          .slice(0, 6)
          .map((r) => ({ id: r.id, nombre: r.name, descripcion: r.description, lenguaje: r.language, estrellas: r.stargazers_count, url: r.html_url }));
        try { sessionStorage.setItem(clave, JSON.stringify(limpia)); } catch { /* no es grave */ }
        setRepos(limpia);
        setEstado('listo');
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setMensaje(e.message);
        setEstado('error');
      });

    return () => ctrl.abort();
  }, []);

  if (!GITHUB_USUARIO) return null;

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-light">Código en GitHub</h3>
      <p className="text-sm opacity-60 mt-2">Repositorios públicos de @{GITHUB_USUARIO}, en vivo desde la API de GitHub.</p>

      {estado === 'cargando' && <p className="mt-6 opacity-70">Cargando repositorios…</p>}
      {estado === 'error' && <p className="error mt-6" role="alert">{mensaje}</p>}
      {estado === 'listo' && repos.length === 0 && <p className="mt-6 opacity-70">Todavía no hay repositorios públicos.</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {repos.map((r) => (
          <article key={r.id} className="tarjeta !p-5 flex flex-col">
            <h4 className="font-semibold break-words">{r.nombre}</h4>
            <p className="text-sm opacity-70 mt-2 line-clamp-3 break-words">{r.descripcion || 'Sin descripción.'}</p>
            <div className="mt-auto pt-4 flex items-center justify-between gap-3 text-xs">
              <span className="opacity-70">
                {r.lenguaje || 'Varios'} · ★ {r.estrellas}
              </span>
              {esLinkDeGithub(r.url) && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#60A5FA] hover:underline">
                  Ver código
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
