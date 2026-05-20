-- Script de inicialización para Neon PostgreSQL
-- Ejecutar este script en la consola SQL de Neon

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'estudiante',
  departamento VARCHAR(255),
  puesto VARCHAR(255),
  googleId VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approvedAt TIMESTAMP,
  approvedBy VARCHAR(36)
);

-- Crear tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'abierto',
  priority VARCHAR(50) DEFAULT 'normal',
  assignedTo VARCHAR(36),
  attendedBy VARCHAR(36),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  firstResponseAt TIMESTAMP,
  closedAt TIMESTAMP,
  reopenedAt TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(assignedTo) REFERENCES users(id),
  FOREIGN KEY(attendedBy) REFERENCES users(id)
);

-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  ticketId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticketId) REFERENCES tickets(id),
  FOREIGN KEY(userId) REFERENCES users(id)
);

-- Crear tabla de historial de tickets
CREATE TABLE IF NOT EXISTS ticket_history (
  id VARCHAR(36) PRIMARY KEY,
  ticketId VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  oldStatus VARCHAR(50),
  newStatus VARCHAR(50),
  description TEXT,
  userId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticketId) REFERENCES tickets(id),
  FOREIGN KEY(userId) REFERENCES users(id)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_tickets_userId ON tickets(userId);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assignedTo ON tickets(assignedTo);
CREATE INDEX IF NOT EXISTS idx_messages_ticketId ON messages(ticketId);
CREATE INDEX IF NOT EXISTS idx_messages_userId ON messages(userId);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticketId ON ticket_history(ticketId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Verificar que las tablas fueron creadas
SELECT 'Base de datos inicializada correctamente' as status;
