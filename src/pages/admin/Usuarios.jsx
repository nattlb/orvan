
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';

const fecha = (f) => {
  if (!f) return '—';

  const fechaConvertida = new Date(f);

  if (Number.isNaN(fechaConvertida.getTime())) return '—';

  return fechaConvertida.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export default function Usuarios() {
  const [filtros, setFiltros] = useState({ q: '', estado: '' });
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const [datos, setDatos] = useState({
    usuarios: [],
    total: 0,
    paginas: 1,
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [confirmar, setConfirmar] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  // Identifica las peticiones para evitar resultados desactualizados.
  const peticionActual = useRef(0);

  // Espera 400 ms después de escribir para buscar.
  useEffect(() => {
    const tiempo = setTimeout(() => {
      setBusqueda(filtros.q);
      setPagina(1);
    }, 400);

    return () => clearTimeout(tiempo);
  }, [filtros.q]);

  // Cargar usuarios.
  const cargar = useCallback(async () => {
    const numeroPeticion = ++peticionActual.current;

    setCargando(true);
    setError('');

    const params = new URLSearchParams({
      q: busqueda,
      estado: filtros.estado,
      pagina: String(pagina),
    });

    try {
      const respuesta = await api(
        `/admin/usuarios?${params.toString()}`
      );

      if (numeroPeticion !== peticionActual.current) return;

      setDatos({
        usuarios: respuesta.usuarios || [],
        total: respuesta.total || 0,
        paginas: respuesta.paginas || 1,
      });
    } catch (e) {
      if (numeroPeticion !== peticionActual.current) return;

      setError(e.message || 'No se pudieron cargar los usuarios.');
    } finally {
      if (numeroPeticion === peticionActual.current) {
        setCargando(false);
      }
    }
  }, [busqueda, filtros.estado, pagina]);

  // Actualizar la lista cuando cambian los filtros o la página.
  useEffect(() => {
    let activa = true;

    cargar();

    return () => {
      activa = false;

      if (activa === false) {
        peticionActual.current += 1;
      }
    };
  }, [cargar]);

  // Cambiar filtros.
  const cambiarFiltro = (campo) => (e) => {
    setFiltros((f) => ({
      ...f,
      [campo]: e.target.value,
    }));

    if (campo !== 'q') {
      setPagina(1);
    }

    setConfirmar(null);
    setAviso('');
  };

  // Bloquear o reactivar una cuenta.
  const cambiarEstado = async (u) => {
    if (ocupado) return;

    setOcupado(true);
    setError('');
    setAviso('');
    setConfirmar(null);

    try {
      await api(`/admin/usuarios/${u.id}`, {
        metodo: 'PATCH',
        cuerpo: { activo: !u.activo },
      });

      setAviso(
        u.activo
          ? `La cuenta de ${u.nombre} fue bloqueada.`
          : `La cuenta de ${u.nombre} fue reactivada.`
      );

      await cargar();
    } catch (e) {
      setError(e.message || 'No se pudo actualizar la cuenta.');
    } finally {
      setOcupado(false);
    }
  };

  // Eliminar una cuenta después de confirmar.
  const eliminar = async (u) => {
    if (ocupado) return;

    setOcupado(true);
    setError('');
    setAviso('');

    try {
      await api(`/admin/usuarios/${u.id}`, {
        metodo: 'DELETE',
      });

      setConfirmar(null);
      setAviso(`La cuenta de ${u.nombre} fue eliminada.`);

      if (datos.usuarios.length === 1 && pagina > 1) {
        setPagina((p) => p - 1);
      } else {
        await cargar();
      }
    } catch (e) {
      setError(e.message || 'No se pudo eliminar la cuenta.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div aria-busy={cargando}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-light">
          Usuarios registrados
        </h2>

        <span className="text-sm opacity-60">
          {datos.total} en total
        </span>
      </div>

      {/* Filtros */}
      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        <input
          className="campo"
          type="search"
          placeholder="Buscar por nombre o email"
          aria-label="Buscar usuarios"
          maxLength={60}
          value={filtros.q}
          onChange={cambiarFiltro('q')}
        />

        <select
          className="campo"
          aria-label="Filtrar por estado"
          value={filtros.estado}
          onChange={cambiarFiltro('estado')}
        >
          <option value="">Todas las cuentas</option>
          <option value="activo">Activas</option>
          <option value="inactivo">Bloqueadas</option>
        </select>
      </div>

      {aviso && (
        <p className="mt-5 text-sm text-[#60A5FA]" role="status">
          {aviso}
        </p>
      )}

      {error && (
        <p className="error mt-5" role="alert">
          {error}
        </p>
      )}

      {/* Tabla */}
      <div className="tarjeta !p-0 mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs opacity-60">
              <th className="p-4 font-normal">Usuario</th>
              <th className="p-4 font-normal">Registro</th>
              <th className="p-4 font-normal text-center">
                Accesos
              </th>
              <th className="p-4 font-normal">Último acceso</th>
              <th className="p-4 font-normal">Estado</th>
              <th className="p-4 font-normal text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {datos.usuarios.map((u) => (
              <tr
                key={u.id}
                className="border-t border-gray-500/20 align-middle"
              >
                <td className="p-4">
                  <p className="font-semibold break-words">
                    {u.nombre}
                  </p>

                  <p className="text-xs opacity-70 break-all">
                    {u.email}
                  </p>
                </td>

                <td className="p-4 whitespace-nowrap">
                  {fecha(u.creado_en)}
                </td>

                <td className="p-4 text-center">
                  {u.accesos}
                </td>

                <td className="p-4 whitespace-nowrap">
                  {fecha(u.ultimo_acceso)}
                </td>

                <td className="p-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
                      u.activo
                        ? 'bg-green-500/15 text-green-500'
                        : 'bg-red-400/15 text-red-400'
                    }`}
                  >
                    {u.activo ? 'Activa' : 'Bloqueada'}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-end items-center gap-3 flex-wrap">
                    {confirmar === u.id ? (
                      <>
                        <span className="text-xs opacity-70">
                          ¿Eliminar definitivamente?
                        </span>

                        <button
                          className="text-xs text-red-400 hover:underline"
                          disabled={ocupado}
                          onClick={() => eliminar(u)}
                        >
                          Sí, eliminar
                        </button>

                        <button
                          className="text-xs opacity-70 hover:underline"
                          disabled={ocupado}
                          onClick={() => setConfirmar(null)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-xs text-[#60A5FA] hover:underline"
                          disabled={ocupado || cargando}
                          onClick={() => cambiarEstado(u)}
                        >
                          {u.activo ? 'Bloquear' : 'Reactivar'}
                        </button>

                        <button
                          className="text-xs text-red-400 hover:underline"
                          disabled={ocupado || cargando}
                          onClick={() => setConfirmar(u.id)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cargando && (
          <p className="p-6 opacity-70" role="status">
            Cargando usuarios…
          </p>
        )}

        {!cargando && !error && datos.usuarios.length === 0 && (
          <p className="p-6 opacity-70">
            No hay usuarios con esos filtros.
          </p>
        )}
      </div>

      {/* Paginación */}
      {datos.paginas > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            className="btn btn-borde text-sm !py-2 !px-5"
            disabled={pagina <= 1 || cargando || ocupado}
            onClick={() => setPagina((p) => p - 1)}
          >
            Anterior
          </button>

          <span className="text-sm opacity-70">
            Página {pagina} de {datos.paginas}
          </span>

          <button
            className="btn btn-borde text-sm !py-2 !px-5"
            disabled={pagina >= datos.paginas || cargando || ocupado}
            onClick={() => setPagina((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
