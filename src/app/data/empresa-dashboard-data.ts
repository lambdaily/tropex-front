// Datos mock del dashboard de empresa, compartidos entre la versión desktop
// (EmpresaDashboard) y móvil (EmpresaDashboardMobile).
//
// Nota: los colores de estado están unificados en config/colors.ts (fleetStatusColor).
// truckDetails, staticTrips, truckExtended y la actividad reciente no se comparten
// porque su forma diverge entre ambas versiones.

export const truckLocations = [
  { id: 'CAM-001', location: 'Asunción', status: 'en-viaje', driver: 'Carlos Mendez' },
  { id: 'CAM-004', location: 'Filadelfia', status: 'disponible', driver: 'Roberto Silva' },
  { id: 'CAM-007', location: 'Concepción', status: 'en-viaje', driver: 'María González' },
  { id: 'CAM-009', location: 'Villa Hayes', status: 'mantenimiento', driver: 'Juan Pérez' },
] as const;

export const mapPins: Record<string, { left: string; top: string }> = {
  'CAM-001': { left: '74%', top: '58%' },
  'CAM-004': { left: '24%', top: '34%' },
  'CAM-007': { left: '61%', top: '28%' },
  'CAM-009': { left: '70%', top: '44%' },
};

export const drivers = [
  { id: 1, name: 'Carlos Mendez', trips: 24, revenue: '₲ 12.400.000', avgSpeed: '72 km/h', speedWarnings: 0 },
  { id: 2, name: 'Roberto Silva', trips: 19, revenue: '₲ 9.800.000', avgSpeed: '68 km/h', speedWarnings: 1 },
  { id: 3, name: 'María González', trips: 31, revenue: '₲ 15.200.000', avgSpeed: '65 km/h', speedWarnings: 0 },
  { id: 4, name: 'Juan Pérez', trips: 15, revenue: '₲ 7.100.000', avgSpeed: '85 km/h', speedWarnings: 3 },
  { id: 5, name: 'Ana López', trips: 22, revenue: '₲ 11.500.000', avgSpeed: '70 km/h', speedWarnings: 0 },
];

export const weekData = [
  { day: 'L', value: 8 },
  { day: 'M', value: 12 },
  { day: 'X', value: 9 },
  { day: 'J', value: 15 },
  { day: 'V', value: 11 },
  { day: 'S', value: 7 },
  { day: 'D', value: 3 },
];

export interface EmpresaTrip {
  id: string;
  origin: string;
  destination: string;
  heads: number;
  cattleType: string;
  pickupDate: string;
  distance: number;
  bidStatus: 'new' | 'rancher-countered' | 'awaiting-rancher';
  marketPrice: number;
  yourBid?: number;
  rancherCounterOffer?: number;
  originCoords: { lat: number; lng: number };
  hoursAgo: number;
}

// Viajes de demostración disponibles en el marketplace (idénticos en desktop/móvil).
export const staticTrips: EmpresaTrip[] = [
  { id: 'SOL-002', origin: 'Loma Plata', destination: 'Concepción', heads: 32, cattleType: 'Novillos', pickupDate: '25/03/2026', distance: 320, bidStatus: 'rancher-countered', yourBid: 1350000, rancherCounterOffer: 1150000, marketPrice: 1220000, originCoords: { lat: -22.37, lng: -59.85 }, hoursAgo: 6 },
  { id: 'SOL-004', origin: 'Mariscal Estigarribia', destination: 'Asunción', heads: 50, cattleType: 'Gordos', pickupDate: '27/03/2026', distance: 560, bidStatus: 'awaiting-rancher', yourBid: 2200000, marketPrice: 2050000, originCoords: { lat: -22.03, lng: -60.61 }, hoursAgo: 8 },
  { id: 'SOL-001', origin: 'Filadelfia', destination: 'Asunción', heads: 45, cattleType: 'Gordos', pickupDate: '24/03/2026', distance: 485, bidStatus: 'new', marketPrice: 1680000, originCoords: { lat: -22.36, lng: -60.03 }, hoursAgo: 3 },
  { id: 'SOL-003', origin: 'Neuland', destination: 'Villa Hayes', heads: 28, cattleType: 'Vaquillonas', pickupDate: '26/03/2026', distance: 380, bidStatus: 'new', marketPrice: 1450000, originCoords: { lat: -22.51, lng: -59.88 }, hoursAgo: 2 },
  { id: 'SOL-005', origin: 'Concepción', destination: 'Asunción', heads: 38, cattleType: 'Terneros', pickupDate: '28/03/2026', distance: 412, bidStatus: 'new', marketPrice: 1580000, originCoords: { lat: -23.41, lng: -57.44 }, hoursAgo: 1 },
  { id: 'SOL-006', origin: 'Villa Hayes', destination: 'Asunción', heads: 35, cattleType: 'Novillos', pickupDate: '25/03/2026', distance: 65, bidStatus: 'new', marketPrice: 420000, originCoords: { lat: -25.10, lng: -57.52 }, hoursAgo: 0.5 },
  { id: 'SOL-007', origin: 'Coronel Oviedo', destination: 'Asunción', heads: 40, cattleType: 'Gordos', pickupDate: '26/03/2026', distance: 155, bidStatus: 'new', marketPrice: 950000, originCoords: { lat: -25.44, lng: -56.44 }, hoursAgo: 4 },
  { id: 'SOL-008', origin: 'San Pedro', destination: 'Asunción', heads: 55, cattleType: 'Gordos', pickupDate: '27/03/2026', distance: 280, bidStatus: 'new', marketPrice: 2400000, originCoords: { lat: -24.10, lng: -57.08 }, hoursAgo: 2 },
  { id: 'SOL-009', origin: 'Pozo Colorado', destination: 'Villa Hayes', heads: 30, cattleType: 'Vaquillonas', pickupDate: '26/03/2026', distance: 200, bidStatus: 'new', marketPrice: 900000, originCoords: { lat: -23.49, lng: -58.79 }, hoursAgo: 5 },
  { id: 'SOL-010', origin: 'Filadelfia', destination: 'Concepción', heads: 42, cattleType: 'Novillos', pickupDate: '28/03/2026', distance: 290, bidStatus: 'new', marketPrice: 1820000, originCoords: { lat: -22.36, lng: -60.03 }, hoursAgo: 1.5 },
];

/**
 * Estadísticas derivadas de la flota. Si la flota del store está vacía,
 * cae al listado estático `fallback` (truckLocations).
 */
export function computeFleetStats(
  fleet: ReadonlyArray<{ status: string }>,
  fallback: ReadonlyArray<{ status: string }>,
) {
  const src = fleet.length > 0 ? fleet : fallback;
  const enViajeCount = src.filter((v) => v.status === 'en-viaje').length;
  const availableTrucksCount = src.filter((v) => v.status === 'disponible').length;
  const occupancyRate = src.length > 0 ? Math.round((enViajeCount / src.length) * 100) : 0;
  return { enViajeCount, availableTrucksCount, occupancyRate };
}

/** Etiqueta legible del estado de un vehículo de la flota. */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'en-viaje':
      return 'En viaje';
    case 'disponible':
      return 'Disponible';
    case 'mantenimiento':
      return 'Mantenimiento';
    default:
      return status;
  }
};
