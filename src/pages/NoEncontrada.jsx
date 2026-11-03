import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

// Página 404: los 4 anillos del logo se dibujan y giran (GSAP)
export default function NoEncontrada() {
  const raiz = useRef(null);

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = 'Página no encontrada | ORVAN';

    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reducido) return;
      gsap.from('.anillo404', { strokeDashoffset: 1, duration: 1.4, stagger: 0.25, ease: 'power2.out' });
      gsap.to('.grupo404', { rotation: 360, svgOrigin: '0 0', duration: 40, repeat: -1, ease: 'none' });
      gsap.from('.texto404', { y: 30, autoAlpha: 0, duration: 0.8, delay: 0.5, stagger: 0.15 });
    }, raiz);

    return () => { ctx.revert(); document.title = tituloAnterior; };
  }, []);

  return (
    <section ref={raiz} className="degradado min-h-[85vh] grid place-items-center text-center">
      <div className="cont">
        <svg viewBox="-2.1 -2.1 4.2 4.2" width="220" height="220" className="mx-auto" fill="none" stroke="#60A5FA" strokeWidth=".05" aria-hidden="true">
          <g className="grupo404">
            <circle className="anillo404" cx="1" r="1" pathLength="1" strokeDasharray="1" strokeDashoffset="0" />
            <circle className="anillo404" cx="-1" r="1" pathLength="1" strokeDasharray="1" strokeDashoffset="0" />
            <circle className="anillo404" cy="1" r="1" pathLength="1" strokeDasharray="1" strokeDashoffset="0" />
            <circle className="anillo404" cy="-1" r="1" pathLength="1" strokeDasharray="1" strokeDashoffset="0" />
          </g>
        </svg>

        <h1 className="texto404 titulo text-6xl md:text-8xl font-light mt-6">404</h1>
        <div className="regla mt-6 mx-auto"></div>
        <p className="texto404 mt-6 opacity-80 max-w-md mx-auto">
          La página que buscás no existe o cambió de lugar. Volvé al inicio y seguí explorando.
        </p>
        <Link to="/" className="texto404 btn btn-azul mt-8 inline-block">Volver al inicio</Link>
      </div>
    </section>
  );
}
