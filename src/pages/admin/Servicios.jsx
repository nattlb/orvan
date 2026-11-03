
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';

const VACIO = {
  titulo: '',
  titulo_en: '',
  descripcion: '',
  descripcion_en: '',
};

const validarForm = (v) => {
  const e = {};

  const t = v.titulo.trim().length;
  const d = v.descripcion.trim().length;

  if (t < 3 || t > 100) {
    e.titulo = 'El título debe tener entre 3 y 100 caracteres.';
  }

  if (d < 10 || d > 500) {
    e.descripcion = 'La descripción debe tener entre 10 y 500 caracteres.';
  }

  if (v.titulo_en.trim().length > 100) {
    e.titulo_en = 'El título en inglés no puede superar los 100 caracteres.';
  }

  if (v.descripcion_en.trim().length > 500) {
    e.descripcion_en = 'La descripción en inglés no puede superar los 500 caracteres.';
  }

  return e;
};

// ---------- FORMULARIO ----------

function Formulario({ servicio, alGuardar, alCancelar }) {
  const editando = Boolean(servicio);

  const [v, setV] = useState(
    editando
      ? {
          titulo: servicio.titulo || '',
          titulo_en: servicio.titulo_en || '',
          descripcion: servicio.descripcion || '',
          descripcion_en: servicio.descripcion_en || '',
        }
      : VACIO
  );

  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

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

  const enviar = async (e) => {
    e.preventDefault();

    const errs = validarForm(v);
    setErrores(errs);

    if (Object.keys(errs).length > 0) return;

    setEnviando(true);
    setErrorServidor('');

    try {
      await api(
        editando
          ? `/admin/servicios/${servicio.id}`
          : '/admin/servicios',
        {
          metodo: editando ? 'PUT' : 'POST',
          cuerpo: {
            titulo: v.titulo.trim(),
            titulo_en: v.titulo_en.trim(),
            descripcion: v.descripcion.trim(),
            descripcion_en: v.descripcion_en.trim(),
          },
        }
      );

      alGuardar(
        editando
          ? 'Servicio actualizado.'
          : 'Servicio creado.'
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
        {editando ? 'Editar servicio' : 'Nuevo servicio'}
      </h3>

      <h4 className="text-sm font-semibold text-[#60A5FA]">
        Contenido en español
      </h4>

      <div>
        <input
          className={clase('titulo')}
          name="titulo"
          placeholder="Título del servicio en español"
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
          rows="3"
          placeholder="Qué incluye el servicio"
          maxLength={500}
          value={v.descripcion}
          onChange={cambiar}
          aria-invalid={!!errores.descripcion}
        />

        <p className="text-xs opacity-60 text-right mt-1">
          {v.descripcion.length}/500
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
            placeholder="Service title in English"
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
            rows="3"
            placeholder="Service description in English"
            maxLength={500}
            value={v.descripcion_en}
            onChange={cambiar}
            aria-invalid={!!errores.descripcion_en}
          />

          <p className="text-xs opacity-60 text-right mt-1">
            {v.descripcion_en.length}/500
          </p>
          <p className="error">{errores.descripcion_en}</p>
        </div>
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
              : 'Crear servicio'}
        </button>
      </div>
    </form>
  );
}

// ---------- PANTALLA PRINCIPAL ----------

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [modo, setModo] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError('');

    api('/admin/servicios')
      .then((d) => setServicios(d.servicios))
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

  const eliminar = async (s) => {
    setError('');
    setAviso('');

    try {
      await api(`/admin/servicios/${s.id}`, {
        metodo: 'DELETE',
      });

      setConfirmar(null);
      setAviso(`El servicio "${s.titulo}" fue eliminado.`);

      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-light">
          Servicios ofrecidos
        </h2>

        {!modo && (
          <button
            className="btn btn-azul text-sm !py-2 !px-5"
            onClick={() => {
              setModo('nuevo');
              setAviso('');
            }}
          >
            Nuevo servicio
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
            servicio={modo === 'nuevo' ? null : modo}
            alGuardar={alGuardar}
            alCancelar={() => setModo(null)}
          />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {cargando && servicios.length === 0 && (
          <p className="opacity-70">Cargando servicios…</p>
        )}

        {!cargando && !error && servicios.length === 0 && (
          <p className="opacity-70">
            Todavía no hay servicios. Mientras tanto, la página muestra los de ejemplo.
          </p>
        )}

        {servicios.map((s) => (
          <article key={s.id} className="tarjeta !p-5">
            <h3 className="font-light text-lg break-words">
              {s.titulo}
            </h3>

            <p className="text-sm opacity-70 mt-2 break-words">
              {s.descripcion}
            </p>

            {s.titulo_en && (
              <p className="text-xs opacity-60 mt-3">
                Inglés: {s.titulo_en}
              </p>
            )}

            <div className="mt-4 flex items-center gap-4 flex-wrap">
              {confirmar === s.id ? (
                <>
                  <span className="text-xs opacity-70">
                    ¿Eliminar definitivamente?
                  </span>

                  <button
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => eliminar(s)}
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
                      setModo(s);
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
                    onClick={() => setConfirmar(s.id)}
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
