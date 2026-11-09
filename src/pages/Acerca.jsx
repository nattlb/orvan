
import { useEffect, useState } from 'react';

import { STACK, SERVICIOS } from '../data/datos';
import { api } from '../services/api';
import Marquee from '../components/Marquee';
import EquipoInteractivo from '../components/EquipoInteractivo';

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
    // Obtener integrantes desde la base de datos
    api('/equipo')
      .then((d) => setIntegrantes(d.integrantes || []))
      .catch(() => setIntegrantes([]));

    // Obtener servicios desde la base de datos
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

          <p className="rv arriba mt-6 opacity-80">
            Cada proyecto lo trabajamos entre todos, con un responsable por área.
            Así el diseño, los datos y la seguridad avanzan juntos desde el primer día.
          </p>

          {/* Nueva presentación interactiva */}
          <EquipoInteractivo integrantes={integrantes} />
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
