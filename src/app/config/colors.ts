// Tokens de color de ESTADO, unificados entre desktop y móvil.
// Antes cada vista (y a veces cada plataforma) usaba hex distintos para el
// mismo estado, generando incoherencia visual.

/** Color por estado de un ENVÍO / viaje (vista ganadero). */
export const SHIPMENT_STATUS_COLOR: Record<string, string> = {
  'in-transit': '#1E5126', // verde marca — en progreso
  accepted: '#F58718', // naranja — asignado / requiere acción
  waiting: '#9CA3AF', // gris — esperando
  completed: '#059669', // verde medio — entregado
};

export const shipmentStatusColor = (status: string): string =>
  SHIPMENT_STATUS_COLOR[status] ?? '#9CA3AF';

/** Color por estado de un VEHÍCULO de la flota (vista transportista). */
export const FLEET_STATUS_COLOR: Record<string, string> = {
  'en-viaje': '#1E5126', // verde marca — en ruta
  disponible: '#22C55E', // verde claro — libre
  mantenimiento: '#F58718', // naranja — requiere atención
};

export const fleetStatusColor = (status: string): string =>
  FLEET_STATUS_COLOR[status] ?? '#9CA3AF';
