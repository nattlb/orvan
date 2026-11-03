import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Cinta infinita de tecnologías. Con GSAP gira sola y, gracias a ScrollTrigger,
// se acelera cuando el visitante hace scroll rápido y vuelve a su ritmo después.
export default function Marquee({ items }) {
  const pista = useRef(null);

  useEffect(() => {
    // Respeta a quienes tienen desactivadas las animaciones en su sistema
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const giro = gsap.to(pista.current, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 });

      ScrollTrigger.create({
        trigger: pista.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const aceleracion = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 5);
          gsap.to(giro, {
            timeScale: aceleracion,
            duration: 0.2,
            overwrite: true,
            onComplete: () => gsap.to(giro, { timeScale: 1, duration: 1.2 }),
          });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // La lista se dibuja dos veces seguidas para que el movimiento nunca tenga un corte
  const tira = (clave) => (
    <div key={clave} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={clave === 'b'}>
      {items.map((t) => (
        <span key={t} className="flex items-center gap-10 titulo text-2xl md:text-4xl font-extralight opacity-40 whitespace-nowrap">
          {t}
          <span className="text-[#60A5FA] text-base">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div ref={pista} className="flex w-max">
        {tira('a')}
        {tira('b')}
      </div>
    </div>
  );
}
