
import { useEffect, useState } from "react";

const CLAVE_COOKIES = "orvan_preferencias_cookies";

export default function BannerCookies() {
  const [visible, setVisible] = useState(false);
  const [configurar, setConfigurar] = useState(false);
  const [preferencias, setPreferencias] = useState(true);

  useEffect(() => {
    const guardado = localStorage.getItem(CLAVE_COOKIES);

    if (!guardado) {
      setVisible(true);
    }
  }, []);

  function guardarEleccion(aceptarPreferencias) {
    const eleccion = {
      necesarias: true,
      preferencias: aceptarPreferencias,
      fecha: new Date().toISOString(),
    };

    localStorage.setItem(CLAVE_COOKIES, JSON.stringify(eleccion));

    setVisible(false);
    setConfigurar(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200]">
      <div className="max-w-5xl mx-auto rounded-2xl border border-gray-500/20 bg-white dark:bg-[#111827] shadow-2xl p-6">

        {!configurar ? (
          <>
            <div className="flex flex-col md:flex-row gap-5 md:items-center md:justify-between">

              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">
                  Tu privacidad importa
                </h2>

                <p className="text-sm opacity-70 leading-relaxed">
                  ORVAN utiliza almacenamiento local para recordar
                  tus preferencias. Podés aceptar, rechazar o
                  configurar estas opciones.
                </p>

                <a
                  href="/cookies"
                  className="inline-block mt-3 text-sm text-[#60A5FA] hover:underline"
                >
                  Conocé nuestra política de cookies
                </a>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() => guardarEleccion(true)}
                  className="rounded-xl px-4 py-3 bg-[#2563EB] text-white text-sm hover:bg-[#1D4ED8] transition"
                >
                  Aceptar
                </button>

                <button
                  type="button"
                  onClick={() => guardarEleccion(false)}
                  className="rounded-xl px-4 py-3 border border-gray-500/30 text-sm hover:bg-gray-500/10 transition"
                >
                  Rechazar
                </button>

                <button
                  type="button"
                  onClick={() => setConfigurar(true)}
                  className="rounded-xl px-4 py-3 border border-gray-500/30 text-sm hover:bg-gray-500/10 transition"
                >
                  Configurar
                </button>

              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2">
              Preferencias de almacenamiento
            </h2>

            <p className="text-sm opacity-70 mb-5">
              Elegí qué tipo de almacenamiento permitís.
              Las opciones necesarias siempre permanecen activas.
            </p>

            <div className="space-y-4">

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-sm">
                    Necesarias
                  </h3>
                  <p className="text-xs opacity-60 mt-1">
                    Permiten funciones básicas del sitio.
                  </p>
                </div>

                <span className="text-xs text-[#60A5FA] font-semibold">
                  Siempre activas
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-sm">
                    Preferencias
                  </h3>
                  <p className="text-xs opacity-60 mt-1">
                    Recuerdan las elecciones realizadas en el sitio.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={preferencias}
                  onChange={(e) => setPreferencias(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                  aria-label="Permitir almacenamiento de preferencias"
                />
              </div>

            </div>

            <div className="flex flex-wrap gap-2 mt-6">

              <button
                type="button"
                onClick={() => guardarEleccion(preferencias)}
                className="rounded-xl px-5 py-3 bg-[#2563EB] text-white text-sm hover:bg-[#1D4ED8] transition"
              >
                Guardar preferencias
              </button>

              <button
                type="button"
                onClick={() => setConfigurar(false)}
                className="rounded-xl px-5 py-3 border border-gray-500/30 text-sm hover:bg-gray-500/10 transition"
              >
                Volver
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
