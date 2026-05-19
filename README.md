# Help Desk CESUN - Sistema de Soporte Institucional

Sistema completo de help desk para instituciones educativas con autenticación Google OAuth, gestión de tickets, chat integrado y panel de administración.

## Características

✅ **Autenticación Google OAuth** - Integración con dominios @cesunbc.edu.ec y @cesun.edu.ec
✅ **3 Roles de Usuario** - Administrativos, Docentes, Estudiantes
✅ **Gestión de Tickets** - Crear, ver y gestionar tickets de soporte
✅ **Chat en Tiempo Real** - Comunicación integrada con Socket.io
✅ **Estados de Tickets** - Abierto, Atendido, En Retroalimentación, Cancelado
✅ **Panel de Administración** - Estadísticas, filtros avanzados y gestión de tickets
✅ **Dashboard Personalizado** - Vistas diferentes según el rol del usuario
✅ **Interfaz Moderna** - Diseño responsivo con Tailwind CSS

## Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Credenciales de Google OAuth (Client ID y Secret)

## Instalación

### 1. Clonar el repositorio
```bash
cd HelpDesk
```

### 2. Instalar dependencias del servidor
```bash
npm install
```

### 3. Instalar dependencias del cliente
```bash
cd client
npm install
cd ..
```

### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:
```
PORT=5000
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
JWT_SECRET=tu_jwt_secret_key
ALLOWED_DOMAINS=cesunbc.edu.ec,cesun.edu.ec
NODE_ENV=development
```

Crear archivo `.env.local` en `client/`:
```
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
```

## Configuración de Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0 (Aplicación web)
5. Agregar URIs autorizados:
   - `http://localhost:3000`
   - `http://localhost:5000`
6. Copiar Client ID y Secret al archivo `.env`

## Ejecución

### Desarrollo (ambos servidores simultáneamente)
```bash
npm run dev
```

Esto ejecutará:
- Backend en `http://localhost:5000`
- Frontend en `http://localhost:3000`

### Solo Backend
```bash
npm run server
```

### Solo Frontend
```bash
npm run client
```

## Estructura del Proyecto

```
HelpDesk/
├── server.js                 # Servidor Express principal
├── .env                      # Variables de entorno
├── package.json              # Dependencias del servidor
├── client/                   # Aplicación React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── TicketDetail.js
│   │   │   ├── TicketList.js
│   │   │   └── AdminPanel.js
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Uso

### Para Estudiantes
1. Iniciar sesión con cuenta Google (@cesunbc.edu.ec o @cesun.edu.ec)
2. Crear nuevos tickets desde el Dashboard
3. Ver estado de sus tickets
4. Comunicarse con soporte mediante chat

### Para Docentes
1. Iniciar sesión con cuenta Google
2. Crear y gestionar sus tickets
3. Acceder a chat de soporte
4. Ver historial de tickets

### Para Administrativos
1. Iniciar sesión con cuenta Google
2. Acceder a Panel de Administración
3. Ver estadísticas y métricas
4. Cambiar estado de tickets
5. Filtrar tickets por categoría, estado y tipo de usuario
6. Gestionar todos los tickets del sistema

## API Endpoints

### Autenticación
- `POST /api/auth/google` - Autenticar con Google

### Usuarios
- `GET /api/user` - Obtener datos del usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear nuevo ticket
- `GET /api/tickets/:id` - Obtener detalles del ticket
- `PATCH /api/tickets/:id` - Actualizar estado del ticket

### Mensajes
- `GET /api/tickets/:id/messages` - Obtener mensajes del ticket
- `POST /api/tickets/:id/messages` - Enviar mensaje

### Dashboard (Admin)
- `GET /api/dashboard` - Obtener estadísticas

## Socket.io Events

- `join_ticket` - Unirse a chat de ticket
- `leave_ticket` - Salir de chat de ticket
- `new_message` - Nuevo mensaje en tiempo real

## Tecnologías Utilizadas

### Backend
- Express.js
- Socket.io
- SQLite3
- JWT
- Google Auth Library

### Frontend
- React 18
- React Router
- Axios
- Socket.io Client
- Tailwind CSS
- Lucide React (Iconos)

## Seguridad

- Autenticación OAuth2 con Google
- JWT para autorización
- Validación de dominios permitidos
- Roles y permisos basados en usuario

## Licencia

MIT

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
