# Guía de desarrollo — Tropero

Convenciones del proyecto. Mantener este archivo corto y vigente.

## Stack y arquitectura

- **Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui** (Radix). Iconos: `lucide-react`.
- **Demo frontend, sin backend.** Los datos viven en memoria en `src/app/store/demoStore.ts` (singleton con `useDemoStore()`); se reinician al refrescar.
- **Navegación**: máquina de estados con `useState` en `src/app/components/TroperoApp.tsx` (no hay router). Cada pantalla se renderiza condicionalmente por `currentScreen`.
- **Roles**: ganadero, empresa, owner-operator, chofer, productor (frigorífico/consignataria/feria/otro). Cada uno con dashboard en `dashboards/` y, donde aplica, versión móvil en `dashboards-mobile/`.

## Responsive / móvil

- El corte móvil es **768px** vía `useIsMobile()` (`src/app/components/ui/use-mobile.ts`).
- Patrón: `isMobile ? <ComponenteMobile .../> : <Componente .../>`. Mantené las props del componente móvil **idénticas** a las de escritorio para que el switch sea directo.

## TypeScript

- **`strict` está activado.** Corré `npm run typecheck` antes de commitear; debe quedar en **0 errores**.
- **Evitá `any`.** Tipos compartidos en `src/app/types/`. Para íconos de Lucide usá el tipo `LucideIcon`.
- Los `any` que quedan son datos mock (`offersData`, `tripDetailsData`, etc.) y se tiparán cuando exista la API real; no agregar `any` nuevos.

## Constantes de negocio

- Nada de números mágicos en componentes. Todo va en `src/app/config/business.ts`:
  - Límites SENACSA por guía (`SENACSA_GUIDE_LIMIT`, helpers `guideLimitFor` / `exceedsGuideLimit`).
  - Precio de referencia del demo (`DEMO_PRICING`, `estimateReferencePrice`).
  - Máximo de rondas de negociación (`MAX_NEGOTIATION_ROUNDS`).

## Marca: TROPEX (Agrotech Logistics)

Fuente de verdad: `src/app/config/brand.ts`. Tagline: "Del oficio tropero a la
logística inteligente". Isotipo **TX** (no usar cabeza de toro ni estética
western). Logo: `public/tropex-logo.svg` (reemplazable) vía `<BrandLogo/>`.

- **Paleta institucional** (no cambiar): verde profundo `#1E5126` (primario),
  naranja GPS `#F58718` (acento/CTA/tracking), verde noche `#08221A` (fondos
  oscuros), neutro técnico `#F6F1E8` (fondo claro).
- **Tipografía**: **Space Grotesk** (títulos/display) + **IBM Plex Sans** (cuerpo/UI).
  Migración desde Manrope en curso (hecho en el landing; el resto es un pase
  global pendiente y coordinado).
- Estados: tokens en `src/app/config/colors.ts`.
- Moneda en guaraníes con separador local: `'₲ ' + n.toLocaleString('es-PY')`.
- Idioma: **español de Paraguay**.

## Git

- Trabajar en ramas; verificar `typecheck` + `build` antes de commitear.
- No versionar `dist/` (está en `.gitignore`). Gestor de paquetes: **npm**.
