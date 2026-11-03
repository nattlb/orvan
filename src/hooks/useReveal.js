
import { useEffect } from 'react';

export default function useReveal() {
  useEffect(() => {
    const timers = [];

    const contar = (el) => {
      if (el.dataset.contado === 'true') return;

      el.dataset.contado = 'true';

      const meta = Number(el.dataset.n);
      let n = 0;

      const t = setInterval(() => {
        n += Math.ceil(meta / 30);

        if (n >= meta) {
          n = meta;
          clearInterval(t);
        }

        el.textContent = n;
      }, 35);

      timers.push(t);
    };

    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');

            e.target.querySelectorAll('[data-n]').forEach(contar);
          } else {
            e.target.classList.remove('in');
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    const escanear = (nodo) => {
      if (nodo.nodeType !== 1) return;

      if (nodo.classList.contains('rv')) {
        io.observe(nodo);
      }

      nodo.querySelectorAll('.rv').forEach((el) => {
        io.observe(el);
      });
    };

    escanear(document.body);

    const mo = new MutationObserver((cambios) => {
      cambios.forEach((c) => {
        c.addedNodes.forEach(escanear);
      });
    });

    mo.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      io.disconnect();
      mo.disconnect();
      timers.forEach(clearInterval);
    };
  }, []);
}

