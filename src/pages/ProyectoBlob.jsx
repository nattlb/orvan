import { useEffect, useState } from 'react';

import { PROYECTOS } from '../data/datos';
import { api } from '../services/api';
import ReposGithub from '../components/ReposGithub';

const esUrlSegura = (url) => /^https?:\/\//i.test(url || '');

export default function ProyectoBlob() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;

    api('/proyectos')
      .then((d) => {
        if (vigente) {
          setProyectos(d.proyectos || []);
        }
      })
      .catch((e) => {
        if (vigente) {
          setError(e.message || 'No se pudieron cargar los proyectos.');
        }
      })
      .finally(() => {
        if (vigente) {
          setCargando(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, []);

  return (
    <section id="proyectos" className="degradado">
      <div className="cont">
        <h2 className="rv arriba text-3xl md:text-5xl font-light">
          Proyectos y demos
        </h2>

        <p className="rv arriba mt-5 opacity-80 max-w-lg">
          Conocé algunos de nuestros trabajos y explorá las soluciones que
          desarrollamos.
        </p>

        <div className="bloqueo abierto mt-12">
          <div className="grilla grid md:grid-cols-3 gap-5">
            {/* Indicadores de carga */}
            {cargando &&
              [1, 2, 3].map((n) => (
                <article
                  key={n}
                  className="tarjeta animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-32 rounded-xl mb-5 bg-gray-500/20"></div>
                  <div className="h-4 w-2/3 rounded bg-gray-500/20"></div>
                  <div className="h-3 w-full rounded bg-gray-500/10 mt-4"></div>
                </article>
              ))}

            {/* Proyectos reales */}
            {!cargando &&
              !error &&
              proyectos.map((p, i) => (
                <article
                  key={p.id}
                  className="tarjeta flex flex-col"
                >
                  {/* Imagen */}
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={`Captura del proyecto ${p.titulo}`}
                      loading="lazy"
                      className="h-32 w-full object-cover rounded-xl mb-5"
                    />
                  ) : (
                    <div
                      className="h-32 rounded-xl mb-5"
                      style={{
                        background:
                          PROYECTOS.length > 0
                            ? PROYECTOS[i % PROYECTOS.length].fondo
                            : '#1D4ED8',
                      }}
                    ></div>
                  )}

                  <h3 className="font-light text-lg">
                    {p.titulo}
                  </h3>

                  <p className="text-sm opacity-70 mt-2">
                    {p.descripcion}
                  </p>

                  {/* Tecnologías */}
                  {p.tecnologias && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {p.tecnologias.split(',').map((tecnologia) => (
                        <span
                          key={tecnologia.trim()}
                          className="chip !py-1 !px-3 text-xs"
                        >
                          {tecnologia.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Enlace de demostración */}
                  {esUrlSegura(p.url_demo) && (
                    <a
                      href={p.url_demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-azul text-sm !py-2 !px-5 mt-5 self-start"
                    >
                      Ver demo
                    </a>
                  )}
                </article>
              ))}
          </div>

          {/* Sin proyectos */}
          {!cargando && !error && proyectos.length === 0 && (
            <p className="mt-6 opacity-70">
              Todavía no hay proyectos cargados.
            </p>
          )}

          {/* Error de conexión */}
          {!cargando && error && (
            <p className="error mt-6" role="alert">
              No se pudieron cargar los proyectos. Intentá nuevamente.
            </p>
          )}

          {/* Repositorios de GitHub */}
          <ReposGithub />
        </div>
      </div>
    </section>
  );
}