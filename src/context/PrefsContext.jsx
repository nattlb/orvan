import { createContext, useContext, useEffect, useState } from 'react';

const PrefsContext = createContext(null);

export function PrefsProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem('orvan_tema') || 'oscuro');

  // Cada vez que cambia el tema: lo ponemos en <html data-tema="..."> y lo guardamos
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    localStorage.setItem('orvan_tema', tema);
  }, [tema]);

  const alternarTema = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'));

  return (
    <PrefsContext.Provider value={{ tema, alternarTema }}>
      {children}
    </PrefsContext.Provider>
  );
}

export const usePrefs = () => useContext(PrefsContext);