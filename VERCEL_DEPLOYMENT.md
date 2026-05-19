# Guía de Despliegue en Vercel

## Requisitos Previos

1. **Cuenta en Vercel** - https://vercel.com
2. **Repositorio en GitHub** - Con el código del proyecto
3. **Base de datos PostgreSQL** - Recomendado: Neon, Supabase o Railway
4. **Credenciales de Google OAuth** - Para producción

## Paso 1: Preparar la Base de Datos PostgreSQL

### Opción A: Neon (Recomendado)
1. Ir a https://neon.tech
2. Crear una cuenta gratuita
3. Crear un nuevo proyecto
4. Copiar la cadena de conexión (DATABASE_URL)

### Opción B: Supabase
1. Ir a https://supabase.com
2. Crear un nuevo proyecto
3. Ir a Settings → Database → Connection String
4. Copiar la cadena de conexión

### Opción C: Railway
1. Ir a https://railway.app
2. Crear un nuevo proyecto
3. Agregar PostgreSQL
4. Copiar la cadena de conexión

## Paso 2: Configurar Google OAuth para Producción

1. Ir a Google Cloud Console - https://console.cloud.google.com
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar "Google+ API"
4. Ir a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth"
5. Seleccionar "Aplicación web"
6. Agregar URIs autorizados:
   - `https://tu-dominio.vercel.app`
   - `https://tu-dominio.vercel.app/auth/callback`
   - `http://localhost:3000` (para desarrollo local)
7. Copiar Client ID y Client Secret

## Paso 3: Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/helpdesk-cesun.git
git push -u origin main
```

## Paso 4: Conectar Vercel con GitHub

1. Ir a https://vercel.com/dashboard
2. Hacer clic en "Add New..." → "Project"
3. Seleccionar tu repositorio de GitHub
4. Configurar variables de entorno (ver Paso 5)
5. Hacer clic en "Deploy"

## Paso 5: Configurar Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables, agregar:

```
NODE_ENV=production
PORT=3000
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_CALLBACK_URL=https://tu-dominio.vercel.app/auth/callback
JWT_SECRET=una_clave_secreta_muy_larga_y_aleatoria
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/basedatos
ALLOWED_DOMAINS=cesunbc.edu.mx,cesun.edu.mx
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app_gmail
EMAIL_FROM=tu_email@gmail.com
```

## Paso 6: Inicializar la Base de Datos

Después del primer despliegue, ejecutar:

```bash
npm run init-db
```

O en Vercel, crear un webhook que ejecute:
```
node init-db.js
```

## Paso 7: Configurar Dominios Personalizados

1. En Vercel Dashboard → Settings → Domains
2. Agregar tu dominio personalizado
3. Seguir las instrucciones para configurar DNS

## Paso 8: Verificar el Despliegue

1. Ir a `https://tu-dominio.vercel.app`
2. Intentar login con Google
3. Verificar que la base de datos está conectada
4. Crear un ticket de prueba

## Solución de Problemas

### Error: "DATABASE_URL no definida"
- Verificar que DATABASE_URL está configurada en Vercel Environment Variables
- Redeploy después de agregar la variable

### Error: "Google OAuth inválido"
- Verificar que GOOGLE_CALLBACK_URL coincide con la URL de Vercel
- Verificar que el dominio está autorizado en Google Cloud Console

### Error: "Conexión a base de datos rechazada"
- Verificar que DATABASE_URL es correcta
- Verificar que la base de datos permite conexiones remotas
- Verificar que no hay restricciones de IP

### Error: "Email no se envía"
- Verificar credenciales de Gmail
- Activar "Contraseñas de aplicación" en Google Account
- Verificar que EMAIL_USER y EMAIL_PASSWORD son correctos

## Monitoreo

- Vercel proporciona logs en Dashboard → Deployments → Logs
- Verificar errores en la consola del navegador
- Usar PostgreSQL admin panel para verificar datos

## Seguridad

- Nunca compartir DATABASE_URL o credenciales
- Usar variables de entorno para todos los secretos
- Cambiar JWT_SECRET regularmente
- Habilitar 2FA en Google Account

## Actualizaciones

Para actualizar el código:
1. Hacer cambios localmente
2. Commit y push a GitHub
3. Vercel redeploy automáticamente
4. Si hay cambios en la base de datos, ejecutar `npm run init-db`

## Soporte

Para más información:
- Documentación de Vercel: https://vercel.com/docs
- Documentación de PostgreSQL: https://www.postgresql.org/docs/
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
