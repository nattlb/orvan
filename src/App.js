
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import Admin from './pages/admin/Admin';
import PanelOperador from './pages/operador/PanelOperador';
import NoEncontrada from './pages/NoEncontrada';

// Páginas legales
import Terminos from './pages/legales/Terminos';
import Privacidad from './pages/legales/Privacidad';
import Cookies from './pages/legales/Cookies';
import PropiedadIntelectual from './pages/legales/PropiedadIntelectual';
import AvisoLegal from './pages/legales/AvisoLegal';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        {/* Página principal */}
        <Route path="/" element={<Inicio />} />

        {/* Administración */}
        <Route path="/admin/*" element={<Admin />} />

        {/* Panel del operador */}
        <Route path="/operador" element={<PanelOperador />} />

        {/* Páginas legales */}
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route
          path="/propiedad-intelectual"
          element={<PropiedadIntelectual />}
        />
        <Route path="/aviso-legal" element={<AvisoLegal />} />

        {/* Página no encontrada */}
        <Route path="*" element={<NoEncontrada />} />

      </Route>
    </Routes>
  );
}
