
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';

const VACIO = {
  titulo: '',
  titulo_en: '',
  descripcion: '',
  descripcion_en: '',
  tecnologias: '',
  url_demo: '',
};

const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

// ---------- Validaciones ----------

const validarArchivo = (f) => {
  if (!f) return '';

  if (!TIPOS_OK.includes(f.type)) {
    return 'Solo se permiten imágenes JPG, PNG o WEBP.';
  }

  if (f.size > MAX_BYTES) {
    return 'La imagen no puede superar los 2 MB.';
  }

  return '';
};

const validarForm = (v, archivo) => {
  const e = {};

  const t = v.titulo.trim().length;
  const d = v.descripcion.trim().length;

  if (t < 3 || t > 100) {
    e.titulo = 'El título debe tener entre 3 y 100 caracteres.';
  }

  if (d < 10 || d > 1000) {
    e.descripcion = 'La descripción debe tener entre 10 y 1000 caracteres.';
  }

  if (v.titulo_en.trim().length > 100) {
    e.titulo_en = 'El título en inglés no puede superar los 100 caracteres.';
  }

  if (v.descripcion_en.trim().length > 1000) {
    e.descripcion_en = 'La descripción en inglés no puede superar los 1000 caracteres.';
  }

  if (v.tecnologias.length > 200) {
    e.tecnologias = 'Las tecnologías no pueden superar los 200 caracteres.';
  }

  if (
    v.url_demo.trim() &&
    !/^https?:\/\/\S+$/i.test(v.url_demo.trim())
  ) {
    e.url_demo = 'La URL de la demo debe empezar con http:// o https://';
  }

  const ea = validarArchivo(archivo);

  if (ea) {
    e.imagen = ea;
  }

  return e;
};

// ---------- Formulario para crear y editar ----------

function Formulario({ proyecto, alGuardar, alCancelar }) {
  const editando = Boolean(proyecto);

  const [v, setV] = useState(
    editando
      ? {
          titulo: proyecto.titulo || '',
          titulo_en: proyecto.titulo_en || '',
          descripcion: proyecto.descripcion || '',
          descripcion_en: proyecto.descripcion_en || '',
          tecnologias: proyecto.tecnologias || '',
          url_demo: proyecto.url_demo || '',
        }
      : VACIO
  );

  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(proyecto?.imagen || '');
  const [quitar, setQuitar] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    return () => {
      if (vista.startsWith('blob:')) {
        URL.revokeObjectURL(vista);
      }
    };
  }, [vista]);

  const cambiar = (e) => {
    const { name, value } = e.target;

    setV((x) => ({
      ...x,
      [name]: value,
    }));

    if (errores[name]) {
      setErrores((er) => ({
        ...er,
        [name]: '',
      }));
    }
  };

  const elegirImagen = (e) => {
    const f = e.target.files[0] || null;
    const msg = validarArchivo(f);

    setArchivo(msg ? null : f);
    setQuitar(false);

    setErrores((er) => ({
      ...er,
      imagen: msg,
    }));

    setVista(
      f && !msg
        ? URL.createObjectURL(f)
        : proyecto?.imagen || ''
    );

    if (msg) {
      e.target.value = '';
    }
  };

  const enviar = async (e) => {
    e.preventDefault();

    const errs = validarForm(v, archivo);

    setErrores(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    const fd = new FormData();

    fd.append('titulo', v.titulo.trim());
    fd.append('titulo_en', v.titulo_en.trim());
    fd.append('descripcion', v.descripcion.trim());
    fd.append('descripcion_en', v.descripcion_en.trim());
    fd.append('tecnologias', v.tecnologias.trim());
    fd.append('url_demo', v.url_demo.trim());

    if (archivo) {
      fd.append('imagen', archivo);
    }

    if (quitar && !archivo) {
      fd.append('quitarImagen', 'true');
    }

    setEnviando(true);
    setErrorServidor('');

    try {
      await api(
        editando
          ? `/admin/proyectos/${proyecto.id}`
          : '/admin/proyectos',
        {
          metodo: editando ? 'PUT' : 'POST',
          cuerpo: fd,
        }
      );

      alGuardar(
        editando
          ? 'Proyecto actualizado.'
          : 'Proyecto creado.'
      );
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const clase = (c) => `campo ${errores[c] ? 'mal' : ''}`;

  return (
    <form onSubmit={enviar} noValidate className="tarjeta space-y-4">
      <h3 className="text-xl font-light">
        {editando ? 'Editar proyecto' : 'Nuevo proyecto'}
      </h3>

      <h4 className="text-sm font-semibold text-[#60A5FA]">
        Contenido en español
      </h4>

      <div>
        <input
          className={clase('titulo')}
          name="titulo"
          placeholder="Título en español"
          maxLength={100}
          value={v.titulo}
          onChange={cambiar}
          aria-invalid={!!errores.titulo}
        />
        <p className="error">{errores.titulo}</p>
      </div>

      <div>
        <textarea
          className={clase('descripcion')}
          name="descripcion"
          rows="4"
          placeholder="Descripción del proyecto en español"
          maxLength={1000}
          value={v.descripcion}
          onChange={cambiar}
          aria-invalid={!!errores.descripcion}
        />

        <p className="text-xs opacity-60 text-right mt-1">
          {v.descripcion.length}/1000
        </p>
        <p className="error">{errores.descripcion}</p>
      </div>

      <div className="border-t border-gray-500/20 pt-4">
        <h4 className="text-sm font-semibold text-[#60A5FA] mb-3">
          English content (optional)
        </h4>

        <div className="mb-4">
          <input
            className={clase('titulo_en')}
            name="titulo_en"
            placeholder="Project title in English"
            maxLength={100}
            value={v.titulo_en}
            onChange={cambiar}
            aria-invalid={!!errores.titulo_en}
          />
          <p className="error">{errores.titulo_en}</p>
        </div>

        <div>
          <textarea
            className={clase('descripcion_en')}
            name="descripcion_en"
            rows="4"
            placeholder="Project description in English"
            maxLength={1000}
            value={v.descripcion_en}
            onChange={cambiar}
            aria-invalid={!!errores.descripcion_en}
          />

          <p className="text-xs opacity-60 text-right mt-1">
            {v.descripcion_en.length}/1000
          </p>
          <p className="error">{errores.descripcion_en}</p>
        </div>
      </div>

      <div>
        <input
          className={clase('tecnologias')}
          name="tecnologias"
          placeholder="Tecnologías separadas por coma (React, Node.js, MySQL)"
          maxLength={200}
          value={v.tecnologias}
          onChange={cambiar}
        />
        <p className="error">{errores.tecnologias}</p>
      </div>

      <div>
        <input
          className={clase('url_demo')}
          name="url_demo"
          placeholder="Link de la demo (opcional, https://…)"
          maxLength={255}
          value={v.url_demo}
          onChange={cambiar}
          aria-invalid={!!errores.url_demo}
        />
        <p className="error">{errores.url_demo}</p>
      </div>

      <div>
        <label
          className="text-sm opacity-80"
          htmlFor="imagen-proyecto"
        >
          Imagen (JPG, PNG o WEBP, máximo 2 MB)
        </label>

        <input
          id="imagen-proyecto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block mt-2 text-sm w-full"
          onChange={elegirImagen}
        />

        <p className="error">{errores.imagen}</p>

        {vista && !quitar && (
          <img
            src={vista}
            alt="Vista previa de la imagen del proyecto"
            className="mt-3 h-32 rounded-xl object-cover"
          />
        )}

        {editando && proyecto.imagen && !archivo && (
          <label className="flex items-center gap-2 mt-3 text-sm opacity-80">
            <input
              type="checkbox"
              checked={quitar}
              onChange={(e) => setQuitar(e.target.checked)}
            />
            Quitar la imagen actual
          </label>
        )}
      </div>

      {errorServidor && (
        <p className="error" role="alert">
          {errorServidor}
        </p>
      )}

      <div className="flex gap-3 justify-end flex-wrap">
        <button
          type="button"
          className="btn btn-borde text-sm !py-2 !px-6"
          onClick={alCancelar}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn btn-azul text-sm !py-2 !px-6"
          disabled={enviando}
        >
          {enviando
            ? 'Guardando…'
            : editando
              ? 'Guardar cambios'
              : 'Crear proyecto'}
        </button>
      </div>
    </form>
  );
}

// ---------- Pantalla principal ----------

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [modo, setModo] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError('');

    api('/admin/proyectos')
      .then((d) => setProyectos(d.proyectos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alGuardar = (mensaje) => {
    setModo(null);
    setAviso(mensaje);
    cargar();
  };

  const eliminar = async (p) => {
    setError('');
    setAviso('');

    try {
      await api(`/admin/proyectos/${p.id}`, {
        metodo: 'DELETE',
      });

      setConfirmar(null);
      setAviso(`El proyecto "${p.titulo}" fue eliminado.`);

      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-light">
          Proyectos y demos
        </h2>

        {!modo && (
          <button
            className="btn btn-azul text-sm !py-2 !px-5"
            onClick={() => {
              setModo('nuevo');
              setAviso('');
            }}
          >
            Nuevo proyecto
          </button>
        )}
      </div>

      {aviso && (
        <p className="mt-5 text-sm text-[#60A5FA]" role="status">
          {aviso}
        </p>
      )}

      {error && (
        <p className="error mt-5" role="alert">
          {error}
        </p>
      )}

      {modo && (
        <div className="mt-6">
          <Formulario
            key={modo === 'nuevo' ? 'nuevo' : modo.id}
            proyecto={modo === 'nuevo' ? null : modo}
            alGuardar={alGuardar}
            alCancelar={() => setModo(null)}
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5 mt-6">
        {cargando && proyectos.length === 0 && (
          <p className="opacity-70">Cargando proyectos…</p>
        )}

        {!cargando && !error && proyectos.length === 0 && (
          <p className="opacity-70">
            Todavía no hay proyectos. Creá el primero con "Nuevo proyecto".
          </p>
        )}

        {proyectos.map((p) => (
          <article key={p.id} className="tarjeta flex flex-col">
            {p.imagen ? (
              <img
                src={p.imagen}
                alt={`Imagen del proyecto ${p.titulo}`}
                loading="lazy"
                className="h-32 w-full object-cover rounded-xl mb-4"
              />
            ) : (
              <div className="h-32 rounded-xl mb-4 grid place-items-center text-xs opacity-60 bg-gray-500/10">
                Sin imagen
              </div>
            )}

            <h3 className="font-light text-lg break-words">
              {p.titulo}
            </h3>

            <p className="text-sm opacity-70 mt-2 line-clamp-3 break-words">
              {p.descripcion}
            </p>

            {p.titulo_en && (
              <p className="text-xs opacity-60 mt-2">
                Inglés: {p.titulo_en}
              </p>
            )}

            {p.tecnologias && (
              <p className="text-xs text-[#60A5FA] mt-3 break-words">
                {p.tecnologias}
              </p>
            )}

            {p.url_demo && (
              <a
                href={p.url_demo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mt-2 underline break-all"
              >
                {p.url_demo}
              </a>
            )}

            <div className="mt-auto pt-4 flex items-center gap-4 flex-wrap">
              {confirmar === p.id ? (
                <>
                  <span className="text-xs opacity-70">
                    ¿Eliminar definitivamente?
                  </span>

                  <button
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => eliminar(p)}
                  >
                    Sí, eliminar
                  </button>

                  <button
                    className="text-sm opacity-70 hover:underline"
                    onClick={() => setConfirmar(null)}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="text-sm text-[#60A5FA] hover:underline"
                    onClick={() => {
                      setModo(p);
                      setAviso('');
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      });
                    }}
                  >
                    Editar
                  </button>

                  <button
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => setConfirmar(p.id)}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
