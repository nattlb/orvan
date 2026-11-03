
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-500/20 px-6 py-12">

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">

        {/* Identidad */}
        <div>
          <span className="titulo tracking-[.3em] text-lg">
            ORVAN
          </span>

          <p className="mt-4 opacity-60 leading-relaxed">
            Estudio de soluciones informáticas.
            Desarrollo web, bases de datos,
            seguridad y asesoría tecnológica.
          </p>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-semibold tracking-wide mb-4">
            Contacto
          </h3>

          <a
            href="mailto:orvanstudio0@gmail.com"
            className="inline-flex items-center gap-2 text-[#60A5FA] hover:opacity-70 transition"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>

            orvanstudio0@gmail.com
          </a>
        </div>

        {/* Información legal */}
        <div>
          <h3 className="font-semibold tracking-wide mb-4">
            Información legal
          </h3>

          <ul className="space-y-3 opacity-70">
            <li>
              <Link to="/terminos" className="hover:text-[#60A5FA] transition">
                Términos y condiciones
              </Link>
            </li>

            <li>
              <Link to="/privacidad" className="hover:text-[#60A5FA] transition">
                Política de privacidad
              </Link>
            </li>

            <li>
              <Link to="/cookies" className="hover:text-[#60A5FA] transition">
                Política de cookies
              </Link>
            </li>

            <li>
              <Link to="/propiedad-intelectual" className="hover:text-[#60A5FA] transition">
                Propiedad intelectual
              </Link>
            </li>

            <li>
              <Link to="/aviso-legal" className="hover:text-[#60A5FA] transition">
                Aviso legal
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-500/20 text-center text-xs opacity-60">

        <p>
          Lenguajes 4 | Universidad Católica de Salta
        </p>

        <p className="mt-3">
          © {new Date().getFullYear()} ORVAN. Todos los derechos reservados.
        </p>

        <p className="mt-2">
          Proyecto académico ficticio con fines demostrativos.
        </p>

      </div>

    </footer>
  );
}
