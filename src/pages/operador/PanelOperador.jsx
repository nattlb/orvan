
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Consultas from '../admin/Consultas';

export default function PanelOperador() {
  const { usuario } = useAuth();

  if (!usuario || !['operador', 'admin'].includes(usuario.rol)) {
    return (
      <section className="degradado min-h-screen">
        <div className="cont">
          <h1 className="titulo text-3xl">Acceso restringido</h1>

          <p className="mt-4 opacity-80">
            Esta sección es exclusiva para operadores.
          </p>

          <Link to="/" className="btn btn-borde mt-6 inline-block">
            Volver al inicio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="degradado min-h-screen">
      <div className="cont">
        <p className="text-sm text-[#60A5FA] tracking-widest">
          PANEL DE OPERADOR
        </p>

        <h1 className="titulo text-3xl md:text-4xl font-light mt-2">
          Hola, {usuario.nombre.split(' ')[0]}
        </h1>

        <div className="regla mt-5"></div>

        <div className="mt-8">
          <Consultas rutaBase="/operador" />
        </div>
      </div>
    </section>
  );
}
