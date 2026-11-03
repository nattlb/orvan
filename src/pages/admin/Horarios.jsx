
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const EXCEPCION_VACIA = {
  fecha_inicio: '',
  fecha_fin: '',
  tipo: 'cerrado',
  hora_apertura: '',
  hora_cierre: '',
  motivo: '',
};

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [pausa, setPausa] = useState({
    activa: 0,
    hora_inicio: '',
    hora_fin: '',
  });

  const [excepciones, setExcepciones] = useState([]);
  const [historial, setHistorial] = useState([]);

  const [nuevaExcepcion, setNuevaExcepcion] = useState(EXCEPCION_VACIA);
  const [editandoId, setEditandoId] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(null);

  useEffect(() => {
    cargarHorarios();
    cargarHistorial();
  }, []);

  // CARGAR INFORMACIÓN

  async function cargarHorarios() {
    try {
      setCargando(true);
      setError('');

      const datos = await api('/admin/horarios');

      setHorarios(datos.horarios);
      setExcepciones(datos.excepciones || []);

      setPausa({
        activa: datos.pausa?.activa || 0,
        hora_inicio: datos.pausa?.hora_inicio || '',
        hora_fin: datos.pausa?.hora_fin || '',
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarHistorial() {
    try {
      const datos = await api('/admin/horarios/historial');
      setHistorial(datos);
    } catch (e) {
      console.error('Error al cargar el historial:', e);
    }
  }

  // MODIFICAR HORARIOS SEMANALES

  function cambiarDia(indice, campo, valor) {
    const nuevosHorarios = [...horarios];

    nuevosHorarios[indice] = {
      ...nuevosHorarios[indice],
      [campo]: valor,
    };

    setHorarios(nuevosHorarios);
  }

  async function guardarDia(dia) {
    try {
      setGuardando(dia.dia_semana);
      setMensaje('');
      setError('');

      await api(`/admin/horarios/dias/${dia.dia_semana}`, {
        metodo: 'PUT',
        cuerpo: {
          abierto: Boolean(dia.abierto),
          hora_apertura: dia.hora_apertura,
          hora_cierre: dia.hora_cierre,
        },
      });

      setMensaje('Horario actualizado correctamente.');
      await cargarHorarios();
      await cargarHistorial();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(null);
    }
  }

  // MODIFICAR PAUSA GENERAL

  async function guardarPausa() {
    try {
      setGuardando('pausa');
      setMensaje('');
      setError('');

      await api('/admin/horarios/pausa', {
        metodo: 'PUT',
        cuerpo: {
          activa: Boolean(pausa.activa),
          hora_inicio: pausa.hora_inicio,
          hora_fin: pausa.hora_fin,
        },
      });

      setMensaje('Pausa general actualizada correctamente.');
      await cargarHorarios();
      await cargarHistorial();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(null);
    }
  }

  // CREAR Y EDITAR EXCEPCIONES

  function cambiarExcepcion(campo, valor) {
    setNuevaExcepcion({
      ...nuevaExcepcion,
      [campo]: valor,
    });
  }

  function editarExcepcion(excepcion) {
    setEditandoId(excepcion.id);

    setNuevaExcepcion({
      fecha_inicio: String(excepcion.fecha_inicio).slice(0, 10),
      fecha_fin: String(excepcion.fecha_fin).slice(0, 10),
      tipo: excepcion.tipo,
      hora_apertura: excepcion.hora_apertura || '',
      hora_cierre: excepcion.hora_cierre || '',
      motivo: excepcion.motivo,
    });

    setMensaje('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNuevaExcepcion({ ...EXCEPCION_VACIA });
  }

  async function crearExcepcion(e) {
    e.preventDefault();

    try {
      setGuardando('excepcion');
      setMensaje('');
      setError('');

      const ruta = editandoId
        ? `/admin/horarios/excepciones/${editandoId}`
        : '/admin/horarios/excepciones';

      await api(ruta, {
        metodo: editandoId ? 'PUT' : 'POST',
        cuerpo: nuevaExcepcion,
      });

      setMensaje(
        editandoId
          ? 'Excepción modificada correctamente.'
          : 'Excepción creada correctamente.'
      );

      cancelarEdicion();
      await cargarHorarios();
      await cargarHistorial();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(null);
    }
  }

  // ELIMINAR EXCEPCIÓN

  async function eliminarExcepcion(id) {
    const confirmar = window.confirm(
      '¿Estás segura de que querés eliminar esta excepción?'
    );

    if (!confirmar) return;

    try {
      setGuardando(`eliminar-${id}`);
      setError('');
      setMensaje('');

      await api(`/admin/horarios/excepciones/${id}`, {
        metodo: 'DELETE',
      });

      setMensaje('Excepción eliminada correctamente.');

      if (editandoId === id) {
        cancelarEdicion();
      }

      await cargarHorarios();
      await cargarHistorial();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(null);
    }
  }

  if (cargando) {
    return <p className="opacity-70">Cargando horarios...</p>;
  }

  // INTERFAZ

  return (
    <div>
      <h2 className="titulo text-2xl font-light">
        Horarios del estudio
      </h2>

      <p className="opacity-70 mt-2">
        Administrá los días y horarios de atención de Orvan.
      </p>

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {mensaje && (
        <p className="text-green-600 mt-4">{mensaje}</p>
      )}

      {/* HORARIOS SEMANALES */}

      <h3 className="font-medium text-xl mt-8 mb-4">
        Horarios semanales
      </h3>

      <div className="space-y-4">
        {horarios.map((dia, indice) => (
          <div
            key={dia.dia_semana}
            className="border border-gray-500/20 rounded-xl p-5"
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h3 className="font-medium text-lg">
                {DIAS[dia.dia_semana]}
              </h3>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(dia.abierto)}
                  onChange={(e) =>
                    cambiarDia(
                      indice,
                      'abierto',
                      e.target.checked ? 1 : 0
                    )
                  }
                />
                Día abierto
              </label>
            </div>

            {Boolean(dia.abierto) && (
              <div className="flex flex-wrap gap-4 mt-4">
                <label className="flex flex-col gap-2 text-sm">
                  Hora de apertura
                  <input
                    type="time"
                    value={dia.hora_apertura || ''}
                    onChange={(e) =>
                      cambiarDia(indice, 'hora_apertura', e.target.value)
                    }
                    className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  Hora de cierre
                  <input
                    type="time"
                    value={dia.hora_cierre || ''}
                    onChange={(e) =>
                      cambiarDia(indice, 'hora_cierre', e.target.value)
                    }
                    className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
                  />
                </label>
              </div>
            )}

            {!Boolean(dia.abierto) && (
              <p className="text-sm opacity-60 mt-3">
                Este día permanecerá cerrado.
              </p>
            )}

            <button
              className="btn btn-borde mt-5"
              onClick={() => guardarDia(dia)}
              disabled={guardando === dia.dia_semana}
            >
              {guardando === dia.dia_semana
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>
          </div>
        ))}
      </div>

      {/* PAUSA GENERAL */}

      <div className="mt-10 border border-gray-500/20 rounded-xl p-5">
        <h3 className="font-medium text-lg">
          Pausa general
        </h3>

        <p className="opacity-70 text-sm mt-2">
          Esta pausa se aplica a todos los días en los que el estudio esté abierto.
        </p>

        <label className="flex items-center gap-2 mt-5 text-sm">
          <input
            type="checkbox"
            checked={Boolean(pausa.activa)}
            onChange={(e) =>
              setPausa({
                ...pausa,
                activa: e.target.checked ? 1 : 0,
              })
            }
          />
          Activar pausa general
        </label>

        {Boolean(pausa.activa) && (
          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex flex-col gap-2 text-sm">
              Inicio de pausa
              <input
                type="time"
                value={pausa.hora_inicio}
                onChange={(e) =>
                  setPausa({
                    ...pausa,
                    hora_inicio: e.target.value,
                  })
                }
                className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Fin de pausa
              <input
                type="time"
                value={pausa.hora_fin}
                onChange={(e) =>
                  setPausa({
                    ...pausa,
                    hora_fin: e.target.value,
                  })
                }
                className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
              />
            </label>
          </div>
        )}

        <button
          className="btn btn-borde mt-5"
          onClick={guardarPausa}
          disabled={guardando === 'pausa'}
        >
          {guardando === 'pausa'
            ? 'Guardando...'
            : 'Guardar pausa'}
        </button>
      </div>

      {/* EXCEPCIONES DEL CALENDARIO */}

      <div className="mt-10">
        <h3 className="font-medium text-xl">
          Excepciones del calendario
        </h3>

        <p className="opacity-70 text-sm mt-2">
          Configurá feriados, vacaciones, eventos y horarios especiales.
        </p>

        <form
          onSubmit={crearExcepcion}
          className="border border-gray-500/20 rounded-xl p-5 mt-5"
        >
          <h4 className="font-medium text-lg">
            {editandoId ? 'Editar excepción' : 'Nueva excepción'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <label className="flex flex-col gap-2 text-sm">
              Fecha de inicio
              <input
                type="date"
                required
                value={nuevaExcepcion.fecha_inicio}
                onChange={(e) =>
                  cambiarExcepcion('fecha_inicio', e.target.value)
                }
                className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Fecha de finalización
              <input
                type="date"
                required
                min={nuevaExcepcion.fecha_inicio || undefined}
                value={nuevaExcepcion.fecha_fin}
                onChange={(e) =>
                  cambiarExcepcion('fecha_fin', e.target.value)
                }
                className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              Tipo de excepción
              <select
                value={nuevaExcepcion.tipo}
                onChange={(e) =>
                  cambiarExcepcion('tipo', e.target.value)
                }
                className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
              >
                <option value="cerrado">Estudio cerrado</option>
                <option value="horario_especial">Horario especial</option>
              </select>
            </label>

            {nuevaExcepcion.tipo === 'horario_especial' && (
              <>
                <label className="flex flex-col gap-2 text-sm">
                  Hora de apertura
                  <input
                    type="time"
                    required
                    value={nuevaExcepcion.hora_apertura}
                    onChange={(e) =>
                      cambiarExcepcion('hora_apertura', e.target.value)
                    }
                    className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  Hora de cierre
                  <input
                    type="time"
                    required
                    value={nuevaExcepcion.hora_cierre}
                    onChange={(e) =>
                      cambiarExcepcion('hora_cierre', e.target.value)
                    }
                    className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
                  />
                </label>
              </>
            )}

            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              Motivo
              <input
                type="text"
                required
                maxLength={200}
                placeholder="Ej.: Feriado, vacaciones, evento..."
                value={nuevaExcepcion.motivo}
                onChange={(e) =>
                  cambiarExcepcion('motivo', e.target.value)
                }
                className="border border-gray-500/30 rounded-lg p-2 bg-white text-gray-900"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="submit"
              className="btn btn-borde"
              disabled={guardando === 'excepcion'}
            >
              {guardando === 'excepcion'
                ? 'Guardando...'
                : editandoId
                  ? 'Guardar modificación'
                  : 'Crear excepción'}
            </button>

            {editandoId && (
              <button
                type="button"
                className="btn btn-borde"
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* LISTADO DE EXCEPCIONES */}

        <div className="mt-6 space-y-3">
          <h4 className="font-medium">
            Excepciones registradas
          </h4>

          {excepciones.length === 0 ? (
            <p className="text-sm opacity-60">
              Todavía no hay excepciones registradas.
            </p>
          ) : (
            excepciones.map((excepcion) => (
              <div
                key={excepcion.id}
                className="border border-gray-500/20 rounded-xl p-4"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <h5 className="font-medium">
                    {excepcion.tipo === 'cerrado'
                      ? 'Estudio cerrado'
                      : 'Horario especial'}
                  </h5>

                  <span className="text-sm opacity-70">
                    {String(excepcion.fecha_inicio).slice(0, 10) ===
                    String(excepcion.fecha_fin).slice(0, 10)
                      ? String(excepcion.fecha_inicio).slice(0, 10)
                      : `${String(excepcion.fecha_inicio).slice(0, 10)} al ${String(excepcion.fecha_fin).slice(0, 10)}`}
                  </span>
                </div>

                {excepcion.tipo === 'horario_especial' && (
                  <p className="text-sm mt-2">
                    {excepcion.hora_apertura} a {excepcion.hora_cierre}
                  </p>
                )}

                <p className="text-sm opacity-70 mt-2">
                  Motivo: {excepcion.motivo}
                </p>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    className="btn btn-borde"
                    onClick={() => editarExcepcion(excepcion)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-borde"
                    onClick={() => eliminarExcepcion(excepcion.id)}
                    disabled={guardando === `eliminar-${excepcion.id}`}
                  >
                    {guardando === `eliminar-${excepcion.id}`
                      ? 'Eliminando...'
                      : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* HISTORIAL DE CAMBIOS */}

      <div className="mt-10 border border-gray-500/20 rounded-xl p-5">
        <h3 className="font-medium text-xl">
          Historial de cambios
        </h3>

        <p className="opacity-70 text-sm mt-2">
          Registro de las modificaciones realizadas en los horarios del estudio.
        </p>

        {historial.length === 0 ? (
          <p className="text-sm opacity-60 mt-5">
            Todavía no hay cambios registrados.
          </p>
        ) : (
          <div className="space-y-4 mt-5">
            {historial.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-500/20 pb-4"
              >
                <p className="font-medium">
                  {item.accion}
                </p>

                <p className="text-sm opacity-70 mt-1">
                  {item.detalle}
                </p>

                <p className="text-xs opacity-60 mt-2">
                  Usuario: {item.usuario || 'Usuario eliminado'}
                </p>

                <p className="text-xs opacity-60">
                  Fecha: {new Date(item.creado_en).toLocaleString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
