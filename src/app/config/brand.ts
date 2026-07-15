// Identidad de marca TROPEX — fuente de verdad.
// Manual: "No cambiar los colores del sistema. Mantener la paleta institucional."

export const BRAND = {
  name: 'TROPEX',
  tagline: 'Del oficio tropero a la logística inteligente',
  descriptor: 'Agrotech Logistics',
} as const;

/** Paleta institucional (4 colores). No agregar/alterar sin actualizar el manual. */
export const BRAND_COLORS = {
  verdeProfundo: '#1E5126', // primario / acción
  naranjaGPS: '#F58718', // acento / CTA / tracking
  verdeNoche: '#08221A', // fondos oscuros, dashboards
  neutroTecnico: '#F6F1E8', // fondo neutro cálido
} as const;

/** Tipografía: display técnica + cuerpo de alta legibilidad. */
export const BRAND_FONTS = {
  display: "'Space Grotesk', system-ui, sans-serif", // títulos
  body: "'IBM Plex Sans', system-ui, sans-serif", // cuerpo / UI
} as const;
