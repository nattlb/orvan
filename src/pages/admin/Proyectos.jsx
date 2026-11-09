
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';

// ==================== CONFIGURACIÓN ====================

const VACIO = {
  titulo: '',
  descripcion: '',
  objetivo: '',
  caracteristicas: '',
  tecnologias: '',
  url_demo: '',
  url_repositorio: '',
};

const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_GALERIA = 15;

// ==================== VALIDACIONES ====================

function validarArchivo(archivo) {
  if (!archivo) return '';

  if (!TIPOS_OK.includes(archivo.type)) {
    return 'Solo se permiten imágenes JPG, PNG o WEBP.';
  }

  if (archivo.size > MAX_BYTES) {
    return 'Cada imagen puede pesar como máximo 2 MB.';
  }

  return '';
}

function validarUrl(url) {
  if (!url.trim()) return true;

  try {
    const direccion = new URL(url.trim());
    return ['http:', 'https:'].includes(direccion.protocol);
  } catch {
    return false;
  }
}

function validarForm(v, archivo, galeria, cantidadActual) {
  const errores = {};

  const titulo = v.titulo.trim().length;
  const descripcion = v.descripcion.trim().length;

  if (titulo < 3 || titulo > 100) {
    errores.titulo = 'El título debe tener entre 3 y 100 caracteres.';
  }

  if (descripcion < 10 || descripcion > 1000) {
    errores.descripcion =
      'La descripción debe tener entre 10 y 1000 caracteres.';
  }

  if (v.objetivo.length > 3000) {
    errores.objetivo = 'El objetivo no puede superar los 3000 caracteres.';
  }

  if (v.caracteristicas.length > 5000) {
    errores.caracteristicas =
      'Las características no pueden superar los 5000 caracteres.';
  }

  if (v.tecnologias.length > 200) {
    errores.tecnologias =
      'Las tecnologías no pueden superar los 200 caracteres.';
  }

  if (!validarUrl(v.url_demo)) {
    errores.url_demo = 'Ingresá una URL válida con http:// o https://';
  }

  if (v.url_demo.length > 255) {
    errores.url_demo = 'La URL no puede superar los 255 caracteres.';
  }

  if (!validarUrl(v.url_repositorio)) {
    errores.url_repositorio =
      'Ingresá una URL válida con http:// o https://';
  }

  if (v.url_repositorio.length > 255) {
    errores.url_repositorio =
      'La URL no puede superar los 255 caracteres.';
  }

  const errorPrincipal = validarArchivo(archivo);

  if (errorPrincipal) {
    errores.imagen = errorPrincipal;
  }

  if (cantidadActual + galeria.length > MAX_GALERIA) {
    errores.galeria =
      'Un proyecto puede tener como máximo 15 imágenes adicionales.';
  }

  for (const imagen of galeria) {
    const error = validarArchivo(imagen);

    if (error) {
      errores.galeria = error;
      break;
    }
  }

  return errores;
}

// ==================== FORMULARIO ====================

function Formulario({ proyecto, alGuardar, alCancelar }) {
  const editando = Boolean(proyecto);

  const [v, setV] = useState(
    editando
      ? {
          titulo: proyecto.titulo || '',
          descripcion: proyecto.descripcion || '',
          objetivo: proyecto.objetivo || '',
          caracteristicas: proyecto.caracteristicas || '',
          tecnologias: proyecto.tecnologias || '',
          url_demo: proyecto.url_demo || '',
          url_repositorio: proyecto.url_repositorio || '',
        }
      : { ...VACIO }
  );

  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(proyecto?.imagen || '');
  const [quitar, setQuitar] = useState(false);

  const [galeria, setGaleria] = useState([]);
  const [imagenesEliminar, setImagenesEliminar] = useState([]);

  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const imagenesActuales = Array.isArray(proyecto?.imagenes)
    ? proyecto.imagenes
    : [];

  const imagenesConservadas = imagenesActuales.filter(
    (item) => !imagenesEliminar.includes(item.id)
  );

  // Vista previa de la imagen principal
  useEffect(() => {
    if (!archivo) {
      setVista(quitar ? '' : proyecto?.imagen || '');
      return;
    }

    const url = URL.createObjectURL(archivo);
    setVista(url);

    return () => URL.revokeObjectURL(url);
  }, [archivo, quitar, proyecto]);

  // Vista previa de las imágenes nuevas
  const [vistasGaleria, setVistasGaleria] = useState([]);

  useEffect(() => {
    const urls = galeria.map((imagen) => URL.createObjectURL(imagen));
    setVistasGaleria(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galeria]);

  function cambiar(e) {
    const { name, value } = e.target;

    setV((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setErrores((anterior) => ({
      ...anterior,
      [name]: '',
    }));
  }

  function elegirImagen(e) {
    const seleccionado = e.target.files?.[0] || null;
    const error = validarArchivo(seleccionado);

    if (error) {
      setErrores((anterior) => ({
        ...anterior,
        imagen: error,
      }));

      e.target.value = '';
      return;
    }

    setArchivo(seleccionado);
    setQuitar(false);

    setErrores((anterior) => ({
      ...anterior,
      imagen: '',
    }));
  }

  function elegirGaleria(e) {
    const seleccionadas = Array.from(e.target.files || []);

    if (!seleccionadas.length) return;

    const total =
      imagenesConservadas.length +
      galeria.length +
      seleccionadas.length;

    if (total > MAX_GALERIA) {
      setErrores((anterior) => ({
        ...anterior,
        galeria:
          'Solo podés tener hasta 15 imágenes adicionales por proyecto.',
      }));

      e.target.value = '';
      return;
    }

    for (const imagen of seleccionadas) {
      const error = validarArchivo(imagen);

      if (error) {
        setErrores((anterior) => ({
          ...anterior,
          galeria: error,
        }));

        e.target.value = '';
        return;
      }
    }

    setGaleria((anterior) => [
      ...anterior,
      ...seleccionadas,
    ]);

    setErrores((anterior) => ({
      ...anterior,
      galeria: '',
    }));

    e.target.value = '';
  }

  function quitarNuevaImagen(indice) {
    setGaleria((anterior) =>
      anterior.filter((_, i) => i !== indice)
    );
  }

  function marcarImagenEliminar(id) {
    setImagenesEliminar((anterior) =>
      anterior.includes(id)
        ? anterior.filter((item) => item !== id)
        : [...anterior, id]
    );

    setErrores((anterior) => ({
      ...anterior,
      galeria: '',
    }));
  }

  async function enviar(e) {
    e.preventDefault();

    if (enviando) return;

    const errs = validarForm(
      v,
      archivo,
      galeria,
      imagenesConservadas.length
    );

    setErrores(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    const fd = new FormData();

    fd.append('titulo', v.titulo.trim());
    fd.append('descripcion', v.descripcion.trim());
    fd.append('objetivo', v.objetivo.trim());
    fd.append('caracteristicas', v.caracteristicas.trim());
    fd.append('tecnologias', v.tecnologias.trim());
    fd.append('url_demo', v.url_demo.trim());
    fd.append('url_repositorio', v.url_repositorio.trim());

    // Campos existentes para compatibilidad
    fd.append('titulo_en', '');
    fd.append('descripcion_en', '');

    if (archivo) {
      fd.append('imagen', archivo);
    }

    if (quitar && !archivo) {
      fd.append('quitarImagen', 'true');
    }

    for (const imagen of galeria) {
      fd.append('galeria', imagen);
    }

    if (imagenesEliminar.length > 0) {
      fd.append(
        'imagenesEliminar',
        JSON.stringify(imagenesEliminar)
      );
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
          ? 'Proyecto actualizado correctamente.'
          : 'Proyecto creado correctamente.'
      );
    } catch (error) {
      setErrorServidor(
        error.message || 'No se pudo guardar el proyecto.'
      );
    } finally {
      setEnviando(false);
    }
  }

  const clase = (campo) =>
    `campo ${errores[campo] ? 'mal' : ''}`;

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="tarjeta space-y-4"
    >
      <h3 className="text-xl font-light">
        {editando ? 'Editar proyecto' : 'Nuevo proyecto'}
      </h3>

      {/* TÍTULO */}
      <div>
        <label className="text-sm opacity-80">
          Título del proyecto
        </label>

        <input
          className={clase('titulo')}
          name="titulo"
          placeholder="Nombre del proyecto"
          maxLength={100}
          value={v.titulo}
          onChange={cambiar}
        />

        <p className="error">{errores.titulo}</p>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className="text-sm opacity-80">
          Descripción
        </label>

        <textarea
          className={clase('descripcion')}
          name="descripcion"
          rows={4}
          placeholder="Descripción general del proyecto"
          maxLength={1000}
          value={v.descripcion}
          onChange={cambiar}
        />

        <p className="text-xs opacity-60 text-right mt-1">
          {v.descripcion.length}/1000
        </p>

        <p className="error">{errores.descripcion}</p>
      </div>

      {/* OBJETIVO */}
      <div>
        <label className="text-sm opacity-80">
          Objetivo del proyecto
        </label>

        <textarea
          className={clase('objetivo')}
          name="objetivo"
          rows={3}
          placeholder="¿Qué busca resolver este proyecto?"
          maxLength={3000}
          value={v.objetivo}
          onChange={cambiar}
        />

        <p className="error">{errores.objetivo}</p>
      </div>

      {/* CARACTERÍSTICAS */}
      <div>
        <label className="text-sm opacity-80">
          Características principales
        </label>

        <textarea
          className={clase('caracteristicas')}
          name="caracteristicas"
          rows={5}
          placeholder={
            'Ejemplo:\nInicio de sesión\nPanel de administrador\nGestión de usuarios'
          }
          maxLength={5000}
          value={v.caracteristicas}
          onChange={cambiar}
        />

        <p className="text-xs opacity-60 mt-1">
          Escribí una característica por línea.
        </p>

        <p className="error">{errores.caracteristicas}</p>
      </div>

      {/* TECNOLOGÍAS */}
      <div>
        <label className="text-sm opacity-80">
          Tecnologías utilizadas
        </label>

        <input
          className={clase('tecnologias')}
          name="tecnologias"
          placeholder="React, Node.js, MySQL"
          maxLength={200}
          value={v.tecnologias}
          onChange={cambiar}
        />

        <p className="error">{errores.tecnologias}</p>
      </div>

      {/* DEMO */}
      <div>
        <label className="text-sm opacity-80">
          Enlace a la demo
        </label>

        <input
          className={clase('url_demo')}
          name="url_demo"
          placeholder="https://..."
          maxLength={255}
          value={v.url_demo}
          onChange={cambiar}
        />

        <p className="error">{errores.url_demo}</p>
      </div>

      {/* GITHUB */}
      <div>
        <label className="text-sm opacity-80">
          Enlace al repositorio de GitHub
        </label>

        <input
          className={clase('url_repositorio')}
          name="url_repositorio"
          placeholder="https://github.com/usuario/proyecto"
          maxLength={255}
          value={v.url_repositorio}
          onChange={cambiar}
        />

        <p className="error">{errores.url_repositorio}</p>
      </div>

      {/* IMAGEN PRINCIPAL */}
      <div>
        <label
          className="text-sm opacity-80"
          htmlFor="imagen-proyecto"
        >
          Imagen principal (JPG, PNG o WEBP, máximo 2 MB)
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
            alt="Vista previa de la imagen principal"
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
            Quitar la imagen principal actual
          </label>
        )}
      </div>

      {/* GALERÍA */}
      <div className="border-t border-white/10 pt-5">
        <h4 className="text-lg font-light mb-2">
          Galería de imágenes
        </h4>

        <p className="text-sm opacity-70 mb-3">
          Podés agregar hasta 15 imágenes adicionales.
          Cada una debe pesar como máximo 2 MB.
        </p>

        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="block text-sm w-full"
          onChange={elegirGaleria}
        />

        <p className="error">{errores.galeria}</p>

        <p className="text-xs opacity-60 mt-2">
          {imagenesConservadas.length + galeria.length}
          /{MAX_GALERIA} imágenes adicionales
        </p>

        {/* Imágenes que ya están guardadas */}
        {imagenesActuales.length > 0 && (
          <div className="mt-5">
            <p className="text-sm mb-3">
              Imágenes guardadas
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imagenesActuales.map((item) => {
                const marcada = imagenesEliminar.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 p-2"
                  >
                    <img
                      src={item.imagen}
                      alt="Imagen guardada del proyecto"
                      className="w-full h-28 object-cover rounded-lg"
                    />

                    <label className="flex items-center gap-2 mt-2 text-xs">
                      <input
                        type="checkbox"
                        checked={marcada}
                        onChange={() => marcarImagenEliminar(item.id)}
                      />

                      {marcada
                        ? 'Se eliminará al guardar'
                        : 'Eliminar imagen'}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Imágenes seleccionadas para subir */}
        {vistasGaleria.length > 0 && (
          <div className="mt-5">
            <p className="text-sm mb-3">
              Imágenes nuevas
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vistasGaleria.map((url, indice) => (
                <div
                  key={url}
                  className="rounded-xl border border-white/10 p-2"
                >
                  <img
                    src={url}
                    alt={`Nueva imagen ${indice + 1}`}
                    className="w-full h-28 object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    className="text-xs text-red-400 mt-2 hover:underline"
                    onClick={() => quitarNuevaImagen(indice)}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ERROR DEL SERVIDOR */}
      {errorServidor && (
        <p className="error" role="alert">
          {errorServidor}
        </p>
      )}

      {/* BOTONES */}
      <div className="flex gap-3 justify-end flex-wrap">
        <button
          type="button"
          className="btn btn-borde text-sm !py-2 !px-6"
          onClick={alCancelar}
          disabled={enviando}
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

// ==================== PANTALLA PRINCIPAL ====================

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [modo, setModo] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);
    setError('');

    api('/admin/proyectos')
      .then((datos) => {
        setProyectos(datos.proyectos || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function alGuardar(mensaje) {
    setModo(null);
    setAviso(mensaje);
    cargar();
  }

  async function eliminar(proyecto) {
    if (eliminando) return;

    setEliminando(true);
    setError('');
    setAviso('');

    try {
      await api(`/admin/proyectos/${proyecto.id}`, {
        metodo: 'DELETE',
      });

      setConfirmar(null);
      setAviso(`El proyecto "${proyecto.titulo}" fue eliminado.`);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div>
      {/* ENCABEZADO */}
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

      {/* MENSAJES */}
      {aviso && (
        <p
          className="mt-5 text-sm text-[#60A5FA]"
          role="status"
        >
          {aviso}
        </p>
      )}

      {error && (
        <p className="error mt-5" role="alert">
          {error}
        </p>
      )}

      {/* FORMULARIO */}
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

      {/* LISTA DE PROYECTOS */}
      <div className="grid sm:grid-cols-2 gap-5 mt-6">
        {cargando && proyectos.length === 0 && (
          <p className="opacity-70">
            Cargando proyectos…
          </p>
        )}

        {!cargando && !error && proyectos.length === 0 && (
          <p className="opacity-70">
            Todavía no hay proyectos. Creá el primero con
            "Nuevo proyecto".
          </p>
        )}

        {proyectos.map((p) => (
          <article
            key={p.id}
            className="tarjeta flex flex-col"
          >
            {/* IMAGEN PRINCIPAL */}
            {p.imagen ? (
              <img
                src={p.imagen}
                alt={`Imagen del proyecto ${p.titulo}`}
                loading="lazy"
                className="h-32 w-full object-cover rounded-xl mb-4"
              />
            ) : (
              <div className="h-32 rounded-xl mb-4 grid place-items-center text-xs opacity-60 bg-gray-500/10">
                Sin imagen principal
              </div>
            )}

            {/* TÍTULO */}
            <h3 className="font-light text-lg break-words">
              {p.titulo}
            </h3>

            {/* DESCRIPCIÓN */}
            <p className="text-sm opacity-70 mt-2 line-clamp-3 break-words">
              {p.descripcion}
            </p>

            {/* OBJETIVO */}
            {p.objetivo && (
              <div className="mt-3">
                <p className="text-xs text-[#60A5FA]">
                  Objetivo
                </p>

                <p className="text-sm opacity-70 line-clamp-2 break-words">
                  {p.objetivo}
                </p>
              </div>
            )}

            {/* CARACTERÍSTICAS */}
            {p.caracteristicas && (
              <div className="mt-3">
                <p className="text-xs text-[#60A5FA]">
                  Características
                </p>

                <p className="text-sm opacity-70 line-clamp-3 whitespace-pre-line break-words">
                  {p.caracteristicas}
                </p>
              </div>
            )}

            {/* TECNOLOGÍAS */}
            {p.tecnologias && (
              <p className="text-xs text-[#60A5FA] mt-3 break-words">
                {p.tecnologias}
              </p>
            )}

            {/* CANTIDAD DE IMÁGENES */}
            <p className="text-xs opacity-60 mt-3">
              Galería: {Array.isArray(p.imagenes) ? p.imagenes.length : 0}
              {' '}imágenes adicionales
            </p>

            {/* ENLACES */}
            {p.url_demo && (
              <a
                href={p.url_demo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mt-2 underline break-all"
              >
                Ver demo
              </a>
            )}

            {p.url_repositorio && (
              <a
                href={p.url_repositorio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mt-2 underline break-all"
              >
                Ver repositorio de GitHub
              </a>
            )}

            {/* EDITAR / ELIMINAR */}
            <div className="mt-auto pt-4 flex items-center gap-4 flex-wrap">
              {confirmar === p.id ? (
                <>
                  <span className="text-xs opacity-70">
                    ¿Eliminar definitivamente?
                  </span>

                  <button
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => eliminar(p)}
                    disabled={eliminando}
                  >
                    {eliminando ? 'Eliminando…' : 'Sí, eliminar'}
                  </button>

                  <button
                    className="text-sm opacity-70 hover:underline"
                    onClick={() => setConfirmar(null)}
                    disabled={eliminando}
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
