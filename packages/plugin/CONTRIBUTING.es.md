# Cómo contribuir a better-auth-mercadopago

> 🇺🇸 **Prefer to read this in English?** → [CONTRIBUTING.md](./CONTRIBUTING.md)

¡Gracias por tu interés en contribuir! Este documento explica la configuración técnica y las convenciones que necesitás conocer para contribuir de manera efectiva.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Visión general de la arquitectura](#visión-general-de-la-arquitectura)
- [Configuración del entorno de desarrollo](#configuración-del-entorno-de-desarrollo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Flujo de trabajo: Cómo contribuir](#flujo-de-trabajo-cómo-contribuir)
- [Estándares de código](#estándares-de-código)
- [Testing](#testing)
- [Changesets: Versionado y Changelogs](#changesets-versionado-y-changelogs)
- [Proceso de release](#proceso-de-release)
- [¿Necesitás ayuda?](#necesitás-ayuda)

---

## Código de Conducta

Al participar en este proyecto, acordás mantener un entorno respetuoso e inclusivo. El acoso, la discriminación o el comportamiento irrespetuoso no serán tolerados.

---

## Visión general de la arquitectura

Este proyecto es un **monorepo con Turborepo** y Bun como gestor de paquetes. El paquete publicable vive en `packages/plugin`. El resto del monorepo (`apps/`, otros `packages/`) es infraestructura para desarrollo y documentación.

```
better-auth-mercadopago/
├── .changeset/          # Configuración de Changesets
├── .github/workflows/   # CI/CD (ci.yml, release.yml)
├── apps/
│   ├── fumadocs/        # Sitio de documentación (Fumadocs)
│   └── web/             # App de demo (Next.js 15)
├── packages/
│   ├── auth/            # Configuración compartida de Better Auth
│   ├── config/          # Configuración compartida de TypeScript/lint
│   ├── db/              # Schema Prisma y migraciones
│   ├── env/             # Validación de variables de entorno (Zod)
│   └── plugin/          # ← EL PAQUETE PUBLICABLE (better-auth-mercadopago)
├── turbo.json           # Pipeline de Turborepo
└── package.json         # Root (privado, solo tooling)
```

### El paquete del Plugin (`packages/plugin`)

El plugin sigue el **patrón de plugins de Better Auth**:

- **`src/index.ts`** — Plugin del servidor (exportado como `better-auth-mercadopago`)
- **`src/client-plugin.ts`** — Plugin del cliente (exportado como `better-auth-mercadopago/client`)
- **`src/types.ts`** — Tipos TypeScript compartidos (exportado como `better-auth-mercadopago/types`)
- **`src/schemas.ts`** — Schemas de validación Zod (exportado como `better-auth-mercadopago/schemas`)
- **`src/endpoints/`** — Handlers de endpoints de Better Auth
- **`src/security/`** — Verificación de firma de webhooks y utilidades de seguridad

**Build:** `tsup` compila TypeScript a ESM + CJS con archivos de declaración `.d.ts` en `dist/`.

---

## Configuración del entorno de desarrollo

### Prerrequisitos

- **Node.js 20+**
- **Bun 1.3+** (instalá en [bun.sh](https://bun.sh))
- **Docker** (para la base de datos PostgreSQL)
- **Git**

### Pasos

```bash
# 1. Forkeá y cloná el repositorio
git clone https://github.com/TU_USUARIO/better-auth-mercadopago.git
cd better-auth-mercadopago

# 2. Instalá todas las dependencias
bun install

# 3. Configurá las variables de entorno
# Copiá el ejemplo y completá con tus credenciales de MercadoPago
cp apps/web/.env.example apps/web/.env.local

# 4. Iniciá la base de datos (requiere Docker)
bun db:start

# 5. Ejecutá las migraciones
bun db:migrate

# 6. Iniciá el entorno de desarrollo
bun dev
```

### Variables de entorno

Para el desarrollo local del **plugin**, solo necesitás:

```env
# apps/web/.env.local
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxx  # Usá un token de TEST, nunca producción
MP_WEBHOOK_SECRET=cualquier-secreto-local
BETTER_AUTH_SECRET=cualquier-secreto-local
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/better-auth-mercadopago
```

> ⚠️ **NUNCA hagas commit de credenciales reales.** Siempre usá los tokens TEST de MercadoPago para desarrollo.

---

## Estructura del Proyecto (Plugin en detalle)

```
packages/plugin/
├── src/
│   ├── endpoints/        # Handlers de endpoints de Better Auth
│   │   └── webhook.ts    # Receptor y despachador de webhooks
│   ├── security/         # Utilidades de seguridad
│   │   └── signature.ts  # Verificación de firma HMAC de MercadoPago
│   ├── client-plugin.ts  # Definición del plugin del lado del cliente
│   ├── index.ts          # Definición del plugin del lado del servidor (entrada principal)
│   ├── schemas.ts        # Schemas Zod para payloads y configuración
│   └── types.ts          # Tipos TypeScript (inferidos desde schemas + custom)
├── tsup.config.ts        # Configuración de build (tsup)
├── tsconfig.json         # Configuración de TypeScript (extiende config compartida)
├── package.json          # Manifiesto del paquete
└── README.md             # Documentación orientada al usuario
```

### Cómo funcionan los plugins de Better Auth

Un plugin de Better Auth es una función que recibe un contexto y devuelve un objeto con las capacidades del plugin:

```typescript
// Estructura simplificada
import type { BetterAuthPlugin } from "better-auth";

export const mercadopago = (options: MercadoPagoOptions): BetterAuthPlugin => ({
  id: "mercadopago",
  // Extender el schema de la base de datos
  schema: {
    mercadoPagoPayment: { fields: { ... } },
    mercadoPagoSubscription: { fields: { ... } },
  },
  // Registrar endpoints HTTP
  endpoints: {
    mercadopagoWebhook: createAuthEndpoint("/mercadopago/webhook", { ... }),
  },
  // Ejecutar código en la inicialización
  init: (ctx) => { ... },
});
```

---

## Flujo de trabajo: Cómo contribuir

### Para bugs o cambios pequeños

1. Revisá los [issues existentes](https://github.com/IvanTsxx/better-auth-mercadopago/issues) para evitar duplicados
2. Creá un nuevo issue describiendo el bug/cambio
3. Forkea, creá una rama: `git checkout -b fix/nombre-descriptivo`
4. Hacé tus cambios siguiendo los [estándares de código](#estándares-de-código)
5. **Agregá un changeset** (ver [sección de Changesets](#changesets-versionado-y-changelogs))
6. Hacé push y abrí un Pull Request

### Para nuevas funcionalidades

1. Abrí una **Discusión** o **issue** primero para validar la idea — no desperdicies tu tiempo en algo que no va a ser mergeado
2. Una vez aprobado, seguí el mismo flujo de rama + changeset

### Convención de nombres de ramas

```
feat/manejo-reembolso-webhook
fix/actualizacion-estado-suscripcion
docs/agregar-ejemplo-nextjs
chore/actualizar-sdk-mercadopago
```

---

## Estándares de código

Este proyecto usa **Ultracite** (Oxlint + Oxfmt) para formateo y linting automatizados.

```bash
# Arreglá todos los problemas de formateo y linting automáticamente
bun x ultracite fix

# Verificá sin modificar
bun x ultracite check
```

### Reglas de TypeScript

- **Tipos explícitos** siempre en parámetros y retornos de funciones
- **`unknown` sobre `any`** — nunca uses `any`
- **`const` por defecto**, `let` solo cuando necesitás reasignar
- **Optional chaining** (`?.`) y nullish coalescing (`??`) para acceso seguro
- **Arrow functions** para callbacks y utilidades

### Reglas de archivos/módulos

- Sin archivos barrel (`index.ts` que re-exporta todo desde una carpeta)
- Preferí imports específicos: `import { foo } from "./foo"` sobre `import * as foo`
- Sin `console.log` en código de producción — usá manejo de errores apropiado

### Convención de commits

Usá [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar handler de endpoint de reembolso
fix: corregir verificación de firma de webhook para región Brasil
docs: actualizar README con ejemplo de suscripción
chore: actualizar SDK de mercadopago a 2.4.0
```

> Nunca agregues atribución "Co-Authored-By" de IA en los commits.

---

## Testing

> 🔲 Los tests están en el roadmap. Actualmente, el pipeline de CI verifica que el plugin compila y pasa el chequeo de tipos correctamente.

Cuando se agregue infraestructura de tests, vivirán en `packages/plugin/src/__tests__/`. Usaremos **Vitest**.

---

## Changesets: Versionado y Changelogs

Usamos [Changesets](https://github.com/changesets/changesets) para versionado semántico y changelogs automatizados. **DEBÉS agregar un changeset para cada contribución que cambie el comportamiento del plugin o su API pública.**

### Cuándo agregar un changeset

| Tipo de cambio | ¿Changeset necesario? | Tipo de versión |
|----------------|----------------------|-----------------|
| Nueva funcionalidad | ✅ Sí | `minor` |
| Corrección de bug | ✅ Sí | `patch` |
| Cambio que rompe compatibilidad | ✅ Sí | `major` |
| Solo documentación | ❌ No | — |
| Refactor interno (sin cambio de API) | ❌ No | — |
| Cambios de CI/tooling | ❌ No | — |

### Cómo agregar un changeset

```bash
# Desde la raíz del repo
bun changeset
```

El CLI te va a preguntar:
1. **Qué paquetes incluir** — siempre seleccioná `better-auth-mercadopago`
2. **Tipo de cambio** — `major`, `minor` o `patch`
3. **Resumen** — Escribí una descripción clara y orientada al usuario del cambio

Esto crea un archivo `.md` en `.changeset/`. **Comiteá este archivo junto con tus cambios de código.**

Ejemplo de archivo changeset (`.changeset/perros-purpura-rien.md`):
```markdown
---
"better-auth-mercadopago": patch
---

Corrige la verificación de firma de webhook para manejar correctamente el formato HMAC-SHA256 de MercadoPago.
```

---

## Proceso de Release

El proceso de release está **completamente automatizado** via GitHub Actions. No necesitás hacer nada más que mergear tu PR.

### Cómo funciona

```
Tu PR (con changeset) → Merge a main
        ↓
GitHub Action detecta el changeset
        ↓
Crea automáticamente un PR "Version Packages"
(actualiza la versión en package.json y el CHANGELOG.md)
        ↓
El maintainer revisa y mergea el PR "Version Packages"
        ↓
GitHub Action publica en npm + crea el GitHub Release
```

### Solo para Maintainers

Para disparar un release manualmente, mergeá el PR automático "Version Packages" en GitHub. El action se encarga del resto.

---

## ¿Necesitás ayuda?

- **¿Preguntas?** Abrí una [Discusión](https://github.com/IvanTsxx/better-auth-mercadopago/discussions)
- **¿Encontraste un bug?** Abrí un [Issue](https://github.com/IvanTsxx/better-auth-mercadopago/issues)
- **¿Vulnerabilidad de seguridad?** NO abras un issue público. Contacto directo (ver SECURITY.md cuando esté disponible)
