
-- =====================================================
-- ORVAN - BASE DE DATOS
-- MySQL 8
-- Esquema para instalación nueva
-- =====================================================

CREATE DATABASE IF NOT EXISTS orvan
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE orvan;

-- =====================================================
-- 1. USUARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL,
  clave_hash VARCHAR(100) NOT NULL,
  rol ENUM('usuario','operador','admin')
    NOT NULL DEFAULT 'usuario',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. ACCESOS
-- =====================================================

CREATE TABLE IF NOT EXISTS accesos (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY usuario_id (usuario_id),
  CONSTRAINT accesos_ibfk_1
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. VISITAS
-- =====================================================

CREATE TABLE IF NOT EXISTS visitas (
  id INT NOT NULL AUTO_INCREMENT,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. CONTACTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS contactos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL,
  tipo ENUM(
    'Consulta general',
    'Cotización de proyecto',
    'Asesoría técnica'
  ) NOT NULL,
  mensaje TEXT NOT NULL,
  estado ENUM('nuevo','respondido') NOT NULL DEFAULT 'nuevo',
  respuesta TEXT DEFAULT NULL,
  respondido_en DATETIME DEFAULT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. PROYECTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS proyectos (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  tecnologias VARCHAR(200) NOT NULL DEFAULT '',
  url_demo VARCHAR(255) DEFAULT NULL,
  imagen VARCHAR(255) DEFAULT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. SERVICIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS servicios (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. EQUIPO
-- =====================================================

CREATE TABLE IF NOT EXISTS equipo (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  imagen VARCHAR(255) DEFAULT NULL,
  orden INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_equipo_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. HORARIOS DEL ESTUDIO
-- =====================================================

CREATE TABLE IF NOT EXISTS horarios_estudio (
  id INT NOT NULL AUTO_INCREMENT,
  dia_semana TINYINT NOT NULL,
  abierto TINYINT(1) NOT NULL DEFAULT 0,
  hora_apertura TIME DEFAULT NULL,
  hora_cierre TIME DEFAULT NULL,
  actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY dia_semana (dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. PAUSA GENERAL
-- =====================================================

CREATE TABLE IF NOT EXISTS horario_pausa (
  id INT NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 0,
  hora_inicio TIME DEFAULT NULL,
  hora_fin TIME DEFAULT NULL,
  actualizado_por INT DEFAULT NULL,
  actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT horario_pausa_ibfk_1
    FOREIGN KEY (actualizado_por)
    REFERENCES usuarios(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. EXCEPCIONES DE HORARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS excepciones_horario (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  tipo ENUM('cerrado','horario_especial') NOT NULL,
  hora_apertura TIME DEFAULT NULL,
  hora_cierre TIME DEFAULT NULL,
  motivo VARCHAR(200) NOT NULL,
  creado_por INT DEFAULT NULL,
  creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_excepciones_fechas (fecha_inicio, fecha_fin),
  CONSTRAINT excepciones_horario_ibfk_1
    FOREIGN KEY (creado_por)
    REFERENCES usuarios(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. HISTORIAL DE HORARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS historial_horarios (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT DEFAULT NULL,
  accion VARCHAR(100) NOT NULL,
  detalle TEXT,
  creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historial_fecha (creado_en),
  CONSTRAINT historial_horarios_ibfk_1
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS INICIALES DE HORARIOS
-- Los siete días comienzan cerrados.
-- Se pueden configurar desde el panel administrador.
-- =====================================================

INSERT IGNORE INTO horarios_estudio (dia_semana, abierto)
VALUES
  (0, 0),
  (1, 0),
  (2, 0),
  (3, 0),
  (4, 0),
  (5, 0),
  (6, 0);

INSERT IGNORE INTO horario_pausa (id, activa)
VALUES (1, 0);

-- =====================================================
-- FIN DEL ESQUEMA ORVAN
-- =====================================================
