
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';

const TIPOS = ['Consulta general', 'Cotización de proyecto', 'Asesoría técnica'];

const fecha = (f) =>
  f ? new Date(f).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '';

// Formulario para responder una consulta
function FormRespuesta({ consulta, alEnviar, rutaBase }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();

    const limpio = texto.trim();

    if (limpio.length < 5) {
      setError('Escribí una respuesta de al menos 5 caracteres.');
      return;
    }

    if (limpio.length > 3000) {
      setError('La respuesta no puede superar los 3000 caracteres.');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const d = await api(`${rutaBase}/consultas/${consulta.id}/responder`, {
        metodo: 'POST',
        cuerpo: { respuesta: limpio },
      });

      alEnviar(d.consulta);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="mt-5 space-y-3">
      <label className="text-sm opacity-80" htmlFor={`resp-${consulta.id}`}>
        Tu respuesta (se envía por email a {consulta.email})
      </label>

      <textarea
        id={`resp-${consulta.id}`}
        className={`campo ${error ? 'mal' : ''}`}
        rows="5"
        maxLength={3000}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          if (error) setError('');
        }}
        placeholder="Escribí la respuesta para el cliente..."
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs opacity-60">{texto.length}/3000</span>

        <button
          type="submit"
          className="btn btn-azul text-sm !py-2 !px-6"
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar respuesta'}
        </button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}

// Pantalla principal de consultas
export default function Consultas({ rutaBase = '/admin' }) {
  const [filtros, setFiltros] = useState({
    q: '',
    tipo: '',
    estado: '',
  });

  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState({
    consultas: [],
    total: 0,
    paginas: 1,
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [abierta, setAbierta] = useState(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setBusqueda(filtros.q);
      setPagina(1);
    }, 400);

    return () => clearTimeout(t);
  }, [filtros.q]);

  const cargar = useCallback(() => {
    setCargando(true);
    setError('');

    const params = new URLSearchParams({
      q: busqueda,
      tipo: filtros.tipo,
      estado: filtros.estado,
      pagina,
    });

    api(`${rutaBase}/consultas?${params.toString()}`)
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [rutaBase, busqueda, filtros.tipo, filtros.estado, pagina]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarFiltro = (campo) => (e) => {
    setFiltros((f) => ({
      ...f,
      [campo]: e.target.value,
    }));

    if (campo !== 'q') setPagina(1);
  };

  const alResponder = (nueva) => {
    if (nueva?.id) {
      setDatos((d) => ({
        ...d,
        consultas: d.consultas.map((c) =>
          c.id === nueva.id ? { ...c, ...nueva } : c
        ),
      }));
    } else {
      cargar();
    }

    setAviso('Respuesta enviada por email.');
    setAbierta(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-light">Consultas</h2>
        <span className="text-sm opacity-60">{datos.total} en total</span>
      </div>

      {/* Filtros */}
      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        <input
          className="campo"
          type="search"
          placeholder="Buscar por nombre, email o mensaje"
          aria-label="Buscar consultas"
          maxLength={60}
          value={filtros.q}
          onChange={cambiarFiltro('q')}
        />

        <select
          className="campo"
          aria-label="Filtrar por tipo"
          value={filtros.tipo}
          onChange={cambiarFiltro('tipo')}
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          className="campo"
          aria-label="Filtrar por estado"
          value={filtros.estado}
          onChange={cambiarFiltro('estado')}
        >
          <option value="">Todos los estados</option>
          <option value="nuevo">Sin responder</option>
          <option value="respondido">Respondidas</option>
        </select>
      </div>

      {aviso && (
        <p className="mt-5 text-sm text-[#60A5FA]" role="status">
          {aviso}
        </p>
      )}

      {error && <p className="error mt-5" role="alert">{error}</p>}

      {/* Listado de consultas */}
      <div className="mt-6 space-y-4">
        {cargando && datos.consultas.length === 0 && (
          <p className="opacity-70">Cargando consultas...</p>
        )}

        {!cargando && !error && datos.consultas.length === 0 && (
          <p className="opacity-70">
            No hay consultas con esos filtros.
          </p>
        )}

        {datos.consultas.map((c) => {
          const desplegada = abierta === c.id;
          const nueva = c.estado === 'nuevo';

          return (
            <article key={c.id} className="tarjeta !p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold break-words">{c.nombre}</p>
                  <p className="text-sm opacity-70 break-all">{c.email}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="chip !py-1 !px-3 text-xs">
                    {c.tipo}
                  </span>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      nueva
                        ? 'bg-[#1D4ED8]/20 text-[#60A5FA]'
                        : 'bg-green-500/15 text-green-500'
                    }`}
                  >
                    {nueva ? 'Sin responder' : 'Respondida'}
                  </span>
                </div>
              </div>

              <p className="text-xs opacity-60 mt-2">
                Recibida: {fecha(c.creado_en)}
              </p>

              <p
                className={`mt-4 text-sm opacity-90 whitespace-pre-wrap break-words ${
                  desplegada ? '' : 'line-clamp-2'
                }`}
              >
                {c.mensaje}
              </p>

              {desplegada && c.respuesta && (
                <div className="mt-5 rounded-xl bg-gray-500/10 p-4">
                  <p className="text-xs opacity-60 mb-2">
                    Respondida el {fecha(c.respondido_en)}
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {c.respuesta}
                  </p>
                </div>
              )}

              {desplegada && nueva && (
                <FormRespuesta
                  consulta={c}
                  alEnviar={alResponder}
                  rutaBase={rutaBase}
                />
              )}

              <button
                className="mt-4 text-sm text-[#60A5FA] hover:underline"
                onClick={() => {
                  setAbierta(desplegada ? null : c.id);
                  setAviso('');
                }}
              >
                {desplegada
                  ? 'Cerrar'
                  : nueva
                    ? 'Ver y responder'
                    : 'Ver respuesta'}
              </button>
            </article>
          );
        })}
      </div>

      {/* Paginación */}
      {datos.paginas > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            className="btn btn-borde text-sm !py-2 !px-5"
            disabled={pagina <= 1 || cargando}
            onClick={() => setPagina((p) => p - 1)}
          >
            Anterior
          </button>

          <span className="text-sm opacity-70">
            Página {pagina} de {datos.paginas}
          </span>

          <button
            className="btn btn-borde text-sm !py-2 !px-5"
            disabled={pagina >= datos.paginas || cargando}
            onClick={() => setPagina((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
