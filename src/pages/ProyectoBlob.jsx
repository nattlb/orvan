
import { useEffect, useState } from 'react';

import { PROYECTOS } from '../data/datos';
import { api } from '../services/api';

import './ProyectoBlob.css';

// ==================== FUNCIONES AUXILIARES ====================

// Comprobar que los enlaces sean HTTP o HTTPS
function esUrlSegura(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    const direccion = new URL(url);
    return ['http:', 'https:'].includes(direccion.protocol);
  } catch {
    return false;
  }
}

// Convertir tecnologías en una lista
function obtenerTecnologias(proyecto) {
  return (proyecto.tecnologias || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// Obtener imagen principal y galería
function obtenerImagenes(proyecto) {
  const imagenes = [];

  if (proyecto.imagen) {
    imagenes.push(proyecto.imagen);
  }

  if (Array.isArray(proyecto.imagenes)) {
    proyecto.imagenes.forEach((item) => {
      if (item.imagen && !imagenes.includes(item.imagen)) {
        imagenes.push(item.imagen);
      }
    });
  }

  return imagenes;
}

// Convertir características en una lista
function obtenerCaracteristicas(proyecto) {
  return (proyecto.caracteristicas || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

// ==================== DETALLES DEL PROYECTO ====================

function DetalleProyecto({ proyecto, alCerrar }) {
  const imagenes = obtenerImagenes(proyecto);
  const tecnologias = obtenerTecnologias(proyecto);
  const caracteristicas = obtenerCaracteristicas(proyecto);

  const [indice, setIndice] = useState(0);

  // Imagen anterior
  function anterior() {
    if (imagenes.length === 0) return;

    setIndice((actual) =>
      actual === 0 ? imagenes.length - 1 : actual - 1
    );
  }

  // Imagen siguiente
  function siguiente() {
    if (imagenes.length === 0) return;

    setIndice((actual) =>
      actual === imagenes.length - 1 ? 0 : actual + 1
    );
  }

  // Control del teclado y bloqueo de scroll
  useEffect(() => {
    function manejarTecla(e) {
      if (e.key === 'Escape') {
        alCerrar();
      }

      if (imagenes.length > 1) {
        if (e.key === 'ArrowLeft') {
          setIndice((actual) =>
            actual === 0 ? imagenes.length - 1 : actual - 1
          );
        }

        if (e.key === 'ArrowRight') {
          setIndice((actual) =>
            actual === imagenes.length - 1 ? 0 : actual + 1
          );
        }
      }
    }

    document.addEventListener('keydown', manejarTecla);

    const scrollAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', manejarTecla);
      document.body.style.overflow = scrollAnterior;
    };
  }, [alCerrar, imagenes.length]);

  return (
    <div
      className="orvan-modal-fondo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          alCerrar();
        }
      }}
    >
      <div
        className="orvan-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${proyecto.titulo}`}
      >
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          className="orvan-modal-cerrar"
          onClick={alCerrar}
          aria-label="Cerrar detalles"
        >
          ×
        </button>

        {/* PARTE SUPERIOR */}
        <div className="orvan-modal-superior">

          {/* GALERÍA */}
          <div className="orvan-galeria">
            <div className="orvan-imagen-grande">
              {imagenes.length > 0 ? (
                <img
                  src={imagenes[indice]}
                  alt={`Captura ${indice + 1} de ${proyecto.titulo}`}
                />
              ) : (
                <div className="orvan-sin-imagen">
                  Sin imágenes disponibles
                </div>
              )}

              {/* FLECHAS DE LA GALERÍA */}
              {imagenes.length > 1 && (
                <>
                  <button
                    type="button"
                    className="orvan-flecha orvan-flecha-izquierda"
                    onClick={anterior}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="orvan-flecha orvan-flecha-derecha"
                    onClick={siguiente}
                    aria-label="Imagen siguiente"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* MINIATURAS */}
            {imagenes.length > 1 && (
              <div className="orvan-miniaturas">
                {imagenes.map((imagen, i) => (
                  <button
                    type="button"
                    key={`${imagen}-${i}`}
                    className={
                      indice === i
                        ? 'orvan-miniatura activa'
                        : 'orvan-miniatura'
                    }
                    onClick={() => setIndice(i)}
                    aria-label={`Mostrar imagen ${i + 1}`}
                  >
                    <img
                      src={imagen}
                      alt={`Miniatura ${i + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* CONTADOR DE IMÁGENES */}
            {imagenes.length > 0 && (
              <p className="orvan-contador">
                {indice + 1} / {imagenes.length}
              </p>
            )}
          </div>

          {/* INFORMACIÓN PRINCIPAL */}
          <div className="orvan-modal-info">
            <h2>{proyecto.titulo}</h2>

            <p className="orvan-descripcion">
              {proyecto.descripcion}
            </p>

            {/* TECNOLOGÍAS */}
            {tecnologias.length > 0 && (
              <div className="orvan-tecnologias">
                <h3>Tecnologías utilizadas</h3>

                <div className="orvan-chips">
                  {tecnologias.map((tecnologia) => (
                    <span
                      className="orvan-chip"
                      key={tecnologia}
                    >
                      {tecnologia}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PARTE INFERIOR */}
        <div className="orvan-modal-inferior">

          {/* OBJETIVO Y CARACTERÍSTICAS */}
          <div className="orvan-detalles">

            {proyecto.objetivo && (
              <div className="orvan-objetivo">
                <h3>Objetivo del proyecto</h3>
                <p>{proyecto.objetivo}</p>
              </div>
            )}

            {caracteristicas.length > 0 && (
              <div>
                <h3>Características principales</h3>

                <div className="orvan-lista-caracteristicas">
                  {caracteristicas.map((item, i) => (
                    <div
                      className="orvan-caracteristica"
                      key={`${item}-${i}`}
                    >
                      <span className="orvan-caracteristica-icono">
                        ✓
                      </span>

                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROYECTOS SIN DETALLES ADICIONALES */}
            {!proyecto.objetivo &&
              caracteristicas.length === 0 && (
                <div>
                  <h3>Acerca del proyecto</h3>
                  <p>{proyecto.descripcion}</p>
                </div>
              )}
          </div>

          {/* ENLACES */}
          <div className="orvan-enlaces">
            <h3>Enlaces</h3>

            {esUrlSegura(proyecto.url_demo) && (
              <a
                href={proyecto.url_demo}
                target="_blank"
                rel="noopener noreferrer"
                className="orvan-enlace-demo"
              >
                ↗ Ver demo en línea
              </a>
            )}

            {esUrlSegura(proyecto.url_repositorio) && (
              <a
                href={proyecto.url_repositorio}
                target="_blank"
                rel="noopener noreferrer"
                className="orvan-enlace-github"
              >
                Ver código en GitHub
              </a>
            )}

            {!esUrlSegura(proyecto.url_demo) &&
              !esUrlSegura(proyecto.url_repositorio) && (
                <p className="orvan-sin-enlaces">
                  Todavía no hay enlaces disponibles.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PÁGINA PÚBLICA ====================

export default function ProyectoBlob() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [seleccionado, setSeleccionado] = useState(null);
  const [abriendo, setAbriendo] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Estado del carrusel
  const [indiceActivo, setIndiceActivo] = useState(0);

  // Mover el carrusel hacia la izquierda o derecha
  function moverCarrusel(direccion) {
    if (proyectos.length === 0) return;

    setIndiceActivo((actual) =>
      (actual + direccion + proyectos.length) % proyectos.length
    );
  }

  // Determinar la posición visual de cada tarjeta
  function posicionTarjeta(indice) {
    if (proyectos.length === 0) return 'oculta';

    const diferencia =
      (indice - indiceActivo + proyectos.length) % proyectos.length;

    if (diferencia === 0) return 'central';

    if (proyectos.length === 2) {
      return diferencia === 1 ? 'derecha' : 'oculta';
    }

    if (diferencia === 1) return 'derecha';

    if (diferencia === proyectos.length - 1) {
      return 'izquierda';
    }

    return 'oculta';
  }

  // Abrir un proyecto solamente con una sesión
  async function abrirProyecto(proyecto) {
    const token = localStorage.getItem('orvan_token');

    if (!token) {
      setMensaje(
        'Para ver los detalles y las demos, primero tenés que registrarte o iniciar sesión.'
      );
      return;
    }

    setMensaje('');
    setAbriendo(proyecto.id);

    try {
      // El servidor valida el token y devuelve
      // los detalles completos del proyecto.
      const datos = await api(`/proyectos/${proyecto.id}`);

      const detalle = datos.proyecto || datos;

      if (!detalle || !detalle.id) {
        throw new Error('No se encontraron los detalles del proyecto.');
      }

      setSeleccionado(detalle);
    } catch (err) {
      setMensaje(
        err.message ||
          'No se pudo abrir el proyecto. Comprobá tu sesión.'
      );
    } finally {
      setAbriendo(null);
    }
  }

  // Cargar proyectos desde MySQL / TiDB Cloud
  useEffect(() => {
    let vigente = true;

    api('/proyectos')
      .then((datos) => {
        if (vigente) {
          setProyectos(datos.proyectos || []);
        }
      })
      .catch((err) => {
        if (vigente) {
          setError(
            err.message || 'No se pudieron cargar los proyectos.'
          );
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
    <section
      id="proyectos"
      className="degradado orvan-proyectos"
    >
      <div className="cont">

        {/* ENCABEZADO */}
        <div className="orvan-proyectos-encabezado">
          <h2 className="rv arriba text-3xl md:text-5xl font-light">
            Proyectos y demos
          </h2>

          <p className="rv arriba mt-5 opacity-80">
            Conocé algunos de nuestros trabajos y explorá las soluciones que desarrollamos.
          </p>
        </div>

        <div className="bloqueo abierto mt-12">

          {/* INDICADORES DE CARGA */}
          {cargando && (
            <div className="orvan-grid">
              {[1, 2, 3].map((n) => (
                <article
                  key={n}
                  className="tarjeta animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-40 rounded-xl bg-gray-500/20" />
                  <div className="h-4 w-2/3 rounded bg-gray-500/20 mt-5" />
                  <div className="h-3 rounded bg-gray-500/10 mt-4" />
                </article>
              ))}
            </div>
          )}

          {/* CARRUSEL DE PROYECTOS */}
          {!cargando && !error && proyectos.length > 0 && (
            <div className="orvan-carrusel">

              <div className="orvan-carrusel-escenario">
                {proyectos.map((proyecto, i) => {
                  const posicion = posicionTarjeta(i);

                  return (
                    <article
                      key={proyecto.id}
                      className={`tarjeta orvan-proyecto-card orvan-carrusel-card ${posicion}`}
                      aria-hidden={posicion === 'oculta'}
                      inert={posicion === 'oculta'}
                    >
                      {/* IMAGEN PRINCIPAL */}
                      <div className="orvan-card-imagen">
                        {proyecto.imagen ? (
                          <img
                            src={proyecto.imagen}
                            alt={`Captura del proyecto ${proyecto.titulo}`}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="orvan-card-fondo"
                            style={{
                              background:
                                PROYECTOS.length > 0
                                  ? PROYECTOS[
                                      i % PROYECTOS.length
                                    ].fondo
                                  : '#1D4ED8',
                            }}
                          />
                        )}
                      </div>

                      {/* TÍTULO */}
                      <h3>{proyecto.titulo}</h3>

                      {/* DESCRIPCIÓN */}
                      <p className="orvan-card-descripcion">
                        {proyecto.descripcion}
                      </p>

                      {/* TECNOLOGÍAS */}
                      {proyecto.tecnologias && (
                        <div className="orvan-chips">
                          {obtenerTecnologias(proyecto).map(
                            (tecnologia) => (
                              <span
                                className="orvan-chip"
                                key={tecnologia}
                              >
                                {tecnologia}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {/* BOTÓN VER PROYECTO */}
                      <button
                        type="button"
                        className="orvan-ver-proyecto"
                        onClick={() => abrirProyecto(proyecto)}
                        disabled={abriendo === proyecto.id}
                      >
                        {abriendo === proyecto.id
                          ? 'Cargando proyecto...'
                          : 'Ver proyecto'}
                        <span>→</span>
                      </button>
                    </article>
                  );
                })}
              </div>

              {/* NAVEGACIÓN DEL CARRUSEL */}
              {proyectos.length > 1 && (
                <div className="orvan-carrusel-controles">

                  <button
                    type="button"
                    className="orvan-carrusel-flecha"
                    onClick={() => moverCarrusel(-1)}
                    aria-label="Proyecto anterior"
                  >
                    ←
                  </button>

                  {/* INDICADORES */}
                  <div className="orvan-carrusel-puntos">
                    {proyectos.map((proyecto, i) => (
                      <button
                        type="button"
                        key={proyecto.id}
                        className={
                          i === indiceActivo
                            ? 'orvan-carrusel-punto activo'
                            : 'orvan-carrusel-punto'
                        }
                        onClick={() => setIndiceActivo(i)}
                        aria-label={`Mostrar proyecto ${i + 1}`}
                        aria-current={
                          i === indiceActivo
                            ? 'true'
                            : undefined
                        }
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className="orvan-carrusel-flecha"
                    onClick={() => moverCarrusel(1)}
                    aria-label="Proyecto siguiente"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SIN PROYECTOS */}
          {!cargando &&
            !error &&
            proyectos.length === 0 && (
              <p className="mt-6 opacity-70">
                Todavía no hay proyectos cargados.
              </p>
            )}

          {/* ERROR DE CONEXIÓN */}
          {!cargando && error && (
            <p className="error mt-6" role="alert">
              No se pudieron cargar los proyectos.
              Intentá nuevamente.
            </p>
          )}

          {/* MENSAJE DE AUTENTICACIÓN O ERROR */}
          {mensaje && (
            <p
              className="error mt-6"
              role="alert"
              style={{ textAlign: 'center' }}
            >
              {mensaje}
            </p>
          )}

        </div>
      </div>

      {/* VENTANA DE DETALLES */}
      {seleccionado && (
        <DetalleProyecto
          key={seleccionado.id}
          proyecto={seleccionado}
          alCerrar={() => setSeleccionado(null)}
        />
      )}
    </section>
  );
}
