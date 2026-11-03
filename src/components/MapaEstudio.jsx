import { usePrefs } from '../context/PrefsContext';

// El mapa busca el lugar por NOMBRE (no hace falta saber las coordenadas).
// Para cambiar la ubicación, modificá solo este texto.
const LUGAR = 'Universidad Católica de Salta, Campo Castañares, Salta, Argentina';

const EMBEBIDO = `https://www.google.com/maps?q=${encodeURIComponent(LUGAR)}&output=embed&hl=es`;
const ENLACE = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LUGAR)}`;

// Mapa incrustado de Google Maps. En tema oscuro se invierten los colores para que combine con la página.
export default function MapaEstudio() {
  const { tema } = usePrefs();

  return (
    <div className="tarjeta !p-2 overflow-hidden">
      <iframe
        title="Mapa con la ubicación de la Universidad Católica de Salta"
        src={EMBEBIDO}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-56 rounded-xl border-0"
        style={tema === 'oscuro' ? { filter: 'invert(.9) hue-rotate(180deg) brightness(.95) contrast(.9)' } : undefined}
      ></iframe>
      <a href={ENLACE} target="_blank" rel="noopener noreferrer"
        className="block text-xs text-[#60A5FA] hover:underline px-2 pt-2 pb-1">
        Ver mapa más grande
      </a>
    </div>
  );
}