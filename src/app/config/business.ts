// Constantes y reglas de negocio centralizadas.
// Antes estaban repetidas como números mágicos dentro de los componentes.

/**
 * Límite de cabezas por guía según regulación SENACSA.
 * Si un envío supera el límite del tipo de ganado, debe dividirse en 2 guías.
 */
export const SENACSA_GUIDE_LIMIT = {
  fat: 45, // Gordos
  weaned: 80, // Desmamantes
} as const;

export type CattleType = keyof typeof SENACSA_GUIDE_LIMIT;

/** Límite de cabezas por guía para un tipo de ganado (default: desmamantes/80). */
export function guideLimitFor(cattleType: string): number {
  return cattleType === 'fat' ? SENACSA_GUIDE_LIMIT.fat : SENACSA_GUIDE_LIMIT.weaned;
}

/** Indica si la cantidad de cabezas supera el límite de una sola guía. */
export function exceedsGuideLimit(cattleType: string, heads: number): boolean {
  if (cattleType !== 'fat' && cattleType !== 'weaned') return false;
  return heads > guideLimitFor(cattleType);
}

/** Tope de rondas en la negociación de una oferta (ganadero ↔ transportista). */
export const MAX_NEGOTIATION_ROUNDS = 3;

/**
 * Capacidad máxima de cabezas que un camión transporta por viaje/guía.
 * La calculadora de oferta nunca cotiza más de este tope: si una solicitud
 * pide más, el transportista cotiza solo lo que entra en un camión.
 */
export const MAX_HEADS_PER_TRUCK = 40;

/** Cabezas que efectivamente se pueden cotizar (topeadas por camión). */
export function billableHeads(heads: number): number {
  return Math.min(heads, MAX_HEADS_PER_TRUCK);
}

/**
 * Mapea una etiqueta de ganado (en español) a la categoría SENACSA usada
 * para los límites por guía. Terneros/desmamantes/destetes → 'weaned' (80);
 * el resto (gordos, novillos, vaquillonas, vacas, toros) → 'fat' (45).
 */
export function cattleCategoryFromLabel(label: string): CattleType {
  return /ternero|desmama|destet/i.test(label) ? 'weaned' : 'fat';
}

/**
 * Parámetros de precio de REFERENCIA para el demo.
 * En producción esto saldría del cálculo de ruta real y tarifas por tramo.
 */
export const DEMO_PRICING = {
  pricePerKmPerHead: 410, // ₲ por km por cabeza
  defaultDistanceKm: 400, // distancia fija usada mientras no hay ruteo real
} as const;

/** Precio de referencia estimado para un envío en el demo. */
export function estimateReferencePrice(
  heads: number,
  distanceKm: number = DEMO_PRICING.defaultDistanceKm,
): number {
  return heads * DEMO_PRICING.pricePerKmPerHead * distanceKm;
}
