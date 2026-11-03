
import { Link } from "react-router-dom";

export default function AvisoLegal() {
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
            Aviso legal
          </h1>

          <p className="mt-5 opacity-60 text-sm">
            Última actualización: noviembre de 2026
          </p>
        </header>

        <div className="space-y-10 leading-relaxed opacity-80">

          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. Identificación del proyecto
            </h2>

            <p>
              ORVAN es una propuesta ficticia de estudio de soluciones
              informáticas desarrollada en el marco de un proyecto
              académico de la asignatura Lenguajes 4, perteneciente
              a la Universidad Católica de Salta.
            </p>

            <p className="mt-3">
              La plataforma tiene como finalidad demostrar conocimientos
              de desarrollo web, administración de bases de datos,
              autenticación de usuarios y gestión de contenidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Naturaleza académica
            </h2>

            <p>
              El sitio no representa necesariamente una empresa
              legalmente constituida ni una organización comercial
              en funcionamiento.
            </p>

            <p className="mt-3">
              Los servicios, proyectos, perfiles y demás contenidos
              pueden ser ficticios y se presentan exclusivamente
              con fines educativos y demostrativos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Contenido y exactitud
            </h2>

            <p>
              La información publicada tiene carácter ilustrativo.
              Aunque se procura mantener la coherencia y claridad
              de los contenidos, no se garantiza que toda la
              información esté permanentemente actualizada o libre
              de errores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Responsabilidad
            </h2>

            <p>
              La plataforma se proporciona como una demostración
              académica. No se garantiza su disponibilidad continua,
              funcionamiento ininterrumpido ni adecuación para
              operaciones comerciales reales.
            </p>

            <p className="mt-3">
              El usuario debe evitar introducir información personal,
              confidencial o sensible en un entorno de demostración
              que no haya sido preparado para su tratamiento real.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Enlaces externos
            </h2>

            <p>
              El sitio puede contener enlaces a páginas externas.
              ORVAN no administra esos sitios ni se responsabiliza
              por sus contenidos, disponibilidad o políticas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Legislación y jurisdicción
            </h2>

            <p>
              Para una eventual implementación comercial, las
              condiciones legales y la jurisdicción aplicable
              deberían definirse de acuerdo con la actividad,
              ubicación y naturaleza jurídica de la entidad
              responsable.
            </p>

            <p className="mt-3">
              Esta sección es descriptiva y no establece por sí
              misma una jurisdicción contractual efectiva.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Contacto institucional
            </h2>

            <p>
              Para consultas relacionadas con el proyecto académico,
              podés comunicarte mediante:
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
