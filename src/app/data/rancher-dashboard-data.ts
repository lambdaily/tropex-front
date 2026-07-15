// Datos mock del dashboard de ganadero, compartidos entre la versión desktop
// (RancherDashboard) y móvil (RancherDashboardMobile).

export interface DashboardShipment {
  id: string;
  status: string;
  statusText: string;
  origin: string;
  destination: string;
  cattleCount: number;
  cattleType: string;
  distance: number;
  driver: string;
  estimatedArrival?: string;
  deliveryTime?: string;
  deliveredAt?: string;
  isStoreOrder?: boolean;
}

export const baseActiveShipments: DashboardShipment[] = [
  { id: 'ENV-001', status: 'in-transit', statusText: 'En tránsito', origin: 'Filadelfia', destination: 'Asunción', cattleCount: 45, cattleType: 'Gordos', distance: 485, driver: 'Roberto Díaz', estimatedArrival: '2 horas' },
  { id: 'ENV-005', status: 'in-transit', statusText: 'En tránsito', origin: 'Filadelfia', destination: 'Puerto Casado', cattleCount: 32, cattleType: 'Novillos', distance: 448, driver: 'Ana Torres', estimatedArrival: '4 horas' },
  { id: 'ENV-002', status: 'accepted', statusText: 'Aceptado', origin: 'Loma Plata', destination: 'Villa Hayes', cattleCount: 30, cattleType: 'Novillos', distance: 290, driver: 'María González', estimatedArrival: 'Mañana 08:00' },
  { id: 'ENV-003', status: 'waiting', statusText: 'Esperando transportista', origin: 'Neuland', destination: 'Concepción', cattleCount: 52, cattleType: 'Gordos', distance: 310, driver: '-', estimatedArrival: '-' },
  { id: 'ENV-004', status: 'completed', statusText: 'Viaje completado', origin: 'Mariscal Estigarribia', destination: 'Asunción', cattleCount: 38, cattleType: 'Vaquillonas', distance: 560, driver: 'Carlos Méndez', estimatedArrival: '-', deliveryTime: '18/03/2026 14:30', deliveredAt: '18/03/2026' },
];

export const progressByShipment: Record<string, number> = { 'ENV-001': 68, 'ENV-005': 45 };

// Ofertas de demostración recibidas por el ganadero (claves = ID de oferta).
export const offersData: Record<string, any> = {
  'OFFER-SOL-001-1': {
    offerId: 'OFFER-SOL-001-1', solId: 'SOL-001', transporterName: 'Transporte González S.A.', transporterRating: 4.8, transporterTrips: 142,
    origin: 'Filadelfia', destination: 'Asunción - Frigorífico Central', cattleType: 'Gordos', heads: 45, distance: 480,
    currentPrice: 2800000, marketPrice: 3200000, status: 'nueva-oferta',
    negotiationHistory: [{ round: 1, from: 'transportista', price: 2800000, label: 'Oferta inicial del transportista' }],
    currentRound: 1, maxRounds: 3,
  },
  'OFFER-SOL-001-2': {
    offerId: 'OFFER-SOL-001-2', solId: 'SOL-001', transporterName: 'Carlos Méndez', transporterRating: 4.6, transporterTrips: 89,
    origin: 'Filadelfia', destination: 'Asunción - Frigorífico Central', cattleType: 'Gordos', heads: 45, distance: 480,
    currentPrice: 2700000, marketPrice: 3200000, status: 'contraoferta-recibida',
    negotiationHistory: [
      { round: 1, from: 'transportista', price: 3000000, label: 'Oferta inicial del transportista' },
      { round: 2, from: 'ganadero', price: 2600000, label: 'Tu contraoferta' },
      { round: 3, from: 'transportista', price: 2700000, label: 'Contraoferta del transportista' },
    ],
    currentRound: 3, maxRounds: 3,
  },
  'OFFER-SOL-002-1': {
    offerId: 'OFFER-SOL-002-1', solId: 'SOL-002', transporterName: 'Flota del Chaco', transporterRating: 4.9, transporterTrips: 213,
    origin: 'Loma Plata', destination: 'Concepción - Matadero Municipal', cattleType: 'Novillos', heads: 32, distance: 320,
    currentPrice: 1800000, marketPrice: 2100000, status: 'nueva-oferta',
    negotiationHistory: [{ round: 1, from: 'transportista', price: 1800000, label: 'Oferta inicial del transportista' }],
    currentRound: 1, maxRounds: 3,
  },
};
