# Guía Completa de Despliegue - Help Desk CESUN

## 📋 Resumen de Cambios Implementados

### ✅ Backend (Node.js + PostgreSQL)
- Migrado de SQLite a PostgreSQL (base de datos persistente)
- Eliminado código de login local
- Solo Google OAuth para autenticación
- Cuenta admin única: `soportetecnico@cesun.edu.mx`
- Dominios autorizados: `@cesunbc.edu.mx` y `@cesun.edu.mx`
- Endpoints para gestión de usuarios (roles, área, puesto)
- Sistema de tickets con historial completo
- Notificaciones por email

### ✅ Frontend (React)
- Login simplificado solo con Google
- Panel de gestión de usuarios (admin)
- Gestión de tickets con área y puesto del usuario
- Interfaz limpia y profesional

### ✅ Base de Datos
- PostgreSQL con tablas persistentes
- Script de inicialización automática
- Soporte para SSL en producción

### ✅ Configuración para Vercel
- `vercel.json` configurado
- Variables de entorno documentadas
- Scripts de build y deploy

---

## 🚀 Pasos para Despliegue en Vercel

### 1. Crear Base de Datos PostgreSQL

**Opción A: Neon (Recomendado - Gratis)**
```bash
1. Ir a https://neon.tech
2. Crear cuenta gratuita
3. Crear nuevo proyecto
4. Copiar CONNECTION STRING
```

**Opción B: Supabase**
```bash
1. Ir a https://supabase.com
2. Crear proyecto
3. Ir a Settings → Database → Connection String
4. Copiar la cadena
```

**Opción C: Railway**
```bash
1. Ir a https://railway.app
2. Crear proyecto con PostgreSQL
3. Copiar la cadena de conexión
```

### 2. Configurar Google OAuth

```bash
1. Ir a https://console.cloud.google.com
2. Crear nuevo proyecto
3. Habilitar "Google+ API"
4. Ir a Credenciales → Crear OAuth 2.0
5. Tipo: Aplicación Web
6. URIs autorizados:
   - https://tu-dominio.vercel.app
   - https://tu-dominio.vercel.app/auth/callback
   - http://localhost:3000 (desarrollo)
7. Copiar Client ID y Client Secret
```

### 3. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/helpdesk-cesun.git
git branch -M main
git push -u origin main
```

### 4. Conectar Vercel

```bash
1. Ir a https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Seleccionar repositorio de GitHub
4. Configurar variables de entorno (ver paso 5)
5. Click "Deploy"
```

### 5. Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=https://tu-dominio.vercel.app/auth/callback
JWT_SECRET=una_clave_muy_larga_y_aleatoria_aqui
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/db
ALLOWED_DOMAINS=cesunbc.edu.mx,cesun.edu.mx
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app_gmail
EMAIL_FROM=tu_email@gmail.com
```

### 6. Inicializar Base de Datos

Después del primer deploy:

```bash
# Opción A: Localmente
npm run init-db

# Opción B: En Vercel (ejecutar en terminal)
vercel env pull
npm run init-db
```

### 7. Verificar Despliegue

```bash
1. Ir a https://tu-dominio.vercel.app
2. Intentar login con Google
3. Crear ticket de prueba
4. Verificar que los datos se guardan
```

---

## 🔐 Seguridad

### Credenciales Importantes
- **Admin Email**: `soportetecnico@cesun.edu.mx`
- **Dominios**: `@cesunbc.edu.mx`, `@cesun.edu.mx`
- **JWT Secret**: Cambiar en producción
- **Google OAuth**: Solo en dominios autorizados

### Mejores Prácticas
- Nunca compartir DATABASE_URL
- Usar variables de entorno para todos los secretos
- Cambiar JWT_SECRET regularmente
- Habilitar 2FA en Google Account
- Usar contraseñas de aplicación (no contraseña de cuenta)

---

## 📊 Estructura de Base de Datos

### Tabla: users
```sql
- id (VARCHAR 36) - UUID
- email (VARCHAR 255) - Email único
- name (VARCHAR 255) - Nombre completo
- role (VARCHAR 50) - admin, docente, estudiante, administrativo
- area (VARCHAR 255) - Área de trabajo
- puesto (VARCHAR 255) - Puesto/Cargo
- googleId (VARCHAR 255) - ID de Google
- createdAt (TIMESTAMP) - Fecha de creación
```

### Tabla: tickets
```sql
- id (VARCHAR 36) - UUID
- userId (VARCHAR 36) - ID del usuario que creó
- title (VARCHAR 255) - Título del ticket
- description (TEXT) - Descripción
- category (VARCHAR 100) - Categoría
- status (VARCHAR 50) - abierto, en proceso, cerrado, cancelado
- priority (VARCHAR 50) - normal, alta, urgente
- assignedTo (VARCHAR 36) - Asignado a (admin)
- attendedBy (VARCHAR 36) - Atendido por (admin)
- createdAt (TIMESTAMP) - Fecha de creación
- updatedAt (TIMESTAMP) - Última actualización
- firstResponseAt (TIMESTAMP) - Primera respuesta
- closedAt (TIMESTAMP) - Fecha de cierre
- reopenedAt (TIMESTAMP) - Fecha de reapertura
```

### Tabla: messages
```sql
- id (VARCHAR 36) - UUID
- ticketId (VARCHAR 36) - ID del ticket
- userId (VARCHAR 36) - ID del usuario
- message (TEXT) - Contenido del mensaje
- createdAt (TIMESTAMP) - Fecha de creación
```

### Tabla: ticket_history
```sql
- id (VARCHAR 36) - UUID
- ticketId (VARCHAR 36) - ID del ticket
- action (VARCHAR 100) - Tipo de acción
- oldStatus (VARCHAR 50) - Estado anterior
- newStatus (VARCHAR 50) - Estado nuevo
- description (TEXT) - Descripción
- userId (VARCHAR 36) - ID del usuario que realizó
- createdAt (TIMESTAMP) - Fecha de creación
```

---

## 🛠️ Desarrollo Local

### Requisitos
- Node.js 16+
- PostgreSQL 12+
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/helpdesk-cesun.git
cd helpdesk-cesun

# Instalar dependencias
npm install
cd client && npm install && cd ..

# Crear .env local
cp .env.example .env

# Editar .env con tus credenciales
# DATABASE_URL=postgresql://localhost/helpdesk_cesun
# GOOGLE_CLIENT_ID=tu_id
# GOOGLE_CLIENT_SECRET=tu_secret

# Inicializar base de datos
npm run init-db

# Ejecutar en desarrollo
npm run dev
```

### URLs Locales
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 📝 Variables de Entorno Explicadas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Ambiente | `production` o `development` |
| `PORT` | Puerto del servidor | `5000` |
| `GOOGLE_CLIENT_ID` | ID de Google OAuth | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Secret de Google OAuth | `GOCSPX-xxx` |
| `GOOGLE_CALLBACK_URL` | URL de callback | `https://tu-dominio.vercel.app/auth/callback` |
| `JWT_SECRET` | Clave para JWT | Cadena aleatoria larga |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@host/db` |
| `ALLOWED_DOMAINS` | Dominios autorizados | `cesunbc.edu.mx,cesun.edu.mx` |
| `EMAIL_PROVIDER` | Proveedor de email | `gmail` |
| `EMAIL_USER` | Email para enviar | `tu@gmail.com` |
| `EMAIL_PASSWORD` | Contraseña de app | Contraseña de aplicación |
| `EMAIL_FROM` | Email remitente | `tu@gmail.com` |

---

## 🐛 Solución de Problemas

### Error: "DATABASE_URL no definida"
```bash
✓ Verificar que está en Vercel Environment Variables
✓ Redeploy después de agregar
✓ Verificar que no hay espacios en blanco
```

### Error: "Google OAuth inválido"
```bash
✓ Verificar GOOGLE_CALLBACK_URL en Vercel
✓ Verificar que dominio está en Google Cloud Console
✓ Verificar que GOOGLE_CLIENT_ID es correcto
```

### Error: "Conexión a base de datos rechazada"
```bash
✓ Verificar DATABASE_URL es correcta
✓ Verificar que BD permite conexiones remotas
✓ Verificar que no hay restricciones de IP
✓ Probar conexión localmente primero
```

### Error: "Email no se envía"
```bash
✓ Verificar credenciales de Gmail
✓ Activar "Contraseñas de aplicación" en Google Account
✓ Verificar EMAIL_USER y EMAIL_PASSWORD
✓ Verificar que EMAIL_PROVIDER=gmail
```

---

## 📞 Soporte

- **Documentación Vercel**: https://vercel.com/docs
- **Documentación PostgreSQL**: https://www.postgresql.org/docs/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Neon**: https://neon.tech/docs
- **Supabase**: https://supabase.com/docs

---

## ✨ Características Implementadas

### Autenticación
- ✅ Google OAuth solo
- ✅ Dominios CESUN autorizados
- ✅ Cuenta admin única
- ✅ JWT tokens

### Gestión de Usuarios
- ✅ Panel de administración
- ✅ Asignación de roles
- ✅ Área y puesto de trabajo
- ✅ Lista de usuarios

### Tickets
- ✅ Crear, editar, eliminar
- ✅ Cambio de estado con confirmación
- ✅ Asignación a admin
- ✅ Chat en tiempo real
- ✅ Historial completo
- ✅ Tiempos de respuesta

### Notificaciones
- ✅ Email al crear ticket
- ✅ Email al cambiar estado
- ✅ Email en nuevos mensajes
- ✅ Notificaciones a admin

### Base de Datos
- ✅ PostgreSQL persistente
- ✅ Tablas con relaciones
- ✅ Índices para performance
- ✅ Timestamps automáticos

---

## 🎉 ¡Listo para Producción!

El sistema está completamente configurado para:
- ✅ Despliegue en Vercel
- ✅ Base de datos PostgreSQL
- ✅ Google OAuth en producción
- ✅ Dominios CESUN
- ✅ Notificaciones por email
- ✅ Gestión de usuarios y tickets

**Próximo paso**: Seguir los pasos de despliegue en Vercel arriba.
