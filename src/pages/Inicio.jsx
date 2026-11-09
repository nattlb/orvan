
import { useEffect, useRef } from 'react';
import HeroRings from '../components/HeroRings';
import Resenas from '../components/Resenas';
import useReveal from '../hooks/useReveal';
import Acerca from './Acerca';
import ProyectoBlob from './ProyectoBlob';
import Contacto from './Contacto';

export default function Inicio() {
  const logo = useRef(null);

  useReveal();

  // Animación del logo al desplazarse
  useEffect(() => {
    const onScroll = () => {
      const el = logo.current;

      if (!el) return;

      const sc = Math.min(
        window.scrollY / window.innerHeight,
        1
      );

      el.style.transform =
        `translateY(${window.scrollY * 0.3}px) scale(${1 - sc * 0.12})`;

      el.style.opacity = 1 - sc * 1.1;
    };

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      {/* INICIO */}
      <header id="inicio" className="hero">
        <div className="orbe a"></div>
        <div className="orbe b"></div>

        <HeroRings />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center w-full max-w-5xl px-4">
          <h1
            ref={logo}
            className="logo-hero titulo"
            aria-label="ORVAN"
          >
            {[...'ORVAN'].map((l, i) => (
              <span
                key={i}
                className="letra"
                aria-hidden="true"
                style={{
                  animationDelay: `${0.15 + i * 0.12}s`,
                }}
              >
                {l}
              </span>
            ))}
          </h1>

          <p className="entra mt-4 text-base md:text-xl font-light opacity-80 max-w-2xl mx-auto leading-relaxed">
            Cuatro especialistas que convierten el pedido de tu
            empresa en un sistema web seguro, rápido y bien
            diseñado.
          </p>

          <div className="entra mt-8 flex gap-4 justify-center flex-wrap">
            <a
              href="#cotizacion"
              className="btn btn-azul"
            >
              Pedir cotización
            </a>

            <a
              href="#servicios"
              className="btn btn-borde"
            >
              Ver servicios
            </a>
          </div>
        </div>

        <div className="pista" aria-hidden="true"></div>
      </header>

      {/* EQUIPO, TECNOLOGÍAS Y SERVICIOS */}
      <Acerca />

      {/* PROYECTOS */}
      <ProyectoBlob />

      {/* RESEÑAS */}
      <div id="resenas" style={{ scrollMarginTop: '90px' }}>
        <Resenas />
      </div>

      {/* CONTACTO */}
      <Contacto />
    </>
  );
}
