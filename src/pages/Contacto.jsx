
import { useEffect, useState } from 'react';
import { validar, validarCampo } from '../utils/validaciones';
import { CANALES, REDES } from '../data/datos';
import { api } from '../services/api';
import ExitoLottie from '../components/ExitoLottie';
import EstadoEstudio from '../components/EstadoEstudio';
import MapaEstudio from '../components/MapaEstudio';

const VACIO = {
  nombre: '',
  email: '',
  tipo: '',
  mensaje: '',
};

// Íconos simples
const P = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ICONOS = {
  email: (
    <svg {...P}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),

  whatsapp: (
    <svg {...P}>
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.3L3 20l1.3-5.4A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M9 9.5c.3 2.2 2.3 4.2 4.5 4.5l1.3-1.3-2-1-.8.7c-.8-.3-1.6-1.1-1.9-1.9l.7-.8-1-2L9 9.5Z" />
    </svg>
  ),

  ubicacion: (
    <svg {...P}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),

  horario: (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),

  linkedin: (
    <svg {...P}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </svg>
  ),

  github: (
    <svg {...P}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),

  instagram: (
    <svg {...P}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.500 6.500v.01" />
    </svg>
  ),
};

export default function Contacto() {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const [trampa, setTrampa] = useState('');

  // Selecciona automáticamente el tipo de consulta al entrar por cotización.
  useEffect(() => {
    const aplicar = () => {
      if (window.location.hash === '#cotizacion') {
        setValores((v) => ({
          ...v,
          tipo: 'Cotización de proyecto',
        }));
      }
    };

    aplicar();

    window.addEventListener('hashchange', aplicar);

    return () => {
      window.removeEventListener('hashchange', aplicar);
    };
  }, []);

  // Actualiza los campos y vuelve a validar si ya tenían errores.
  const cambiar = (e) => {
    const { name, value } = e.target;

    const nuevos = {
      ...valores,
      [name]: value,
    };

    setValores(nuevos);

    if (errores[name]) {
      setErrores((er) => ({
        ...er,
        [name]: validarCampo(name, nuevos),
      }));
    }

    if (errorServidor) {
      setErrorServidor('');
    }

    if (ok) {
      setOk('');
    }
  };

  // Valida cada campo cuando el usuario sale de él.
  const alSalir = (e) => {
    const { name } = e.target;

    setErrores((er) => ({
      ...er,
      [name]: validarCampo(name, valores),
    }));
  };

  // Envía la consulta al servidor.
  const enviar = async (e) => {
    e.preventDefault();

    if (enviando) return;

    const errs = validar(valores, [
      'nombre',
      'email',
      'tipo',
      'mensaje',
    ]);

    setErrores(errs);
    setErrorServidor('');
    setOk('');

    if (Object.keys(errs).length > 0) {
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await api('/contactos', {
        metodo: 'POST',
        cuerpo: {
          nombre: valores.nombre.trim(),
          email: valores.email.trim(),
          tipo: valores.tipo,
          mensaje: valores.mensaje.trim(),
          sitio_web: trampa,
        },
      });

      // Solo mostramos éxito si el servidor confirma la operación.
      setOk(
        respuesta.mensaje ||
        'Consulta enviada. Te respondemos por email a la brevedad.'
      );

      setValores(VACIO);
      setErrores({});
      setTrampa('');
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const clase = (campo) =>
    `campo ${errores[campo] ? 'mal' : ''}`;

  return (
    <section id="contacto" className="degradado">
      <div className="cont grid md:grid-cols-2 gap-14">

        {/* Columna izquierda: formas de contacto */}
        <div>
          <h2 className="rv arriba text-3xl md:text-5xl font-light">
            Contanos qué necesitás
          </h2>

          <div className="regla mt-6 rv"></div>

          <p className="rv arriba mt-6 opacity-80 max-w-sm">
            Consulta general, cotización de un proyecto o asesoría técnica.
            Escribinos por el formulario o por el canal que te quede más cómodo.
          </p>

          <ul className="mt-10 space-y-3 max-w-sm">
            {CANALES.map((c, i) => {
              const contenido = (
                <>
                  <span className="avatar shrink-0">
                    {ICONOS[c.id]}
                  </span>

                  <span>
                    <span className="block text-xs opacity-60">
                      {c.titulo}
                    </span>

                    <span className="block text-sm">
                      {c.valor}
                    </span>
                  </span>
                </>
              );

              return (
                <li
                  key={c.id}
                  className="rv arriba"
                  style={{
                    transitionDelay: `${i * 0.08}s`,
                  }}
                >
                  {c.href ? (
                    <a
                      href={c.href}
                      className="tarjeta !p-4 flex items-center gap-4 hover:border-[#60A5FA] transition"
                      {...(
                        c.externo
                          ? {
                              target: '_blank',
                              rel: 'noopener noreferrer',
                            }
                          : {}
                      )}
                    >
                      {contenido}
                    </a>
                  ) : (
                    <div className="tarjeta !p-4 flex items-center gap-4">
                      {contenido}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Redes sociales */}
          <div className="rv arriba mt-8">
            <p className="text-xs opacity-60 mb-3">
              También en redes
            </p>

            <div className="flex gap-3">
              {REDES.map((r) => (
                <a
                  key={r.id}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.nombre}
                  title={r.nombre}
                  className="btn-flecha grid place-items-center"
                >
                  {ICONOS[r.id]}
                </a>
              ))}
            </div>
          </div>

          {/* Estado y ubicación */}
          <div className="mt-8 space-y-4 max-w-sm">
            <EstadoEstudio />
            <MapaEstudio />
          </div>
        </div>

        {/* Columna derecha: formulario */}
        <form
          id="cotizacion"
          className="rv arriba space-y-4 tarjeta scroll-mt-24 self-start"
          onSubmit={enviar}
          noValidate
        >
          <div>
            <input
              className={clase('nombre')}
              name="nombre"
              aria-label="Nombre completo"
              aria-invalid={Boolean(errores.nombre)}
              aria-describedby="error-nombre"
              placeholder="Nombre completo"
              autoComplete="name"
              maxLength={60}
              value={valores.nombre}
              onChange={cambiar}
              onBlur={alSalir}
              required
            />

            <p id="error-nombre" className="error" role="alert">
              {errores.nombre}
            </p>
          </div>

          <div>
            <input
              className={clase('email')}
              name="email"
              type="email"
              aria-label="Email"
              aria-invalid={Boolean(errores.email)}
              aria-describedby="error-email"
              placeholder="Email"
              autoComplete="email"
              maxLength={120}
              value={valores.email}
              onChange={cambiar}
              onBlur={alSalir}
              required
            />

            <p id="error-email" className="error" role="alert">
              {errores.email}
            </p>
          </div>

          <div>
            <select
              className={clase('tipo')}
              name="tipo"
              aria-label="Tipo de consulta"
              aria-invalid={Boolean(errores.tipo)}
              aria-describedby="error-tipo"
              value={valores.tipo}
              onChange={cambiar}
              onBlur={alSalir}
              required
            >
              <option value="">Tipo de consulta</option>
              <option>Consulta general</option>
              <option>Cotización de proyecto</option>
              <option>Asesoría técnica</option>
            </select>

            <p id="error-tipo" className="error" role="alert">
              {errores.tipo}
            </p>
          </div>

          <div>
            <textarea
              className={clase('mensaje')}
              name="mensaje"
              aria-label="Mensaje"
              aria-invalid={Boolean(errores.mensaje)}
              aria-describedby="error-mensaje contador-mensaje"
              rows="4"
              placeholder="Contanos tu idea o problema"
              maxLength={1000}
              value={valores.mensaje}
              onChange={cambiar}
              onBlur={alSalir}
              required
            />

            <p
              id="contador-mensaje"
              className="text-xs opacity-60 text-right mt-1"
            >
              {valores.mensaje.length}/1000
            </p>

            <p id="error-mensaje" className="error" role="alert">
              {errores.mensaje}
            </p>
          </div>

          {/* Campo trampa antispam: debe validarse también en el backend. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            <label htmlFor="sitio_web">
              No completar este campo
            </label>

            <input
              id="sitio_web"
              type="text"
              name="sitio_web"
              tabIndex={-1}
              autoComplete="off"
              value={trampa}
              onChange={(e) => setTrampa(e.target.value)}
            />
          </div>

          <button
            className="btn btn-azul w-full"
            type="submit"
            disabled={enviando}
          >
            {enviando ? 'Enviando…' : 'Enviar consulta'}
          </button>

          {errorServidor && (
            <p
              className="error text-center"
              role="alert"
            >
              {errorServidor}
            </p>
          )}

          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-1"
          >
            {ok && <ExitoLottie />}

            <p className="text-center text-sm text-[#60A5FA]">
              {ok}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
