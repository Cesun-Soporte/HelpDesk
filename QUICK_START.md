# Inicio Rápido - Help Desk CESUN

## 1. Configuración Rápida (5 minutos)

### Paso 1: Obtener credenciales Google
1. Ir a https://console.cloud.google.com/
2. Crear proyecto "Help Desk CESUN"
3. Habilitar Google+ API
4. Crear credenciales OAuth (Aplicación web)
5. Agregar URIs: `http://localhost:3000`, `http://localhost:5000`
6. Copiar Client ID y Secret

### Paso 2: Crear archivos de configuración

**Archivo: `.env` (raíz del proyecto)**
```
PORT=5000
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
JWT_SECRET=tu_jwt_secret_key
ALLOWED_DOMAINS=cesunbc.edu.ec,cesun.edu.ec
NODE_ENV=development
```

**Archivo: `client/.env.local`**
```
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id
REACT_APP_API_URL=http://localhost:5000
```

### Paso 3: Instalar y ejecutar
```bash
# Instalar dependencias
npm install
cd client && npm install && cd ..

# Ejecutar (abre dos terminales)
npm run dev
```

## 2. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 3. Roles de Usuario (Automáticos)

| Email contiene | Rol |
|---|---|
| admin | Administrativo |
| docente, profesor | Docente |
| Otros | Estudiante |

## 4. Funcionalidades por Rol

### 👨‍🎓 Estudiante
- ✅ Crear tickets
- ✅ Ver mis tickets
- ✅ Chat de soporte
- ✅ Ver estado

### 👨‍🏫 Docente
- ✅ Crear tickets
- ✅ Ver mis tickets
- ✅ Chat de soporte
- ✅ Historial completo

### 👨‍💼 Administrativo
- ✅ Ver todos los tickets
- ✅ Cambiar estado (Abierto, Atendido, Retroalimentación, Cancelado)
- ✅ Panel de administración
- ✅ Estadísticas y gráficos
- ✅ Filtros avanzados por categoría, estado, rol
- ✅ Gestionar chat

## 5. Estados de Tickets

- 🔵 **Abierto** - Ticket nuevo sin atender
- 🟢 **Atendido** - Problema resuelto
- 🟡 **Retroalimentación** - Esperando respuesta del usuario
- 🔴 **Cancelado** - Ticket cerrado

## 6. Categorías de Tickets

- General
- Técnico
- Académico
- Administrativo
- Otro

## 7. Prioridades

- 🔴 Alta
- 🟡 Normal
- 🟢 Baja

## Documentación Completa

Ver `README.md` y `SETUP.md` para más detalles.
