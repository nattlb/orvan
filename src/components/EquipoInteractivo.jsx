
import { useEffect, useState } from 'react';
import './EquipoInteractivo.css';

export default function EquipoInteractivo({ integrantes = [] }) {
  const [seleccionado, setSeleccionado] = useState(0);

  useEffect(() => {
    if (seleccionado >= integrantes.length) {
      setSeleccionado(0);
    }
  }, [integrantes.length, seleccionado]);

  if (integrantes.length === 0) {
    return (
      <p className="opacity-70 mt-12">
        Nuestro equipo estará disponible próximamente.
      </p>
    );
  }

  const actual = integrantes[seleccionado] || integrantes[0];

  const cambiar = (direccion) => {
    setSeleccionado((anterior) =>
      (anterior + direccion + integrantes.length) % integrantes.length
    );
  };

  return (
    <div className="equipo-interactivo equipo-nuevo mt-14">

      {/* LISTA DE INTEGRANTES */}
      <div className="equipo-selector">
        <p className="equipo-etiqueta">
          CONOCÉ A NUESTROS ESPECIALISTAS
        </p>

        <div className="equipo-lista">
          {integrantes.map((persona, i) => (
            <button
              key={persona.id}
              type="button"
              className={`equipo-opcion ${
                i === seleccionado ? 'seleccionado' : ''
              }`}
              onClick={() => setSeleccionado(i)}
              aria-pressed={i === seleccionado}
            >
              <span className="equipo-numero">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="equipo-miniatura">
                {persona.imagen ? (
                  <img
                    src={persona.imagen}
                    alt=""
                  />
                ) : (
                  <span>
                    {persona.nombre?.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>

              <span className="equipo-opcion-texto">
                <strong>{persona.nombre}</strong>
                <small>{persona.especialidad}</small>
              </span>

              <span className="equipo-indicador">
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PRESENTACIÓN PRINCIPAL */}
      <div className="equipo-presentacion">
        <article
          key={actual.id}
          className="equipo-destacado"
        >
          {/* Fotografía */}
          <div className="equipo-foto">
            {actual.imagen ? (
              <img
                src={actual.imagen}
                alt={actual.nombre}
              />
            ) : (
              <span className="equipo-inicial">
                {actual.nombre?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Información */}
          <div className="equipo-informacion">
            <span className="equipo-etiqueta">
              NUESTRO EQUIPO
            </span>

            <p className="equipo-especialidad">
              {actual.especialidad}
            </p>

            <h3 className="equipo-nombre">
              {actual.nombre}
            </h3>

            <div className="regla my-5"></div>

            <p className="equipo-descripcion">
              {actual.descripcion}
            </p>
          </div>
        </article>

        {/* NAVEGACIÓN */}
        <div className="equipo-navegacion">
          <button
            type="button"
            className="equipo-flecha"
            onClick={() => cambiar(-1)}
            aria-label="Integrante anterior"
          >
            ←
          </button>

          <div className="equipo-puntos">
            {integrantes.map((persona, i) => (
              <button
                key={persona.id}
                type="button"
                className={`equipo-punto ${
                  i === seleccionado ? 'activo' : ''
                }`}
                onClick={() => setSeleccionado(i)}
                aria-label={`Ver a ${persona.nombre}`}
                aria-pressed={i === seleccionado}
              />
            ))}
          </div>

          <button
            type="button"
            className="equipo-flecha"
            onClick={() => cambiar(1)}
            aria-label="Siguiente integrante"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
