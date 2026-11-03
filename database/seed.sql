USE orvan;

INSERT INTO servicios (titulo, descripcion) VALUES
('Sitios y sistemas web', 'Desarrollo fullstack a medida: desde una web institucional hasta un sistema de gestión con usuarios y paneles.'),
('Diseño de interfaz y marca', 'Paleta, tipografía, prototipos y versión móvil. Todo documentado en un manual de estilo.'),
('Bases de datos y reportes', 'Diseño de la base, migración de datos y gráficos para seguir las métricas del negocio.'),
('Asesoría técnica y seguridad', 'Revisamos lo que ya tenés, te decimos qué mejorar y cuánto costaría.');

INSERT INTO proyectos (titulo, descripcion, tecnologias, url_demo) VALUES
('Proyecto uno',  'Descripción del proyecto uno. Reemplazar desde el panel de administración.',  'React, Node.js, MySQL', NULL),
('Proyecto dos',  'Descripción del proyecto dos. Reemplazar desde el panel de administración.',  'React, Tailwind, API REST', NULL),
('Proyecto tres', 'Descripción del proyecto tres. Reemplazar desde el panel de administración.', 'Node.js, MySQL, Chart.js', NULL);