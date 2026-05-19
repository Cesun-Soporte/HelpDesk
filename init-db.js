const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initializeDatabase = async () => {
  try {
    console.log('Inicializando base de datos...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        area VARCHAR(255),
        puesto VARCHAR(255),
        googleId VARCHAR(255) UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla users creada');

    await pool.query(`
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
      )
    `);
    console.log('✓ Tabla tickets creada');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        ticketId VARCHAR(36) NOT NULL,
        userId VARCHAR(36) NOT NULL,
        message TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticketId) REFERENCES tickets(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);
    console.log('✓ Tabla messages creada');

    await pool.query(`
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
      )
    `);
    console.log('✓ Tabla ticket_history creada');

    console.log('\n✅ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
};

initializeDatabase();
