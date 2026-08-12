# 🚀 Guía de Despliegue — CALA Multiservices ObraFlow

## Requisitos Previos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com) (gratuita funciona)
- Proyecto de Supabase activo (ya está configurado)
- Node.js 20+ instalado localmente

---

## Paso 1: Subir el Código a GitHub

### 1.1 Inicializa el repositorio Git
Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "feat: ObraFlow v1.0 - Sistema de gestión CALA Multiservices"
```

### 1.2 Crea un repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `cala-multiservices` (o el que prefieras)
3. Visibilidad: **Private** (recomendado para código empresarial)
4. No inicialices con README (ya tienes uno)

### 1.3 Conecta y sube el código
```bash
git remote add origin https://github.com/TU_USUARIO/cala-multiservices.git
git branch -M main
git push -u origin main
```

---

## Paso 2: Conectar con Vercel

### 2.1 Importar el proyecto
1. Ve a https://vercel.com/new
2. Selecciona **Import Git Repository**
3. Elige tu repositorio `cala-multiservices`
4. Vercel detectará Next.js automáticamente

### 2.2 Configurar variables de entorno en Vercel
En la pantalla de configuración, agrega estas variables:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bnefneafczponpanpjxo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(del archivo .env.local)* |
| `DATABASE_URL` | *(URL de pooler de Supabase con `?pgbouncer=true`)* |
| `NEXT_PUBLIC_APP_URL` | `https://cala-multiservices.vercel.app` *(o tu dominio)* |

> ⚠️ **IMPORTANTE:** El `DATABASE_URL` debe ser la URL del **Transaction Pooler** de Supabase (puerto 6543), NO la Direct URL.

### 2.3 Configuración del build
Vercel debe detectar automáticamente:
- **Framework:** Next.js
- **Build Command:** `npm run build` (que internamente ejecuta `prisma generate && next build`)
- **Install Command:** `npm install --legacy-peer-deps`

### 2.4 Deploy
Haz clic en **Deploy** y espera que compile (3-5 minutos la primera vez).

---

## Paso 3: Configurar Supabase para Producción

### 3.1 URL de Redirección de Auth
En tu panel de Supabase:
1. Ve a **Authentication → URL Configuration**
2. En **Site URL**, cambia a: `https://cala-multiservices.vercel.app`
3. En **Redirect URLs**, agrega: `https://cala-multiservices.vercel.app/**`

### 3.2 Verificar la base de datos
Las tablas ya existen desde la migración inicial. No se necesita nada adicional.

---

## Paso 4: Dominio Personalizado (Opcional)

Si tienes un dominio propio (ej. `app.calamultiservices.ca`):
1. En Vercel → proyecto → **Settings → Domains**
2. Agrega tu dominio
3. Configura los DNS según las instrucciones de Vercel (normalmente un CNAME)
4. Actualiza `NEXT_PUBLIC_APP_URL` y las URLs de Supabase Auth

---

## Actualizaciones Futuras

Para actualizar la app en producción:
```bash
git add .
git commit -m "fix: descripción del cambio"
git push
```
Vercel hace el redeploy automáticamente.

---

## Credenciales de Primer Acceso

> Las cuentas de usuario se crean **desde Supabase**, no desde la app (por seguridad).

Para crear el primer usuario `superadmin`:
1. Ve a Supabase → **Authentication → Users → Add User**
2. Ingresa el email y contraseña
3. En la tabla `profiles` (via Supabase Table Editor), crea un registro:
   - `id` = mismo UUID que el usuario de Auth
   - `full_name` = nombre completo
   - `role` = `superadmin`
