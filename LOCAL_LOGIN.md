# Login Local - Modo de Prueba

## Descripción

Se ha agregado un sistema de login local para que puedas probar la aplicación sin necesidad de configurar Google OAuth. Esto es útil para desarrollo y pruebas rápidas.

## Características

✅ **Sin Google OAuth** - No requiere credenciales de Google
✅ **Asignación Automática de Roles** - Basada en el email
✅ **Usuarios Dinámicos** - Se crean automáticamente al primer login
✅ **Seguro para Pruebas** - Solo funciona con dominios autorizados

## Cómo Usar

### 1. Acceder a la Pantalla de Login

1. Abrir http://localhost:3000
2. Verás dos opciones:
   - **Iniciar sesión con Google** (requiere configuración)
   - **Acceso de Prueba (Sin Google)** (disponible ahora)

### 2. Hacer Clic en "Acceso de Prueba"

Se abrirá un formulario con dos campos:
- **Email**: Debe terminar en @cesunbc.edu.ec o @cesun.edu.ec
- **Contraseña**: Cualquier contraseña funciona

### 3. Ejemplos de Emails para Prueba

#### Estudiante
```
Email: juan.estudiante@cesunbc.edu.ec
Contraseña: cualquier_contraseña
Rol: Estudiante
```

#### Docente
```
Email: maria.docente@cesun.edu.ec
Contraseña: cualquier_contraseña
Rol: Docente
```

#### Administrativo
```
Email: admin.soporte@cesunbc.edu.ec
Contraseña: cualquier_contraseña
Rol: Administrativo
```

## Asignación Automática de Roles

El rol se asigna automáticamente según el email:

| Email contiene | Rol |
|---|---|
| `admin` | Administrativo |
| `docente` o `profesor` | Docente |
| Otros | Estudiante |

### Ejemplos:

```
admin@cesunbc.edu.ec           → Administrativo
administrador@cesun.edu.ec     → Administrativo
docente@cesunbc.edu.ec         → Docente
profesor@cesun.edu.ec          → Docente
juan@cesunbc.edu.ec            → Estudiante
maria@cesun.edu.ec             → Estudiante
```

## Flujo de Prueba Completo

### Paso 1: Crear Ticket como Estudiante

1. Login con: `estudiante@cesunbc.edu.ec` / `123456`
2. Ir a Dashboard
3. Hacer clic en "Nuevo Ticket"
4. Llenar:
   - Título: "Problema de acceso"
   - Descripción: "No puedo acceder al sistema"
   - Categoría: "Técnico"
   - Prioridad: "Alta"
5. Hacer clic en "Crear Ticket"
6. ✅ Deberías ver el ticket en la lista

### Paso 2: Ver Ticket como Admin

1. Logout (botón rojo arriba a la derecha)
2. Login con: `admin@cesunbc.edu.ec` / `123456`
3. Ir a "Admin" en la barra de navegación
4. Verás el ticket creado por el estudiante
5. Hacer clic en "Gestionar"

### Paso 3: Cambiar Estado

1. En el detalle del ticket, hacer clic en "Atendido"
2. El estado cambia a verde
3. Se registra en el historial

### Paso 4: Enviar Mensaje

1. En la pestaña "Chat", escribir un mensaje
2. Hacer clic en "Enviar"
3. El mensaje aparece en el chat
4. Se registra en el historial

### Paso 5: Ver Historial

1. Hacer clic en la pestaña "Historial"
2. Ver timeline de todos los eventos:
   - Creación del ticket
   - Cambio de estado
   - Mensajes

## Características Disponibles en Modo Prueba

✅ Crear tickets
✅ Cambiar estado de tickets
✅ Enviar y recibir mensajes
✅ Ver historial completo
✅ Ver tiempos de respuesta
✅ Reabrir tickets cancelados
✅ Panel de administración con estadísticas
✅ Filtros por categoría, estado y rol

## Limitaciones del Modo Prueba

⚠️ **Sin Notificaciones por Email** - No se envían emails (requiere configuración)
⚠️ **Sin Verificación de Contraseña** - Cualquier contraseña funciona
⚠️ **Base de Datos en Memoria** - Los datos se pierden al reiniciar el servidor
⚠️ **Solo Dominios Autorizados** - Debe terminar en @cesunbc.edu.ec o @cesun.edu.ec

## Cambiar a Google OAuth

Cuando estés listo para usar Google OAuth:

1. Configurar credenciales en Google Cloud Console
2. Crear archivo `.env` con `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
3. Crear archivo `client/.env.local` con `REACT_APP_GOOGLE_CLIENT_ID`
4. El botón "Iniciar sesión con Google" estará disponible

El login local seguirá funcionando como opción alternativa.

## Usuarios de Prueba Recomendados

Copia y pega estos emails para pruebas rápidas:

```
# Estudiante
estudiante@cesunbc.edu.ec

# Docente
docente@cesun.edu.ec

# Admin
admin@cesunbc.edu.ec

# Otro estudiante
juan.perez@cesunbc.edu.ec

# Otro admin
administrador@cesun.edu.ec
```

## Solución de Problemas

### Error: "Dominio no autorizado"
- Asegúrate de usar @cesunbc.edu.ec o @cesun.edu.ec
- No funciona con otros dominios

### Error: "No se pudo determinar el rol"
- El email debe ser válido
- Verifica que el dominio es correcto

### No puedo ver el botón "Acceso de Prueba"
- Recarga la página (F5)
- Limpia el cache del navegador (Ctrl+Shift+Delete)
- Verifica que el servidor está corriendo

### Los datos desaparecen al reiniciar
- Es normal en modo prueba (base de datos en memoria)
- Para persistencia, configura una base de datos real

## Próximos Pasos

Cuando termines de probar:

1. **Configurar Google OAuth** - Ver INSTALLATION.md
2. **Configurar Email** - Ver EMAIL_NOTIFICATIONS.md
3. **Desplegar en Producción** - Ver README.md

## Notas Importantes

- Este modo es **solo para desarrollo y pruebas**
- No usar en producción
- La contraseña no se valida (cualquiera funciona)
- Los datos se pierden al reiniciar el servidor
- No se envían notificaciones por email

## Contacto

Para problemas o sugerencias sobre el login local, contacta al equipo de desarrollo.
