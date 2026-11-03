
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import BotonArriba from './BotonArriba';
import BannerCookies from './BannerCookies';

import { api } from '../services/api';

export default function Layout() {
  const { pathname } = useLocation();

  const progreso = useRef(null);
  const luz = useRef(null);

  // Volver arriba al cambiar de página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Contador de visitas: una vez por sesión
  useEffect(() => {
    if (sessionStorage.getItem('orvan_visita')) return;

    sessionStorage.setItem('orvan_visita', '1');

    api('/visitas', { metodo: 'POST' }).catch(() => {});
  }, []);

  // Barra de progreso y efecto de luz
  useEffect(() => {
    const onScroll = () => {
      if (!progreso.current) return;

      const max =
        document.documentElement.scrollHeight - window.innerHeight;

      progreso.current.style.transform =
        `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };

    const onMove = (e) => {
      if (!luz.current) return;

      luz.current.style.transform =
        `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <>
      <div id="progreso" ref={progreso}></div>
      <div id="luz" ref={luz}></div>

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#1D4ED8] focus:text-white"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />

      <BotonArriba />

      <AuthModal />

      <BannerCookies />
    </>
  );
}
