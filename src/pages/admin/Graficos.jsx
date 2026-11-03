import { useEffect, useState } from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { api } from '../../services/api';
import { usePrefs } from '../../context/PrefsContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const RANGOS = [7, 30, 90];

const AZUL = '#1D4ED8';
const CIELO = '#60A5FA';
const HIELO = '#93C5FD';
const VERDE = '#34D399';

// Convierte la fecha al formato día/mes
const corto = (d) => {
  return d.substring(8, 10) + '/' + d.substring(5, 7);
};

// Suma los valores de una serie
const suma = (serie) => {
  return serie.reduce((total, x) => total + Number(x.total), 0);
};

// Colores de texto y grilla según el tema actual
function useColores() {
  const { tema } = usePrefs();

  const [c, setC] = useState({
    texto: '#94A3B8',
    grilla: 'rgba(148,163,184,.2)',
  });

  useEffect(() => {
    const t = setTimeout(() => {
      const css = getComputedStyle(document.documentElement);

      setC({
        texto:
          css.getPropertyValue('--texto-principal').trim() || '#94A3B8',
        grilla:
          css.getPropertyValue('--border-card').trim() ||
          'rgba(148,163,184,.2)',
      });
    }, 60);

    return () => clearTimeout(t);
  }, [tema]);

  return c;
}

// Opciones comunes de los gráficos
const conEjes = (c, extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: 'index',
    intersect: false,
  },

  plugins: {
    legend: {
      labels: { color: c.texto },
    },
    ...(extra.plugins || {}),
  },

  scales: {
    x: {
      ticks: {
        color: c.texto,
        maxTicksLimit: 8,
        ...(extra.xTicks || {}),
      },
      grid: { color: c.grilla },
      ...(extra.x || {}),
    },

    y: {
      beginAtZero: true,
      ticks: {
        color: c.texto,
        precision: 0,
      },
      grid: { color: c.grilla },
      ...(extra.y || {}),
    },
  },

  ...(extra.raiz || {}),
});

// Tarjeta de cada gráfico
function Tarjeta({ titulo, ayuda, children }) {
  return (
    <article className="tarjeta">
      <h3 className="font-light text-lg">{titulo}</h3>

      <p className="text-xs opacity-60 mt-1">{ayuda}</p>

      <div className="h-64 mt-4 relative">
        {children}
      </div>
    </article>
  );
}

export default function Graficos() {
  const colores = useColores();

  const [dias, setDias] = useState(30);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Consultar estadísticas al servidor
  useEffect(() => {
    let vigente = true;

    setCargando(true);
    setError('');

    api('/admin/estadisticas?dias=' + dias)
      .then((d) => {
        if (vigente) {
          setDatos(d);
        }
      })
      .catch((e) => {
        if (vigente) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (vigente) {
          setCargando(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [dias]);

  // Descargar estadísticas en CSV
  const descargarCSV = () => {
    if (!datos) return;

    const filas = [
      ['fecha', 'visitas', 'accesos_de_usuarios', 'registros_nuevos'],
    ];

    datos.visitas.forEach((v, i) => {
      filas.push([
        v.dia,
        v.total,
        datos.accesos[i] ? datos.accesos[i].total : 0,
        datos.registros[i] ? datos.registros[i].total : 0,
      ]);
    });

    const csv =
      '\uFEFF' + filas.map((f) => f.join(';')).join('\n');

    const archivo = new Blob([csv], {
      type: 'text/csv;charset=utf-8',
    });

    const url = URL.createObjectURL(archivo);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'orvan-estadisticas-' + datos.dias + '-dias.csv';

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const etiquetas = datos
    ? datos.visitas.map((v) => corto(v.dia))
    : [];

  const totalEstados = datos
    ? suma(datos.consultasPorEstado)
    : 0;

  const totalTipos = datos
    ? suma(datos.consultasPorTipo)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-light">Estadísticas</h2>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2" role="group" aria-label="Período">
            {RANGOS.map((r) => (
              <button
                key={r}
                onClick={() => setDias(r)}
                aria-pressed={dias === r}
                className={
                  dias === r
                    ? 'px-4 py-2 rounded-xl text-sm border bg-[#1D4ED8] border-[#1D4ED8] text-white'
                    : 'px-4 py-2 rounded-xl text-sm border border-gray-500/20 opacity-80 hover:opacity-100'
                }
              >
                {r} días
              </button>
            ))}
          </div>

          <button
            className="btn btn-borde text-sm !py-2 !px-5"
            onClick={descargarCSV}
            disabled={!datos || cargando}
          >
            Descargar CSV
          </button>
        </div>
      </div>

      {error && (
        <p className="error mt-6" role="alert">
          {error}
        </p>
      )}

      {cargando && !datos && (
        <p className="mt-6 opacity-70">
          Cargando estadísticas...
        </p>
      )}

      {datos && (
        <div
          className={
            'grid xl:grid-cols-2 gap-5 mt-8 transition-opacity ' +
            (cargando ? 'opacity-50' : '')
          }
        >
          {/* 1. Tipos de consulta más frecuentes */}
          <Tarjeta
            titulo="Tipos de consulta más frecuentes"
            ayuda={
              'Consultas recibidas en los últimos ' +
              datos.dias +
              ' días (' +
              totalTipos +
              ')'
            }
          >
            <Bar
              data={{
                labels: datos.consultasPorTipo.map((x) => x.tipo),
                datasets: [
                  {
                    label: 'Consultas',
                    data: datos.consultasPorTipo.map((x) => x.total),
                    backgroundColor: [AZUL, CIELO, HIELO],
                    borderRadius: 8,
                  },
                ],
              }}
              options={conEjes(colores, {
                raiz: { indexAxis: 'y' },
                plugins: {
                  legend: { display: false },
                },
                x: {
                  beginAtZero: true,
                  ticks: {
                    color: colores.texto,
                    precision: 0,
                  },
                },
                y: {
                  beginAtZero: false,
                  ticks: { color: colores.texto },
                },
              })}
            />
          </Tarjeta>

          {/* 2. Estado de las consultas */}
          <Tarjeta
            titulo="Estado de las consultas"
            ayuda="Cuántas esperan respuesta y cuántas ya se respondieron"
          >
            {totalEstados === 0 ? (
              <p className="absolute inset-0 grid place-items-center text-sm opacity-60">
                Sin consultas en este período
              </p>
            ) : (
              <Doughnut
                data={{
                  labels: ['Sin responder', 'Respondidas'],
                  datasets: [
                    {
                      data: datos.consultasPorEstado.map((x) => x.total),
                      backgroundColor: [CIELO, VERDE],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '62%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: colores.texto },
                    },
                  },
                }}
              />
            )}
          </Tarjeta>

          {/* 3. Flujo de registros */}
          <Tarjeta
            titulo="Flujo de registros"
            ayuda={
              'Usuarios nuevos por día (' +
              suma(datos.registros) +
              ' en el período)'
            }
          >
            <Bar
              data={{
                labels: etiquetas,
                datasets: [
                  {
                    label: 'Registros',
                    data: datos.registros.map((x) => x.total),
                    backgroundColor: CIELO,
                    borderRadius: 6,
                  },
                ],
              }}
              options={conEjes(colores, {
                plugins: {
                  legend: { display: false },
                },
              })}
            />
          </Tarjeta>

          {/* 4. Estadísticas de tráfico */}
          <Tarjeta
            titulo="Estadísticas de tráfico"
            ayuda={
              suma(datos.visitas) +
              ' visitas y ' +
              suma(datos.accesos) +
              ' accesos de usuarios'
            }
          >
            <Line
              data={{
                labels: etiquetas,
                datasets: [
                  {
                    label: 'Visitas',
                    data: datos.visitas.map((x) => x.total),
                    borderColor: CIELO,
                    backgroundColor: 'rgba(96,165,250,.18)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 2,
                  },
                  {
                    label: 'Accesos de usuarios',
                    data: datos.accesos.map((x) => x.total),
                    borderColor: VERDE,
                    backgroundColor: 'rgba(52,211,153,.12)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 2,
                  },
                ],
              }}
              options={conEjes(colores)}
            />
          </Tarjeta>
        </div>
      )}
    </div>
  );
}