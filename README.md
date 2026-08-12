# CALA Multiservices — ObraFlow

Plataforma de gestión operativa para CALA Multiservices, empresa de servicios de construcción y mantenimiento en Canadá.

## Tech Stack

- **Frontend/Backend:** Next.js 16 (App Router)
- **Base de Datos:** PostgreSQL via Supabase + Prisma ORM v7
- **Autenticación:** Supabase Auth
- **Estilos:** Tailwind CSS + Fontes Google (Bebas Neue, Poppins)
- **Deploy:** Vercel

## Módulos del Sistema

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/dashboard` | Pipeline en tiempo real + métricas clave |
| Clientes | `/dashboard/clientes` | CRM básico de clientes |
| Proyectos | `/dashboard/proyectos` | Gestión del ciclo de vida del proyecto |
| Caminata | `/dashboard/proyectos/[id]` | Calculadora interactiva de cotización |
| Propuesta | `/dashboard/proyectos/[id]/propuesta` | Generación de propuestas bilingüe + PDF |
| Asignación | `/dashboard/proyectos/[id]/asignacion` | Asignación de técnicos + itinerario |
| Mis Tareas | `/dashboard/mis-tareas` | Vista mobile-first para técnicos |
| Informe de Campo | `/dashboard/mis-tareas/[id]` | Reporte de progreso por actividad |
| Facturación | `/dashboard/proyectos/[id]/factura` | Generación y cobro de factura final |
| Costos | `/dashboard/costos` | Configuración de tarifas y márgenes |
| Catálogo | `/dashboard/catalogo` | Catálogo bilingüe de actividades |

## Flujo del Proyecto

```
Cita → Caminata → Propuesta → Aprobado → Asignado → En Ejecución → Informe → Facturado → Cerrado
```

## Variables de Entorno Requeridas

Configura en Vercel (Settings → Environment Variables):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

> **Nota:** `DATABASE_URL` debe usar la URL de Pooler de Supabase con `?pgbouncer=true` para compatibilidad en producción.

## Desarrollo Local

```bash
npm install --legacy-peer-deps
npx prisma generate
npm run dev
```

## Deploy en Vercel

1. Haz push del repositorio a GitHub
2. Conecta el repo en [vercel.com](https://vercel.com)
3. Configura las variables de entorno en el panel de Vercel
4. Vercel detectará Next.js automáticamente y hará el build

## Roles de Usuario

| Rol | Acceso |
|-----|--------|
| `superadmin` | Todo el sistema |
| `operador` | Proyectos, clientes, propuestas, asignación, facturación |
| `tecnico` | Solo `/mis-tareas` — vista simplificada |
