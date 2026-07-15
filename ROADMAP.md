# Roadmap — Tropero

Pendientes a futuro. La deuda técnica de limpieza/refactor ya está cerrada
(ver historial de git: tsconfig + strict, salida de `dist` del control de
versiones, estandarización en npm, eliminación de código muerto, constantes de
negocio centralizadas, tipado del flujo de signup, cableado del registro móvil
y deduplicación desktop/móvil).

Lo que queda **no es limpieza, son features que requieren backend / decisiones
de producto**:

## 1. Autenticación real
- Hoy el login es **simulado**: `handleLogin` en `src/app/components/TroperoApp.tsx`
  ignora email y contraseña y entra siempre como ganadero de demo.
- Falta: autenticación real, manejo de sesión y protección de pantallas por rol.

## 2. Persistencia
- El estado vive en memoria: `src/app/store/demoStore.ts` es un singleton que
  **se reinicia al refrescar** la página.
- Falta: persistir órdenes, ofertas y negociaciones (backend o, como mínimo,
  almacenamiento local).

## 3. Datos reales (API)
- Los dashboards usan datos mock centralizados en `src/app/data/`
  (`rancher-dashboard-data.ts`, `empresa-dashboard-data.ts`) y objetos como
  `offersData`, `tripDetailsData`, `truckDetails`, `staticTrips`.
- Falta: reemplazarlos por respuestas de una API real.
- **Nota:** cuando esto se haga, conviene tipar los `any` que quedan (los
  `Record<string, any>` de datos mock) con los tipos reales de la API. Hasta
  entonces se dejaron intencionalmente sin tipar.

## 4. Pulido de UI pendiente

De la auditoría de UX (la primera tanda ya se implementó: toasts, colores de
estado unificados, fuentes legibles, validación de signup, acciones
cancelar/descartar, negociación más clara, carruseles más lentos). Queda:

- **Reducir densidad** de los paneles más cargados (strip de "Flota en ruta",
  "Viaje actual" del chofer): menos datos por fila, más aire.
- **Centralizar contacto**: extraer los `window.open('tel:'/'wa.me')` repetidos
  (~16 lugares) a un util `src/app/utils/contact.ts`.
- **Reusar componentes shadcn ya instalados**: `Badge` para estados, `Skeleton`
  para loading, `Tooltip` para campos técnicos (RUC, capacidades).
- **Accesibilidad**: roles/aria en tabs y botones-icono, foco visible, y
  contraste de textos tenues (opacidades bajas sobre fondo oscuro).
- **Fuentes de 9px**: quedan ~87 instancias en 9px (borderline); evaluar subirlas.
- **Datos demo visibles**: nombres "Demo Transportista/Empresa/Ganadero" en
  tarjetas reales (atar a la futura API / modo demo). El pill "Demo" se deja a
  propósito mientras estén en desarrollo.

---

> Convención del proyecto: trabajar en ramas, verificar `npm run typecheck`
> (0 errores) y `npm run build` antes de commitear. Ver `guidelines/Guidelines.md`.
