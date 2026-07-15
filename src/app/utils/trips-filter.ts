// Filtrado y ordenamiento de viajes del marketplace, compartido entre la vista
// desktop y móvil de la empresa. Función pura: cada plataforma pasa su estado.

export interface TripFilterState {
  estadoFilter: 'todos' | 'accion' | 'disponible' | 'esperando';
  priceSort: 'none' | 'asc' | 'desc';
  recomendadosActive: boolean;
  /** Límite de distancia en km; >= 1000 o undefined = sin límite. */
  distanceMax?: number;
  /** Origen para ordenar por proximidad (camión seleccionado); null = sin proximidad. */
  proximityOrigin?: { lat: number; lng: number } | null;
}

interface FilterableTrip {
  distance: number;
  bidStatus: string;
  marketPrice: number;
  hoursAgo: number;
  originCoords: { lat: number; lng: number };
}

const calcDist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
  Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);

export function filterAndSortTrips<T extends FilterableTrip>(trips: T[], opts: TripFilterState): T[] {
  const { estadoFilter, priceSort, recomendadosActive, distanceMax, proximityOrigin } = opts;
  const maxDist = distanceMax === undefined || distanceMax >= 1000 ? Infinity : distanceMax;

  let result = trips.filter((t) => {
    if (t.distance > maxDist) return false;
    if (estadoFilter === 'accion') return t.bidStatus === 'rancher-countered';
    if (estadoFilter === 'disponible') return t.bidStatus === 'new';
    if (estadoFilter === 'esperando') return t.bidStatus === 'awaiting-rancher';
    return true;
  });

  if (priceSort === 'desc') {
    result = [...result].sort((a, b) => b.marketPrice - a.marketPrice);
  } else if (priceSort === 'asc') {
    result = [...result].sort((a, b) => a.marketPrice - b.marketPrice);
  } else if (recomendadosActive) {
    // acciones primero, luego proximidad (si hay camión), luego precio
    result = [...result].sort((a, b) => {
      const pa = a.bidStatus === 'rancher-countered' ? 3 : a.bidStatus === 'awaiting-rancher' ? 2 : 1;
      const pb = b.bidStatus === 'rancher-countered' ? 3 : b.bidStatus === 'awaiting-rancher' ? 2 : 1;
      if (pa !== pb) return pb - pa;
      if (proximityOrigin) {
        const dA = calcDist(proximityOrigin, a.originCoords);
        const dB = calcDist(proximityOrigin, b.originCoords);
        if (Math.abs(dA - dB) > 0.3) return dA - dB;
      }
      return b.marketPrice - a.marketPrice;
    });
  } else {
    result = [...result].sort((a, b) => a.hoursAgo - b.hoursAgo);
  }

  return result;
}
