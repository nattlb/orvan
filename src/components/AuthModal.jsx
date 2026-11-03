import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validar, validarCampo, fuerzaClave } from '../utils/validaciones';

const VACIO = { nombre: '', email: '', clave: '', confirmar: '' };
const ETIQUETAS = ['', 'Débil', 'Media', 'Fuerte'];
const COLORES = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-400'];

// Ventana para crear cuenta o iniciar sesión (usa el <dialog> nativo, igual que el HTML)
export default function AuthModal() {
  const { modal, cerrarModal, registrar, ingresar, abrirModal } = useAuth();
  const ref = useRef(null);
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [verClave, setVerClave] = useState(false);

  const esRegistro = modal !== 'login';
  const fuerza = fuerzaClave(valores.clave);

  // Abre/cierra el <dialog> según el estado, y limpia el formulario cada vez
  useEffect(() => {
    const d = ref.current;
    if (modal && !d.open) d.showModal();
    if (!modal && d.open) d.close();
    setValores(VACIO);
    setErrores({});
    setErrorServidor('');
    setVerClave(false);
  }, [modal]);

  // En el login la contraseña solo tiene que estar escrita (no se exige el formato)
  const revisarCampo = (campo, vals) => {
    if (!esRegistro && campo === 'clave') return vals.clave ? '' : 'Ingresá tu contraseña.';
    return validarCampo(campo, vals);
  };

  // Mientras escribe: si el campo ya tenía error, se vuelve a revisar al instante
  const cambiar = (e) => {
    const { name, value } = e.target;
    const nuevos = { ...valores, [name]: value };
    setValores(nuevos);
    setErrores((er) => {
      const sig = { ...er };
      if (er[name]) sig[name] = revisarCampo(name, nuevos);
      if (name === 'clave' && er.confirmar) sig.confirmar = revisarCampo('confirmar', nuevos);
      return sig;
    });
  };

  // Al salir de un campo: se revisa ese campo
  const alSalir = (e) => {
    const { name } = e.target;
    setErrores((er) => ({ ...er, [name]: revisarCampo(name, valores) }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const campos = esRegistro ? ['nombre', 'email', 'clave', 'confirmar'] : ['email'];
    const errs = validar(valores, campos);
    if (!esRegistro && !valores.clave) errs.clave = 'Ingresá tu contraseña.';
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setEnviando(true);
    setErrorServidor('');
    try {
      if (esRegistro) await registrar({ nombre: valores.nombre.trim(), email: valores.email.trim(), clave: valores.clave });
      else await ingresar({ email: valores.email.trim(), clave: valores.clave });
      cerrarModal();
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const clase = (c) => `campo ${errores[c] ? 'mal' : ''}`;

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); cerrarModal(); }} // tecla Esc
      onMouseDown={(e) => { if (e.target === ref.current) cerrarModal(); }} // clic afuera
    >
      <form onSubmit={enviar} noValidate>
        <h3 className="titulo text-2xl font-light">{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h3>
        <p className="text-sm opacity-60 mt-1 mb-5">Con tu cuenta accedés a los proyectos y demos.</p>

        {esRegistro && (
          <div className="mb-3">
            <input className={clase('nombre')} name="nombre" aria-label="Nombre" placeholder="Nombre" autoComplete="name"
              maxLength={60} value={valores.nombre} onChange={cambiar} onBlur={alSalir}
              aria-invalid={!!errores.nombre} />
            <p className="error">{errores.nombre}</p>
          </div>
        )}

        <div className="mb-3">
          <input className={clase('email')} name="email" aria-label="Email" type="email" placeholder="Email" autoComplete="email"
            maxLength={120} value={valores.email} onChange={cambiar} onBlur={alSalir}
            aria-invalid={!!errores.email} />
          <p className="error">{errores.email}</p>
        </div>

        <div className="mb-3">
          <div className="relative">
            <input className={`${clase('clave')} !pr-24`} name="clave" aria-label="Contraseña" type={verClave ? 'text' : 'password'}
              placeholder={esRegistro ? 'Contraseña (mínimo 8, con un número)' : 'Contraseña'}
              autoComplete={esRegistro ? 'new-password' : 'current-password'}
              maxLength={64} value={valores.clave} onChange={cambiar} onBlur={alSalir}
              aria-invalid={!!errores.clave} />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#60A5FA]"
              onClick={() => setVerClave((v) => !v)} aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {verClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {/* Medidor de seguridad (solo al registrarse) */}
          {esRegistro && valores.clave && (
            <div className="mt-2" aria-live="polite">
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`h-1 flex-1 rounded ${fuerza >= n ? COLORES[fuerza] : 'bg-gray-500/30'}`}></span>
                ))}
              </div>
              <p className="text-xs opacity-60 mt-1">Seguridad: {ETIQUETAS[fuerza]}</p>
            </div>
          )}
          <p className="error">{errores.clave}</p>
        </div>

        {esRegistro && (
          <div className="mb-3">
            <input className={clase('confirmar')} name="confirmar" aria-label="Repetir contraseña" type={verClave ? 'text' : 'password'}
              placeholder="Repetí la contraseña" autoComplete="new-password"
              maxLength={64} value={valores.confirmar} onChange={cambiar} onBlur={alSalir}
              aria-invalid={!!errores.confirmar} />
            <p className="error">{errores.confirmar}</p>
          </div>
        )}

        {errorServidor && <p className="error mb-2" role="alert">{errorServidor}</p>}

        <div className="flex gap-3 mt-4">
          <button type="button" className="btn btn-borde flex-1" onClick={cerrarModal}>Cancelar</button>
          <button type="submit" className="btn btn-azul flex-1" disabled={enviando}>
            {enviando ? 'Enviando…' : esRegistro ? 'Registrarme' : 'Ingresar'}
          </button>
        </div>

        <p className="text-sm text-center opacity-80 mt-5">
          {esRegistro ? '¿Ya tenés cuenta? ' : '¿Todavía no tenés cuenta? '}
          <button type="button" className="text-[#60A5FA] underline"
            onClick={() => abrirModal(esRegistro ? 'login' : 'registro')}>
            {esRegistro ? 'Iniciá sesión' : 'Registrate'}
          </button>
        </p>
      </form>
    </dialog>
  );
}
