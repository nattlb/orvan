import { useRef } from 'react';
import { RESENAS } from '../data/datos';

// Carrusel horizontal de reseñas con flechas
export default function Resenas() {
  const pista = useRef(null);

  const mover = (dir) => {
    const ancho = pista.current.querySelector('.resena').offsetWidth + 20;
    pista.current.scrollBy({ left: dir * ancho });
  };

  return (
    <section className="degradado">
      <div className="cont">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="rv arriba text-3xl md:text-5xl font-light">Lo que dicen nuestros clientes</h2>
            <div className="regla mt-6 rv"></div>
          </div>
          <div className="flex gap-3">
            <button className="btn-flecha" aria-label="Reseña anterior" onClick={() => mover(-1)}>&larr;</button>
            <button className="btn-flecha" aria-label="Reseña siguiente" onClick={() => mover(1)}>&rarr;</button>
          </div>
        </div>

        <div ref={pista} className="pista-res rv arriba mt-10" tabIndex={0}>
          {RESENAS.map(([ini, nombre, cargo, texto]) => (
            <article key={nombre} className="tarjeta resena">
              <p className="text-[#2563EB] tracking-widest text-sm" aria-label="5 estrellas">★★★★★</p>
              <p className="text-sm opacity-80 leading-relaxed">{texto}</p>
              <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-500/20">
                <span className="avatar">{ini}</span>
                <div>
                  <p className="text-sm font-semibold">{nombre}</p>
                  <p className="text-xs opacity-60">{cargo}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}