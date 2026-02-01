-- Esquema actualizado para página de consultoría de equipos de cómputo
-- Soporta registro/inicio de sesión, usuario admin y registros de equipos/consultas

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Base de datos: `consultoria`

-- Eliminar tablas antiguas si existen (precaución en producción)
DROP TABLE IF EXISTS `consultations`;
DROP TABLE IF EXISTS `equipments`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `correo`;
DROP TABLE IF EXISTS `contacto`;

-- Tabla de usuarios (registro / inicio de sesión)
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- (Se elimina la tabla `contacto` antigua; se reemplaza más abajo por `contacts` integrada)

CREATE TABLE `equipments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `model` VARCHAR(100) DEFAULT NULL,
  `serial` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'available',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_equipments_brand` (`brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de consultas/servicios solicitados
CREATE TABLE `consultations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `equipment_id` INT(11) DEFAULT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_consultations_user` (`user_id`),
  KEY `fk_consultations_equipment` (`equipment_id`),
  CONSTRAINT `fk_consultations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_consultations_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de contacto integrada para el sitio web
CREATE TABLE `contacts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(200) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contacts_user` (`user_id`),
  CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Registros de ejemplo para contacto (algunos enlazados a usuarios existentes)
INSERT INTO `contacts` (`user_id`, `name`, `email`, `phone`, `subject`, `message`, `status`) VALUES
(2, 'Juan Pérez', 'juan@example.com', '+5215512345678', 'Soporte PC recepción', 'La PC de la recepción se reinicia sola varias veces al día.', 'new'),
(3, 'María Gómez', 'maria@example.com', '+5215578901234', 'Presupuesto renovación', 'Necesitamos un presupuesto para renovar 10 equipos de oficina.', 'new'),
(NULL, 'Cliente Externo', 'cliente@externo.com', NULL, 'Consulta general', '¿Ofrecen servicio fuera de la ciudad?', 'new');

-- Datos de ejemplo: usuarios (incluye admin)
-- Nota: Reemplazar `password_hash` con hash real (bcrypt/scrypt/argon2) en producción
INSERT INTO `users` (`username`, `email`, `password_hash`, `is_admin`) VALUES
('admin', 'admin@consultoria.local', '$2y$12$EXAMPLEAdm1nHashReplaceThisByRealHash', 1),
('juan', 'juan@example.com', '$2y$12$EXAMPLEUserHash1Replace', 0),
('maria', 'maria@example.com', '$2y$12$EXAMPLEUserHash2Replace', 0);

-- Datos de ejemplo: equipos
INSERT INTO `equipments` (`name`, `brand`, `model`, `serial`, `status`, `notes`) VALUES
('PC Oficina - Recepción', 'Dell', 'OptiPlex 3070', 'SN-DEL-0001', 'available', 'Equipo de recepcion, Windows 10'),
('Laptop Desarrollo', 'Lenovo', 'ThinkPad T14', 'SN-LEN-0456', 'in_service', 'Requiere actualización de RAM'),
('Servidor Local', 'HP', 'ProLiant DL380', 'SN-HP-9876', 'available', 'Servidor para pruebas internas');

-- Datos de ejemplo: consultas
INSERT INTO `consultations` (`user_id`, `equipment_id`, `subject`, `description`, `status`) VALUES
(2, 1, 'Revisión de lentitud', 'La PC en recepción tarda mucho en iniciar sesión.', 'open'),
(3, 2, 'Ampliación de memoria', 'Solicito cambio de 8GB a 16GB en la laptop de desarrollo.', 'pending'),
(2, NULL, 'Asesoría compra', 'Necesito recomendación para renovar 10 equipos de oficina.', 'open');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
