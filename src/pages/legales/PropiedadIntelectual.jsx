
import { Link } from "react-router-dom";

export default function PropiedadIntelectual() {
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
            Propiedad intelectual
          </h1>

          <p className="mt-5 opacity-60 text-sm">
            Última actualización: noviembre de 2026
          </p>
        </header>

        <div className="space-y-10 leading-relaxed opacity-80">

          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. Identidad de ORVAN
            </h2>

            <p>
              ORVAN es un proyecto académico ficticio desarrollado
              como propuesta de estudio de soluciones informáticas.
              Su identidad visual, nombre, presentación y contenidos
              forman parte de una experiencia educativa y demostrativa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Contenidos del sitio
            </h2>

            <p>
              Los textos, diseños de interfaz, elementos gráficos,
              estructura de navegación y desarrollos informáticos
              creados específicamente para este proyecto se consideran
              parte de su material académico.
            </p>

            <p className="mt-3">
              Los materiales de terceros que pudieran utilizarse
              conservan los derechos y condiciones de sus respectivos
              titulares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Uso de los contenidos
            </h2>

            <p>
              Los contenidos del proyecto no deben reproducirse,
              distribuirse, modificarse o presentarse como propios
              de terceros sin contar con las autorizaciones
              correspondientes.
            </p>

            <p className="mt-3">
              Su utilización con fines educativos o de referencia
              debe respetar las licencias aplicables y reconocer
              la autoría cuando corresponda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Software y tecnologías
            </h2>

            <p>
              El desarrollo de ORVAN utiliza tecnologías y herramientas
              informáticas de terceros, entre ellas bibliotecas,
              frameworks y recursos de software.
            </p>

            <p className="mt-3">
              Cada tecnología conserva sus propias licencias,
              condiciones de uso y derechos de autor. La utilización
              de dichas herramientas no implica que ORVAN sea
              propietario de ellas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Marcas y nombres comerciales
            </h2>

            <p>
              Los nombres, marcas y logotipos de terceros mencionados
              o representados en el sitio pertenecen a sus respectivos
              titulares y se incluyen únicamente cuando corresponde
              a fines informativos o demostrativos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Proyectos y trabajos de demostración
            </h2>

            <p>
              Los proyectos, imágenes y ejemplos publicados en ORVAN
              pueden ser representaciones ficticias destinadas a
              demostrar capacidades de diseño y desarrollo.
            </p>

            <p className="mt-3">
              Su publicación no implica necesariamente la existencia
              de clientes, contratos o relaciones comerciales reales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Consultas
            </h2>

            <p>
              Para consultas relacionadas con los contenidos y
              materiales presentados en este proyecto, podés
              comunicarte mediante:
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
