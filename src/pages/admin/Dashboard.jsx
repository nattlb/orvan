import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';

// [campo que devuelve el servidor, título, explicación]
const TARJETAS = [
  ['visitas', 'Visitas al sitio', 'Una por cada sesión de navegador'],
  ['accesos', 'Accesos de usuarios', 'Registros e inicios de sesión'],
  ['usuarios', 'Usuarios registrados', 'Cuentas creadas por visitantes'],
  ['consultasNuevas', 'Consultas sin responder', 'Esperando respuesta'],
  ['consultas', 'Consultas recibidas', 'Total histórico'],
  ['proyectos', 'Proyectos publicados', 'Visibles para usuarios registrados'],
];

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    setCargando(true);
    setError('');
    api('/admin/resumen')
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-light">Resumen</h2>
        <button className="btn btn-borde text-sm !py-2 !px-5" onClick={cargar} disabled={cargando}>
          {cargando ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {error && <p className="error mt-6" role="alert">{error}</p>}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        {TARJETAS.map(([campo, titulo, ayuda]) => (
          <article key={campo} className="tarjeta">
            <p className="text-sm opacity-70">{titulo}</p>
            <p className="titulo text-4xl md:text-5xl font-extralight text-[#60A5FA] mt-3">
              {datos ? Number(datos[campo]).toLocaleString('es-AR') : '—'}
            </p>
            <p className="text-xs opacity-60 mt-3">{ayuda}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
