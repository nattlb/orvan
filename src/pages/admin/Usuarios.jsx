import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';

const fecha = (f) =>
  f ? new Date(f).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export default function Usuarios() {
  const [filtros, setFiltros] = useState({ q: '', estado: '' });
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState({ usuarios: [], total: 0, paginas: 1 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [confirmar, setConfirmar] = useState(null); // id del usuario a eliminar (esperando confirmación)
  const [ocupado, setOcupado] = useState(null);     // id del usuario con una acción en curso

  // Espera 400 ms después de escribir para no pedir datos en cada letra
  useEffect(() => {
    const t = setTimeout(() => { setBusqueda(filtros.q); setPagina(1); }, 400);
    return () => clearTimeout(t);
  }, [filtros.q]);

  const cargar = useCallback(() => {
    setCargando(true);
    setError('');
    const params = new URLSearchParams({ q: busqueda, estado: filtros.estado, pagina });
    api(`/admin/usuarios?${params.toString()}`)
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [busqueda, filtros.estado, pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarFiltro = (campo) => (e) => {
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));
    if (campo !== 'q') setPagina(1);
  };

  // Bloquear / reactivar
  const cambiarEstado = async (u) => {
    setOcupado(u.id);
    setError('');
    setAviso('');
    try {
      await api(`/admin/usuarios/${u.id}`, { metodo: 'PATCH', cuerpo: { activo: !u.activo } });
      setDatos((d) => ({
        ...d,
        usuarios: d.usuarios.map((x) => (x.id === u.id ? { ...x, activo: u.activo ? 0 : 1 } : x)),
      }));
      setAviso(u.activo ? `La cuenta de ${u.nombre} fue bloqueada.` : `La cuenta de ${u.nombre} fue reactivada.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(null);
    }
  };

  // Eliminar (con confirmación en dos pasos)
  const eliminar = async (u) => {
    setOcupado(u.id);
    setError('');
    setAviso('');
    try {
      await api(`/admin/usuarios/${u.id}`, { metodo: 'DELETE' });
      setConfirmar(null);
      setAviso(`La cuenta de ${u.nombre} fue eliminada.`);
      if (datos.usuarios.length === 1 && pagina > 1) setPagina(pagina - 1);
      else cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-light">Usuarios registrados</h2>
        <span className="text-sm opacity-60">{datos.total} en total</span>
      </div>

      {/* Filtros */}
      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        <input className="campo" type="search" placeholder="Buscar por nombre o email"
          aria-label="Buscar usuarios" maxLength={60} value={filtros.q} onChange={cambiarFiltro('q')} />
        <select className="campo" aria-label="Filtrar por estado" value={filtros.estado} onChange={cambiarFiltro('estado')}>
          <option value="">Todas las cuentas</option>
          <option value="activo">Activas</option>
          <option value="inactivo">Bloqueadas</option>
        </select>
      </div>

      {aviso && <p className="mt-5 text-sm text-[#60A5FA]" role="status">{aviso}</p>}
      {error && <p className="error mt-5" role="alert">{error}</p>}

      {/* Tabla */}
      <div className="tarjeta !p-0 mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs opacity-60">
              <th className="p-4 font-normal">Usuario</th>
              <th className="p-4 font-normal">Registro</th>
              <th className="p-4 font-normal text-center">Accesos</th>
              <th className="p-4 font-normal">Último acceso</th>
              <th className="p-4 font-normal">Estado</th>
              <th className="p-4 font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.usuarios.map((u) => (
              <tr key={u.id} className="border-t border-gray-500/20 align-middle">
                <td className="p-4">
                  <p className="font-semibold break-words">{u.nombre}</p>
                  <p className="text-xs opacity-70 break-all">{u.email}</p>
                </td>
                <td className="p-4 whitespace-nowrap">{fecha(u.creado_en)}</td>
                <td className="p-4 text-center">{u.accesos}</td>
                <td className="p-4 whitespace-nowrap">{fecha(u.ultimo_acceso)}</td>
                <td className="p-4">
                  <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${u.activo ? 'bg-green-500/15 text-green-500' : 'bg-red-400/15 text-red-400'}`}>
                    {u.activo ? 'Activa' : 'Bloqueada'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end items-center gap-3 flex-wrap">
                    {confirmar === u.id ? (
                      <>
                        <span className="text-xs opacity-70">¿Eliminar definitivamente?</span>
                        <button className="text-xs text-red-400 hover:underline" disabled={ocupado === u.id}
                          onClick={() => eliminar(u)}>Sí, eliminar</button>
                        <button className="text-xs opacity-70 hover:underline" onClick={() => setConfirmar(null)}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button className="text-xs text-[#60A5FA] hover:underline" disabled={ocupado === u.id}
                          onClick={() => cambiarEstado(u)}>
                          {u.activo ? 'Bloquear' : 'Reactivar'}
                        </button>
                        <button className="text-xs text-red-400 hover:underline" onClick={() => setConfirmar(u.id)}>Eliminar</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cargando && datos.usuarios.length === 0 && <p className="p-6 opacity-70">Cargando usuarios…</p>}
        {!cargando && !error && datos.usuarios.length === 0 && (
          <p className="p-6 opacity-70">No hay usuarios con esos filtros.</p>
        )}
      </div>

      {/* Paginación */}
      {datos.paginas > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button className="btn btn-borde text-sm !py-2 !px-5" disabled={pagina <= 1 || cargando}
            onClick={() => setPagina((p) => p - 1)}>Anterior</button>
          <span className="text-sm opacity-70">Página {pagina} de {datos.paginas}</span>
          <button className="btn btn-borde text-sm !py-2 !px-5" disabled={pagina >= datos.paginas || cargando}
            onClick={() => setPagina((p) => p + 1)}>Siguiente</button>
        </div>
      )}
    </div>
  );
}
