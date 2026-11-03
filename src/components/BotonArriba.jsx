import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const R = 20;
const CIRCUNFERENCIA = 2 * Math.PI * R;

// Botón flotante: aparece (animado con GSAP) al bajar, y su anillo se completa a medida que avanza la lectura
export default function BotonArriba() {
  const boton = useRef(null);
  const anillo = useRef(null);

  useEffect(() => {
    const el = boton.current;
    gsap.set(el, { autoAlpha: 0, y: 20 });
    let visible = false;

    const alHacerScroll = () => {
      if (!anillo.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const avance = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      anillo.current.style.strokeDashoffset = String(CIRCUNFERENCIA * (1 - avance));

      const mostrar = window.scrollY > 600;
      if (mostrar !== visible) {
        visible = mostrar;
        gsap.to(el, { autoAlpha: mostrar ? 1 : 0, y: mostrar ? 0 : 20, duration: 0.4, ease: 'power2.out' });
      }
    };

    alHacerScroll();
    window.addEventListener('scroll', alHacerScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', alHacerScroll);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <button
      ref={boton}
      type="button"
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 grid place-items-center rounded-full bg-[#0A1736]/85 backdrop-blur border border-[#60A5FA]/30 text-white"
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(96,165,250,.2)" strokeWidth="2" />
        <circle
          ref={anillo} cx="24" cy="24" r={R} fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA}
        />
      </svg>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
