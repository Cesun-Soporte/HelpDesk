# Guía de Instalación - Help Desk CESUN

## Estado Actual

✅ **Servidor Backend**: Ejecutándose en puerto 5000
✅ **Dependencias**: Instaladas correctamente
⚠️ **Email**: Requiere configuración

## Paso 1: Configurar Google OAuth

### 1.1 Crear Proyecto en Google Cloud Console

1. Ir a https://console.cloud.google.com/
2. Crear un nuevo proyecto: "Help Desk CESUN"
3. Esperar a que se cree

### 1.2 Habilitar Google+ API

1. En el menú izquierdo: "APIs y servicios"
2. Hacer clic en "Habilitar APIs y servicios"
3. Buscar "Google+ API"
4. Hacer clic en "Habilitar"

### 1.3 Crear Credenciales OAuth

1. Ir a "Credenciales"
2. Hacer clic en "Crear credenciales" → "ID de cliente OAuth"
3. Seleccionar "Aplicación web"
4. Agregar URIs autorizados:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - `http://localhost:3000/auth/callback`
5. Copiar **Client ID** y **Client Secret**

## Paso 2: Crear Archivo `.env`

Crear archivo `C:\Users\asis.ti\Desktop\HelpDesk\.env` con:

```
PORT=5000
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
JWT_SECRET=tu_jwt_secret_key_super_segura_123456
ALLOWED_DOMAINS=cesunbc.edu.ec,cesun.edu.ec
NODE_ENV=development

# Configuración de Email - Opción 1: Gmail (Recomendado)
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=contraseña_app_generada
EMAIL_FROM=tu_email@gmail.com

# Configuración de Email - Opción 2: SMTP (Descomenta si usas otro proveedor)
# EMAIL_PROVIDER=smtp
# SMTP_HOST=smtp.tuproveedor.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=tu_usuario@tuproveedor.com
# SMTP_PASSWORD=tu_contraseña
# EMAIL_FROM=tu_email@tuproveedor.com
```

## Paso 3: Configurar Email (Opción A: Gmail)

### 3.1 Habilitar Verificación en Dos Pasos

1. Ir a https://myaccount.google.com/security
2. Habilitar "Verificación en dos pasos"
3. Seguir las instrucciones

### 3.2 Generar Contraseña de Aplicación

1. Ir a https://myaccount.google.com/apppasswords
2. Seleccionar "Correo" y "Windows"
3. Copiar la contraseña generada (16 caracteres)
4. Pegar en `.env` como `EMAIL_PASSWORD`

## Paso 4: Configurar Cliente React

Crear archivo `C:\Users\asis.ti\Desktop\HelpDesk\client\.env.local` con:

```
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_aqui
REACT_APP_API_URL=http://localhost:5000
```

## Paso 5: Ejecutar la Aplicación

### Opción A: Ejecutar Backend y Frontend por Separado

**Terminal 1 (Backend):**
```powershell
npm run server
```

**Terminal 2 (Frontend):**
```powershell
cd client
npm start
```

### Opción B: Ejecutar Ambos Simultáneamente

```powershell
npm run dev
```

## Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Verificar que Todo Funciona

1. Abrir http://localhost:3000 en el navegador
2. Hacer clic en "Iniciar sesión con Google"
3. Seleccionar una cuenta con dominio @cesunbc.edu.ec o @cesun.edu.ec
4. Crear un ticket
5. Verificar que llega un email de confirmación

## Solución de Problemas

### Error: "Cannot find module 'nodemailer'"
```powershell
npm install nodemailer
```

### Error: "Missing credentials for PLAIN"
- Verificar que `.env` tiene `EMAIL_USER` y `EMAIL_PASSWORD`
- Si usas Gmail, asegúrate de usar "Contraseña de aplicación", no la contraseña de cuenta

### Error: "Invalid Client ID"
- Verificar que `GOOGLE_CLIENT_ID` es correcto
- Verificar que localhost:3000 está en URIs autorizados en Google Cloud

### React no inicia
```powershell
cd client
npm install
npm start
```

### Puerto 5000 ya está en uso
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Estructura de Carpetas

```
C:\Users\asis.ti\Desktop\HelpDesk\
├── server.js                    # Backend Express
├── emailService.js              # Servicio de email
├── package.json                 # Dependencias servidor
├── .env                         # Variables de entorno (crear)
├── .env.example                 # Ejemplo de variables
├── README.md                    # Documentación principal
├── SETUP.md                     # Guía de configuración
├── QUICK_START.md               # Inicio rápido
├── FEATURES_UPDATE.md           # Nuevas características
├── EMAIL_NOTIFICATIONS.md       # Notificaciones por email
├── INSTALLATION.md              # Este archivo
└── client/                      # Aplicación React
    ├── package.json
    ├── .env.local               # Variables de entorno cliente (crear)
    ├── public/
    │   └── index.html
    └── src/
        ├── pages/
        ├── components/
        ├── App.js
        └── index.js
```

## Próximos Pasos

1. ✅ Instalar dependencias
2. ⏳ Configurar Google OAuth
3. ⏳ Crear archivo `.env`
4. ⏳ Configurar email
5. ⏳ Crear archivo `client/.env.local`
6. ⏳ Ejecutar aplicación
7. ⏳ Probar con usuario de prueba

## Características Implementadas

✅ Autenticación Google OAuth (3 roles)
✅ Gestión de tickets
✅ Chat en tiempo real
✅ Panel de administración
✅ Tiempos de respuesta
✅ Historial de seguimiento
✅ Reabrir tickets
✅ Notificaciones por correo

## Soporte

Para problemas:
1. Revisar logs del servidor
2. Verificar configuración en `.env`
3. Revisar documentación específica (EMAIL_NOTIFICATIONS.md, etc.)
4. Contactar al equipo de soporte
