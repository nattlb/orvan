
import { useEffect, useState } from 'react';

// API del clima en Salta
const URL_CLIMA =
  'https://api.open-meteo.com/v1/forecast?latitude=-24.7859&longitude=-65.4117&current=temperature_2m,weather_code&timezone=America%2FArgentina%2FSalta';

const ZONA = 'America/Argentina/Salta';

// Descripción del clima
const descripcion = (c) => {
  if (c === 0) return 'Despejado';
  if (c <= 2) return 'Poco nublado';
  if (c === 3) return 'Nublado';
  if (c === 45 || c === 48) return 'Niebla';
  if (c >= 51 && c <= 57) return 'Llovizna';
  if (c >= 61 && c <= 67) return 'Lluvia';
  if (c >= 71 && c <= 77) return 'Nieve';
  if (c >= 80 && c <= 82) return 'Chubascos';
  if (c >= 95) return 'Tormenta';
  return '';
};

// Hora actual de Salta
function ahoraEnSalta() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (tipo) =>
    (partes.find((p) => p.type === tipo) || {}).value;

  const dia = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }[get('weekday')];

  let hora = parseInt(get('hour'), 10);
  if (hora === 24) hora = 0;

  return {
    dia,
    hora,
    minuto: get('minute'),
    fecha: new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()),
  };
}

// Convierte TIME de MySQL a minutos
function aMinutos(hora) {
  if (!hora) return null;

  const partes = String(hora).split(':');
  return Number(partes[0]) * 60 + Number(partes[1]);
}

export default function EstadoEstudio() {
  const [ahora, setAhora] = useState(ahoraEnSalta);
  const [clima, setClima] = useState(null);
  const [horarios, setHorarios] = useState(null);

  // Actualizar reloj
  useEffect(() => {
    const t = setInterval(() => setAhora(ahoraEnSalta()), 30000);
    return () => clearInterval(t);
  }, []);

  // Consultar horarios del backend
  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        const respuesta = await fetch(
          `/api/horarios?fecha=${ahora.fecha}`
        );

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los horarios');
        }

        const datos = await respuesta.json();
        setHorarios(datos);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setHorarios(null);
      }
    };

    cargarHorarios();

    const intervalo = setInterval(cargarHorarios, 60000);
    return () => clearInterval(intervalo);
  }, [ahora.fecha]);

  // Consultar clima
  useEffect(() => {
    const ctrl = new AbortController();

    fetch(URL_CLIMA, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('sin clima'))))
      .then((d) => {
        if (d.current && typeof d.current.temperature_2m === 'number') {
          setClima({
            temp: Math.round(d.current.temperature_2m),
            texto: descripcion(d.current.weather_code),
          });
        }
      })
      .catch(() => {});

    return () => ctrl.abort();
  }, []);

  // Calcular estado de atención
  let estado = 'cargando';
  let textoEstado = 'Consultando horarios...';

  if (horarios) {
    const horarioDia = horarios.horarios?.find(
      (h) => Number(h.dia_semana) === ahora.dia
    );

    if (!horarioDia || !horarioDia.abierto) {
      estado = 'cerrado';
      textoEstado = 'Fuera del horario de atención';
    } else {
      const horaActual = ahora.hora * 60 + Number(ahora.minuto);
      let apertura = aMinutos(horarioDia.hora_apertura);
      let cierre = aMinutos(horarioDia.hora_cierre);

      // Aplicar excepción del día
      const excepcion = horarios.excepcion;

      if (excepcion?.tipo === 'cerrado') {
        apertura = null;
        cierre = null;
      } else if (excepcion?.tipo === 'horario_especial') {
        apertura = aMinutos(excepcion.hora_apertura);
        cierre = aMinutos(excepcion.hora_cierre);
      }

      if (apertura === null || cierre === null ||
          horaActual < apertura || horaActual >= cierre) {
        estado = 'cerrado';
        textoEstado = 'Fuera del horario de atención';
      } else {
        const pausa = horarios.pausa;

        const inicioPausa = pausa?.activa
          ? aMinutos(pausa.hora_inicio)
          : null;

        const finPausa = pausa?.activa
          ? aMinutos(pausa.hora_fin)
          : null;

        if (
          inicioPausa !== null &&
          finPausa !== null &&
          horaActual >= inicioPausa &&
          horaActual < finPausa
        ) {
          estado = 'pausa';
          textoEstado = 'Estamos en pausa';
        } else {
          estado = 'abierto';
          textoEstado = 'Estamos atendiendo ahora';
        }
      }
    }
  }

  const color =
    estado === 'abierto'
      ? 'bg-green-400 animate-pulse'
      : estado === 'pausa'
        ? 'bg-yellow-400'
        : 'bg-gray-400';

  return (
    <div
      className="tarjeta !p-4 flex items-center gap-4"
      aria-live="polite"
    >
      <span
        className={`w-3 h-3 rounded-full shrink-0 ${color}`}
        aria-hidden="true"
      />

      <div className="min-w-0">
        <p className="text-sm">{textoEstado}</p>

        <p className="text-xs opacity-60">
          Salta · {String(ahora.hora).padStart(2, '0')}:
          {ahora.minuto} h
          {clima &&
            ` · ${clima.temp} °C${clima.texto ? ` · ${clima.texto}` : ''}`}
        </p>
      </div>
    </div>
  );
}
