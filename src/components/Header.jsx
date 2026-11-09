
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePrefs } from '../context/PrefsContext';
import BotonSesion from './BotonSesion';

const LINKS = [
  { href: '/#inicio', texto: 'Inicio' },
  { href: '/#equipo', texto: 'Equipo' },
  { href: '/#stack', texto: 'Tecnologías' },
  { href: '/#servicios', texto: 'Servicios' },
  { href: '/#proyectos', texto: 'Proyectos' },
  { href: '/#resenas', texto: 'Reseñas' },
  { href: '/#cotizacion', texto: 'Pedir cotización' },
  { href: '/#contacto', texto: 'Contacto' },
];

export default function Header() {
  const { tema, alternarTema } = usePrefs();

  const location = useLocation();
  const navigate = useNavigate();

  const [fija, setFija] = useState(false);
  const [abierto, setAbierto] = useState(false);

  // Buscar la sección correspondiente
  const buscarSeccion = (id) => {
    const seccion = document.getElementById(id);

    if (seccion) return seccion;

    // Buscar la sección de reseñas por su título
    if (id === 'resenas') {
      const titulos = document.querySelectorAll('h1, h2, h3, h4');

      const titulo = Array.from(titulos).find((elemento) =>
        elemento.textContent
          .toLowerCase()
          .includes('lo que dicen nuestros clientes')
      );

      if (titulo) {
        return titulo.closest('section') || titulo;
      }
    }

    return null;
  };

  // Desplazarse suavemente
  const desplazarASeccion = (id) => {
    const seccion = buscarSeccion(id);

    if (seccion) {
      seccion.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Navegación del menú
  const irASeccion = (e, href) => {
    e.preventDefault();
    setAbierto(false);

    const id = href.split('#')[1];

    if (!id) return;

    if (location.pathname !== '/') {
      navigate(href);
      return;
    }

    if (location.hash !== `#${id}`) {
      navigate(href);
    }

    setTimeout(() => {
      desplazarASeccion(id);
    }, 100);
  };

  // Desplazamiento al cambiar de ruta
  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) {
      return;
    }

    const id = decodeURIComponent(location.hash.substring(1));

    const tiempo = setTimeout(() => {
      desplazarASeccion(id);
    }, 150);

    return () => clearTimeout(tiempo);
  }, [location.pathname, location.hash]);

  // Cerrar menú con Escape
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false);
      }
    };

    window.addEventListener('keydown', alTeclear);

    return () => {
      window.removeEventListener('keydown', alTeclear);
    };
  }, []);

  // Estilo del encabezado al desplazarse
  useEffect(() => {
    const f = () => setFija(window.scrollY > 30);

    f();

    window.addEventListener('scroll', f, { passive: true });

    return () => {
      window.removeEventListener('scroll', f);
    };
  }, []);

  return (
    <>
      {/* Menú lateral */}
      <div
        className={`drawer-overlay ${abierto ? 'open' : ''}`}
        aria-hidden={!abierto}
        onClick={() => setAbierto(false)}
      >
        <div
          className="drawer-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-500/20">
            <span className="titulo tracking-[.3em] text-lg">
              MENÚ
            </span>

            <button
              className="text-2xl text-current"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
            >
              &times;
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="drawer-link"
                onClick={(e) => irASeccion(e, l.href)}
              >
                <span>{l.texto}</span>
                <span>&rarr;</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Barra principal */}
      <nav className={`fixed top-0 inset-x-0 z-40 ${fija ? 'fija' : ''}`}>
        <div className="cont flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-5">
            {/* Botón del menú */}
            <button
              className={`btn-burger ${abierto ? 'active' : ''}`}
              aria-label="Abrir menú"
              aria-expanded={abierto}
              onClick={() => setAbierto(!abierto)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Interruptor sol / luna */}
            <button
              className="tema"
              role="switch"
              aria-checked={tema === 'claro'}
              aria-label="Cambiar tema claro / oscuro"
              onClick={alternarTema}
            >
              <span className="tema-pista" aria-hidden="true"></span>

              <span className="tema-bola">
                <svg
                  className="icono-tema"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <defs>
                    <mask id="mascaraLuna">
                      <rect width="24" height="24" fill="#fff" />
                      <circle
                        className="corte"
                        cx="26"
                        cy="2"
                        r="6"
                        fill="#000"
                      />
                    </mask>
                  </defs>

                  <circle
                    className="nucleo"
                    cx="12"
                    cy="12"
                    r="5.2"
                    mask="url(#mascaraLuna)"
                  />

                  <g className="rayos">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((g) => (
                      <line
                        key={g}
                        x1="12"
                        y1="1.8"
                        x2="12"
                        y2="4"
                        transform={`rotate(${g} 12 12)`}
                      />
                    ))}
                  </g>
                </svg>
              </span>
            </button>

            {/* Logo ORVAN */}
            <Link
              to="/#inicio"
              onClick={(e) => irASeccion(e, '/#inicio')}
              className="group titulo font-light tracking-[.3em] text-lg flex items-center gap-3"
            >
              <svg
                viewBox="-2.1 -2.1 4.2 4.2"
                width="26"
                height="26"
                fill="none"
                stroke="#60A5FA"
                strokeWidth=".16"
                className="transition-transform duration-[1200ms] group-hover:rotate-90"
              >
                <circle cx="1" r="1" />
                <circle cx="-1" r="1" />
                <circle cy="1" r="1" />
                <circle cy="-1" r="1" />
              </svg>

              ORVAN
            </Link>
          </div>

          {/* Inicio de sesión */}
          <div className="flex items-center gap-3">
            <BotonSesion />
          </div>
        </div>
      </nav>
    </>
  );
}
