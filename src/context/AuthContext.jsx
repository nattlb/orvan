import { createContext, useContext, useEffect, useState } from 'react';
import { api, obtenerToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(!!obtenerToken());
  const [modal, setModal] = useState(null); // null (cerrado) | 'registro' | 'login'

  // Al abrir el sitio: si hay un token guardado, preguntamos al servidor quién es
  useEffect(() => {
    if (!obtenerToken()) return;
    api('/auth/me')
      .then((d) => setUsuario(d.usuario))
      .catch(() => localStorage.removeItem('orvan_token'))
      .finally(() => setCargando(false));
  }, []);

  const guardar = (d) => {
    localStorage.setItem('orvan_token', d.token);
    setUsuario(d.usuario);
  };

  const registrar = async (datos) => guardar(await api('/auth/registro', { metodo: 'POST', cuerpo: datos }));
  const ingresar = async (datos) => guardar(await api('/auth/login', { metodo: 'POST', cuerpo: datos }));
  const salir = () => { localStorage.removeItem('orvan_token'); setUsuario(null); };

  return (
    <AuthContext.Provider
      value={{
        usuario, cargando, modal,
        abrirModal: (cual = 'registro') => setModal(cual),
        cerrarModal: () => setModal(null),
        registrar, ingresar, salir,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
