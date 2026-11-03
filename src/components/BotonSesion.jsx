
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BotonSesion() {
  const { usuario, abrirModal, salir } = useAuth();

  if (!usuario) {
    return (
      <div className="flex items-center gap-4">
        <button
          className="text-sm opacity-80 hover:opacity-100 transition"
          onClick={() => abrirModal('login')}
        >
          Ingresar
        </button>

        <button
          className="btn btn-borde text-sm !py-2 !px-5"
          onClick={() => abrirModal('registro')}
        >
          Registrarme
        </button>
      </div>
    );
  }

  const ini = usuario.nombre.trim().slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">

      {usuario.rol === 'admin' && (
        <Link to="/admin" className="text-sm text-[#60A5FA] hover:underline">
          Panel admin
        </Link>
      )}

      {usuario.rol === 'operador' && (
        <Link to="/operador" className="text-sm text-[#60A5FA] hover:underline">
          Panel operador
        </Link>
      )}

      <span className="hidden sm:flex items-center gap-2 text-sm">
        <span className="avatar !w-8 !h-8 !text-xs">{ini}</span>
        <span className="opacity-80">{usuario.nombre.split(' ')[0]}</span>
      </span>

      <button
        className="btn btn-borde text-sm !py-2 !px-5"
        onClick={salir}
      >
        Salir
      </button>
    </div>
  );
}
