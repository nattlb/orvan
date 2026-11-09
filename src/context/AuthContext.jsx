
import { createContext, useContext, useEffect, useState } from 'react';
import { api, obtenerToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(!!obtenerToken());
  const [modal, setModal] = useState(null);

  // Al abrir el sitio, verificamos si existe una sesión guardada.
  useEffect(() => {
    if (!obtenerToken()) return;

    api('/auth/me')
      .then((d) => {
        setUsuario(d.usuario);
      })
      .catch((error) => {
        // Solo eliminamos el token si la sesión no es válida.
        if (error.status === 401) {
          localStorage.removeItem('orvan_token');
          setUsuario(null);
        } else {
          // Si hay otro problema, conservamos el token.
          console.error('No se pudo verificar la sesión:', error);
        }
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  // Guardamos los datos cuando el usuario inicia sesión o se registra.
  const guardar = (d) => {
    localStorage.setItem('orvan_token', d.token);
    setUsuario(d.usuario);
  };

  const registrar = async (datos) => {
    const respuesta = await api('/auth/registro', {
      metodo: 'POST',
      cuerpo: datos,
    });

    guardar(respuesta);
  };

  const ingresar = async (datos) => {
    const respuesta = await api('/auth/login', {
      metodo: 'POST',
      cuerpo: datos,
    });

    guardar(respuesta);
  };

  // Cerramos la sesión.
  const salir = () => {
    localStorage.removeItem('orvan_token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        modal,
        abrirModal: (cual = 'registro') => setModal(cual),
        cerrarModal: () => setModal(null),
        registrar,
        ingresar,
        salir,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
