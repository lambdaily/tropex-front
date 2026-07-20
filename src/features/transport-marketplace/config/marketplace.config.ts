/**
 * Los datos demo solo se habilitan explícitamente para pruebas visuales.
 * En producción, una respuesta vacía del backend debe mostrar estado vacío.
 */
export const isMarketplaceDemoEnabled = import.meta.env.VITE_ENABLE_DEMO_MARKETPLACE === 'true';
