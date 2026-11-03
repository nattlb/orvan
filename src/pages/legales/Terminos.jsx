
import { Link } from "react-router-dom";

export default function Terminos() {
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
            Términos y condiciones
          </h1>

          <p className="mt-5 opacity-60 text-sm">
            Última actualización: noviembre de 2026
          </p>
        </header>

        <div className="space-y-10 leading-relaxed opacity-80">

          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. Introducción
            </h2>

            <p>
              Bienvenido a ORVAN, un proyecto académico ficticio
              desarrollado con fines educativos y demostrativos.
              Su propósito es presentar una propuesta de estudio de
              soluciones informáticas orientado al desarrollo web,
              gestión de bases de datos, seguridad informática y
              asesoramiento tecnológico.
            </p>

            <p className="mt-3">
              El acceso y la navegación por este sitio implican la
              aceptación de las condiciones descritas en este documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Uso del sitio web
            </h2>

            <p>
              El usuario se compromete a utilizar el sitio de manera
              responsable, respetando la legislación aplicable y los
              derechos de terceros.
            </p>

            <p className="mt-3">
              Queda prohibido utilizar la plataforma para realizar
              actividades fraudulentas, distribuir contenido malicioso,
              intentar acceder sin autorización a sistemas o interferir
              con el funcionamiento del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Registro y cuentas de usuario
            </h2>

            <p>
              Algunas funcionalidades pueden requerir la creación de
              una cuenta. El usuario deberá proporcionar información
              correcta y mantener la confidencialidad de sus credenciales.
            </p>

            <p className="mt-3">
              Cada usuario es responsable de las actividades realizadas
              desde su cuenta. En caso de detectar un acceso no autorizado,
              deberá comunicarlo mediante los canales de contacto
              disponibles en el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Servicios y solicitudes
            </h2>

            <p>
              ORVAN presenta servicios ficticios relacionados con:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Desarrollo de sitios y sistemas web.</li>
              <li>Diseño de interfaces y soluciones digitales.</li>
              <li>Diseño y administración de bases de datos.</li>
              <li>Asesoría técnica y seguridad informática.</li>
            </ul>

            <p className="mt-3">
              Las solicitudes enviadas mediante formularios tienen
              carácter demostrativo. En un escenario comercial real,
              cualquier contratación requeriría una propuesta formal,
              alcance definido, presupuesto y aceptación expresa
              de las partes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Propiedad intelectual
            </h2>

            <p>
              Los elementos visuales, textos, diseños, identidad gráfica
              y demás contenidos presentados en este sitio forman parte
              de la propuesta académica de ORVAN o se utilizan con fines
              demostrativos.
            </p>

            <p className="mt-3">
              No se autoriza su reproducción o distribución como si
              fueran materiales propios de terceros sin la correspondiente
              autorización de sus titulares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Responsabilidad y disponibilidad
            </h2>

            <p>
              Debido a su naturaleza académica, el sitio puede presentar
              modificaciones, interrupciones o limitaciones técnicas.
              No se garantiza la disponibilidad permanente ni la ausencia
              de errores.
            </p>

            <p className="mt-3">
              La información publicada tiene fines informativos y no
              constituye una oferta comercial vinculante ni una garantía
              de prestación de servicios reales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Modificaciones
            </h2>

            <p>
              Estos términos pueden actualizarse para reflejar cambios
              en las funcionalidades, contenidos o características
              demostrativas de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Contacto
            </h2>

            <p>
              Para consultas relacionadas con el funcionamiento de
              este proyecto académico, podés comunicarte mediante:
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
