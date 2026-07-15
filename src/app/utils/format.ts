// Helpers de formato compartidos entre vistas desktop y móvil.

/** Formatea un monto en guaraníes: 2800000 -> "₲ 2.800.000". */
export const formatPrice = (price: number): string => '₲ ' + price.toLocaleString('es-PY');

/** % de ahorro de un precio actual respecto al precio de mercado. */
export const calculateSavings = (currentPrice: number, marketPrice: number): number =>
  Math.round(((marketPrice - currentPrice) / marketPrice) * 100);
