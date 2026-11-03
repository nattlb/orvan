// Contenido del sitio (sale del HTML de ORVAN).
// Para cambiar textos, nombres o reseñas se edita SOLO este archivo.


export const EQUIPO = [
  {
    area: 'Base de datos',
    nombre: 'Fiorella Gatti',
    texto: 'Diseña y organiza bases de datos para que la información sea consistente, segura y fácil de consultar. Trabaja en el modelado, las consultas y la optimización de datos.',
    horas: 720,
    cursos: [
      ['Modelado y consultas SQL', 420],
      ['Bases NoSQL y reportes', 300],
    ],
  },
  {
    area: 'Ciberseguridad',
    nombre: 'Natalia Tolaba',
    texto: 'Se enfoca en proteger aplicaciones y sistemas mediante la identificación de vulnerabilidades, la validación de datos y la implementación de mecanismos de autenticación segura.',
    horas: 580,
    cursos: [
      ['Seguridad informática', 340],
      ['Autenticación segura', 240],
    ],
  },
  {
    area: 'Diseño UI/UX',
    nombre: 'Florencia Tolaba',
    texto: 'Diseña interfaces intuitivas y atractivas, priorizando la experiencia del usuario, la accesibilidad y la adaptación a distintos dispositivos.',
    horas: 600,
    cursos: [
      ['Diseño de interfaces Figma', 360],
      ['Curso experiencia UX', 240],
    ],
  },
  {
    area: 'Arquitectura',
    nombre: 'Luciano Sobrero',
    texto: 'Define la estructura técnica de las aplicaciones y organiza sus componentes, tecnologías y conexiones para desarrollar soluciones eficientes y mantenibles.',
    horas: 810,
    cursos: [
      ['Desarrollo JS y Node.js', 480],
      ['APIs y despliegue en nube', 330],
    ],
  },
];


export const STACK = ['HTML5', 'CSS3 + Tailwind', 'JavaScript', 'React', 'GSAP', 'Node.js', 'MySQL', 'APIs REST', 'Chart.js'];

export const SERVICIOS = [
  ['Sitios y sistemas web', 'Desarrollo fullstack a medida: desde una web institucional hasta un sistema de gestión con usuarios y paneles.'],
  ['Diseño de interfaz y marca', 'Paleta, tipografía, prototipos y versión móvil. Todo documentado en un manual de estilo.'],
  ['Bases de datos y reportes', 'Diseño de la base, migración de datos y gráficos para seguir las métricas del negocio.'],
  ['Asesoría técnica y seguridad', 'Revisamos lo que ya tenés, te decimos qué mejorar y cuánto costaría.'],
];

// Reseñas de EJEMPLO. Reemplazarlas por reales o aclarar que son ilustrativas.
export const RESENAS = [
  ['CR', 'Camila Rojas', 'Directora, Estudio Aurora', 'El trabajo fue excelente. Entendieron lo que necesitábamos desde la primera reunión y entregaron un sitio impecable, antes de lo acordado.'],
  ['MG', 'Martín Giménez', 'Gerente de Operaciones, Logística del Norte', 'Resultado sobresaliente. El sistema que nos armaron es rápido, claro y nuestro equipo lo aprendió en un solo día.'],
  ['LF', 'Lucía Fernández', 'Fundadora, Tienda Altos', 'Una experiencia magnífica de principio a fin. El diseño es elegante y las ventas online mejoraron desde el primer mes.'],
  ['FP', 'Federico Paz', 'CTO, Andes Software', 'Código prolijo, base de datos bien pensada y una seguridad de primer nivel. Un equipo realmente profesional.'],
];

// Proyectos de ejemplo (en el Paso 6 pasan a la base de datos y se administran desde el panel)
export const PROYECTOS = [
  { titulo: 'Proyecto uno', fondo: 'var(--degrade)' },
  { titulo: 'Proyecto dos', fondo: 'linear-gradient(135deg,#0A1736,#2563EB)' },
  { titulo: 'Proyecto tres', fondo: 'linear-gradient(135deg,#60A5FA,#DBEAFE)' },
];

// Canales de contacto (sección Contacto). EDITAR con los datos reales del estudio.
export const CANALES = [
  { id: 'email', titulo: 'Email', valor: 'orvanstudio0@gmail.com', href: 'mailto:orvanstudio0@gmail.com' },
  // <- reemplazar el número (formato internacional sin + ni espacios en el link)
  { id: 'whatsapp', titulo: 'WhatsApp', valor: '+54 9 387 000 0000', href: 'https://wa.me/5493870000000', externo: true },
  { id: 'ubicacion', titulo: 'Ubicación', valor: 'UCASAL · Campus Castañares, Salta', href: 'https://www.google.com/maps/search/?api=1&query=Universidad+Cat%C3%B3lica+de+Salta+Campo+Casta%C3%B1ares+Salta', externo: true },
  { id: 'horario', titulo: 'Horario de atención', valor: 'Lunes a viernes, 9 a 18 h' },
];

// <- reemplazar los links por los perfiles reales
export const REDES = [
  { id: 'linkedin', nombre: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { id: 'github', nombre: 'GitHub', href: 'https://github.com/' },
  { id: 'instagram', nombre: 'Instagram', href: 'https://www.instagram.com/' },
];