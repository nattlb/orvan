
import { Link } from "react-router-dom";

export default function Privacidad() {
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
            Política de privacidad
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
              En ORVAN valoramos la privacidad y la protección de los
              datos personales. Esta política describe cómo se contempla
              la recopilación, utilización, almacenamiento y protección
              de la información dentro de este proyecto académico
              ficticio.
            </p>

            <p className="mt-3">
              Este documento tiene fines demostrativos y no representa
              una política de privacidad de una empresa comercial
              efectivamente constituida.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Información que puede recopilarse
            </h2>

            <p>
              Según las funcionalidades utilizadas, la plataforma puede
              procesar los siguientes datos:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                Datos de registro: nombre, correo electrónico y
                contraseña almacenada mediante un mecanismo de hash.
              </li>
              <li>
                Datos de contacto: nombre, correo electrónico,
                tipo de consulta y mensaje enviado.
              </li>
              <li>
                Datos técnicos: registros de visitas y actividad
                necesaria para el funcionamiento de la aplicación.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Finalidad del tratamiento
            </h2>

            <p>
              En el contexto de la aplicación, los datos pueden utilizarse
              para:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Gestionar cuentas y permitir el inicio de sesión.</li>
              <li>Procesar y responder consultas de contacto.</li>
              <li>Administrar las funcionalidades internas del sistema.</li>
              <li>Registrar visitas y realizar pruebas de funcionamiento.</li>
              <li>Mejorar la experiencia de navegación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Almacenamiento y seguridad
            </h2>

            <p>
              El proyecto utiliza una base de datos para almacenar la
              información necesaria para sus funcionalidades.
              Las contraseñas se contemplan mediante almacenamiento
              cifrado por hash, evitando guardar las claves en texto
              plano.
            </p>

            <p className="mt-3">
              También se contemplan mecanismos de autenticación,
              control de acceso y validación de datos.
            </p>

            <p className="mt-3">
              Estas características forman parte de la implementación
              demostrativa y no constituyen una garantía de seguridad
              absoluta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Conservación de los datos
            </h2>

            <p>
              En una implementación real, la información debería
              conservarse únicamente durante el tiempo necesario
              para cumplir la finalidad para la que fue recopilada,
              considerando las obligaciones legales aplicables.
            </p>

            <p className="mt-3">
              En esta versión académica, los datos pueden permanecer
              almacenados mientras se utilice la base de datos
              de demostración.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Compartición de información
            </h2>

            <p>
              El proyecto no contempla la comercialización de datos
              personales. En el funcionamiento de demostración, la
              información puede utilizarse dentro de los módulos
              administrativos y técnicos de la aplicación.
            </p>

            <p className="mt-3">
              No se debe interpretar esta descripción como una
              garantía de que los datos nunca serán accesibles
              por terceros: ello depende de la configuración
              y el entorno donde se ejecute la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Derechos de los usuarios
            </h2>

            <p>
              En un servicio real, los titulares de los datos podrían
              ejercer los derechos de acceso, rectificación,
              actualización y supresión de su información, de acuerdo
              con la normativa aplicable.
            </p>

            <p className="mt-3">
              Para el contexto demostrativo del proyecto, las consultas
              pueden dirigirse al correo institucional indicado al final
              de esta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Enlaces externos
            </h2>

            <p>
              El sitio puede incluir enlaces a plataformas o servicios
              externos. ORVAN no controla sus políticas de privacidad
              ni sus prácticas de tratamiento de datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Actualizaciones
            </h2>

            <p>
              Esta política puede modificarse para reflejar cambios
              en las funcionalidades o características del proyecto.
              La fecha de actualización se indicará al comienzo
              del documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Contacto
            </h2>

            <p>
              Para consultas relacionadas con la privacidad dentro
              de este proyecto académico, podés escribir a:
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
