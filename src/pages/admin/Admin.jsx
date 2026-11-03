import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dashboard from './Dashboard';
import Graficos from './Graficos';
import Consultas from './Consultas';
import Usuarios from './Usuarios';
import Proyectos from './Proyectos';
import Servicios from './Servicios';
import Operador from '../operador/Operador';
import Equipo from './Equipo';
import Horarios from './Horarios';

// Secciones del panel (en los próximos pasos se suman: Consultas, Usuarios, Contenido)
const SECCIONES = [
  { to: '/admin', texto: 'Resumen', end: true },
  { to: '/admin/estadisticas', texto: 'Estadísticas' },
  { to: '/admin/consultas', texto: 'Consultas' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
  { to: '/admin/proyectos', texto: 'Proyectos' },
  { to: '/admin/servicios', texto: 'Servicios' },
  { to: '/admin/horarios', texto: 'Horarios' },
  { to: '/admin/equipo', texto: 'Equipo' },
  { to: '/admin/operadores', texto: 'Operadores' },
];

export default function Admin() {
  const { usuario, cargando, abrirModal } = useAuth();

  if (cargando) {
    return (
      <section className="degradado min-h-screen">
        <div className="cont"><p className="opacity-70">Cargando…</p></div>
      </section>
    );
  }

  // Solo administradores
  if (!usuario || usuario.rol !== 'admin') {
    return (
      <section className="degradado min-h-[80vh]">
        <div className="cont max-w-lg">
          <h1 className="titulo text-3xl font-light">Acceso restringido</h1>
          <div className="regla mt-6"></div>
          <p className="mt-6 opacity-80">
            Esta zona es solo para administradores.
            {!usuario && ' Iniciá sesión con una cuenta de administrador para continuar.'}
          </p>
          <div className="mt-8 flex gap-4 flex-wrap">
            {!usuario && (
              <button className="btn btn-azul" onClick={() => abrirModal('login')}>Ingresar</button>
            )}
            <Link to="/" className="btn btn-borde">Volver al inicio</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="degradado min-h-screen">
      <div className="cont">
        <p className="text-sm text-[#60A5FA] tracking-widest">PANEL DE ADMINISTRACIÓN</p>
        <h1 className="titulo text-3xl md:text-4xl font-light mt-2">Hola, {usuario.nombre.split(' ')[0]}</h1>
        <div className="regla mt-5"></div>

        <div className="grid md:grid-cols-[200px_1fr] gap-8 mt-10">
          <div role="navigation" aria-label="Secciones del panel" className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible self-start">
            {SECCIONES.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                end={s.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm whitespace-nowrap border transition ${
                    isActive ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white' : 'border-gray-500/20 opacity-80 hover:opacity-100'
                  }`
                }
              >
                {s.texto}
              </NavLink>
            ))}
          </div>

          <div className="min-w-0">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="estadisticas" element={<Graficos />} />
              <Route path="consultas" element={<Consultas />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="proyectos" element={<Proyectos />} />
              <Route path="servicios" element={<Servicios />} />
              <Route path="horarios" element={<Horarios />} />
              <Route path="equipo" element={<Equipo />} />
              <Route path="operadores" element={<Operador />} />
              <Route path="*" element={<p className="opacity-70">Sección no encontrada.</p>} />
              
            </Routes>
          </div>
        </div>
      </div>
    </section>
  );
}
