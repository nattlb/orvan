
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function Operador() {
  const [operadores, setOperadores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Obtener operadores del servidor
  const cargarOperadores = async () => {
    try {
      setCargando(true);
      const datos = await api('/admin/operadores');
      setOperadores(datos.operadores);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOperadores();
  }, []);

  // Crear un operador
  const crearOperador = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      setGuardando(true);

      await api('/admin/operadores', {
        metodo: 'POST',
        cuerpo: { nombre, email, clave },
      });

      setMensaje('Operador creado correctamente.');
      setNombre('');
      setEmail('');
      setClave('');

      await cargarOperadores();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  // Bloquear o reactivar una cuenta
  const cambiarEstado = async (operador) => {
    const nuevoEstado = !operador.activo;

    try {
      setError('');
      setMensaje('');

      await api(`/admin/operadores/${operador.id}`, {
        metodo: 'PATCH',
        cuerpo: { activo: nuevoEstado },
      });

      setMensaje('Estado actualizado correctamente.');
      await cargarOperadores();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-light">Gestión de operadores</h2>

      <div className="regla mt-4"></div>

      <p className="mt-5 opacity-80">
        Administrá las cuentas de operadores de Orvan.
      </p>

      {mensaje && (
        <p className="mt-4 text-green-600">{mensaje}</p>
      )}

      {error && (
        <p className="mt-4 text-red-500">{error}</p>
      )}

      {/* Formulario para crear operadores */}
      <div className="mt-8 rounded-xl border border-gray-500/20 p-5">
        <h3 className="text-lg font-medium">Crear operador</h3>

        <form onSubmit={crearOperador} className="mt-5 grid gap-4">
          <div>
            <label className="block text-sm mb-2">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-500/30 bg-transparent p-3"
              placeholder="Nombre del operador"
              minLength="3"
              maxLength="60"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-500/30 bg-transparent p-3"
              placeholder="operador@correo.com"
              maxLength="120"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Contraseña</label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full rounded-lg border border-gray-500/30 bg-transparent p-3"
              placeholder="Mínimo 8 caracteres y un número"
              minLength="8"
              maxLength="64"
              required
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="btn btn-azul justify-self-start"
          >
            {guardando ? 'Creando...' : 'Crear operador'}
          </button>
        </form>
      </div>

      {/* Lista de operadores */}
      <div className="mt-8 rounded-xl border border-gray-500/20 p-5">
        <h3 className="text-lg font-medium">Operadores registrados</h3>

        {cargando ? (
          <p className="mt-4 opacity-70">Cargando operadores...</p>
        ) : operadores.length === 0 ? (
          <p className="mt-4 opacity-70">
            Todavía no hay operadores registrados.
          </p>
        ) : (
          <div className="mt-5 grid gap-4">
            {operadores.map((operador) => (
              <div
                key={operador.id}
                className="rounded-lg border border-gray-500/20 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{operador.nombre}</p>
                  <p className="text-sm opacity-70">{operador.email}</p>
                  <p className="text-sm mt-1">
                    Estado: {operador.activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => cambiarEstado(operador)}
                  className="btn btn-borde"
                >
                  {operador.activo ? 'Desactivar' : 'Reactivar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
