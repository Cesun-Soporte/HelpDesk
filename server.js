const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const {
  initializeEmailService,
  sendTicketCreatedEmail,
  sendStatusChangeEmail,
  sendNewMessageEmail,
  sendAdminNotificationEmail
} = require('./emailService');
require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

app.get('/api/config', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('ERROR: GOOGLE_CLIENT_ID no está configurado');
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID no configurado en el servidor' });
  }
  res.json({
    googleClientId: clientId,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/callback'
  });
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || 'cesunbc.edu.mx,cesun.edu.mx').split(',').map(d => d.trim());
const ADMIN_EMAIL = 'soportetecnico@cesun.edu.mx';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/callback'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initializeDatabase = async () => {
  try {
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

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
};

initializeDatabase();
initializeEmailService();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
};

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    const domain = email.split('@')[1];
    if (!ALLOWED_DOMAINS.includes(domain)) {
      return res.status(403).json({ error: 'Dominio no autorizado. Solo se permiten dominios: ' + ALLOWED_DOMAINS.join(', ') });
    }

    let role = 'estudiante';
    let status = 'pending';
    
    if (email === ADMIN_EMAIL) {
      role = 'admin';
      status = 'approved';
    } else if (email.includes('docente') || email.includes('profesor')) {
      role = 'docente';
    } else if (email.includes('administrativo') || email.includes('admin')) {
      role = 'administrativo';
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
      await pool.query(
        'UPDATE users SET googleId = $1, name = $2 WHERE email = $3',
        [googleId, name, email]
      );
      user = { ...user, name };
    } else {
      const userId = uuidv4();
      await pool.query(
        'INSERT INTO users (id, email, name, role, googleId, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, email, name, role, googleId, status]
      );
      user = { id: userId, email, name, role, status };
    }

    if (user.status === 'pending') {
      return res.status(403).json({ 
        error: 'Tu cuenta está pendiente de aprobación. Los administradores la revisarán pronto.',
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        error: 'Tu cuenta ha sido rechazada. Contacta con los administradores.',
        status: 'rejected'
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error('Error en autenticación Google:', error);
    res.status(500).json({ error: 'Error en autenticación' });
  }
});

app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, area, puesto, status FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const result = await pool.query('SELECT id, email, name, role, status, createdAt, approvedAt FROM users ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:userId/approve', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { role } = req.body;
    const userId = req.params.userId;

    await pool.query(
      'UPDATE users SET status = $1, role = $2, approvedAt = CURRENT_TIMESTAMP, approvedBy = $3 WHERE id = $4',
      ['approved', role || 'estudiante', req.user.id, userId]
    );

    res.json({ message: 'Usuario aprobado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:userId/reject', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const userId = req.params.userId;

    await pool.query(
      'UPDATE users SET status = $1, approvedAt = CURRENT_TIMESTAMP, approvedBy = $2 WHERE id = $3',
      ['rejected', req.user.id, userId]
    );

    res.json({ message: 'Usuario rechazado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:userId/role', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { role } = req.body;
    const userId = req.params.userId;

    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, userId]
    );

    res.json({ message: 'Rol actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/import', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de usuarios' });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const userData of users) {
      try {
        const { email, departamento, puesto, rol } = userData;

        if (!email || !rol) {
          results.errors.push({ email, error: 'Email y rol son requeridos' });
          continue;
        }

        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userResult.rows.length > 0) {
          await pool.query(
            'UPDATE users SET role = $1, departamento = $2, puesto = $3 WHERE email = $4',
            [rol, departamento || null, puesto || null, email]
          );
          results.updated++;
        } else {
          const userId = uuidv4();
          await pool.query(
            'INSERT INTO users (id, email, role, departamento, puesto, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, email, rol, departamento || null, puesto || null, 'pending']
          );
          results.created++;
        }
      } catch (err) {
        results.errors.push({ email: userData.email, error: err.message });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/import-file', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.trim().split('\n');
    
    if (lines.length < 2) {
      return res.status(400).json({ error: 'El archivo está vacío' });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim());
      const userData = {};
      headers.forEach((header, idx) => {
        userData[header] = values[idx] || '';
      });
      users.push(userData);
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const userData of users) {
      try {
        const email = userData.email?.trim();
        const rol = userData.rol?.trim();
        const departamento = userData.departamento?.trim() || null;
        const puesto = userData.puesto?.trim() || null;

        if (!email || !rol) {
          results.errors.push({ email: email || 'sin email', error: 'Email y rol son requeridos' });
          continue;
        }

        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userResult.rows.length > 0) {
          await pool.query(
            'UPDATE users SET role = $1, departamento = $2, puesto = $3 WHERE email = $4',
            [rol, departamento, puesto, email]
          );
          results.updated++;
        } else {
          const userId = uuidv4();
          await pool.query(
            'INSERT INTO users (id, email, role, departamento, puesto, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, email, rol, departamento, puesto, 'pending']
          );
          results.created++;
        }
      } catch (err) {
        results.errors.push({ email: userData.email || 'sin email', error: err.message });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets', verifyToken, async (req, res) => {
  try {
    const { title, description, category, priority, userId } = req.body;
    const ticketId = uuidv4();
    
    let targetUserId = req.user.id;
    
    if (userId && req.user.role === 'admin') {
      targetUserId = userId;
    }

    await pool.query(
      'INSERT INTO tickets (id, userId, title, description, category, priority) VALUES ($1, $2, $3, $4, $5, $6)',
      [ticketId, targetUserId, title, description, category, priority || 'normal']
    );

    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [targetUserId]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      sendTicketCreatedEmail(user.email, user.name, ticketId, title, description);

      const adminsResult = await pool.query('SELECT email, name FROM users WHERE role = $1', ['admin']);
      if (adminsResult.rows.length > 0) {
        adminsResult.rows.forEach(admin => {
          sendAdminNotificationEmail(
            admin.email,
            admin.name,
            ticketId,
            title,
            user.name,
            'Nuevo Ticket Creado',
            `${category} - Prioridad: ${priority || 'normal'}`
          );
        });
      }
    }

    io.emit('ticket_created', { ticketId, title, category, priority });
    res.json({ id: ticketId, message: 'Ticket creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets', verifyToken, async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = 'SELECT t.*, u.name, u.role, u.area, u.puesto FROM tickets t JOIN users u ON t.userId = u.id WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (req.user.role === 'estudiante') {
      query += ` AND t.userId = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }

    if (category) {
      query += ` AND t.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY t.createdAt DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT t.*, u.name, u.role, u.area, u.puesto FROM tickets t JOIN users u ON t.userId = u.id WHERE t.id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tickets/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { status, assignedTo } = req.body;
    const ticketId = req.params.id;

    const ticketResult = await pool.query('SELECT status, assignedTo, attendedBy FROM tickets WHERE id = $1', [ticketId]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticket = ticketResult.rows[0];
    const oldStatus = ticket.status;
    let updateQuery = 'UPDATE tickets SET status = $1, assignedTo = $2, updatedAt = CURRENT_TIMESTAMP';
    const params = [status || oldStatus, assignedTo, ticketId];
    let paramCount = 3;

    if (status === 'cerrado' && oldStatus !== 'cerrado') {
      updateQuery += `, closedAt = CURRENT_TIMESTAMP, attendedBy = $${paramCount}`;
      params.splice(2, 0, req.user.id);
      paramCount++;
    } else if (status === 'en proceso' && !ticket.attendedBy) {
      updateQuery += `, attendedBy = $${paramCount}`;
      params.splice(2, 0, req.user.id);
      paramCount++;
    } else if (status === 'abierto' && oldStatus === 'cancelado') {
      updateQuery += ', reopenedAt = CURRENT_TIMESTAMP';
    }

    updateQuery += ` WHERE id = $${paramCount}`;
    params.push(ticketId);

    await pool.query(updateQuery, params);

    if (status && status !== oldStatus) {
      await pool.query(
        'INSERT INTO ticket_history (id, ticketId, action, oldStatus, newStatus, description, userId) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [uuidv4(), ticketId, 'status_change', oldStatus, status, `Cambio de estado: ${oldStatus} → ${status}`, req.user.id]
      );

      const ticketInfoResult = await pool.query(
        'SELECT t.title, u.email, u.name FROM tickets t JOIN users u ON t.userId = u.id WHERE t.id = $1',
        [ticketId]
      );

      if (ticketInfoResult.rows.length > 0) {
        const ticketInfo = ticketInfoResult.rows[0];
        sendStatusChangeEmail(ticketInfo.email, ticketInfo.name, ticketId, ticketInfo.title, oldStatus, status);
      }

      io.emit('status_changed', { ticketId, oldStatus, newStatus: status });
    }

    res.json({ message: 'Ticket actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/messages', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const messageId = uuidv4();
    const ticketId = req.params.id;

    await pool.query(
      'INSERT INTO messages (id, ticketId, userId, message) VALUES ($1, $2, $3, $4)',
      [messageId, ticketId, req.user.id, message]
    );

    const ticketResult = await pool.query('SELECT firstResponseAt FROM tickets WHERE id = $1', [ticketId]);
    if (ticketResult.rows.length > 0 && !ticketResult.rows[0].firstResponseAt && req.user.role === 'admin') {
      await pool.query(
        'UPDATE tickets SET firstResponseAt = CURRENT_TIMESTAMP WHERE id = $1',
        [ticketId]
      );
    }

    await pool.query(
      'INSERT INTO ticket_history (id, ticketId, action, description, userId) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), ticketId, 'message', message, req.user.id]
    );

    const ticketInfoResult = await pool.query(
      'SELECT t.title, t.userId, u.name as senderName, u.role FROM tickets t JOIN users u ON u.id = $1 WHERE t.id = $2',
      [req.user.id, ticketId]
    );

    if (ticketInfoResult.rows.length > 0) {
      const ticketInfo = ticketInfoResult.rows[0];
      const ticketOwnerResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [ticketInfo.userId]);
      
      if (ticketOwnerResult.rows.length > 0) {
        const ticketOwner = ticketOwnerResult.rows[0];
        if (ticketOwner.email !== req.user.id) {
          sendNewMessageEmail(
            ticketOwner.email,
            ticketOwner.name,
            ticketId,
            ticketInfo.title,
            ticketInfo.senderName,
            message
          );
        }
      }

      if (ticketInfo.role === 'estudiante' || ticketInfo.role === 'docente') {
        const adminsResult = await pool.query(
          'SELECT email, name FROM users WHERE role = $1 AND id != $2',
          ['admin', req.user.id]
        );

        if (adminsResult.rows.length > 0) {
          adminsResult.rows.forEach(admin => {
            sendAdminNotificationEmail(
              admin.email,
              admin.name,
              ticketId,
              ticketInfo.title,
              ticketInfo.senderName,
              'Nuevo Mensaje',
              message.substring(0, 100) + (message.length > 100 ? '...' : '')
            );
          });
        }
      }
    }

    io.emit('new_message', { ticketId, messageId, userId: req.user.id, message });
    res.json({ id: messageId, message: 'Mensaje enviado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/:id/messages', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, u.name FROM messages m JOIN users u ON m.userId = u.id WHERE m.ticketId = $1 ORDER BY m.createdAt',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/:id/history', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT h.*, u.name FROM ticket_history h JOIN users u ON h.userId = u.id WHERE h.ticketId = $1 ORDER BY h.createdAt',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/reopen', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await pool.query(
      'UPDATE tickets SET status = $1, reopenedAt = CURRENT_TIMESTAMP WHERE id = $2',
      ['abierto', req.params.id]
    );

    res.json({ message: 'Ticket reabierto' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN status = 'en proceso' THEN 1 ELSE 0 END) as enProceso,
        SUM(CASE WHEN status = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
        SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelados
      FROM tickets
      WHERE userId = $1
    `, [req.user.id]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const result = await pool.query(`
      SELECT 
        t.category,
        t.status,
        u.role as userRole,
        COUNT(*) as count
      FROM tickets t
      JOIN users u ON t.userId = u.id
      GROUP BY t.category, t.status, u.role
      ORDER BY t.category, t.status
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const result = await pool.query(
      'SELECT id, email, name, role, area, puesto, createdAt FROM users ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { role, area, puesto } = req.body;
    const userId = req.params.id;

    await pool.query(
      'UPDATE users SET role = $1, area = $2, puesto = $3 WHERE id = $4',
      [role, area, puesto, userId]
    );

    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join_ticket', (ticketId) => {
    socket.join(`ticket_${ticketId}`);
  });

  socket.on('leave_ticket', (ticketId) => {
    socket.leave(`ticket_${ticketId}`);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

app.get('*', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'client/build/index.html'));
});

server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
