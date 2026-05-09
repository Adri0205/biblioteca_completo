-- ============================================================
-- Base de datos: biblioteca
-- Descripción: Esquema para sistema de gestión de biblioteca
-- Fecha: 2026-05-09
-- ============================================================

CREATE DATABASE IF NOT EXISTS `biblioteca`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `biblioteca`;

-- ------------------------------------------------------------
-- Tabla: usuarios
-- ------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id`        INT           NOT NULL AUTO_INCREMENT,
  `nombre`    VARCHAR(100)  NOT NULL,
  `correo`    VARCHAR(100)  NOT NULL,
  `password`  VARCHAR(255)  NOT NULL,
  `rol`       ENUM('admin','usuario') NOT NULL DEFAULT 'usuario',
  `createdAt` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_correo_unique` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: libros
-- ------------------------------------------------------------
CREATE TABLE `libros` (
  `id`                  INT          NOT NULL AUTO_INCREMENT,
  `titulo`              VARCHAR(200) NOT NULL,
  `autor`               VARCHAR(100) NOT NULL,
  `categoria`           VARCHAR(50)  NOT NULL,
  `isbn`                VARCHAR(20)  DEFAULT NULL,
  `descripcion`         TEXT         DEFAULT NULL,
  `anio_publicacion`    SMALLINT UNSIGNED DEFAULT NULL,
  `cantidad_total`      INT          NOT NULL DEFAULT 1,
  `cantidad_disponible` INT          NOT NULL DEFAULT 1,
  `createdAt`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `libros_isbn_unique`     (`isbn`),
  KEY        `libros_autor_idx`       (`autor`),
  KEY        `libros_categoria_idx`   (`categoria`),
  CONSTRAINT `chk_disponible` CHECK (`cantidad_disponible` >= 0 AND `cantidad_disponible` <= `cantidad_total`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: prestamos
-- ------------------------------------------------------------
CREATE TABLE `prestamos` (
  `id`               INT      NOT NULL AUTO_INCREMENT,
  `usuario_id`       INT      NOT NULL,
  `libro_id`         INT      NOT NULL,
  `fecha_prestamo`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_limite`     DATETIME NOT NULL,
  `fecha_devolucion` DATETIME DEFAULT NULL,
  `estado`           ENUM('activo','devuelto','vencido') NOT NULL DEFAULT 'activo',
  `createdAt`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `prestamos_usuario_id_idx` (`usuario_id`),
  KEY `prestamos_libro_id_idx`   (`libro_id`),
  CONSTRAINT `prestamos_usuario_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prestamos_libro_fk`   FOREIGN KEY (`libro_id`)   REFERENCES `libros`   (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
