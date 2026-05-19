# Cuentas de Prueba - Help Desk CESUN

## Cuentas de Administrador (3 opciones)

Usa cualquiera de estas cuentas para acceder como **Administrativo**:

### Admin 1
```
Email:      admin.soporte@cesunbc.edu.ec
Contraseña: 123
Rol:        Administrativo
```

### Admin 2
```
Email:      administrador@cesun.edu.ec
Contraseña: 123
Rol:        Administrativo
```

### Admin 3
```
Email:      admin.helpdesk@cesunbc.edu.ec
Contraseña: 123
Rol:        Administrativo
```

---

## Cuentas de Prueba Adicionales

### Estudiante
```
Email:      luis@cesunbc.edu.ec
Contraseña: 123
Rol:        Estudiante
```

### Docente
```
Email:      docente@cesun.edu.ec
Contraseña: 123
Rol:        Docente
```

---

## Cómo Usar

1. Abre http://localhost:3000
2. Haz clic en **"Acceso de Prueba (Sin Google)"**
3. Copia uno de los emails de admin
4. Pega en el campo "Email"
5. Escribe cualquier contraseña (ej: `123`)
6. Haz clic en **"Iniciar Sesión"**

---

## Pantallas Disponibles para Admin

### Dashboard
- Ver resumen de tickets
- Estadísticas rápidas
- Crear tickets

### Tickets
- Ver todos los tickets
- Filtrar por categoría y estado
- Ver detalles de cada ticket

### Panel de Administración
- Estadísticas completas
- Gráficos por rol, estado y categoría
- Filtros avanzados
- Gestionar todos los tickets

### Detalle de Ticket
- Ver información completa
- Chat en tiempo real
- Cambiar estado (Abierto, Atendido, Retroalimentación, Cancelado)
- Ver historial completo
- Ver tiempos de respuesta

---

## Flujo de Prueba Recomendado

### Paso 1: Crear Ticket como Estudiante
1. Login con: `luis@cesunbc.edu.ec` / `123`
2. Dashboard → "Nuevo Ticket"
3. Llenar datos y crear

### Paso 2: Ver en Panel Admin
1. Logout
2. Login con: `admin.soporte@cesunbc.edu.ec` / `123`
3. Ir a "Admin"
4. Ver el ticket creado

### Paso 3: Gestionar Ticket
1. Hacer clic en "Gestionar"
2. Cambiar estado a "Atendido"
3. Enviar mensaje en el chat
4. Ver historial

### Paso 4: Cambiar a Otro Admin
1. Logout
2. Login con: `administrador@cesun.edu.ec` / `123`
3. Ver el mismo ticket
4. Probar otras funcionalidades

---

## Notas Importantes

✅ Todos los emails deben terminar en @cesunbc.edu.ec o @cesun.edu.ec
✅ La contraseña puede ser cualquiera (no se valida en modo prueba)
✅ El rol se asigna automáticamente según el email
✅ Los datos se pierden al reiniciar el servidor

---

## Características para Probar

### Como Admin puedes:
- ✅ Ver todos los tickets
- ✅ Cambiar estado de tickets
- ✅ Enviar mensajes
- ✅ Ver historial completo
- ✅ Ver tiempos de respuesta
- ✅ Reabrir tickets cancelados
- ✅ Filtrar tickets
- ✅ Ver estadísticas

### Como Estudiante puedes:
- ✅ Crear tickets
- ✅ Ver mis tickets
- ✅ Enviar mensajes
- ✅ Ver estado de mis tickets

### Como Docente puedes:
- ✅ Crear tickets
- ✅ Ver mis tickets
- ✅ Enviar mensajes
- ✅ Ver estado de mis tickets

---

## Pantallas Principales

### 1. Login
- Opción Google OAuth (requiere configuración)
- Opción Acceso de Prueba (disponible ahora)

### 2. Dashboard
- Resumen de tickets
- Estadísticas rápidas
- Botón para crear ticket

### 3. Tickets
- Lista de todos los tickets
- Filtros por categoría y estado
- Ver detalles de cada ticket

### 4. Detalle de Ticket
- Información completa
- Chat integrado
- Historial de cambios
- Tiempos de respuesta
- Cambio de estado

### 5. Panel Admin
- Estadísticas avanzadas
- Gráficos
- Filtros avanzados
- Gestión de tickets

---

## Atajos Útiles

| Acción | Ruta |
|--------|------|
| Dashboard | http://localhost:3000/dashboard |
| Tickets | http://localhost:3000/tickets |
| Ticket Detalle | http://localhost:3000/tickets/{id} |
| Panel Admin | http://localhost:3000/admin |
| Login | http://localhost:3000/login |

---

## Solución de Problemas

### No puedo entrar con admin
- Verifica que el email termina en @cesunbc.edu.ec o @cesun.edu.ec
- Intenta con otro email de admin

### No veo el botón "Acceso de Prueba"
- Recarga la página (F5)
- Limpia el cache (Ctrl+Shift+Delete)

### Los datos desaparecen
- Es normal (base de datos en memoria)
- Reinicia el servidor para limpiar

### El servidor no responde
- Verifica que está corriendo: `npm run server`
- Verifica puerto 5000: `netstat -ano | findstr :5000`

---

## Próximos Pasos

Cuando termines de probar:
1. Configurar Google OAuth
2. Configurar notificaciones por email
3. Desplegar en producción
