# Sistema de Notificaciones por Correo Electrónico

## Descripción General

El sistema Help Desk CESUN incluye notificaciones automáticas por correo electrónico para todas las actualizaciones de tickets. Los usuarios reciben notificaciones en tiempo real cuando:

- Se crea un nuevo ticket
- El estado de un ticket cambia
- Se recibe un nuevo mensaje en un ticket
- Se reabre un ticket cancelado

## Configuración

### Requisitos Previos

Necesitas configurar un servicio de email. El sistema soporta dos opciones:

1. **Gmail** (Recomendado para pruebas)
2. **SMTP Genérico** (Para servidores corporativos)

### Opción 1: Configurar con Gmail

#### Paso 1: Habilitar "Contraseñas de Aplicación"

1. Ir a https://myaccount.google.com/security
2. Habilitar "Verificación en dos pasos"
3. Ir a "Contraseñas de aplicación"
4. Seleccionar "Correo" y "Windows"
5. Copiar la contraseña generada

#### Paso 2: Actualizar archivo `.env`

```
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=contraseña_app_generada
EMAIL_FROM=tu_email@gmail.com
```

### Opción 2: Configurar con SMTP Genérico

Para usar un servidor SMTP corporativo o de otro proveedor:

```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.tuproveedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_usuario@tuproveedor.com
SMTP_PASSWORD=tu_contraseña
EMAIL_FROM=tu_email@tuproveedor.com
```

**Notas:**
- `SMTP_PORT`: Generalmente 587 (TLS) o 465 (SSL)
- `SMTP_SECURE`: true para puerto 465, false para 587

## Tipos de Notificaciones

### 1. 📧 Ticket Creado

**Enviado a:** Usuario que crea el ticket + Todos los admins

**Contenido:**
- ID del ticket
- Título
- Estado inicial (Abierto)
- Enlace para ver detalles

**Ejemplo:**
```
Asunto: Ticket Creado: Problema de acceso al sistema
De: noreply@helpdesk.cesun.edu.ec
Para: estudiante@cesunbc.edu.ec

Hola Juan,

Tu ticket ha sido creado exitosamente en el sistema Help Desk CESUN.

ID del Ticket: a1b2c3d4e5f6
Título: Problema de acceso al sistema
Estado: Abierto

Tu solicitud ha sido registrada y será atendida por nuestro equipo...
```

### 2. 🔄 Cambio de Estado

**Enviado a:** Usuario que creó el ticket

**Contenido:**
- ID del ticket
- Título
- Estado anterior
- Nuevo estado

**Estados posibles:**
- Abierto → Atendido
- Abierto → En Retroalimentación
- Abierto → Cancelado
- Cancelado → Abierto (Reabierto)

**Ejemplo:**
```
Asunto: Actualización: Problema de acceso al sistema
De: noreply@helpdesk.cesun.edu.ec
Para: estudiante@cesunbc.edu.ec

Hola Juan,

El estado de tu ticket ha sido actualizado.

ID del Ticket: a1b2c3d4e5f6
Título: Problema de acceso al sistema
Estado Anterior: Abierto
Nuevo Estado: Atendido

Puedes ver más detalles en el sistema Help Desk CESUN...
```

### 3. 💬 Nuevo Mensaje

**Enviado a:**
- Usuario que creó el ticket (si el mensaje es de un admin)
- Todos los admins (si el mensaje es de estudiante/docente)

**Contenido:**
- Título del ticket
- ID del ticket
- Nombre de quien envió el mensaje
- Contenido del mensaje (primeras líneas)

**Ejemplo:**
```
Asunto: Nuevo mensaje: Problema de acceso al sistema
De: noreply@helpdesk.cesun.edu.ec
Para: estudiante@cesunbc.edu.ec

Hola Juan,

Admin Support ha enviado un nuevo mensaje en tu ticket.

Ticket: Problema de acceso al sistema
ID: a1b2c3d4e5f6

Mensaje:
Hemos identificado el problema. Tu cuenta estaba desactivada...
```

### 4. 🔔 Notificación para Admins

**Enviado a:** Todos los administradores

**Contenido:**
- Acción realizada
- ID del ticket
- Título
- Solicitante
- Detalles adicionales

**Ejemplo:**
```
Asunto: [ADMIN] Nuevo evento en ticket: Problema de acceso al sistema
De: noreply@helpdesk.cesun.edu.ec
Para: admin@cesun.edu.ec

Hola Admin,

Hay una nueva actividad en un ticket que requiere tu atención.

Acción: Nuevo Ticket Creado
Ticket ID: a1b2c3d4
Título: Problema de acceso al sistema
Solicitante: Juan Pérez
Detalles: tecnico - Prioridad: alta

Accede al panel de administración para gestionar este ticket...
```

## Flujo de Notificaciones

### Creación de Ticket
```
Usuario crea ticket
    ↓
✉️ Email al usuario: "Ticket Creado"
✉️ Email a admins: "Nuevo Ticket"
```

### Cambio de Estado
```
Admin cambia estado
    ↓
✉️ Email al usuario: "Cambio de Estado"
```

### Nuevo Mensaje
```
Alguien envía mensaje
    ↓
Si es admin → ✉️ Email al usuario
Si es usuario → ✉️ Email a todos los admins
```

### Reabrir Ticket
```
Admin reabre ticket
    ↓
✉️ Email al usuario: "Ticket Reabierto"
```

## Plantillas de Email

Todas las plantillas incluyen:

✅ **Encabezado con gradiente** - Identificación visual clara
✅ **Información del ticket** - ID, título, estado
✅ **Detalles específicos** - Según el tipo de notificación
✅ **Llamada a la acción** - Enlace para ver detalles
✅ **Pie de página** - Información de contacto

Las plantillas están diseñadas para ser:
- Responsivas (funcionan en móvil y desktop)
- Profesionales
- Claras y fáciles de leer
- Con colores corporativos

## Solución de Problemas

### Los emails no se envían

**Problema:** Las notificaciones no llegan

**Soluciones:**
1. Verificar que `EMAIL_PROVIDER` está configurado
2. Verificar credenciales en `.env`
3. Revisar logs del servidor para errores
4. Si usas Gmail, verificar que habilitaste "Contraseñas de aplicación"

### Errores de autenticación

**Problema:** "Error configurando servicio de email"

**Soluciones:**
1. Verificar que `EMAIL_USER` y `EMAIL_PASSWORD` son correctos
2. Para Gmail: usar contraseña de aplicación, no la contraseña de cuenta
3. Para SMTP: verificar que el servidor y puerto son correctos

### Emails van a spam

**Problema:** Los emails llegan a la carpeta de spam

**Soluciones:**
1. Configurar SPF, DKIM y DMARC en tu dominio
2. Usar un dominio de email profesional
3. Incluir información de contacto clara
4. Pedir a usuarios que marquen como "No es spam"

## Configuración Avanzada

### Personalizar Remitente

En `.env`:
```
EMAIL_FROM=noreply@helpdesk.cesun.edu.ec
```

### Usar Variable de Entorno para Contraseña

Para mayor seguridad, no guardes contraseñas en `.env`:

```bash
export EMAIL_PASSWORD="tu_contraseña_segura"
```

### Deshabilitar Notificaciones Temporalmente

En `emailService.js`, comentar la línea de inicialización:
```javascript
// initializeEmailService();
```

## Mejores Prácticas

### Para Administradores

✅ Responde rápido a los tickets para que los usuarios reciban notificaciones
✅ Usa estados apropiados para mantener a los usuarios informados
✅ Incluye mensajes claros cuando cambies el estado

### Para Usuarios

✅ Revisa tu carpeta de spam si no recibes notificaciones
✅ Responde a los emails para mantener la comunicación
✅ No compartas tu contraseña por email

### Para Configuración

✅ Usa contraseñas de aplicación en lugar de contraseñas de cuenta
✅ Configura SPF/DKIM para mejorar entregabilidad
✅ Prueba la configuración antes de ir a producción
✅ Monitorea los logs para detectar problemas

## Estadísticas y Monitoreo

El sistema registra automáticamente:
- Emails enviados exitosamente
- Errores en el envío
- Timestamps de cada notificación

Revisa los logs del servidor para:
```
Servicio de email configurado correctamente
Email enviado a usuario@cesunbc.edu.ec: Ticket Creado
```

## Próximas Mejoras

- [ ] Preferencias de notificación por usuario
- [ ] Resumen diario de tickets
- [ ] Notificaciones por SMS
- [ ] Webhooks para integraciones
- [ ] Plantillas personalizables
- [ ] Tracking de aperturas de email

## Soporte

Para problemas con notificaciones por correo:
1. Verificar configuración en `.env`
2. Revisar logs del servidor
3. Probar credenciales manualmente
4. Contactar al equipo de soporte

## Ejemplos de Configuración

### Gmail (Producción)
```
EMAIL_PROVIDER=gmail
EMAIL_USER=helpdesk@cesun.edu.ec
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=helpdesk@cesun.edu.ec
```

### Servidor Corporativo
```
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.cesun.edu.ec
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=helpdesk@cesun.edu.ec
SMTP_PASSWORD=contraseña_segura
EMAIL_FROM=helpdesk@cesun.edu.ec
```

### Pruebas Locales
```
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email_personal@gmail.com
EMAIL_PASSWORD=contraseña_app
EMAIL_FROM=tu_email_personal@gmail.com
```
