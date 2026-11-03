
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';

const VACIO = {
  nombre: '',
  especialidad: '',
  especialidad_en: '',
  descripcion: '',
  descripcion_en: '',
  orden: 1,
  activo: true,
};

function Formulario({ integrante, alGuardar, alCancelar }) {
  const editando = Boolean(integrante);

  const [v, setV] = useState(
    editando
      ? {
          nombre: integrante.nombre || '',
          especialidad: integrante.especialidad || '',
          especialidad_en: integrante.especialidad_en || '',
          descripcion: integrante.descripcion || '',
          descripcion_en: integrante.descripcion_en || '',
          orden: integrante.orden,
          activo: Boolean(integrante.activo),
        }
      : { ...VACIO }
  );

  const [imagen, setImagen] = useState(null);
  const [quitarImagen, setQuitarImagen] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;

    setV((x) => ({
      ...x,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError('');

    if (v.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (v.especialidad.trim().length < 3) {
      setError('La especialidad debe tener al menos 3 caracteres.');
      return;
    }

    if (v.descripcion.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    if (v.especialidad_en.trim().length > 100) {
      setError('La especialidad en inglés no puede superar los 100 caracteres.');
      return;
    }

    if (v.descripcion_en.trim().length > 1000) {
      setError('La descripción en inglés no puede superar los 1000 caracteres.');
      return;
    }

    const datos = new FormData();

    datos.append('nombre', v.nombre.trim());
    datos.append('especialidad', v.especialidad.trim());
    datos.append('especialidad_en', v.especialidad_en.trim());
    datos.append('descripcion', v.descripcion.trim());
    datos.append('descripcion_en', v.descripcion_en.trim());
    datos.append('orden', v.orden);
    datos.append('activo', v.activo);

    if (imagen) datos.append('imagen', imagen);
    if (quitarImagen) datos.append('quitarImagen', 'true');

    setEnviando(true);

    try {
      await api(
        editando
          ? `/admin/equipo/${integrante.id}`
          : '/admin/equipo',
        {
          metodo: editando ? 'PUT' : 'POST',
          cuerpo: datos,
        }
      );

      alGuardar(
        editando
          ? 'Integrante actualizado correctamente.'
          : 'Integrante agregado correctamente.'
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="tarjeta space-y-4">
      <h3 className="text-xl font-light">
        {editando ? 'Editar integrante' : 'Nuevo integrante'}
      </h3>

      <h4 className="text-sm font-semibold text-[#60A5FA]">
        Contenido en español
      </h4>

      <div>
        <label className="block text-sm mb-2">Nombre completo</label>
        <input
          className="campo"
          name="nombre"
          placeholder="Nombre y apellido"
          value={v.nombre}
          onChange={cambiar}
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Especialidad</label>
        <input
          className="campo"
          name="especialidad"
          placeholder="Ej. Ciberseguridad"
          value={v.especialidad}
          onChange={cambiar}
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Descripción</label>
        <textarea
          className="campo"
          name="descripcion"
          rows="4"
          placeholder="Descripción del integrante"
          value={v.descripcion}
          onChange={cambiar}
          maxLength={1000}
        />
        <p className="text-xs opacity-60 text-right mt-1">
          {v.descripcion.length}/1000
        </p>
      </div>

      <div className="border-t border-gray-500/20 pt-4">
        <h4 className="text-sm font-semibold text-[#60A5FA] mb-3">
          English content (optional)
        </h4>

        <div className="mb-4">
          <label className="block text-sm mb-2">
            Speciality
          </label>
          <input
            className="campo"
            name="especialidad_en"
            placeholder="E.g. Cybersecurity"
            value={v.especialidad_en}
            onChange={cambiar}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Description
          </label>
          <textarea
            className="campo"
            name="descripcion_en"
            rows="4"
            placeholder="Description of the team member"
            value={v.descripcion_en}
            onChange={cambiar}
            maxLength={1000}
          />
          <p className="text-xs opacity-60 text-right mt-1">
            {v.descripcion_en.length}/1000
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-2">Orden de aparición</label>
        <input
          className="campo"
          type="number"
          name="orden"
          min="0"
          max="1000"
          value={v.orden}
          onChange={cambiar}
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Fotografía</label>
        <input
          className="campo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            setImagen(e.target.files[0] || null);
            setQuitarImagen(false);
          }}
        />
        <p className="text-xs opacity-60 mt-2">
          JPG, PNG o WEBP. Tamaño máximo: 2 MB.
        </p>

        {editando && (
          <label className="flex items-center gap-2 mt-3 text-sm">
            <input
              type="checkbox"
              checked={quitarImagen}
              onChange={(e) => setQuitarImagen(e.target.checked)}
            />
            Quitar fotografía actual
          </label>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="activo"
          checked={v.activo}
          onChange={cambiar}
        />
        Integrante activo
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
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
          {enviando ? 'Guardando…' : 'Guardar integrante'}
        </button>
      </div>
    </form>
  );
}

export default function Equipo() {
  const [integrantes, setIntegrantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [modo, setModo] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError('');

    api('/admin/equipo')
      .then((d) => setIntegrantes(d.integrantes || []))
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

  const eliminar = async (integrante) => {
    setError('');

    try {
      await api(`/admin/equipo/${integrante.id}`, {
        metodo: 'DELETE',
      });

      setConfirmar(null);
      setAviso(`Se eliminó a ${integrante.nombre}.`);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-light">Nuestro equipo</h2>
          <p className="text-sm opacity-60 mt-2">
            Administrá los integrantes y sus especialidades.
          </p>
        </div>

        {!modo && (
          <button
            className="btn btn-azul text-sm !py-2 !px-5"
            onClick={() => {
              setModo('nuevo');
              setAviso('');
              setError('');
            }}
          >
            Nuevo integrante
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
            integrante={modo === 'nuevo' ? null : modo}
            alGuardar={alGuardar}
            alCancelar={() => setModo(null)}
          />
        </div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 gap-5">
        {cargando && integrantes.length === 0 && (
          <p className="opacity-70">Cargando integrantes…</p>
        )}

        {!cargando && integrantes.length === 0 && !error && (
          <p className="opacity-70">
            Todavía no hay integrantes registrados.
          </p>
        )}

        {integrantes.map((m) => (
          <article key={m.id} className="tarjeta !p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-light text-lg break-words">
                  {m.nombre}
                </h3>
                <p className="text-sm text-[#60A5FA] mt-1">
                  {m.especialidad}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  m.activo
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-gray-500/10 opacity-60'
                }`}
              >
                {m.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <p className="text-sm opacity-70 mt-4 break-words">
              {m.descripcion}
            </p>

            <p className="text-xs opacity-50 mt-4">
              Orden de aparición: {m.orden}
            </p>

            <div className="mt-5 flex items-center gap-4 flex-wrap">
              {confirmar === m.id ? (
                <>
                  <span className="text-xs opacity-70">
                    ¿Eliminar definitivamente?
                  </span>
                  <button
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => eliminar(m)}
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
                      setModo(m);
                      setAviso('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Editar
                  </button>

                  <button
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => setConfirmar(m.id)}
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
