# Guía de Configuración - Help Desk CESUN

## Paso 1: Obtener Credenciales de Google OAuth

### 1.1 Crear Proyecto en Google Cloud Console
1. Ir a https://console.cloud.google.com/
2. Crear un nuevo proyecto (nombre: "Help Desk CESUN")
3. Esperar a que se cree el proyecto

### 1.2 Habilitar Google+ API
1. En el panel izquierdo, ir a "APIs y servicios"
2. Hacer clic en "Habilitar APIs y servicios"
3. Buscar "Google+ API"
4. Hacer clic en "Habilitar"

### 1.3 Crear Credenciales OAuth
1. Ir a "Credenciales" en el menú izquierdo
2. Hacer clic en "Crear credenciales" → "ID de cliente OAuth"
3. Seleccionar "Aplicación web"
4. Agregar URIs autorizados:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - `http://localhost:3000/auth/callback`
5. Copiar el **Client ID** y **Client Secret**

## Paso 2: Configurar Variables de Entorno

### 2.1 Archivo `.env` (raíz del proyecto)
Crear archivo `C:/Users/asis.ti/Desktop/HelpDesk/.env`:
```
PORT=5000
GOOGLE_CLIENT_ID=<tu_client_id_aqui>
GOOGLE_CLIENT_SECRET=<tu_client_secret_aqui>
JWT_SECRET=tu_jwt_secret_key_super_segura_123456
ALLOWED_DOMAINS=cesunbc.edu.ec,cesun.edu.ec
NODE_ENV=development
```

### 2.2 Archivo `.env.local` (en carpeta client)
Crear archivo `C:/Users/asis.ti/Desktop/HelpDesk/client/.env.local`:
```
REACT_APP_GOOGLE_CLIENT_ID=<tu_client_id_aqui>
REACT_APP_API_URL=http://localhost:5000
```

## Paso 3: Instalar Dependencias

### 3.1 Instalar dependencias del servidor
```bash
cd C:/Users/asis.ti/Desktop/HelpDesk
npm install
```

### 3.2 Instalar dependencias del cliente
```bash
cd client
npm install
cd ..
```

## Paso 4: Ejecutar la Aplicación

### Opción A: Ejecutar ambos servidores simultáneamente
```bash
npm run dev
```

Esto abrirá:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Opción B: Ejecutar servidores por separado

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

## Paso 5: Probar la Aplicación

### 5.1 Crear Cuentas de Prueba
Para probar los diferentes roles, necesitas crear cuentas Google en los dominios:
- `@cesunbc.edu.ec`
- `@cesun.edu.ec`

**Nota**: La asignación de roles se hace automáticamente:
- Email con "admin" → Rol: Administrativo
- Email con "docente" o "profesor" → Rol: Docente
- Otros emails → Rol: Estudiante

### 5.2 Flujo de Prueba

#### Como Estudiante:
1. Iniciar sesión con cuenta de estudiante
2. Hacer clic en "Nuevo Ticket"
3. Crear un ticket con:
   - Título: "Problema de acceso"
   - Descripción: "No puedo acceder al sistema"
   - Categoría: "Técnico"
   - Prioridad: "Alta"
4. Ver el ticket en el Dashboard
5. Enviar mensajes en el chat

#### Como Docente:
1. Iniciar sesión con cuenta de docente
2. Crear y gestionar tickets
3. Ver chat de soporte

#### Como Administrativo:
1. Iniciar sesión con cuenta admin
2. Hacer clic en "Admin" en la barra de navegación
3. Ver:
   - Estadísticas de tickets
   - Gráficos por rol y estado
   - Categorías principales
4. Usar filtros avanzados
5. Cambiar estado de tickets
6. Gestionar tickets de todos los usuarios

## Estructura de Carpetas Creadas

```
C:/Users/asis.ti/Desktop/HelpDesk/
├── server.js                    # Servidor Express
├── package.json                 # Dependencias del servidor
├── .env                         # Variables de entorno (crear)
├── .env.example                 # Ejemplo de variables
├── .gitignore                   # Archivos a ignorar
├── README.md                    # Documentación
├── SETUP.md                     # Este archivo
├── client/
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
│   ├── postcss.config.js
│   ├── .env.example
│   └── .env.local               # Crear con variables
```

## Solución de Problemas

### Error: "GOOGLE_CLIENT_ID is not defined"
- Verificar que `.env` existe en la raíz del proyecto
- Verificar que las variables están correctamente asignadas
- Reiniciar el servidor

### Error: "Cannot find module 'google-auth-library'"
```bash
npm install google-auth-library
```

### Error: "Socket.io connection failed"
- Verificar que el backend está ejecutándose en puerto 5000
- Verificar que CORS está habilitado

### Error: "Google login not working"
- Verificar que REACT_APP_GOOGLE_CLIENT_ID está en `.env.local`
- Verificar que el Client ID es correcto
- Verificar que localhost:3000 está en URIs autorizados en Google Cloud

### Error: "Database locked"
- La base de datos SQLite está en memoria, no requiere archivo
- Si hay problemas, reiniciar el servidor

## Características Implementadas

✅ **Autenticación Google OAuth**
- Validación de dominios (@cesunbc.edu.ec, @cesun.edu.ec)
- Asignación automática de roles
- JWT para sesiones

✅ **Gestión de Tickets**
- Crear tickets
- Ver detalles
- Cambiar estado (Abierto, Atendido, Retroalimentación, Cancelado)
- Filtrar por categoría y estado

✅ **Chat en Tiempo Real**
- Socket.io para mensajes en vivo
- Historial de mensajes
- Identificación de usuario

✅ **Panel de Administración**
- Estadísticas de tickets
- Gráficos por rol, estado y categoría
- Filtros avanzados
- Gestión completa de tickets

✅ **Interfaz Responsiva**
- Diseño mobile-first
- Tailwind CSS
- Iconos con Lucide React

## Próximos Pasos (Opcionales)

1. **Persistencia de Base de Datos**: Cambiar SQLite en memoria a archivo
2. **Notificaciones por Email**: Integrar servicio de email
3. **Exportar Reportes**: Generar reportes en PDF
4. **Autenticación 2FA**: Agregar verificación de dos factores
5. **Despliegue en Producción**: Usar Heroku, AWS o similar

## Contacto y Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
