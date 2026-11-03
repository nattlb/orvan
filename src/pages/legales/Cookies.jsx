
import { Link } from "react-router-dom";

export default function Cookies() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <Link
          to="/"
          className="text-sm text-[#60A5FA] hover:opacity-70 transition"
        >
          ← Volver al inicio
        </Link>

        <header className="mt-10 mb-12">
          <p className="text-xs tracking-[.3em] text-[#60A5FA] uppercase">
            ORVAN · Información institucional
          </p>

          <h1 className="text-3xl md:text-5xl font-semibold mt-4">
            Política de cookies
          </h1>

          <p className="mt-5 opacity-60 text-sm">
            Última actualización: noviembre de 2026
          </p>
        </header>

        <div className="space-y-10 leading-relaxed opacity-80">

          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. ¿Qué son las cookies?
            </h2>

            <p>
              Las cookies son pequeños archivos de información que
              determinados sitios web pueden almacenar en el navegador
              del usuario. Permiten recordar preferencias, mantener
              sesiones y mejorar la experiencia de navegación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Uso de cookies en ORVAN
            </h2>

            <p>
              Esta versión académica de ORVAN contempla el uso de
              almacenamiento local del navegador para recordar
              determinadas preferencias, como la elección realizada
              en el aviso de cookies.
            </p>

            <p className="mt-3">
              El almacenamiento local no es técnicamente una cookie,
              aunque cumple una función similar de persistencia
              de información en el dispositivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Tipos de almacenamiento
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">
                  Almacenamiento necesario
                </h3>
                <p className="mt-1">
                  Puede utilizarse para recordar preferencias básicas
                  y permitir el funcionamiento de determinadas
                  características de la aplicación.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">
                  Almacenamiento de preferencias
                </h3>
                <p className="mt-1">
                  Permite recordar elecciones realizadas por el usuario,
                  como la aceptación o el rechazo del aviso de cookies.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">
                  Cookies analíticas o publicitarias
                </h3>
                <p className="mt-1">
                  Esta versión académica no declara utilizar herramientas
                  de publicidad ni seguimiento analítico de terceros.
                  Si se incorporaran en el futuro, deberían informarse
                  y configurarse de manera correspondiente.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Administración de preferencias
            </h2>

            <p>
              El usuario puede gestionar sus preferencias mediante
              el aviso de cookies disponible en el sitio, cuando
              esta funcionalidad se encuentre habilitada.
            </p>

            <p className="mt-3">
              También puede eliminar los datos almacenados desde
              la configuración de su navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Almacenamiento de terceros
            </h2>

            <p>
              Algunos recursos externos pueden tener sus propias
              tecnologías de almacenamiento. Su funcionamiento
              depende de las plataformas proveedoras y de la
              configuración del navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Modificaciones
            </h2>

            <p>
              Esta política podrá actualizarse si se incorporan
              nuevas funcionalidades, herramientas de análisis
              o servicios externos a la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Contacto
            </h2>

            <p>
              Para consultas sobre esta política podés comunicarte
              mediante el siguiente correo:
            </p>

            <a
              href="mailto:orvanstudio0@gmail.com"
              className="inline-block mt-3 text-[#60A5FA] hover:opacity-70 transition"
            >
              orvanstudio0@gmail.com
            </a>
          </section>

        </div>

        <div className="mt-14 pt-6 border-t border-gray-500/20 text-xs opacity-50">
          ORVAN · Estudio de Soluciones Informáticas
          <br />
          Proyecto académico ficticio · Universidad Católica de Salta
        </div>

      </div>
    </main>
  );
}
