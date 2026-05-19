# Actualización de Funcionalidades - Help Desk CESUN

## Nuevas Características Implementadas

### 1. ⏱️ Tiempos de Respuesta

Se han agregado métricas automáticas para rastrear los tiempos de respuesta:

- **Primera Respuesta**: Tiempo desde la creación del ticket hasta la primera respuesta del administrador
- **Tiempo de Resolución**: Tiempo desde la creación hasta que el ticket es marcado como "Atendido"
- **Formato Legible**: Los tiempos se muestran en formato humanizado (ej: "2h 30m", "1d 5h")

#### Cómo funciona:
- Cuando un admin envía el primer mensaje en un ticket, se registra automáticamente `firstResponseAt`
- Cuando el estado cambia a "Atendido", se registra `closedAt`
- Estos tiempos se muestran en el panel lateral del ticket

### 2. 🔄 Reabrir Tickets Cerrados

Los tickets cancelados ahora pueden ser reabiertos:

- **Botón de Reabrir**: Aparece en la sección de información cuando el ticket está cancelado
- **Confirmación**: Se pide confirmación antes de reabrir
- **Historial**: Se registra automáticamente la reapertura en el historial
- **Timestamp**: Se guarda `reopenedAt` para auditoría

#### Cómo usar:
1. Ir a un ticket con estado "Cancelado"
2. En el panel lateral, hacer clic en "Reabrir Ticket"
3. Confirmar la acción
4. El ticket volverá a estado "Abierto"

### 3. 📋 Historial Completo de Seguimiento

Se agregó una pestaña de "Historial" que muestra todas las acciones realizadas en el ticket:

#### Eventos registrados:
- **Cambios de estado**: Muestra transición de estados (ej: "abierto → atendido")
- **Mensajes**: Cada mensaje enviado se registra
- **Reaperturas**: Cuando se reabre un ticket
- **Información del usuario**: Quién realizó cada acción
- **Timestamp**: Fecha y hora exacta de cada evento

#### Visualización:
- Timeline vertical con puntos conectados
- Información clara de cada evento
- Nombre del usuario que realizó la acción
- Fecha y hora completa

### 4. 📊 Métricas Mejoradas

En el panel lateral de cada ticket se muestran:

```
Tiempos de Respuesta
├── Primera respuesta: 2h 30m
│   └── Fecha: 19/05/2026 14:30
├── Tiempo de resolución: 5h 15m
│   └── Fecha: 19/05/2026 17:45
└── Reabierto: (si aplica)
    └── Fecha: 19/05/2026 18:00
```

## Cambios en la Base de Datos

Se agregaron nuevos campos a la tabla `tickets`:

```sql
firstResponseAt DATETIME    -- Primera respuesta del admin
closedAt DATETIME           -- Cuando fue marcado como atendido
reopenedAt DATETIME         -- Cuando fue reabierto
```

Se mejoró la tabla `ticket_history`:

```sql
description TEXT            -- Descripción adicional del evento
```

## Cambios en la API

### Nuevos Endpoints

#### GET `/api/tickets/:id/history`
Obtiene el historial completo de un ticket con métricas

**Respuesta:**
```json
{
  "history": [
    {
      "id": "uuid",
      "ticketId": "uuid",
      "action": "status_change|message|reopen",
      "oldStatus": "abierto",
      "newStatus": "atendido",
      "description": "Cambio de estado: abierto → atendido",
      "userId": "uuid",
      "name": "Admin Name",
      "role": "admin",
      "createdAt": "2026-05-19T14:30:00Z"
    }
  ],
  "metrics": {
    "createdAt": "2026-05-19T12:00:00Z",
    "firstResponseAt": "2026-05-19T14:30:00Z",
    "closedAt": "2026-05-19T17:45:00Z",
    "reopenedAt": null,
    "responseTimeMs": 9000000,
    "resolutionTimeMs": 20700000,
    "responseTimeFormatted": "2h 30m",
    "resolutionTimeFormatted": "5h 45m"
  }
}
```

#### POST `/api/tickets/:id/reopen`
Reabre un ticket cancelado

**Requisitos:**
- Solo funciona si el ticket está en estado "cancelado"
- Requiere autenticación
- Cambia el estado a "abierto"

**Respuesta:**
```json
{
  "message": "Ticket reabierto"
}
```

### Cambios en Endpoints Existentes

#### PATCH `/api/tickets/:id`
Ahora registra automáticamente:
- `closedAt` cuando cambia a "atendido"
- `reopenedAt` cuando cambia de "cancelado" a "abierto"

#### POST `/api/tickets/:id/messages`
Ahora:
- Registra automáticamente `firstResponseAt` en la primera respuesta del admin
- Crea un evento en el historial para cada mensaje

## Interfaz de Usuario

### Pestaña de Historial
- Accesible desde el panel de chat del ticket
- Muestra una timeline visual
- Cada evento incluye:
  - Tipo de acción (icono y texto)
  - Descripción
  - Usuario responsable
  - Fecha y hora

### Panel Lateral Mejorado
- Sección "Tiempos de Respuesta" con 3 métricas
- Botón "Reabrir Ticket" (solo visible si está cancelado)
- Información de solicitante y fecha de creación

## Ejemplo de Uso

### Escenario 1: Rastrear tiempo de respuesta
1. Estudiante crea un ticket a las 12:00
2. Admin responde a las 14:30
3. El sistema registra automáticamente: "Primera respuesta: 2h 30m"
4. Admin marca como atendido a las 17:45
5. El sistema registra: "Tiempo de resolución: 5h 45m"

### Escenario 2: Reabrir un ticket
1. Ticket está en estado "Cancelado"
2. Estudiante solicita reabrir
3. Admin hace clic en "Reabrir Ticket"
4. Confirma la acción
5. Ticket vuelve a "Abierto"
6. Se registra en el historial: "Ticket reabierto"

### Escenario 3: Ver historial completo
1. Abrir un ticket
2. Hacer clic en la pestaña "Historial"
3. Ver timeline de todos los eventos:
   - Creación del ticket
   - Cambios de estado
   - Mensajes intercambiados
   - Reaperturas
4. Cada evento muestra quién lo realizó y cuándo

## Beneficios

✅ **Transparencia**: Historial completo y auditable de cada ticket
✅ **Métricas**: Medir tiempos de respuesta para mejorar SLA
✅ **Flexibilidad**: Reabrir tickets sin perder información
✅ **Trazabilidad**: Saber exactamente qué pasó y cuándo
✅ **Mejora Continua**: Datos para analizar rendimiento del equipo

## Notas Técnicas

- Los tiempos se calculan automáticamente en milisegundos
- Se formatean a formato humanizado (días, horas, minutos, segundos)
- Todos los timestamps usan UTC
- El historial es inmutable (solo lectura)
- Los eventos se registran en orden cronológico

## Próximas Mejoras Sugeridas

- Exportar historial a PDF
- Gráficos de tiempos de respuesta por categoría
- Alertas si se excede SLA
- Estadísticas de reaperturas
- Filtrar historial por tipo de evento
