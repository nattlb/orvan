import { useEffect, useState } from 'react';

import { STACK, SERVICIOS } from '../data/datos';
import { api } from '../services/api';
import Marquee from '../components/Marquee';

export default function Acerca() {
  const [integrantes, setIntegrantes] = useState([]);

  const [servicios, setServicios] = useState(
    SERVICIOS.map(([titulo, texto], i) => ({
      id: `ej${i}`,
      titulo,
      descripcion: texto,
    }))
  );

  useEffect(() => {
    api('/equipo')
      .then((d) => setIntegrantes(d.integrantes || []))
      .catch(() => setIntegrantes([]));

    api('/servicios')
      .then((d) => {
        if (d.servicios && d.servicios.length > 0) {
          setServicios(d.servicios);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ---------- Equipo ---------- */}
      <section id="equipo" className="claro">
        <div className="cont">
          <h2 className="rv arriba text-3xl md:text-5xl font-light">
            Un equipo, cuatro especialidades
          </h2>

          <div className="regla mt-6 rv"></div>

          <p className="rv arriba mt-6 max-w-xl opacity-80">
            Cada proyecto lo trabajamos entre todos, con un responsable por
            área. Así el diseño, los datos y la seguridad avanzan juntos
            desde el primer día.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {integrantes.map((m, i) => (
              <article
                key={m.id}
                className="tarjeta rv arriba"
                style={{ '--orden': i }}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-5 bg-gray-200/50 flex items-center justify-center">
                  {m.imagen ? (
                    <img
                      src={m.imagen}
                      alt={m.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="titulo text-5xl opacity-40">
                      {m.nombre.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold">
                  {m.especialidad}
                </h3>

                <p className="mt-1 text-sm text-[#1D4ED8]">
                  {m.nombre}
                </p>

                <p className="mt-4 text-sm opacity-80">
                  {m.descripcion}
                </p>
              </article>
            ))}

            {integrantes.length === 0 && (
              <p className="opacity-70">
                Nuestro equipo estará disponible próximamente.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Tecnologías ---------- */}
      <section id="stack" className="degradado">
        <div className="cont">
          <h2 className="rv arriba text-3xl md:text-5xl font-light">
            Tecnologías que usamos
          </h2>

          <div className="regla mt-6 rv"></div>

          <div className="flex flex-wrap gap-3 mt-12">
            {STACK.map((tecnologia, i) => (
              <span
                key={tecnologia}
                className="chip rv arriba"
                style={{ '--orden': i }}
              >
                {tecnologia}
              </span>
            ))}
          </div>

          <div className="mt-16">
            <Marquee items={STACK} />
          </div>

          <div className="grid grid-cols-3 gap-6 mt-20 text-center">
            {[
              [integrantes.length, '', 'especialistas'],
              [4, '', 'áreas integradas'],
              [100, '%', 'datos validados'],
            ].map(([numero, sufijo, texto], i) => (
              <div
                key={texto}
                className="rv arriba"
                style={{ '--orden': i }}
              >
                <p className="titulo text-4xl md:text-6xl font-extralight text-[#60A5FA]">
                  {numero}{sufijo}
                </p>

                <p className="text-sm opacity-60 mt-2">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Servicios ---------- */}
      <section id="servicios" className="claro">
        <div className="cont">
          <h2 className="rv arriba text-3xl md:text-5xl font-light">
            Qué podemos hacer por tu empresa
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-14">
            {servicios.map((s, i) => (
              <article
                key={s.id}
                className="tarjeta rv arriba"
                style={{ '--orden': i }}
              >
                <h3 className="text-xl font-light">
                  {s.titulo}
                </h3>

                <p className="mt-3 opacity-80 text-sm">
                  {s.descripcion}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}